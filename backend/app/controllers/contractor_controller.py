import bcrypt
import uuid
import re
import json
import random
import string
import base64
import logging
from app.utils.file_utils import save_uploaded_file
from app.models.contractor_model import ContractorModel
from app.models.provider_model import ProviderModel 
from app.utils.encrypt_utils import cipher
from app.utils.email_utils import (
    send_email,
    send_contractor_activation_email,
    send_contractor_otp_email,
    send_contractor_profile_submitted_email,
    send_admin_new_contractor_notification
)
from app.config import Config

ADMIN_EMAIL = Config.FROM_EMAIL


class ContractorController:

    # ---------------- Signup ----------------
    @staticmethod
    def signup(data):
        brn = data.get('business_registration_number')
        company_name = data.get('company_name')
        email = data.get('email_id')
        phone = data.get('phone_number')
        password = data.get('password')

        if not all([brn, company_name, email, phone, password]):
            return {"error": "All fields are required"}, 400

        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        token = str(uuid.uuid4())

        # creates users_t + company_details_t
        ContractorModel.create_company(company_name, brn, hashed, phone, email, token)
        send_contractor_activation_email(email, token)

        return {"message": "Signup successful. Activation link sent to your email."}, 200

    # ---------------- Activate ----------------
    @staticmethod
    def activate(token):
        company = ContractorModel.get_company_by_token(token)
        if not company:
            return {"error": "Invalid activation token"}, 400

        ContractorModel.activate_company(token)

        # get_company_by_token now returns email_id from users_t
        return {
            "message": "Company account activated successfully.",
            "email_id": company["email_id"],
        }, 200

    # ---------------- Login ----------------
    @staticmethod
    def login(email,password):

        # This now reads from users_t (service_type = 1 in model)
        contractor = ContractorModel.get_contractor_by_email(email)
        if not contractor:
            return {"error": "Invalid credentials"}, 401

        # Optional extra safety: ensure this really is a company account
        if contractor.get("service_type") is not None and contractor["service_type"] != 1:
            return {"error": "Invalid credentials"}, 401

        if not bcrypt.checkpw(password.encode(), contractor["password_hash"].encode()):
            return {"error": "Invalid credentials"}, 401

        if not contractor["active_status"]:
            return {"error": "Account not activated"}, 401

        otp = ''.join(random.choices(string.digits, k=6))
        ContractorModel.save_otp(email, otp)
        send_contractor_otp_email(email, otp)

        return {"message": "OTP sent to contractor email"}, 200

    # ---------------- Verify OTP ----------------
    @staticmethod
    def verify_otp(data):
        email = data.get('email')
        otp = data.get('otp')
        if not email or not otp:
            return {"error": "Email and OTP required"}, 400

        record = ContractorModel.validate_otp(email)
        if record and record['otp_code'] == otp:
            ContractorModel.delete_otp(email)

            contractor = ContractorModel.get_basic_info(email)
            if not contractor:
                return {"error": "Contractor not found"}, 404

            return {
                "message": "OTP verified successfully",
                "contractor": contractor
            }, 200

        return {"error": "Invalid or expired OTP"}, 401

    # ---------------- Resend OTP ----------------
    @staticmethod
    def resend_otp(data):
        email = data.get('email')
        if not email:
            return {"error": "Email required"}, 400

        ContractorModel.delete_otp(email)
        otp = ''.join(random.choices(string.digits, k=6))
        ContractorModel.save_otp(email, otp)
        send_contractor_otp_email(email, otp)
        return {"message": "OTP resent successfully"}, 200

    # ---------------- Profile ----------------

    @staticmethod
    def get_profile(data):
        email = data.get('email')
        if not email:
            return {"error": "Email required"}, 400

        profile = ContractorModel.get_company_profile(email)
        if not profile:
            return {"error": "Company not found"}, 404

        # Convert memoryview (bytes) to Base64 string exactly like provider logic
        if profile.get("logo_path"):
            profile["logo_path"] = base64.b64encode(profile["logo_path"]).decode()

        if profile.get("certificate_path"):
            profile["certificate_path"] = base64.b64encode(profile["certificate_path"]).decode()

        return profile, 200


    # ---------------- Update Company Profile ----------------
    @staticmethod
    def update_company_profile(form_data, files):
        email = form_data.get('email')
        if not email:
            return {"error": "Email required"}, 400

        company_data = {
            "company_name": form_data.get('company_name'),
            "brn_number": form_data.get('brn_number'),
            "tin_number": form_data.get('tin_number'),
            "bumiputera": form_data.get('bumiputera'),
            "mailing_address": form_data.get('mailing_address'),
            "billing_address": form_data.get('billing_address'),
            "contact_number": form_data.get('contact_number'),
            "alternate_contact": form_data.get('alternate_contact'),
            "contact_person": form_data.get('contact_person')
        }

        # Parse services JSON
        try:
            services = json.loads(form_data.get('services', '[]'))
            print(services)
            if not isinstance(services, list):
                services = []
        except Exception:
            services = []

        logo_file = files.get('company_logo')
        cert_file = files.get('certificate')

        # 1. Save to disk (optional, for future download)
        if logo_file:
            save_uploaded_file(logo_file, "company_logos")
        if cert_file:
            save_uploaded_file(cert_file, "company_certificates")

        # 2. Reset pointer so we can read the bytes again
        if logo_file:
            logo_file.seek(0)
        if cert_file:
            cert_file.seek(0)

        # 3. Save BYTES to DB
        logo_bytes = logo_file.read() if logo_file else None
        cert_bytes = cert_file.read() if cert_file else None

        success = ContractorModel.update_company_profile(email, company_data, services, logo_bytes, cert_bytes)
        if not success:
            return {"error": "Failed to update company profile"}, 500

        # Notify admin and contractor
        send_contractor_profile_submitted_email(email, company_data['company_name'])
        send_admin_new_contractor_notification(ADMIN_EMAIL, company_data['company_name'], email)

        return {
            "message": "Company profile updated and submitted for approval",
            "status": "pending"
        }, 200
    # ---------------- Update Company Bank ----------------
    @staticmethod
    def update_company_bank(form_data, files):
        try:
            # ✅ Get Form Fields
            email = form_data.get("email")
            swift = (form_data.get("swift") or "").upper()
            bank_name = form_data.get("bank_name")
            holder_name = form_data.get("holder_name")
            account_number = form_data.get("account_number")
    
            # ✅ Get Uploaded File
            statement = files.get("bank_statement")
    
            logging.info(f"Bank statement received: {statement}")
    
            # ✅ Check Required Fields
            if not all([email, swift, bank_name, holder_name, account_number]):
                return {"error": "All fields are required"}, 400
    
            # ✅ Validate SWIFT Format
            if not re.match(r'^[A-Z]{4}MY[A-Z0-9]{2}([A-Z0-9]{3})?$', swift):
                return {"error": "Invalid SWIFT format"}, 400
    
            # ✅ Validate Account Number
            if not re.match(r'^[0-9]{6,20}$', account_number):
                return {"error": "Invalid account number"}, 400
    
            # ✅ Encrypt Bank Details
            bank_details = {
                "swift_enc": cipher.encrypt(swift.encode()).decode(),
                "account_number_enc": cipher.encrypt(account_number.encode()).decode(),
                "holder_name": holder_name,
                "bank_name": bank_name
            }
    
            # =====================================================
            # ✅ STEP 1: Read File Bytes FIRST (Before Saving)
            # =====================================================
            statement_bytes = statement.read()
    
            logging.info(f"Uploaded File Size: {len(statement_bytes)} bytes")
    
            if len(statement_bytes) == 0:
                return {"error": "Uploaded bank statement file is empty"}, 400
    
            # =====================================================
            # ✅ STEP 2: Reset Pointer for Saving
            # =====================================================
            statement.seek(0)
    
            # =====================================================
            # ✅ STEP 3: Save File Physically (Optional)
            # =====================================================
            save_uploaded_file(statement, "company_bank_statements")
    
            # =====================================================
            # ✅ STEP 4: Store in Database
            # =====================================================
            success = ContractorModel.update_company_bank(
                email,
                bank_details,
                statement_bytes
            )
    
            if not success:
                return {"error": "Failed to update bank details"}, 500
    
            # ✅ Send Confirmation Email
            send_email(
                email,
                "Bank Details Submitted",
                "Your bank details have been successfully submitted and stored securely."
            )
    
            return {"message": "Bank details updated successfully"}, 200
    
        except Exception as e:
            logging.error("Bank Update Controller Error: %s", str(e))
            return {"error": "Internal server error"}, 500
    
    # ---------------- Notifications ----------------
    @staticmethod
    def get_notifications(email):
        if not email:
            return {"error": "Email required"}, 400

        notifications = ContractorModel.fetch_notifications(email)
        return notifications, 200

    @staticmethod
    def unread_count(email):
        if not email:
            return {"error": "Email required"}, 400

        count = ContractorModel.fetch_unread_count(email)
        return {"count": count}, 200

    @staticmethod
    def mark_as_read(data):
        message_id = data.get('message_id')
        if not message_id:
            return {"error": "Message ID required"}, 400

        updated = ContractorModel.mark_notification_read(message_id)
        if updated:
            return {"success": True}, 200
        return {"error": "Notification not found"}, 404

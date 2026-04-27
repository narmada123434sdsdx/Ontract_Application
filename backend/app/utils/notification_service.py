from firebase_admin import messaging
import logging


# =====================================================
# 🔥 SINGLE TOKEN NOTIFICATION
# =====================================================
def send_notification(token, title, body):
    """
    Send notification to a single device
    """

    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            webpush=messaging.WebpushConfig(
                notification=messaging.WebpushNotification(
                    title=title,
                    body=body,
                    icon="https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
                )
            ),
            token=token,
        )

        response = messaging.send(message)

        logging.info(f"✅ Single notification sent: {response}")

    except Exception as e:
        logging.error(f"❌ Error sending single notification: {e}", exc_info=True)


# =====================================================
# 🔥 MULTIPLE TOKENS NOTIFICATION (MAIN FUNCTION)
# =====================================================
def send_notification_to_tokens(tokens, title, body):
    logging.info("Notification function called")

    try:
        if not tokens:
            logging.warning("No tokens available")
            return

        message = messaging.MulticastMessage(
            data={
                "title": title,
                "body": body,
            },
            tokens=tokens,
        )

        response = messaging.send_each_for_multicast(message)

        logging.info(f"Success count: {response.success_count}")
        logging.info(f"Failure count: {response.failure_count}")

    except Exception as e:
        logging.error(f"Notification error: {e}", exc_info=True)


# =====================================================
# 🔥 OPTIONAL: SEND TO USER (FETCH TOKENS INSIDE)
# =====================================================
def send_notification_to_user(user_id, title, body, get_tokens_function):
    """
    Wrapper function:
    - Fetch tokens using model
    - Send notification

    get_tokens_function → pass your model function here
    """

    try:
        tokens, error = get_tokens_function(user_id)

        if error:
            logging.error(f"❌ Token fetch error: {error}")
            return

        if not tokens:
            logging.warning("⚠️ No tokens found for user")
            return

        send_notification_to_tokens(tokens, title, body)

    except Exception as e:
        logging.error(f"❌ Error sending notification to user: {e}", exc_info=True)
# app/controllers/state_bp.py
import logging
from flask import Blueprint, request, jsonify
from app.models.state_model import StateModel

state_bp = Blueprint("state_bp", __name__, url_prefix="/api/state")

# -------------------------------
# GET ALL STATES
# -------------------------------
@state_bp.get("/")
def get_states():
    logging.info("STATE CONTROLLER CALLED")
    data = StateModel.get_all_states()
    return jsonify(data), 200


# -------------------------------
# CREATE NEW STATE
# -------------------------------
@state_bp.post("/")
def add_state():
    try:
        state_name = request.json.get("state_name")
        region_id  = request.json.get("region_id")
        status     = request.json.get("status")

        if not state_name:
            return jsonify({"error": "state_name is required"}), 400
        if not region_id:
            return jsonify({"error": "region_id is required"}), 400
        if not status:
            return jsonify({"error": "status is required"}), 400

        StateModel.insert_state(state_name, region_id, status)

        return jsonify({"message": "State created successfully"}), 201

    except Exception as e:
        logging.error(str(e))
        return jsonify({"error": str(e)}), 500


# -------------------------------
# UPDATE STATE
# -------------------------------
@state_bp.put("/<int:id>")
def update_state(id):
    state_name = request.json.get("state_name")

    if not state_name:
        return jsonify({"error": "state_name is required"}), 400

    StateModel.update_state(id, state_name)
    return jsonify({"message": "State updated successfully"}), 200


# -------------------------------
# DELETE STATE
# -------------------------------
@state_bp.delete("/<int:id>")
def delete_state(id):
    StateModel.delete_state(id)
    return jsonify({"message": "State deleted successfully"}), 200

@state_bp.get("/by-region/<int:region_id>")
def get_states_by_region(region_id):
    data = StateModel.get_states_by_region(region_id)
    return jsonify(data), 200

@state_bp.get("/id-types")
def get_identity_types():
    data = StateModel.get_id_types()
    return jsonify(data)


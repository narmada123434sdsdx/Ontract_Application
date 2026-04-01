import logging
from flask import Blueprint, request, jsonify
from app.models.region_model import RegionModel

region_bp = Blueprint("region_bp", __name__, url_prefix="/api/region")

@region_bp.get("/")
def get_regions():
    logging.info(f"check this is controller")
    data = RegionModel.get_all_regions()
    logging.info(f"CHECKOUT: '{data}'")
    return jsonify(data), 200

@region_bp.post("/")
def add_region():
    try:
        region_name = request.json.get("region_name")
        status = request.json.get("status")

        if not region_name:
            return jsonify({"error": "region_name is required"}), 400
        if not status:
            return jsonify({"error": "status is required"}), 400

        # Just insert, no need to capture returned value
        RegionModel.insert_region(region_name, status)

        return jsonify({"message": "Region created successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@region_bp.put("/<int:id>")
def update_region(id):
    region_name = request.json.get("region_name")
    status = request.json.get("status")
    logging.info(f"checkthe input: '{status}'")
    logging.info(f"checkthe input: '{region_name}'")
    RegionModel.update_region(id, region_name, status)
    return jsonify({"message": "updated"}), 200

@region_bp.delete("/<int:id>")
def delete_region(id):
    RegionModel.delete_region(id)
    return jsonify({"message": "deleted"}), 200

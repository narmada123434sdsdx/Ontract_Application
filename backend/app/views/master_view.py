# backend/app/views/master_view.py

from flask import Blueprint, request, jsonify
from app.controllers.master_controller import MasterController

master_bp = Blueprint("master_bp", __name__)

# ======================================================
# CATEGORY ROUTES (Fully CORS + OPTIONS Supported)
# ======================================================

@master_bp.route("/category", methods=["GET", "OPTIONS"])
def get_categories():
    if request.method == "OPTIONS":
        return jsonify({"status": "OK"}), 200

    categories = MasterController.get_all_categories()
    return jsonify([dict(row) for row in categories]), 200


@master_bp.route("/category", methods=["POST", "OPTIONS"])
def add_category():
    if request.method == "OPTIONS":
        return jsonify({"status": "OK"}), 200

    data = request.json
    result = MasterController.add_category(data)

    return jsonify({
        "message": "Category added",
        "id": result["id"],
        "category_id": result["category_id"]
    }), 201


@master_bp.route("/category/<int:cat_id>", methods=["PUT", "OPTIONS"])
def update_category(cat_id):
    if request.method == "OPTIONS":
        return jsonify({"status": "OK"}), 200

    data = request.json
    updated = MasterController.update_category(cat_id, data)

    if not updated:
        return jsonify({"error": "Category not found"}), 404

    return jsonify({"message": "Category updated"}), 200


@master_bp.route("/category/<int:cat_id>", methods=["DELETE", "OPTIONS"])
def delete_category(cat_id):
    if request.method == "OPTIONS":
        return jsonify({"status": "OK"}), 200

    deleted = MasterController.delete_category(cat_id)

    if not deleted:
        return jsonify({"error": "Category not found"}), 404

    return jsonify({"message": "Category deleted"}), 200


# ===========================
# ITEM ROUTES (WITH OPTIONS)
# ===========================

@master_bp.route("/items", methods=["GET", "OPTIONS"])
def get_items():
    if request.method == "OPTIONS":
        return "", 200
    data = MasterController.get_all_items()
    return jsonify([dict(row) for row in data]), 200


@master_bp.route("/items", methods=["POST", "OPTIONS"])
def add_item():
    if request.method == "OPTIONS":
        return "", 200

    data = request.json
    result = MasterController.add_item(data)
    return jsonify({"message": "Item added", "id": result["id"]}), 201


@master_bp.route("/items/<int:item_id>", methods=["PUT", "OPTIONS"])
def update_item(item_id):
    if request.method == "OPTIONS":
        return "", 200

    data = request.json
    updated = MasterController.update_item(item_id, data)
    return jsonify({"message": "Item updated"}) if updated else ({"error": "Not found"}, 404)


@master_bp.route("/items/<int:item_id>", methods=["DELETE", "OPTIONS"])
def delete_item(item_id):
    if request.method == "OPTIONS":
        return "", 200

    deleted = MasterController.delete_item(item_id)
    return jsonify({"message": "Item deleted"}) if deleted else ({"error": "Not found"}, 404)
# ================= TYPE ROUTES =================

@master_bp.route("/types", methods=["GET", "OPTIONS"])
def get_types():
    if request.method == "OPTIONS":
        return "", 200
    try:
        rows = MasterController.get_all_types()
        return jsonify([dict(row) for row in rows]), 200
    except Exception as e:
        print("GET TYPES ERROR:", e)
        return jsonify({"error": str(e)}), 500


@master_bp.route("/types", methods=["POST", "OPTIONS"])
def add_type():
    if request.method == "OPTIONS":
        return "", 200
    try:
        data = request.json
        result = MasterController.add_type(data)
        return jsonify({
            "message": "Type added",
            "id": result["id"],
            "type_id": result["type_id"]
        }), 201
    except Exception as e:
        print("ADD TYPE ERROR:", e)
        return jsonify({"error": str(e)}), 500


@master_bp.route("/types/<int:type_id>", methods=["PUT", "OPTIONS"])
def update_type(type_id):
    if request.method == "OPTIONS":
        return "", 200
    try:
        data = request.json
        MasterController.update_type(type_id, data)
        return jsonify({"message": "Type updated"}), 200
    except Exception as e:
        print("UPDATE TYPE ERROR:", e)
        return jsonify({"error": str(e)}), 500


@master_bp.route("/types/<int:type_id>", methods=["DELETE", "OPTIONS"])
def delete_type(type_id):
    if request.method == "OPTIONS":
        return "", 200
    try:
        MasterController.delete_type(type_id)
        return jsonify({"message": "Type deleted"}), 200
    except Exception as e:
        print("DELETE TYPE ERROR:", e)
        return jsonify({"error": str(e)}), 500
    
    
    
# ================= DESCRIPTION ROUTES =================

@master_bp.route("/description", methods=["GET", "OPTIONS"])
def get_descriptions():
    if request.method == "OPTIONS":
        return "", 200
    rows = MasterController.get_all_descriptions()
    return jsonify([dict(r) for r in rows]), 200


@master_bp.route("/description", methods=["POST", "OPTIONS"])
def add_description():
    if request.method == "OPTIONS":
        return "", 200
    data = request.json
    result = MasterController.add_description(data)
    return jsonify({
        "message": "Description added",
        "id": result["id"],
        "description_id": result["description_id"]
    }), 201


@master_bp.route("/description/<int:desc_id>", methods=["PUT", "OPTIONS"])
def update_description(desc_id):
    if request.method == "OPTIONS":
        return "", 200
    data = request.json
    MasterController.update_description(desc_id, data)
    return jsonify({"message": "Description updated"}), 200


@master_bp.route("/description/<int:desc_id>", methods=["DELETE", "OPTIONS"])
def delete_description(desc_id):
    if request.method == "OPTIONS":
        return "", 200
    MasterController.delete_description(desc_id)
    return jsonify({"message": "Description deleted"}), 200

@master_bp.route("/items/<int:category_id>")
def get_items_by_category(category_id):
    items = MasterController.fetch_item_by_category_id(category_id)
    return jsonify(items), 200


@master_bp.route("/types/filter")
def get_types_filtered():
    category_id = request.args.get("category_id", type=int)
    item_id = request.args.get("item_id", type=int)

    if not category_id or not item_id:
        return jsonify([])

    types = MasterController.fetch_types(category_id, item_id)
    return jsonify(types)

@master_bp.route("/description/filter")
def get_description_filtered():

    category_id = request.args.get("category_id", type=int)
    item_id = request.args.get("item_id", type=int)
    type_id = request.args.get("type_id", type=int)

    if not category_id or not item_id or not type_id:
        return jsonify([]), 200

    descriptions = MasterController.fetch_descriptions(category_id, item_id, type_id)
    return jsonify(descriptions), 200

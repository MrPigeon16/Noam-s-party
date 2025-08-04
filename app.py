# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import database

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

@app.route('/submit', methods=['POST'])
def submit():
    data = request.get_json()
    hash_value = data.get("hash")
    
    if not hash_value:
        return jsonify({"status": "error", "message": "Missing hash"}), 400

    guest = database.get_guest_info(hash_value)
    if guest:
        return jsonify({"status": "ok", "guest": {
            "id": guest[0],
            "name": guest[1],
            "hash": guest[2],
            "inside": bool(guest[3])
        }})
    else:
        return jsonify({"status": "not_found"}), 404

@app.route('/redeem', methods=['POST'])
def redeem():
    try:
        data = request.get_json()
        hash_value = data.get("hash")

        if not hash_value:
            return jsonify({"status": "error", "message": "No hash provided"}), 400

        guest = database.get_guest_info(hash_value)
        if not guest:
            return jsonify({"status": "not_found"}), 404

        database.update_inside_status(hash_value, True)
        updated_guest = database.get_guest_info(hash_value)

        return jsonify({"status": "ok", "guest": {
            "id": updated_guest[0],
            "name": updated_guest[1],
            "hash": updated_guest[2],
            "inside": bool(updated_guest[3])
        }})
    except Exception as e:
        print("Error in /redeem:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/COMPLETE', methods=['POST'])
def complete():
    try:
        all_guests = database.get_all_guest()
        return jsonify({"status": "ok", "guest_info": all_guests})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

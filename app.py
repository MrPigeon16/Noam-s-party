from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import database

app = Flask(__name__)
CORS(app)  # This allows requests from your frontend (GitHub Pages)

def get_guest_info(hash_value):
    conn = sqlite3.connect('party.db')
    c = conn.cursor()
    c.execute('SELECT id, name, hash, inside FROM guests WHERE hash = ?', (hash_value,))
    guest = c.fetchone()
    conn.close()
    return guest

def update_inside_status(hash_value, inside_status=True):
    conn = sqlite3.connect('party.db')
    c = conn.cursor()
    c.execute('UPDATE guests SET inside = ? WHERE hash = ?', (int(inside_status), hash_value))
    conn.commit()
    conn.close()

@app.route('/submit', methods=['POST'])
def submit():
    data = request.get_json()
    hash_value = data.get("hash")
    guest = get_guest_info(hash_value)
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
    data = request.get_json()
    hash_value = data.get("hash")
    database.update_inside_status(hash_value,1)
    guest = database.get_guest_info(hash_value)
    return jsonify({"status": "ok", "guest": {
            "id": guest[0],
            "name": guest[1],
            "hash": guest[2],
            "inside": bool(guest[3])
        }})


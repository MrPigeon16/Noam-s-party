from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This allows requests from your frontend (GitHub Pages)

@app.route('/submit', methods=['POST'])
def submit():
    data = request.get_json()
    print(data)  # You can also save this to a DB
    return jsonify({"status": "ok", "received": data})

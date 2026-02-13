from flask import Flask, request, jsonify
from flask_cors import CORS

import sys
import os

# Ensure BACKEND directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model_loader import model, SYMPTOM_LIST
from severity import determine_severity
from utils import validate_symptoms, encode_symptoms

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "MediTriage Backend is running"
    })


# Prediction endpoint
@app.route("/predict", methods=["POST"])
@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()
    user_symptoms = data.get("symptoms", [])

    # Validate input
    is_valid, error = validate_symptoms(user_symptoms)
    if not is_valid:
        return jsonify({"error": error}), 400

    # Encode symptoms
    input_vector = encode_symptoms(user_symptoms, SYMPTOM_LIST)

    # Predict disease
    predicted_disease = model.predict([input_vector])[0]

    # Determine severity
    severity = determine_severity(user_symptoms)

    return jsonify({
        "severity": severity,
        "predicted_disease": predicted_disease
    })


# Send symptom list to frontend
@app.route("/symptoms", methods=["GET"])
@app.route("/api/symptoms", methods=["GET"])
def get_symptoms():
    return jsonify(SYMPTOM_LIST)


if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=debug_mode, use_reloader=False)

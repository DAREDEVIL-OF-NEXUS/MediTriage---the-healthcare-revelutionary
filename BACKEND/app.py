from flask import Flask, request, jsonify
from flask_cors import CORS

import sys
import os

# Ensure the current directory (BACKEND) is in sys.path so that imports work
# when running as a script AND when imported as a module by Vercel
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model_loader import model, SYMPTOM_LIST
from severity import determine_severity
from utils import validate_symptoms, encode_symptoms

# Initialize Flask app
app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "MediTriage Backend is running"
    })


@app.route("/predict", methods=["POST"])
@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()
    user_symptoms = data.get("symptoms", [])

    # Validate input
    is_valid, error = validate_symptoms(user_symptoms)
    if not is_valid:
        return jsonify({"error": error}), 400

    # Encode symptoms for ML model
    input_vector = encode_symptoms(user_symptoms, SYMPTOM_LIST)

    # Disease prediction
    predicted_disease = model.predict([input_vector])[0]

    # Severity classification
    severity = determine_severity(user_symptoms)

    return jsonify({
        "severity": severity,
        "predicted_disease": predicted_disease
    })


if __name__ == "__main__":
    app.run(debug=True)

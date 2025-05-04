from flask import Blueprint, request, jsonify
from app.models.menstruation_cycle import predict_cycle_phases
import numpy as np

cycle_bp = Blueprint('cycle', __name__)

def clean_json_data(data):
    """Recursively clean NaN values from a dictionary or list, converting them to None."""
    if isinstance(data, dict):
        return {k: clean_json_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_json_data(item) for item in data]
    elif isinstance(data, float) and np.isnan(data):
        return None
    return data

@cycle_bp.route('/predict-cycle', methods=['POST'])
def predict_cycle():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        required_fields = ['lastPeriodDate', 'cycleLength', 'bleedingDays', 'age', 'weight', 'height']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Extract fields
        last_period_date = data['lastPeriodDate']  # Expected in 'DD-MM-YYYY' format
        cycle_length = int(data['cycleLength'])
        bleeding_days = int(data['bleedingDays'])
        age = int(data['age'])
        weight_kg = float(data['weight'])
        height_feet = float(data['height'])

        # Validate fields
        if cycle_length < 21 or cycle_length > 35:
            return jsonify({"error": "Cycle length must be between 21 and 35 days"}), 400
        if bleeding_days < 2 or bleeding_days > 7:
            return jsonify({"error": "Bleeding days must be between 2 and 7 days"}), 400

        # Predict cycle phases using the model
        cycle_phases = predict_cycle_phases(
            last_period_date_str=last_period_date,
            cycle_length=cycle_length,
            bleeding_days=bleeding_days,
            age=age,
            weight_kg=weight_kg,
            height_feet=height_feet
        )

        # Clean the phases to ensure no NaN values
        cleaned_cycle_phases = clean_json_data(cycle_phases)

        return jsonify({
            "cycle_phases": cleaned_cycle_phases
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
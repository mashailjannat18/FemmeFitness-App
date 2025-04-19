from flask import Blueprint, request, jsonify
from app.models.workout_plan import generate_workout_plan
from app.models.meal_plan import generate_meal_plan
import numpy as np

workout_bp = Blueprint('workout', __name__)

def clean_json_data(data):
    """Recursively clean NaN values from a dictionary or list, converting them to None."""
    if isinstance(data, dict):
        return {k: clean_json_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_json_data(item) for item in data]
    elif isinstance(data, float) and np.isnan(data):
        return None
    return data

@workout_bp.route('/generate-plan', methods=['POST'])
def generate_plan():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        required_fields = ['age', 'activityLevel', 'goal', 'weight', 'challengeDays', 'preferredRestDay', 'height']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Generate workout plan
        workout_plan = generate_workout_plan(data)

        # Generate meal plan based on workout plan
        meal_plan = generate_meal_plan(workout_plan, data)

        # Clean the plans to ensure no NaN values
        cleaned_workout_plan = clean_json_data(workout_plan)
        cleaned_meal_plan = clean_json_data(meal_plan)

        return jsonify({
            "workout_plan": cleaned_workout_plan,
            "meal_plan": cleaned_meal_plan
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
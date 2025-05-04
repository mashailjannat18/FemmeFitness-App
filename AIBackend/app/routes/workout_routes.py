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

        # Generate workout plan and get intensity
        workout_plan, intensity = generate_workout_plan(data)

        # Generate meal plan based on workout plan
        meal_plan = generate_meal_plan((workout_plan, intensity), data)

        # Clean the plans to ensure no NaN values
        cleaned_workout_plan = clean_json_data(workout_plan)
        cleaned_meal_plan = clean_json_data(meal_plan)

        return jsonify({
            "workout_plan": cleaned_workout_plan,
            "meal_plan": cleaned_meal_plan,
            "intensity": intensity
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@workout_bp.route('/update-plan', methods=['POST'])
def update_plan():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        required_fields = ['age', 'activityLevel', 'goal', 'weight', 'challengeDays', 'preferredRestDay', 'height', 'currentDay', 'userId', 'workoutPlanId']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        current_day = int(data['currentDay'])
        total_days = int(data['challengeDays'])

        if current_day <= 0 or current_day > total_days:
            return jsonify({"error": "Invalid current day"}), 400

        # Calculate remaining days
        remaining_days = total_days - (current_day - 1)

        if remaining_days <= 0:
            return jsonify({"error": "No remaining days to update"}), 400

        # Create payload for generating new plan for remaining days
        plan_data = {
            "age": data['age'],
            "activityLevel": data['activityLevel'],
            "goal": data['goal'],
            "weight": data['weight'],
            "challengeDays": remaining_days,
            "preferredRestDay": data['preferredRestDay'],
            "height": data['height']
        }

        # Generate new workout and meal plans for the remaining days
        workout_plan, intensity = generate_workout_plan(plan_data)
        meal_plan = generate_meal_plan((workout_plan, intensity), plan_data)

        # Clean the plans
        cleaned_workout_plan = clean_json_data(workout_plan)
        cleaned_meal_plan = clean_json_data(meal_plan)

        return jsonify({
            "workout_plan": cleaned_workout_plan,
            "meal_plan": cleaned_meal_plan,
            "intensity": intensity
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
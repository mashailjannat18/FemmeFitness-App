from flask import Blueprint, request, jsonify
from app.models.workout_plan import generate_workout_plan
from app.models.meal_plan import generate_meal_plan
import numpy as np
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

workout_bp = Blueprint('workout', __name__)

# Mapping of user-facing goal strings to internal keys
GOAL_MAPPING = {
    "Lose Weight": "weight_loss",
    "Gain Weight": "gain_weight",
    "Muscle Build": "build_muscle",
    "Stay Fit": "stay_fit"
}

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

        # Normalize the goal
        goal = data['goal']
        if goal in GOAL_MAPPING:
            data['goal'] = GOAL_MAPPING[goal]
            logger.info(f"Normalized goal from {goal} to {data['goal']} for generate-plan")
        elif goal not in ["weight_loss", "gain_weight", "build_muscle", "stay_fit"]:
            logger.error(f"Invalid goal received: {goal}")
            return jsonify({"error": f"Invalid goal: {goal}. Must be one of {list(GOAL_MAPPING.keys()) + ['weight_loss', 'gain_weight', 'build_muscle', 'stay_fit']}"}), 400

        # Generate workout plan and get intensity
        workout_plan, intensity = generate_workout_plan(data)

        # Extract cycle phases from the payload
        cycle_phases = data.get('cyclePhases', [])

        # Generate meal plan, passing cycle phases
        meal_plan = generate_meal_plan((workout_plan, intensity), data, cycle_phases)

        # Clean the plans to ensure no NaN values
        cleaned_workout_plan = clean_json_data(workout_plan)
        cleaned_meal_plan = clean_json_data(meal_plan)

        return jsonify({
            "workout_plan": cleaned_workout_plan,
            "meal_plan": cleaned_meal_plan,
            "intensity": intensity
        }), 200

    except Exception as e:
        logger.error(f"Error in generate-plan: {str(e)}")
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

        # Normalize the goal
        goal = data['goal']
        logger.info(f"Received goal: {goal}")
        if goal in GOAL_MAPPING:
            data['goal'] = GOAL_MAPPING[goal]
            logger.info(f"Normalized goal from {goal} to {data['goal']} for update-plan")
        elif goal not in ["weight_loss", "gain_weight", "build_muscle", "stay_fit"]:
            logger.error(f"Invalid goal received: {goal}")
            return jsonify({"error": f"Invalid goal: {goal}. Must be one of {list(GOAL_MAPPING.keys()) + ['weight_loss', 'gain_weight', 'build_muscle', 'stay_fit']}"}), 400

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
        logger.info(f"Plan data prepared: {plan_data}")

        # Generate new workout and meal plans for the remaining days
        workout_plan, intensity = generate_workout_plan(plan_data)
        if not workout_plan:
            logger.error(f"Workout plan generation failed for goal: {data['goal']}")
            return jsonify({"error": f"Failed to generate workout plan for goal: {data['goal']}"}), 400

        meal_plan = generate_meal_plan((workout_plan, intensity), plan_data)
        if not meal_plan:
            logger.error(f"Meal plan generation failed for goal: {data['goal']}")
            return jsonify({"error": f"Failed to generate meal plan for goal: {data['goal']}"}), 400

        # Clean the plans
        cleaned_workout_plan = clean_json_data(workout_plan)
        cleaned_meal_plan = clean_json_data(meal_plan)

        return jsonify({
            "workout_plan": cleaned_workout_plan,
            "meal_plan": cleaned_meal_plan,
            "intensity": intensity
        }), 200

    except ValueError as ve:
        logger.error(f"ValueError in update-plan: {str(ve)}")
        return jsonify({"error": f"Invalid data format: {str(ve)}"}), 400
    except Exception as e:
        logger.error(f"Unexpected error in update-plan: {str(e)}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
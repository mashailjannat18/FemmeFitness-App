from flask import Blueprint, request, jsonify
from app.services.workout_service import WorkoutService
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

workout_bp = Blueprint('workout', __name__)
workout_service = WorkoutService()

@workout_bp.route('/generate-plan', methods=['POST'])
def generate_workout_plan():
    try:
        user_data = request.get_json()
        logger.info("Received user data: %s", user_data)  # Log the incoming payload

        if not user_data:
            logger.error("No user data provided")
            return jsonify({"error": "No user data provided"}), 400

        required_fields = ['age', 'activityLevel', 'goal', 'weight', 'challengeDays']
        for field in required_fields:
            if field not in user_data:
                logger.error("Missing required field: %s", field)
                return jsonify({"error": f"Missing required field: {field}"}), 400

        plan = workout_service.generate_workout_plan(user_data)
        logger.info("Generated workout plan: %s", plan)  # Log the generated plan

        return jsonify({"plan": plan}), 200

    except Exception as e:
        logger.error("Error generating workout plan: %s", str(e))
        return jsonify({"error": str(e)}), 500
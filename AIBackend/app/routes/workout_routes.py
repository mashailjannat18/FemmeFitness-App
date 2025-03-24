from flask import Blueprint, request, jsonify
from app.services.workout_service import WorkoutService

workout_bp = Blueprint('workout', __name__)
workout_service = WorkoutService()

@workout_bp.route('/generate-plan', methods=['POST'])
def generate_workout_plan():
    try:
        user_data = request.get_json()
        if not user_data:
            return jsonify({"error": "No user data provided"}), 400

        required_fields = ['age', 'activityLevel', 'goal', 'weight', 'challengeDays']
        for field in required_fields:
            if field not in user_data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        plan = workout_service.generate_workout_plan(user_data)
        return jsonify({"plan": plan}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
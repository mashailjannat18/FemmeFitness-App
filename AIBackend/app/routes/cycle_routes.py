from flask import Blueprint, request, jsonify
from app.models.menstruation_cycle import predict_cycle_phases
from app.models.ovulation_recalibration import predict_recalibrated_future_phase
import numpy as np
from datetime import datetime, timedelta
import requests
import os

cycle_bp = Blueprint('cycle', __name__)

# Supabase configuration (replace with your actual Supabase URL and API key)
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://<your-supabase-project-id>.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', '<your-supabase-service-role-key>')
SUPABASE_HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
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

@cycle_bp.route('/recalibrate-cycle', methods=['POST'])
def recalibrate_cycle():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        required_fields = ['user_id']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        user_id = data['user_id']

        # Fetch user data from Supabase
        user_response = requests.post(
            f'{SUPABASE_URL}/rest/v1/rpc/get_user_data',
            headers=SUPABASE_HEADERS,
            json={"p_user_id": user_id}
        )
        if user_response.status_code != 200:
            print(f"Supabase error response: {user_response.text}, Status Code: {user_response.status_code}")
            return jsonify({"error": "Failed to fetch user data from Supabase"}), 500

        user_data = user_response.json()
        if not user_data or len(user_data) == 0:
            return jsonify({"error": "User not found"}), 404

        user = user_data[0]
        last_period_date = user.get('last_period_date')
        cycle_length = user.get('cycle_length')
        bleeding_days = user.get('bleeding_days')

        if not last_period_date or not cycle_length or not bleeding_days:
            return jsonify({"error": "Missing required user data for cycle recalibration"}), 400

        # Fetch average sleep hours for the past 5 days
        today = datetime.today().strftime('%Y-%m-%d')
        five_days_ago = (datetime.today() - timedelta(days=5)).strftime('%Y-%m-%d')
        sleep_response = requests.post(
            f'{SUPABASE_URL}/rest/v1/rpc/get_avg_sleep',
            headers=SUPABASE_HEADERS,
            json={
                "p_user_id": user_id,
                "p_start_date": five_days_ago,
                "p_end_date": today
            }
        )
        if sleep_response.status_code != 200:
            print(f"Supabase sleep error response: {sleep_response.text}, Status Code: {sleep_response.status_code}")
            return jsonify({"error": "Failed to fetch sleep data from Supabase"}), 500

        sleep_data = sleep_response.json()
        avg_sleep_hours = sleep_data[0]['avg_sleep_hours'] if sleep_data and sleep_data[0]['avg_sleep_hours'] is not None else 0.0

        # Fetch average water intake for the past 5 days
        water_response = requests.post(
            f'{SUPABASE_URL}/rest/v1/rpc/get_avg_water_intake',
            headers=SUPABASE_HEADERS,
            json={
                "p_user_id": user_id,
                "p_start_date": five_days_ago,
                "p_end_date": today
            }
        )
        if water_response.status_code != 200:
            print(f"Supabase water intake error response: {water_response.text}, Status Code: {water_response.status_code}")
            return jsonify({"error": "Failed to fetch water intake data from Supabase"}), 500

        water_data = water_response.json()
        avg_water_liters = water_data[0]['avg_water_liters'] if water_data and water_data[0]['avg_water_liters'] is not None else 0.0

        # Convert last_period_date to the required format (DD-MM-YYYY)
        last_period_date = datetime.strptime(last_period_date, '%Y-%m-%d').strftime('%d-%m-%Y')

        # Call the recalibration model
        recalibrated_phases = predict_recalibrated_future_phase(
            last_period_date_str=last_period_date,
            cycle_length=cycle_length,
            bleeding_days=bleeding_days,
            avg_sleep_hours=avg_sleep_hours,
            avg_water_liters=avg_water_liters
        )

        # Clean the phases to ensure no NaN values
        cleaned_phases = clean_json_data(recalibrated_phases)

        return jsonify({
            "recalibrated_phases": cleaned_phases
        }), 200

    except Exception as e:
        print(f"Error in recalibrate_cycle: {str(e)}")
        return jsonify({"error": str(e)}), 500
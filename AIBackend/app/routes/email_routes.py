from flask import Blueprint, request, jsonify, current_app
import requests
import logging

email_bp = Blueprint('email', __name__)

def validate_email_data(data):
    """Validate email request data"""
    if not data:
        return False, "No data provided"
    
    email = data.get('email')
    code = data.get('code')
    
    if not email or not isinstance(email, str):
        return False, "Valid email is required"
    
    if not code or not isinstance(code, str):
        return False, "Valid confirmation code is required"
    
    return True, ""

@email_bp.route('/send-confirmation-email', methods=['POST'])
def send_confirmation_email():
    try:
        data = request.get_json()
        
        # Validate input
        is_valid, error_msg = validate_email_data(data)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        email = data['email']
        code = data['code']
        
        # Prepare Brevo payload
        brevo_data = {
            'sender': {
                'name': current_app.config['BREVO_SENDER_NAME'],
                'email': current_app.config['BREVO_SENDER_EMAIL']
            },
            'to': [{'email': email}],
            'subject': 'Your FemmeFitness Confirmation Code',
            'textContent': f'Your confirmation code is {code}. It expires in 10 minutes.',
            'htmlContent': f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Your FemmeFitness Confirmation Code</h2>
                <p>Your confirmation code is <strong>{code}</strong>.</p>
                <p>Please enter this code in the app to complete your registration.</p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            </div>
            """
        }
        
        # Send request to Brevo API
        response = requests.post(
            current_app.config['BREVO_API_ENDPOINT'],
            headers={
                'accept': 'application/json',
                'api-key': current_app.config['BREVO_API_KEY'],
                'content-type': 'application/json'
            },
            json=brevo_data,
            timeout=10  # Add timeout to prevent hanging
        )
        
        # Handle response
        if response.status_code != 201:
            current_app.logger.error(
                f"Brevo API error - Status: {response.status_code}, Response: {response.text}"
            )
            return jsonify({
                'error': 'Failed to send confirmation email',
                'details': 'Email service unavailable'
            }), 503
        
        current_app.logger.info(f"Confirmation code sent to {email}")
        return jsonify({
            'message': 'Confirmation code sent successfully',
            'email': email
        }), 200

    except requests.Timeout:
        current_app.logger.error("Brevo API request timed out")
        return jsonify({'error': 'Email service timeout'}), 503
        
    except requests.RequestException as e:
        current_app.logger.error(f"Brevo API connection error: {str(e)}")
        return jsonify({'error': 'Email service unavailable'}), 503
        
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
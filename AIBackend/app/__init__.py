import os
from flask import Flask
from dotenv import load_dotenv

def create_app():
    app = Flask(__name__)
    
    # Load environment variables
    load_dotenv()
    
    # Validate required environment variables
    required_vars = ['BREVO_API_KEY', 'BREVO_SENDER_EMAIL']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    # Configure Brevo settings
    app.config.update({
        'BREVO_API_KEY': os.getenv('BREVO_API_KEY'),
        'BREVO_SENDER_EMAIL': os.getenv('BREVO_SENDER_EMAIL'),
        'BREVO_SENDER_NAME': os.getenv('BREVO_SENDER_NAME', 'FemmeFitness'),
        'BREVO_API_ENDPOINT': 'https://api.brevo.com/v3/smtp/email'
    })

    # Register blueprints
    from app.routes.workout_routes import workout_bp
    app.register_blueprint(workout_bp, url_prefix='/api')

    from app.routes import email_routes
    app.register_blueprint(email_routes.email_bp, url_prefix='/api')

    return app
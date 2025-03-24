from flask import Flask

def create_app():
    app = Flask(__name__)

    # Register blueprints
    from app.routes.workout_routes import workout_bp
    app.register_blueprint(workout_bp, url_prefix='/api')

    return app
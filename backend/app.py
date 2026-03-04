from flask import Flask
from flask_cors import CORS
from config import Config
from database import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    with app.app_context():
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        if 'vehicles' in inspector.get_table_names():
            cols = [c['name'] for c in inspector.get_columns('vehicles')]
            print(f"DEBUG: Vehicles columns: {cols}")
            
    CORS(app, supports_credentials=True, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.trips import trips_bp
    from routes.references import references_bp
    from routes.directions import directions_bp
    from routes.executors import executors_bp
    from routes.contract_providers import contract_providers_bp
    from routes.users import users_bp
    from routes.templates import templates_bp
    from routes.templates_actions import templates_actions_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(trips_bp, url_prefix='/api/trips')
    app.register_blueprint(references_bp, url_prefix='/api')
    app.register_blueprint(directions_bp, url_prefix='/api')
    app.register_blueprint(executors_bp)
    app.register_blueprint(contract_providers_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(templates_bp)
    app.register_blueprint(templates_actions_bp)
    
    # Create database tables and seed default users
    with app.app_context():
        from models import User
        db.create_all()

        default_users = [
            {'username': 'admin',      'password': 'admin123',      'role': 'admin'},
            {'username': 'dispatcher', 'password': 'dispatcher123', 'role': 'dispatcher'},
            {'username': 'viewer',     'password': 'viewer123',     'role': 'viewer'},
        ]
        for u in default_users:
            if not User.query.filter_by(username=u['username']).first():
                user = User(username=u['username'], role=u['role'])
                user.set_password(u['password'])
                db.session.add(user)
                print(f"Default user created: {u['username']} ({u['role']})")
        db.session.commit()
    
    return app

if __name__ == '__main__':
    app = create_app()
    # Debug mode enabled but reloader disabled to prevent cache issues
    app.run(debug=True, host='0.0.0.0', port=5555, use_reloader=False)

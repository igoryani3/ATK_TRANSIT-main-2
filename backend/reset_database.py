"""
Script to drop all tables and recreate them with new schema
"""
import sys
from app import create_app
from database import db

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def reset_database():
    """Drop all tables and recreate them"""
    print("Resetting database...")
    print("=" * 50)
    
    app = create_app()
    with app.app_context():
        # Drop all tables
        print("Dropping all tables...")
        db.drop_all()
        print("Tables dropped")
        
        # Recreate all tables with new schema
        print("Creating tables with new schema...")
        db.create_all()
        print("Tables created")
        
        # Create default user
        from models import User
        if not User.query.filter_by(username='dispatcher').first():
            default_user = User(username='dispatcher', role='dispatcher')
            default_user.set_password('dispatcher123')
            db.session.add(default_user)
            db.session.commit()
            print("Default dispatcher user created")
        
        print("=" * 50)
        print("Database reset completed successfully!")

if __name__ == '__main__':
    reset_database()

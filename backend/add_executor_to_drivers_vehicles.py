from app import create_app
from database import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    # Add executor_id to drivers table
    try:
        db.session.execute(text('ALTER TABLE drivers ADD COLUMN executor_id INTEGER'))
        print("✓ Added executor_id column to drivers table")
    except Exception as e:
        print(f"Column executor_id might already exist in drivers: {e}")

    # Add executor_id to vehicles table
    try:
        db.session.execute(text('ALTER TABLE vehicles ADD COLUMN executor_id INTEGER'))
        print("✓ Added executor_id column to vehicles table")
    except Exception as e:
        print(f"Column executor_id might already exist in vehicles: {e}")

    db.session.commit()
    print("✓ Migration completed successfully")

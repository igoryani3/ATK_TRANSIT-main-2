from app import create_app
from database import db
from sqlalchemy import text

def migrate_templates():
    app = create_app()
    with app.app_context():
        # Add new columns to templates table
        try:
            with db.engine.connect() as conn:
                # Check if columns exist before adding
                result = conn.execute(text("PRAGMA table_info(templates)"))
                existing_columns = [row[1] for row in result]

                columns_to_add = [
                    ("region", "VARCHAR(50)"),
                    ("contract", "VARCHAR(200)"),
                    ("type", "VARCHAR(100)"),
                    ("time_of_day", "VARCHAR(50)"),
                    ("executor", "VARCHAR(200)"),
                    ("vehicle_id", "INTEGER"),
                    ("driver_id", "INTEGER"),
                    ("driver_phone", "VARCHAR(50)")
                ]

                for col_name, col_type in columns_to_add:
                    if col_name not in existing_columns:
                        print(f"Adding column: {col_name}")
                        conn.execute(text(f"ALTER TABLE templates ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                    else:
                        print(f"Column {col_name} already exists, skipping")

                print("Migration completed successfully!")

        except Exception as e:
            print(f"Error during migration: {e}")
            raise

if __name__ == '__main__':
    migrate_templates()

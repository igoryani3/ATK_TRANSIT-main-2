from app import create_app
from database import db
from sqlalchemy import text

def migrate_drivers():
    app = create_app()
    with app.app_context():
        try:
            with db.engine.connect() as conn:
                # Check existing columns
                result = conn.execute(text("PRAGMA table_info(drivers)"))
                existing_columns = [row[1] for row in result]

                columns_to_add = [
                    ("birth_date", "DATE"),
                    ("backup_phone", "VARCHAR(50)"),
                    ("employment_status", "VARCHAR(100)"),
                    ("license_series_number", "VARCHAR(50)"),
                    ("license_issue_date", "DATE"),
                    ("license_expiry_date", "DATE"),
                    ("license_available", "BOOLEAN DEFAULT 0"),
                    ("passport_series_number", "VARCHAR(50)"),
                    ("passport_issue_date", "DATE"),
                    ("passport_issued_by", "TEXT"),
                    ("passport_available", "BOOLEAN DEFAULT 0"),
                    ("snils_number", "VARCHAR(50)"),
                    ("snils_available", "BOOLEAN DEFAULT 0"),
                    ("tachograph_number", "VARCHAR(50)"),
                    ("tachograph_issue_date", "DATE"),
                    ("tachograph_expiry_date", "DATE"),
                    ("tachograph_available", "BOOLEAN DEFAULT 0"),
                ]

                for col_name, col_type in columns_to_add:
                    if col_name not in existing_columns:
                        print(f"Adding column: {col_name}")
                        conn.execute(text(f"ALTER TABLE drivers ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                    else:
                        print(f"Column {col_name} already exists, skipping")

                print("Migration completed successfully!")

        except Exception as e:
            print(f"Error during migration: {e}")
            raise

if __name__ == '__main__':
    migrate_drivers()

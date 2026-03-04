import csv
from datetime import datetime
from app import create_app
from database import db
from models import Driver

def parse_date(date_str):
    """Parse date in DD.MM.YYYY format"""
    if not date_str or date_str.strip() == '':
        return None
    try:
        return datetime.strptime(date_str.strip(), '%d.%m.%Y').date()
    except:
        return None

def parse_bool(bool_str):
    """Parse TRUE/FALSE string to boolean"""
    return bool_str.strip().upper() == 'TRUE' if bool_str else False

def import_drivers_from_csv():
    app = create_app()
    with app.app_context():
        csv_path = 'database/db_drivers_info.csv'

        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)

            # Skip header rows (first 2 rows)
            data_rows = rows[2:]

            imported = 0
            skipped = 0

            for row in data_rows:
                if len(row) < 20:
                    continue

                # Skip empty rows or "не работают" section
                if not row[1] or row[1].strip() == '' or 'не работают' in row[0].lower():
                    continue

                full_name = row[1].strip()
                if not full_name:
                    continue

                # Check if driver already exists
                existing = Driver.query.filter_by(full_name=full_name).first()
                if existing:
                    print(f"Updating: {full_name}")
                    driver = existing
                else:
                    print(f"Creating: {full_name}")
                    driver = Driver(full_name=full_name)

                # Parse data
                driver.birth_date = parse_date(row[2])
                driver.phone = row[17].strip() if row[17] else ''
                driver.backup_phone = row[18].strip() if row[18] else None
                driver.employment_status = row[19].strip() if len(row) > 19 and row[19] else None

                # Driver's license
                driver.license_series_number = row[3].strip() if row[3] else None
                driver.license_issue_date = parse_date(row[4])
                driver.license_expiry_date = parse_date(row[5])
                driver.license_available = parse_bool(row[6])

                # Passport
                driver.passport_series_number = row[7].strip() if row[7] else None
                driver.passport_issue_date = parse_date(row[8])
                driver.passport_issued_by = row[9].strip() if row[9] else None
                driver.passport_available = parse_bool(row[10])

                # SNILS
                driver.snils_number = row[11].strip() if row[11] else None
                driver.snils_available = parse_bool(row[12])

                # Tachograph
                driver.tachograph_number = row[13].strip() if row[13] else None
                driver.tachograph_issue_date = parse_date(row[14])
                driver.tachograph_expiry_date = parse_date(row[15])
                driver.tachograph_available = parse_bool(row[16])

                if not existing:
                    db.session.add(driver)

                imported += 1

            db.session.commit()
            print(f"\nImport completed!")
            print(f"Imported/Updated: {imported}")
            print(f"Skipped: {skipped}")

if __name__ == '__main__':
    import_drivers_from_csv()

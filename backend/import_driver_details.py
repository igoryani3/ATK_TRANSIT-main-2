import csv
from datetime import datetime
from app import create_app
from database import db
from models import Driver

app = create_app()

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
    if not bool_str or bool_str.strip() == '':
        return False
    return bool_str.strip().upper() == 'TRUE'

with app.app_context():
    print("=== Importing Driver Details ===\n")

    with open('database/db_drivers_info.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

        # Skip first 2 header rows
        data_rows = rows[2:]

        updated_count = 0
        not_found_count = 0
        skipped_count = 0

        for row in data_rows:
            if len(row) < 20:
                continue

            # Extract data from CSV
            number = row[0].strip() if row[0] else ''
            full_name = row[1].strip() if row[1] else ''
            birth_date_str = row[2].strip() if row[2] else ''

            # Skip empty rows or section headers
            if not full_name or full_name in ['не работают', '']:
                skipped_count += 1
                continue

            # Driver's license
            license_series_number = row[3].strip() if row[3] else ''
            license_issue_date_str = row[4].strip() if row[4] else ''
            license_expiry_date_str = row[5].strip() if row[5] else ''
            license_available_str = row[6].strip() if row[6] else ''

            # Passport
            passport_series_number = row[7].strip() if row[7] else ''
            passport_issue_date_str = row[8].strip() if row[8] else ''
            passport_issued_by = row[9].strip() if row[9] else ''
            passport_available_str = row[10].strip() if row[10] else ''

            # SNILS
            snils_number = row[11].strip() if row[11] else ''
            snils_available_str = row[12].strip() if row[12] else ''

            # Tachograph
            tachograph_number = row[13].strip() if row[13] else ''
            tachograph_issue_date_str = row[14].strip() if row[14] else ''
            tachograph_expiry_date_str = row[15].strip() if row[15] else ''
            tachograph_available_str = row[16].strip() if row[16] else ''

            # Contact info
            phone = row[17].strip() if row[17] else ''
            backup_phone = row[18].strip() if row[18] else ''
            employment_status = row[19].strip() if row[19] else ''

            # Find driver in database by name
            driver = Driver.query.filter_by(full_name=full_name).first()

            if not driver:
                print(f"⚠️  Driver not found: {full_name}")
                not_found_count += 1
                continue

            # Update driver information
            driver.birth_date = parse_date(birth_date_str)
            driver.backup_phone = backup_phone if backup_phone else driver.backup_phone
            driver.employment_status = employment_status if employment_status else driver.employment_status

            # Update phone if not already set
            if phone and (not driver.phone or driver.phone == ''):
                driver.phone = phone

            # Driver's license
            driver.license_series_number = license_series_number
            driver.license_issue_date = parse_date(license_issue_date_str)
            driver.license_expiry_date = parse_date(license_expiry_date_str)
            driver.license_available = parse_bool(license_available_str)

            # Passport
            driver.passport_series_number = passport_series_number
            driver.passport_issue_date = parse_date(passport_issue_date_str)
            driver.passport_issued_by = passport_issued_by
            driver.passport_available = parse_bool(passport_available_str)

            # SNILS
            driver.snils_number = snils_number
            driver.snils_available = parse_bool(snils_available_str)

            # Tachograph
            driver.tachograph_number = tachograph_number
            driver.tachograph_issue_date = parse_date(tachograph_issue_date_str)
            driver.tachograph_expiry_date = parse_date(tachograph_expiry_date_str)
            driver.tachograph_available = parse_bool(tachograph_available_str)

            updated_count += 1
            print(f"✓ Updated: {full_name}")
            print(f"   Birth: {driver.birth_date}")
            print(f"   License: {driver.license_series_number} (expires: {driver.license_expiry_date})")
            print(f"   Passport: {driver.passport_series_number}")
            print(f"   SNILS: {driver.snils_number}")
            print(f"   Tachograph: {driver.tachograph_number} (expires: {driver.tachograph_expiry_date})")
            print()

        db.session.commit()

        print(f"\n=== Summary ===")
        print(f"Updated: {updated_count}")
        print(f"Not found: {not_found_count}")
        print(f"Skipped: {skipped_count}")

        # Show statistics
        print(f"\n=== Database Statistics ===")
        total_drivers = Driver.query.count()
        with_license = Driver.query.filter(Driver.license_available == True).count()
        with_passport = Driver.query.filter(Driver.passport_available == True).count()
        with_snils = Driver.query.filter(Driver.snils_available == True).count()
        with_tachograph = Driver.query.filter(Driver.tachograph_available == True).count()

        print(f"Total drivers: {total_drivers}")
        print(f"With valid license: {with_license}")
        print(f"With valid passport: {with_passport}")
        print(f"With SNILS: {with_snils}")
        print(f"With tachograph card: {with_tachograph}")

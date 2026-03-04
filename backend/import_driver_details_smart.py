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

def find_driver_by_name(full_name_with_patronymic, all_drivers):
    """
    Try to match driver by name parts.
    Russian full name format: Фамилия Имя Отчество
    Database format: Имя Фамилия
    """
    if not full_name_with_patronymic:
        return None

    parts = full_name_with_patronymic.strip().split()
    if len(parts) < 2:
        return None

    last_name = parts[0]  # Фамилия
    first_name = parts[1]  # Имя

    # Try exact match first
    for driver in all_drivers:
        if driver.full_name == full_name_with_patronymic:
            return driver

    # Try matching "Имя Фамилия" format
    name_variant1 = f"{first_name} {last_name}"
    for driver in all_drivers:
        if driver.full_name == name_variant1:
            return driver

    # Try matching by last name and first name parts
    for driver in all_drivers:
        driver_parts = driver.full_name.split()
        if len(driver_parts) >= 2:
            # Check if first name and last name match
            if first_name in driver.full_name and last_name in driver.full_name:
                return driver

    return None

with app.app_context():
    print("=== Importing Driver Details with Smart Matching ===\n")

    # Load all existing drivers
    all_drivers = Driver.query.all()
    print(f"Found {len(all_drivers)} drivers in database\n")

    with open('database/db_drivers_info.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

        # Skip first 2 header rows
        data_rows = rows[2:]

        updated_count = 0
        created_count = 0
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
            if not full_name or full_name in ['не работают', '', 'Роколь']:
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

            # Find driver in database
            driver = find_driver_by_name(full_name, all_drivers)

            if not driver:
                # Create new driver with full name
                print(f"➕ Creating new driver: {full_name}")
                driver = Driver(
                    full_name=full_name,
                    phone=phone if phone else ''
                )
                db.session.add(driver)
                db.session.flush()
                all_drivers.append(driver)
                created_count += 1
            else:
                print(f"✓ Updating existing driver: {driver.full_name} -> {full_name}")
                # Update full name to include patronymic
                driver.full_name = full_name
                updated_count += 1

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

            print(f"   Birth: {driver.birth_date}")
            print(f"   Phone: {driver.phone}")
            print(f"   License: {driver.license_series_number} (valid: {driver.license_available})")
            print(f"   Passport: {driver.passport_series_number} (valid: {driver.passport_available})")
            print(f"   SNILS: {driver.snils_number} (valid: {driver.snils_available})")
            print(f"   Tachograph: {driver.tachograph_number} (valid: {driver.tachograph_available})")
            print()

        db.session.commit()

        print(f"\n=== Summary ===")
        print(f"Updated existing: {updated_count}")
        print(f"Created new: {created_count}")
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

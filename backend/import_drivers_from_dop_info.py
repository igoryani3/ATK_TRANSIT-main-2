import csv
from app import create_app
from database import db
from models import Driver, Executor

app = create_app()

with app.app_context():
    # Read CSV file
    drivers_data = []

    with open('database/Доп_инфо.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

        # Skip first 3 rows (headers and info)
        for row in rows[3:]:
            if len(row) < 16:
                continue

            executor_name = row[12].strip() if row[12] else None
            license_plate = row[13].strip() if row[13] else None
            driver_name = row[14].strip() if row[14] else None
            driver_phone = row[15].strip() if row[15] else None

            # Skip if driver name or phone is empty or looks like placeholder
            if not driver_name or not driver_phone:
                continue
            if driver_name in ['', 'ИП Самцов Александр', 'ИП Праксин Сергей'] and driver_phone in ['ИП Самцов Александр', 'ИП Праксин Сергей']:
                continue

            drivers_data.append({
                'name': driver_name,
                'phone': driver_phone,
                'executor': executor_name
            })

    # Get unique drivers
    unique_drivers = {}
    for d in drivers_data:
        key = (d['name'], d['phone'])
        if key not in unique_drivers:
            unique_drivers[key] = d

    print(f"Found {len(unique_drivers)} unique drivers in CSV")

    # Get existing drivers from database
    existing_drivers = Driver.query.all()
    existing_driver_keys = {(d.full_name, d.phone) for d in existing_drivers}

    print(f"Found {len(existing_drivers)} existing drivers in database")

    # Get all executors for mapping
    executors = {e.name: e.id for e in Executor.query.all()}

    # Add new drivers
    added_count = 0
    for key, driver_data in unique_drivers.items():
        if key not in existing_driver_keys:
            executor_id = executors.get(driver_data['executor']) if driver_data['executor'] else None

            new_driver = Driver(
                full_name=driver_data['name'],
                phone=driver_data['phone'],
                executor_id=executor_id
            )
            db.session.add(new_driver)
            added_count += 1
            print(f"Adding: {driver_data['name']} ({driver_data['phone']}) - Executor: {driver_data['executor']}")

    if added_count > 0:
        db.session.commit()
        print(f"\n✓ Successfully added {added_count} new drivers")
    else:
        print("\n✓ No new drivers to add")

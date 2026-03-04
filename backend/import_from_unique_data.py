import json
from app import create_app
from database import db
from models import Executor, Vehicle, Driver

app = create_app()

with app.app_context():
    # Load unique data
    with open('database/unique_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Import Executors
    print("=== Importing Executors ===")
    existing_executors = {e.name for e in Executor.query.all()}
    added_executors = 0

    for performer in data['performers']:
        if performer not in existing_executors:
            executor = Executor(name=performer)
            db.session.add(executor)
            added_executors += 1
            print(f"+ {performer}")

    db.session.commit()
    print(f"✓ Added {added_executors} executors\n")

    # Refresh executor mapping
    executors_map = {e.name: e.id for e in Executor.query.all()}

    # 2. Import Vehicles
    print("=== Importing Vehicles ===")
    existing_vehicles = {v.license_plate for v in Vehicle.query.all()}
    added_vehicles = 0

    for plate in data['vehicles']:
        if plate not in existing_vehicles:
            vehicle = Vehicle(
                license_plate=plate,
                model='Не указана',
                capacity=None,
                owner=None,
                executor_id=None
            )
            db.session.add(vehicle)
            added_vehicles += 1
            print(f"+ {plate}")

    db.session.commit()
    print(f"✓ Added {added_vehicles} vehicles\n")

    # 3. Import Drivers
    print("=== Importing Drivers ===")
    existing_drivers = {d.full_name for d in Driver.query.all()}
    added_drivers = 0

    for driver_name in data['drivers']:
        if driver_name not in existing_drivers:
            driver = Driver(
                full_name=driver_name,
                phone='',
                executor_id=None
            )
            db.session.add(driver)
            added_drivers += 1
            print(f"+ {driver_name}")

    db.session.commit()
    print(f"✓ Added {added_drivers} drivers\n")

    print(f"=== Summary ===")
    print(f"Executors: {added_executors} new")
    print(f"Vehicles: {added_vehicles} new")
    print(f"Drivers: {added_drivers} new")

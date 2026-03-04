import csv
from app import create_app
from database import db
from models import Vehicle, Executor

app = create_app()

with app.app_context():
    # Read CSV file
    vehicles_data = []

    with open('database/Доп_инфо.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

        # Skip first 3 rows (headers and info)
        for row in rows[3:]:
            if len(row) < 16:
                continue

            executor_name = row[12].strip() if row[12] else None
            license_plate = row[13].strip() if row[13] else None
            model = row[14].strip() if row[14] else None

            # Skip if license plate is empty or looks like placeholder
            if not license_plate or license_plate in ['', 'Гос.номер']:
                continue

            # Try to extract capacity from people_count field
            capacity = None
            try:
                if row[5]:
                    capacity = int(row[5].strip())
            except:
                pass

            vehicles_data.append({
                'license_plate': license_plate,
                'model': model or 'Не указана',
                'capacity': capacity,
                'owner': executor_name,  # Use executor as owner for now
                'executor': executor_name
            })

    # Get unique vehicles by license plate
    unique_vehicles = {}
    for v in vehicles_data:
        plate = v['license_plate']
        if plate not in unique_vehicles:
            unique_vehicles[plate] = v

    print(f"Found {len(unique_vehicles)} unique vehicles in CSV")

    # Get existing vehicles from database
    existing_vehicles = Vehicle.query.all()
    existing_plates = {v.license_plate for v in existing_vehicles}

    print(f"Found {len(existing_vehicles)} existing vehicles in database")

    # Get all executors for mapping
    executors = {e.name: e.id for e in Executor.query.all()}

    # Add new vehicles
    added_count = 0
    for plate, vehicle_data in unique_vehicles.items():
        if plate not in existing_plates:
            executor_id = executors.get(vehicle_data['executor']) if vehicle_data['executor'] else None

            new_vehicle = Vehicle(
                license_plate=vehicle_data['license_plate'],
                model=vehicle_data['model'],
                capacity=vehicle_data['capacity'],
                owner=vehicle_data['owner'],
                executor_id=executor_id
            )
            db.session.add(new_vehicle)
            added_count += 1
            print(f"Adding: {vehicle_data['license_plate']} ({vehicle_data['model']}) - Executor: {vehicle_data['executor']}")

    if added_count > 0:
        db.session.commit()
        print(f"\n✓ Successfully added {added_count} new vehicles")
    else:
        print("\n✓ No new vehicles to add")

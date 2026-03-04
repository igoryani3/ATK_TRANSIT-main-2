import csv
from app import create_app
from database import db
from models import Executor, Vehicle, Driver

app = create_app()

with app.app_context():
    # Read CSV and build relationships
    print("=== Reading CSV ===")

    executors_data = {}  # name -> set of vehicles/drivers
    vehicles_data = {}   # plate -> {model, capacity, executor, driver}
    drivers_data = {}    # name -> {phone, executor, vehicles}

    with open('database/Доп_инфо.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

        for i, row in enumerate(rows[3:], start=4):
            if len(row) < 16:
                continue

            executor_name = row[12].strip() if row[12] else None
            vehicle_plate = row[13].strip() if row[13] else None
            driver_name = row[14].strip() if row[14] else None
            driver_phone = row[15].strip() if row[15] else None

            # Skip invalid entries
            if not vehicle_plate or len(vehicle_plate) > 50:
                continue
            if vehicle_plate in ['Такси', 'такси', 'Прямой', '1/2 круга']:
                continue
            if 'реальное время' in vehicle_plate.lower():
                continue

            # Collect executor data
            if executor_name and executor_name not in ['Прямой', '1/2 круга']:
                if executor_name not in executors_data:
                    executors_data[executor_name] = {'vehicles': set(), 'drivers': set()}
                if vehicle_plate:
                    executors_data[executor_name]['vehicles'].add(vehicle_plate)
                if driver_name:
                    executors_data[executor_name]['drivers'].add(driver_name)

            # Collect vehicle data
            if vehicle_plate:
                if vehicle_plate not in vehicles_data:
                    vehicles_data[vehicle_plate] = {
                        'executor': executor_name,
                        'drivers': set(),
                        'capacity': None
                    }
                if driver_name:
                    vehicles_data[vehicle_plate]['drivers'].add(driver_name)

                # Try to get capacity
                try:
                    if row[5]:
                        capacity = int(row[5].strip())
                        if not vehicles_data[vehicle_plate]['capacity']:
                            vehicles_data[vehicle_plate]['capacity'] = capacity
                except:
                    pass

            # Collect driver data
            if driver_name and driver_phone:
                # Skip if driver name looks like company
                if any(x in driver_name for x in ['ИП ', 'ООО ', 'Авангард', 'Авторетролюкс', 'Балтийские', 'КомТранс']):
                    continue
                if driver_name in ['Такси', 'Прямой']:
                    continue

                if driver_name not in drivers_data:
                    drivers_data[driver_name] = {
                        'phone': driver_phone,
                        'executor': executor_name,
                        'vehicles': set()
                    }
                if vehicle_plate:
                    drivers_data[driver_name]['vehicles'].add(vehicle_plate)

    print(f"Found {len(executors_data)} executors")
    print(f"Found {len(vehicles_data)} vehicles")
    print(f"Found {len(drivers_data)} drivers")

    # Get existing data
    existing_executors = {e.name: e for e in Executor.query.all()}
    existing_vehicles = {v.license_plate: v for v in Vehicle.query.all()}
    existing_drivers = {d.full_name: d for d in Driver.query.all()}

    # Update executors
    print("\n=== Updating Executors ===")
    for exec_name in executors_data:
        if exec_name not in existing_executors:
            executor = Executor(name=exec_name)
            db.session.add(executor)
            db.session.flush()
            existing_executors[exec_name] = executor
            print(f"+ {exec_name}")

    db.session.commit()

    # Update vehicles with executor relationships
    print("\n=== Updating Vehicles ===")
    updated_vehicles = 0
    for plate, vdata in vehicles_data.items():
        if plate in existing_vehicles:
            vehicle = existing_vehicles[plate]
            if vdata['executor'] and vdata['executor'] in existing_executors:
                executor_id = existing_executors[vdata['executor']].id
                if vehicle.executor_id != executor_id:
                    vehicle.executor_id = executor_id
                    vehicle.owner = vdata['executor']
                    updated_vehicles += 1
                    print(f"Updated: {plate} -> {vdata['executor']}")

    db.session.commit()
    print(f"✓ Updated {updated_vehicles} vehicles")

    # Update drivers with phone and executor
    print("\n=== Updating Drivers ===")
    updated_drivers = 0
    for driver_name, ddata in drivers_data.items():
        if driver_name in existing_drivers:
            driver = existing_drivers[driver_name]
            updated = False

            if ddata['phone'] and (not driver.phone or driver.phone == ''):
                driver.phone = ddata['phone']
                updated = True

            if ddata['executor'] and ddata['executor'] in existing_executors:
                executor_id = existing_executors[ddata['executor']].id
                if driver.executor_id != executor_id:
                    driver.executor_id = executor_id
                    updated = True

            if updated:
                updated_drivers += 1
                print(f"Updated: {driver_name} -> {ddata['phone']}, executor: {ddata['executor']}")

    db.session.commit()
    print(f"✓ Updated {updated_drivers} drivers")

    print("\n=== Summary ===")
    print(f"Executors in DB: {Executor.query.count()}")
    print(f"Vehicles in DB: {Vehicle.query.count()}")
    print(f"Drivers in DB: {Driver.query.count()}")

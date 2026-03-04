from app import create_app
from database import db
from models import Executor, Vehicle, Driver

app = create_app()

with app.app_context():
    print("=== FINAL INTEGRATION REPORT ===\n")

    # Overall statistics
    executors = Executor.query.all()
    vehicles = Vehicle.query.all()
    drivers = Driver.query.all()

    print(f"📊 Total Records:")
    print(f"   Executors: {len(executors)}")
    print(f"   Vehicles: {len(vehicles)}")
    print(f"   Drivers: {len(drivers)}")
    print()

    # Executors with their resources
    print("📋 Top 10 Executors by Resources:")
    executor_stats = []
    for executor in executors:
        v_count = Vehicle.query.filter_by(executor_id=executor.id).count()
        d_count = Driver.query.filter_by(executor_id=executor.id).count()
        if v_count > 0 or d_count > 0:
            executor_stats.append((executor.name, v_count, d_count))

    executor_stats.sort(key=lambda x: x[1] + x[2], reverse=True)
    for name, v_count, d_count in executor_stats[:10]:
        print(f"   {name}: {v_count} vehicles, {d_count} drivers")
    print()

    # Data quality metrics
    print("✅ Data Quality:")
    vehicles_with_executor = Vehicle.query.filter(Vehicle.executor_id != None).count()
    vehicles_without_executor = Vehicle.query.filter(Vehicle.executor_id == None).count()
    print(f"   Vehicles with executor: {vehicles_with_executor}/{len(vehicles)} ({vehicles_with_executor*100//len(vehicles)}%)")
    print(f"   Vehicles without executor: {vehicles_without_executor}")

    drivers_with_phone = Driver.query.filter(Driver.phone != '', Driver.phone != None).count()
    drivers_without_phone = Driver.query.filter(db.or_(Driver.phone == '', Driver.phone == None)).count()
    print(f"   Drivers with phone: {drivers_with_phone}/{len(drivers)} ({drivers_with_phone*100//len(drivers) if len(drivers) > 0 else 0}%)")
    print(f"   Drivers without phone: {drivers_without_phone}")

    drivers_with_executor = Driver.query.filter(Driver.executor_id != None).count()
    drivers_without_executor = Driver.query.filter(Driver.executor_id == None).count()
    print(f"   Drivers with executor: {drivers_with_executor}/{len(drivers)} ({drivers_with_executor*100//len(drivers) if len(drivers) > 0 else 0}%)")
    print()

    # Sample vehicles without executors
    print("⚠️  Vehicles without executor (first 10):")
    unassigned_vehicles = Vehicle.query.filter(Vehicle.executor_id == None).limit(10).all()
    for v in unassigned_vehicles:
        print(f"   - {v.license_plate} ({v.model})")
    print()

    # Sample drivers without phones
    if drivers_without_phone > 0:
        print("⚠️  Drivers without phone:")
        no_phone_drivers = Driver.query.filter(db.or_(Driver.phone == '', Driver.phone == None)).all()
        for d in no_phone_drivers:
            print(f"   - {d.full_name}")
        print()

    # Sample data for verification
    print("📝 Sample Data (first 5 complete records):")
    complete_vehicles = Vehicle.query.filter(Vehicle.executor_id != None).limit(5).all()
    for v in complete_vehicles:
        executor = Executor.query.get(v.executor_id)
        print(f"   Vehicle: {v.license_plate}")
        print(f"      Model: {v.model}")
        print(f"      Executor: {executor.name if executor else 'N/A'}")
        print(f"      Capacity: {v.capacity if v.capacity else 'N/A'}")
        print()

    print("✅ Integration Complete!")
    print("\nNext steps:")
    print("   1. Review vehicles without executors and assign manually if needed")
    print("   2. Add phone numbers for drivers missing them")
    print("   3. Use the API endpoints to manage directories")

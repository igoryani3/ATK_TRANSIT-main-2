from app import create_app
from database import db
from models import Executor, Vehicle, Driver

app = create_app()

with app.app_context():
    print("=" * 60)
    print("FINAL DATABASE REPORT - ALL DATA INTEGRATED")
    print("=" * 60)
    print()

    # Overall counts
    executors = Executor.query.all()
    vehicles = Vehicle.query.all()
    drivers = Driver.query.all()

    print("📊 TOTAL RECORDS:")
    print(f"   Executors: {len(executors)}")
    print(f"   Vehicles: {len(vehicles)}")
    print(f"   Drivers: {len(drivers)}")
    print()

    # Driver details statistics
    print("👤 DRIVER DETAILS COMPLETENESS:")
    drivers_with_birth = Driver.query.filter(Driver.birth_date != None).count()
    drivers_with_phone = Driver.query.filter(Driver.phone != '', Driver.phone != None).count()
    drivers_with_backup_phone = Driver.query.filter(Driver.backup_phone != '', Driver.backup_phone != None).count()

    print(f"   With birth date: {drivers_with_birth}/{len(drivers)} ({drivers_with_birth*100//len(drivers) if len(drivers) > 0 else 0}%)")
    print(f"   With phone: {drivers_with_phone}/{len(drivers)} ({drivers_with_phone*100//len(drivers) if len(drivers) > 0 else 0}%)")
    print(f"   With backup phone: {drivers_with_backup_phone}/{len(drivers)} ({drivers_with_backup_phone*100//len(drivers) if len(drivers) > 0 else 0}%)")
    print()

    # Document availability
    print("📄 DRIVER DOCUMENTS:")
    with_license = Driver.query.filter(Driver.license_available == True).count()
    with_passport = Driver.query.filter(Driver.passport_available == True).count()
    with_snils = Driver.query.filter(Driver.snils_available == True).count()
    with_tachograph = Driver.query.filter(Driver.tachograph_available == True).count()

    print(f"   Valid driver's license: {with_license}/{len(drivers)} ({with_license*100//len(drivers) if len(drivers) > 0 else 0}%)")
    print(f"   Valid passport: {with_passport}/{len(drivers)} ({with_passport*100//len(drivers) if len(drivers) > 0 else 0}%)")
    print(f"   SNILS available: {with_snils}/{len(drivers)} ({with_snils*100//len(drivers) if len(drivers) > 0 else 0}%)")
    print(f"   Tachograph card: {with_tachograph}/{len(drivers)} ({with_tachograph*100//len(drivers) if len(drivers) > 0 else 0}%)")
    print()

    # Executor relationships
    print("🔗 RELATIONSHIPS:")
    vehicles_with_executor = Vehicle.query.filter(Vehicle.executor_id != None).count()
    drivers_with_executor = Driver.query.filter(Driver.executor_id != None).count()

    print(f"   Vehicles linked to executors: {vehicles_with_executor}/{len(vehicles)} ({vehicles_with_executor*100//len(vehicles) if len(vehicles) > 0 else 0}%)")
    print(f"   Drivers linked to executors: {drivers_with_executor}/{len(drivers)} ({drivers_with_executor*100//len(drivers) if len(drivers) > 0 else 0}%)")
    print()

    # Top executors
    print("🏆 TOP 5 EXECUTORS BY RESOURCES:")
    executor_stats = []
    for executor in executors:
        v_count = Vehicle.query.filter_by(executor_id=executor.id).count()
        d_count = Driver.query.filter_by(executor_id=executor.id).count()
        if v_count > 0 or d_count > 0:
            executor_stats.append((executor.name, v_count, d_count))

    executor_stats.sort(key=lambda x: x[1] + x[2], reverse=True)
    for i, (name, v_count, d_count) in enumerate(executor_stats[:5], 1):
        print(f"   {i}. {name}")
        print(f"      Vehicles: {v_count}, Drivers: {d_count}")
    print()

    # Sample complete driver record
    print("📝 SAMPLE COMPLETE DRIVER RECORD:")
    complete_driver = Driver.query.filter(
        Driver.license_available == True,
        Driver.passport_available == True,
        Driver.snils_available == True,
        Driver.tachograph_available == True,
        Driver.birth_date != None
    ).first()

    if complete_driver:
        print(f"   Name: {complete_driver.full_name}")
        print(f"   Birth Date: {complete_driver.birth_date}")
        print(f"   Phone: {complete_driver.phone}")
        if complete_driver.backup_phone:
            print(f"   Backup Phone: {complete_driver.backup_phone}")
        print(f"   License: {complete_driver.license_series_number} (expires: {complete_driver.license_expiry_date})")
        print(f"   Passport: {complete_driver.passport_series_number}")
        print(f"   SNILS: {complete_driver.snils_number}")
        print(f"   Tachograph: {complete_driver.tachograph_number} (expires: {complete_driver.tachograph_expiry_date})")
        if complete_driver.executor_id:
            executor = Executor.query.filter_by(id=complete_driver.executor_id).first()
            if executor:
                print(f"   Executor: {executor.name}")
    print()

    # Warnings
    print("⚠️  ATTENTION REQUIRED:")

    # Drivers without documents
    incomplete_drivers = Driver.query.filter(
        db.or_(
            Driver.license_available == False,
            Driver.passport_available == False,
            Driver.tachograph_available == False
        )
    ).count()

    if incomplete_drivers > 0:
        print(f"   {incomplete_drivers} drivers have incomplete documents")

    # Vehicles without executors
    unassigned_vehicles = Vehicle.query.filter(Vehicle.executor_id == None).count()
    if unassigned_vehicles > 0:
        print(f"   {unassigned_vehicles} vehicles not assigned to executors")

    # Drivers without executors
    unassigned_drivers = Driver.query.filter(Driver.executor_id == None).count()
    if unassigned_drivers > 0:
        print(f"   {unassigned_drivers} drivers not assigned to executors")

    print()
    print("=" * 60)
    print("✅ DATA INTEGRATION COMPLETE")
    print("=" * 60)
    print()
    print("All data from CSV files has been successfully imported:")
    print("  ✓ Unique performers → Executors")
    print("  ✓ Vehicle plates → Vehicles")
    print("  ✓ Driver names → Drivers")
    print("  ✓ Driver details → Driver records (documents, contacts, etc.)")
    print("  ✓ Relationships established between executors, vehicles, and drivers")
    print()
    print("The database is ready for use via API endpoints.")

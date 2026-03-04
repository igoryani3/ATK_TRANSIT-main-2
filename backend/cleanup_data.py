from app import create_app
from database import db
from models import Executor, Vehicle, Driver

app = create_app()

with app.app_context():
    print("=== Cleaning Data Quality Issues ===\n")

    # 1. Remove suspicious vehicles
    print("1. Removing suspicious vehicles:")
    suspicious_plates = [
        'Такси', 'такси', 'Прямой', '1/2 круга',
        'ИП Корнилов Дмитрий', 'Эрматов Эрнис',
        'ИмперияАвто, вагнер',
        'реальное время отправления в 7:55 ,но оно не согласовано с руководсвтом'
    ]

    removed_vehicles = 0
    for plate in suspicious_plates:
        vehicle = Vehicle.query.filter_by(license_plate=plate).first()
        if vehicle:
            print(f"  - Removing: {plate}")
            db.session.delete(vehicle)
            removed_vehicles += 1

    db.session.commit()
    print(f"✓ Removed {removed_vehicles} suspicious vehicles\n")

    # 2. Remove drivers that are actually companies
    print("2. Removing company entries from drivers:")
    company_patterns = [
        'ИП Абакумец Александр',
        'ИП Алексей Анохин',
        'ИП Бассыр',
        'ИП Борейш Иван Федорович',
        'ИП Вагнер Дмитрий',
        'ИП Гасанов Омар',
        'ИП Горенков Илья',
        'ИП Дмитрий Константинов',
        'ИП Заур',
        'ИП Зауров Загир',
        'ИП Корнилов Дмитрий',
        'ИП Махаров Эльяс',
        'ИП Самцов Александр',
        'ИП Федор',
        'Авангард (ИП Кулакова Ирина)',
        'Авторетролюкс',
        'Балтийские линии',
        'КомТранс',
        'ООО Янина',
        'Такси'
    ]

    removed_drivers = 0
    for name in company_patterns:
        driver = Driver.query.filter_by(full_name=name).first()
        if driver:
            print(f"  - Removing: {name}")
            db.session.delete(driver)
            removed_drivers += 1

    db.session.commit()
    print(f"✓ Removed {removed_drivers} company entries from drivers\n")

    # 3. Show final statistics
    print("=== Final Database Statistics ===")
    executors_count = Executor.query.count()
    vehicles_count = Vehicle.query.count()
    drivers_count = Driver.query.count()

    print(f"Executors: {executors_count}")
    print(f"Vehicles: {vehicles_count}")
    print(f"Drivers: {drivers_count}")

    # 4. Show sample data
    print("\n=== Sample Executors ===")
    for executor in Executor.query.limit(10).all():
        vehicles = Vehicle.query.filter_by(executor_id=executor.id).count()
        drivers = Driver.query.filter_by(executor_id=executor.id).count()
        print(f"{executor.name}: {vehicles} vehicles, {drivers} drivers")

    print("\n=== Drivers with phones ===")
    drivers_with_phone = Driver.query.filter(Driver.phone != '', Driver.phone != None).count()
    drivers_without_phone = Driver.query.filter(db.or_(Driver.phone == '', Driver.phone == None)).count()
    print(f"With phone: {drivers_with_phone}")
    print(f"Without phone: {drivers_without_phone}")

    print("\n=== Vehicles with executors ===")
    vehicles_with_executor = Vehicle.query.filter(Vehicle.executor_id != None).count()
    vehicles_without_executor = Vehicle.query.filter(Vehicle.executor_id == None).count()
    print(f"With executor: {vehicles_with_executor}")
    print(f"Without executor: {vehicles_without_executor}")

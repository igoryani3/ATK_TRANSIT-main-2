"""
Migration script to import data from CSV files into SQLite database
"""
import csv
import os
import sys
from datetime import datetime
from app import create_app
from database import db
from models import Driver, Vehicle, Client, Template, Contract, Executor, ContractProvider

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def import_customers():
    """Import customers from db_customers.csv"""
    print("Importing customers...")
    csv_path = os.path.join('database', 'db_customers.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        count = 0
        for row in reader:
            customer_name = row['Customer_Name'].strip()
            if not customer_name:
                continue
                
            # Check if customer already exists
            existing = Client.query.filter_by(company_name=customer_name).first()
            if existing:
                print(f"  Customer '{customer_name}' already exists, skipping")
                continue
            
            client = Client(
                company_name=customer_name,
                contact_info=''
            )
            db.session.add(client)
            count += 1
        
        db.session.commit()
        print(f"  Imported {count} customers")


def import_drivers():
    """Import drivers from db_drivers_updated.csv"""
    print("Importing drivers...")
    csv_path = os.path.join('database', 'db_drivers_updated.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        count = 0
        for row in reader:
            driver_name = row['Driver_Name'].strip()
            phone = row['Phone'].strip()
            plate = row['Plate'].strip() if row['Plate'] else None
            
            if not driver_name or not phone:
                continue
            
            # Check if driver already exists by name and phone
            existing = Driver.query.filter_by(full_name=driver_name, phone=phone).first()
            if existing:
                # Update current vehicle plate if provided
                if plate and not existing.current_vehicle_plate:
                    existing.current_vehicle_plate = plate
                    count += 1
                continue
            
            driver = Driver(
                full_name=driver_name,
                phone=phone,
                current_vehicle_plate=plate,
                documents=''
            )
            db.session.add(driver)
            count += 1
        
        db.session.commit()
        print(f"  Imported/updated {count} drivers")


def import_vehicles():
    """Import vehicles from db_vehicles_new.csv"""
    print("Importing vehicles...")
    csv_path = os.path.join('database', 'db_vehicles_new.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        count = 0
        for row in reader:
            plate = row['Plate'].strip()
            model = row['Model'].strip() if row['Model'] else ''
            capacity_str = row['Capacity'].strip() if row['Capacity'] else None
            owner = row['Owner'].strip() if row['Owner'] else ''
            
            if not plate:
                continue
            
            # Check if vehicle already exists
            existing = Vehicle.query.filter_by(license_plate=plate).first()
            if existing:
                # Update owner if not set
                if owner and not existing.owner:
                    existing.owner = owner
                    count += 1
                continue
            
            # Parse capacity
            capacity = None
            if capacity_str:
                try:
                    capacity = int(float(capacity_str))
                except ValueError:
                    pass
            
            vehicle = Vehicle(
                license_plate=plate,
                model=model if model else 'Unknown',
                capacity=capacity,
                owner=owner
            )
            db.session.add(vehicle)
            count += 1
        
        db.session.commit()
        print(f"  Imported/updated {count} vehicles")


def import_templates():
    """Import templates from db_templates.csv"""
    print("Importing templates...")
    csv_path = os.path.join('database', 'db_templates.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        count = 0
        for row in reader:
            customer_id_str = row['Customer_ID'].strip()
            route_name = row['Route_Name'].strip()
            start_point = row['Start_Point'].strip()
            end_point = row['End_Point'].strip()
            route_type = row['Route_Type'].strip() if row['Route_Type'] else ''
            pickup_time = row['Pickup_Time'].strip() if row['Pickup_Time'] else None
            departure_time = row['Departure_Time'].strip() if row['Departure_Time'] else None
            capacity_str = row['Capacity'].strip() if row['Capacity'] else None
            price_str = row['Price_Excl_VAT'].strip() if row['Price_Excl_VAT'] else None
            
            if not route_name:
                continue
            
            # Parse customer_id
            customer_id = None
            if customer_id_str:
                try:
                    csv_customer_id = int(customer_id_str)
                    # Find customer in our database by iterating through customers
                    # Since CSV Customer_ID might not match our DB IDs
                    # We'll skip this for now and handle customer matching separately if needed
                except ValueError:
                    pass
            
            # Parse capacity and price
            capacity = None
            if capacity_str:
                try:
                    capacity = float(capacity_str)
                except ValueError:
                    pass
            
            price_excl_vat = None
            if price_str:
                try:
                    price_excl_vat = float(price_str)
                except ValueError:
                    pass
            
            template = Template(
                customer_id=customer_id,
                route_name=route_name,
                start_point=start_point,
                end_point=end_point,
                route_type=route_type,
                pickup_time=pickup_time,
                departure_time=departure_time,
                capacity=capacity,
                price_excl_vat=price_excl_vat
            )
            db.session.add(template)
            count += 1
        
        db.session.commit()
        print(f"  Imported {count} templates")


def import_contracts():
    """Import contracts from db_contracts.csv"""
    print("Importing contracts...")
    csv_path = os.path.join('database', 'db_contracts.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        count = 0
        for row in reader:
            provider = row['Provider_Entity'].strip()
            customer_name = row['Customer_Name'].strip()
            
            if not provider or not customer_name:
                continue
            
            # Find customer by name
            customer = Client.query.filter_by(company_name=customer_name).first()
            if not customer:
                print(f"  Customer '{customer_name}' not found, skipping contract")
                continue
            
            # Check if contract already exists
            existing = Contract.query.filter_by(
                provider_entity=provider,
                customer_id=customer.id
            ).first()
            if existing:
                continue
            
            contract = Contract(
                provider_entity=provider,
                customer_id=customer.id
            )
            db.session.add(contract)
            count += 1
        
        db.session.commit()
        print(f"  Imported {count} contracts")


def import_executors():
    """Import executors from db_ispolniteli.csv"""
    print("Importing executors...")
    csv_path = os.path.join('database', 'db_ispolniteli.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        count = 0
        for row in reader:
            name = row['Unique_Names'].strip()
            
            if not name or name == 'Исполнитель':  # Skip header row if present
                continue
            
            # Check if executor already exists
            existing = Executor.query.filter_by(name=name).first()
            if existing:
                print(f"  Executor '{name}' already exists, skipping")
                continue
            
            executor = Executor(name=name)
            db.session.add(executor)
            count += 1
        
        db.session.commit()
        print(f"  Imported {count} executors")


def import_contract_providers():
    """Import contract providers from db_dogovor.csv"""
    print("Importing contract providers...")
    csv_path = os.path.join('database', 'db_dogovor.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        count = 0
        for row in reader:
            name = row['Unique_Names'].strip()
            
            if not name:
                continue
            
            # Remove extra quotes from names like "ООО ""Басфор"""
            name = name.replace('""', '"')
            
            # Check if provider already exists
            existing = ContractProvider.query.filter_by(name=name).first()
            if existing:
                print(f"  Contract provider '{name}' already exists, skipping")
                continue
            
            provider = ContractProvider(name=name)
            db.session.add(provider)
            count += 1
        
        db.session.commit()
        print(f"  Imported {count} contract providers")


def main():
    """Run all migrations"""
    print("Starting CSV data migration...")
    print("=" * 50)
    
    app = create_app()
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created/verified")
        print()
        
        # Import data in order (customers first, then dependent entities)
        import_customers()
        import_drivers()
        import_vehicles()
        import_templates()
        import_contracts()
        import_executors()
        import_contract_providers()
        
        print()
        print("=" * 50)
        print("Migration completed successfully!")


if __name__ == '__main__':
    main()

from sqlalchemy import create_engine, inspect
from config import Config
import os

def inspect_db():
    print(f"Inspecting DB at: {Config.SQLALCHEMY_DATABASE_URI}")
    engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
    inspector = inspect(engine)
    
    print("Tables:", inspector.get_table_names())
    
    if 'vehicles' in inspector.get_table_names():
        print("\nColumns in 'vehicles':")
        for col in inspector.get_columns('vehicles'):
            print(f"  - {col['name']} ({col['type']})")
    
    if 'drivers' in inspector.get_table_names():
        print("\nColumns in 'drivers':")
        for col in inspector.get_columns('drivers'):
            print(f"  - {col['name']} ({col['type']})")

if __name__ == '__main__':
    inspect_db()

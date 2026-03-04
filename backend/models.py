from datetime import datetime, date as date_type
from werkzeug.security import generate_password_hash, check_password_hash
from database import db
import json

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='dispatcher')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role
        }


class Driver(db.Model):
    __tablename__ = 'drivers'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(50), nullable=False)
    documents = db.Column(db.Text)  # JSON or comma-separated
    current_vehicle_plate = db.Column(db.String(20))  # Current assigned vehicle
    executor_id = db.Column(db.Integer, db.ForeignKey('executors.id'))  # Belongs to executor

    # Personal info
    birth_date = db.Column(db.Date)
    backup_phone = db.Column(db.String(50))
    employment_status = db.Column(db.String(100))

    # Driver's license
    license_series_number = db.Column(db.String(50))
    license_issue_date = db.Column(db.Date)
    license_expiry_date = db.Column(db.Date)
    license_available = db.Column(db.Boolean, default=False)

    # Passport
    passport_series_number = db.Column(db.String(50))
    passport_issue_date = db.Column(db.Date)
    passport_issued_by = db.Column(db.Text)
    passport_available = db.Column(db.Boolean, default=False)

    # SNILS
    snils_number = db.Column(db.String(50))
    snils_available = db.Column(db.Boolean, default=False)

    # Tachograph card
    tachograph_number = db.Column(db.String(50))
    tachograph_issue_date = db.Column(db.Date)
    tachograph_expiry_date = db.Column(db.Date)
    tachograph_available = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    trips = db.relationship('Trip', backref='driver', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'phone': self.phone,
            'documents': self.documents,
            'current_vehicle_plate': self.current_vehicle_plate,
            'executor_id': self.executor_id,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'backup_phone': self.backup_phone,
            'employment_status': self.employment_status,
            'license_series_number': self.license_series_number,
            'license_issue_date': self.license_issue_date.isoformat() if self.license_issue_date else None,
            'license_expiry_date': self.license_expiry_date.isoformat() if self.license_expiry_date else None,
            'license_available': self.license_available,
            'passport_series_number': self.passport_series_number,
            'passport_issue_date': self.passport_issue_date.isoformat() if self.passport_issue_date else None,
            'passport_issued_by': self.passport_issued_by,
            'passport_available': self.passport_available,
            'snils_number': self.snils_number,
            'snils_available': self.snils_available,
            'tachograph_number': self.tachograph_number,
            'tachograph_issue_date': self.tachograph_issue_date.isoformat() if self.tachograph_issue_date else None,
            'tachograph_expiry_date': self.tachograph_expiry_date.isoformat() if self.tachograph_expiry_date else None,
            'tachograph_available': self.tachograph_available,
        }


class Vehicle(db.Model):
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)
    license_plate = db.Column(db.String(20), unique=True, nullable=False)
    model = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer)  # Passenger capacity or load capacity
    owner = db.Column(db.String(200))  # Owner/Partner name
    executor_id = db.Column(db.Integer, db.ForeignKey('executors.id'))  # Belongs to executor
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    trips = db.relationship('Trip', backref='vehicle', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'license_plate': self.license_plate,
            'model': self.model,
            'capacity': self.capacity,
            'owner': self.owner,
            'executor_id': self.executor_id
        }


class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(200), nullable=False)
    contact_info = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    trips = db.relationship('Trip', backref='client', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_name': self.company_name,
            'contact_info': self.contact_info
        }


class Route(db.Model):
    __tablename__ = 'routes'
    
    id = db.Column(db.Integer, primary_key=True)
    route_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'route_name': self.route_name,
            'description': self.description
        }


class Trip(db.Model):
    __tablename__ = 'trips'
    
    id = db.Column(db.Integer, primary_key=True)
    trip_number = db.Column(db.String(50), unique=True, nullable=False)
    
    # Trip details
    region = db.Column(db.String(20))  # Север/Юг
    contract = db.Column(db.String(100))
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'))
    direction = db.Column(db.String(200))
    type = db.Column(db.String(100))  # Тип
    people_count = db.Column(db.Integer)
    time_of_day = db.Column(db.String(20))  # Утро/Вечер
    
    # Timing
    submission_time = db.Column(db.String(50))  # Подача
    departure_time = db.Column(db.String(50))  # Выезд
    
    # Route details
    route_start = db.Column(db.String(200))
    route_waypoints = db.Column(db.Text)  # JSON array of intermediate points
    route_end = db.Column(db.String(200))
    
    # Execution details
    trip_type = db.Column(db.String(100))  # Тип рейса
    executor = db.Column(db.String(200))  # Исполнитель
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'))
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'))
    driver_phone = db.Column(db.String(50))
    
    # Pricing
    price_without_vat = db.Column(db.Float)
    price_with_vat = db.Column(db.Float)

    # Calendar date (which day this trip belongs to)
    trip_date = db.Column(db.Date)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'trip_number': self.trip_number,
            'region': self.region,
            'contract': self.contract,
            'client_id': self.client_id,
            'client_name': self.client.company_name if self.client else None,
            'direction': self.direction,
            'type': self.type,
            'people_count': self.people_count,
            'time_of_day': self.time_of_day,
            'submission_time': self.submission_time,
            'departure_time': self.departure_time,
            'route_start': self.route_start,
            'route_waypoints': json.loads(self.route_waypoints) if self.route_waypoints else [],
            'route_end': self.route_end,
            'trip_type': self.trip_type,
            'executor': self.executor,
            'vehicle_id': self.vehicle_id,
            'vehicle_plate': self.vehicle.license_plate if self.vehicle else None,
            'driver_id': self.driver_id,
            'driver_name': self.driver.full_name if self.driver else None,
            'driver_phone': self.driver_phone,
            'price_without_vat': self.price_without_vat,
            'price_with_vat': self.price_with_vat,
            'trip_date': self.trip_date.isoformat() if self.trip_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Template(db.Model):
    __tablename__ = 'templates'

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('clients.id'))
    route_name = db.Column(db.String(200), nullable=False)
    start_point = db.Column(db.String(200))
    end_point = db.Column(db.String(200))
    route_type = db.Column(db.String(100))  # Прямой, 1/2 круга и т.д.
    pickup_time = db.Column(db.String(50))
    departure_time = db.Column(db.String(50))
    capacity = db.Column(db.Float)
    price_excl_vat = db.Column(db.Float)

    # Additional fields from Trip
    region = db.Column(db.String(50))  # Север/Юг
    contract = db.Column(db.String(200))  # Договор
    type = db.Column(db.String(100))  # Тип
    time_of_day = db.Column(db.String(50))  # Утро/Вечер
    executor = db.Column(db.String(200))  # Исполнитель
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'))
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'))
    driver_phone = db.Column(db.String(50))

    weekdays = db.Column(db.Text)  # JSON array of weekdays: ["monday", "tuesday", ...]
    last_trip_date = db.Column(db.Date)  # Last date when trip was generated from this template
    end_date = db.Column(db.Date)  # Date when template should be archived
    archived = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    customer = db.relationship('Client', backref='templates', lazy=True)
    vehicle = db.relationship('Vehicle', backref='templates', lazy=True)
    driver = db.relationship('Driver', backref='templates', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'customer_name': self.customer.company_name if self.customer else None,
            'route_name': self.route_name,
            'start_point': self.start_point,
            'end_point': self.end_point,
            'route_type': self.route_type,
            'pickup_time': self.pickup_time,
            'departure_time': self.departure_time,
            'capacity': self.capacity,
            'price_excl_vat': self.price_excl_vat,
            'region': self.region,
            'contract': self.contract,
            'type': self.type,
            'time_of_day': self.time_of_day,
            'executor': self.executor,
            'vehicle_id': self.vehicle_id,
            'vehicle_plate': self.vehicle.license_plate if self.vehicle else None,
            'driver_id': self.driver_id,
            'driver_name': self.driver.full_name if self.driver else None,
            'driver_phone': self.driver_phone,
            'weekdays': json.loads(self.weekdays) if self.weekdays else [],
            'last_trip_date': self.last_trip_date.isoformat() if self.last_trip_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'archived': self.archived,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Executor(db.Model):
    __tablename__ = 'executors'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class ContractProvider(db.Model):
    __tablename__ = 'contract_providers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class Contract(db.Model):
    __tablename__ = 'contracts'
    
    id = db.Column(db.Integer, primary_key=True)
    provider_entity = db.Column(db.String(200), nullable=False)  # ООО "Басфор", ИП Осотова и т.д.
    customer_id = db.Column(db.Integer, db.ForeignKey('clients.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    customer = db.relationship('Client', backref='contracts', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'provider_entity': self.provider_entity,
            'customer_id': self.customer_id,
            'customer_name': self.customer.company_name if self.customer else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

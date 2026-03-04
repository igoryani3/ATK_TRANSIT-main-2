from flask import Blueprint, request, jsonify, session
from models import Driver, Vehicle, Client, Route, Template, Contract
from database import db
from routes.auth import require_auth, require_role

references_bp = Blueprint('references', __name__)

# ============= DRIVERS =============
@references_bp.route('/drivers', methods=['GET'])
@require_auth
def get_drivers():
    drivers = Driver.query.all()
    return jsonify([driver.to_dict() for driver in drivers]), 200

@references_bp.route('/drivers', methods=['POST'])
@require_role('admin')
def create_driver():
    data = request.get_json()
    driver = Driver(
        full_name=data.get('full_name'),
        phone=data.get('phone'),
        documents=data.get('documents', ''),
        current_vehicle_plate=data.get('current_vehicle_plate'),
        executor_id=data.get('executor_id')
    )
    db.session.add(driver)
    db.session.commit()
    return jsonify(driver.to_dict()), 201

@references_bp.route('/drivers/<int:driver_id>', methods=['DELETE'])
@require_role('admin')
def delete_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    db.session.delete(driver)
    db.session.commit()
    return jsonify({'message': 'Driver deleted'}), 200

@references_bp.route('/drivers/<int:driver_id>', methods=['GET'])
@require_auth
def get_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    return jsonify(driver.to_dict()), 200

@references_bp.route('/drivers/<int:driver_id>', methods=['PUT'])
@require_role('admin')
def update_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    data = request.get_json()

    # Update basic fields
    if 'full_name' in data:
        driver.full_name = data['full_name']
    if 'phone' in data:
        driver.phone = data['phone']
    if 'backup_phone' in data:
        driver.backup_phone = data['backup_phone']
    if 'current_vehicle_plate' in data:
        driver.current_vehicle_plate = data['current_vehicle_plate']
    if 'employment_status' in data:
        driver.employment_status = data['employment_status']
    if 'executor_id' in data:
        driver.executor_id = data['executor_id']

    # Update dates
    from datetime import datetime
    if 'birth_date' in data and data['birth_date']:
        driver.birth_date = datetime.fromisoformat(data['birth_date']).date()

    # Driver's license
    if 'license_series_number' in data:
        driver.license_series_number = data['license_series_number']
    if 'license_issue_date' in data and data['license_issue_date']:
        driver.license_issue_date = datetime.fromisoformat(data['license_issue_date']).date()
    if 'license_expiry_date' in data and data['license_expiry_date']:
        driver.license_expiry_date = datetime.fromisoformat(data['license_expiry_date']).date()
    if 'license_available' in data:
        driver.license_available = data['license_available']

    # Passport
    if 'passport_series_number' in data:
        driver.passport_series_number = data['passport_series_number']
    if 'passport_issue_date' in data and data['passport_issue_date']:
        driver.passport_issue_date = datetime.fromisoformat(data['passport_issue_date']).date()
    if 'passport_issued_by' in data:
        driver.passport_issued_by = data['passport_issued_by']
    if 'passport_available' in data:
        driver.passport_available = data['passport_available']

    # SNILS
    if 'snils_number' in data:
        driver.snils_number = data['snils_number']
    if 'snils_available' in data:
        driver.snils_available = data['snils_available']

    # Tachograph
    if 'tachograph_number' in data:
        driver.tachograph_number = data['tachograph_number']
    if 'tachograph_issue_date' in data and data['tachograph_issue_date']:
        driver.tachograph_issue_date = datetime.fromisoformat(data['tachograph_issue_date']).date()
    if 'tachograph_expiry_date' in data and data['tachograph_expiry_date']:
        driver.tachograph_expiry_date = datetime.fromisoformat(data['tachograph_expiry_date']).date()
    if 'tachograph_available' in data:
        driver.tachograph_available = data['tachograph_available']

    db.session.commit()
    return jsonify(driver.to_dict()), 200

# ============= VEHICLES =============
@references_bp.route('/vehicles', methods=['GET'])
@require_auth
def get_vehicles():
    vehicles = Vehicle.query.all()
    return jsonify([vehicle.to_dict() for vehicle in vehicles]), 200

@references_bp.route('/vehicles', methods=['POST'])
@require_role('admin')
def create_vehicle():
    data = request.get_json()
    vehicle = Vehicle(
        license_plate=data.get('license_plate'),
        model=data.get('model'),
        capacity=data.get('capacity'),
        owner=data.get('owner', ''),
        executor_id=data.get('executor_id')
    )
    db.session.add(vehicle)
    db.session.commit()
    return jsonify(vehicle.to_dict()), 201

@references_bp.route('/vehicles/<int:vehicle_id>', methods=['DELETE'])
@require_role('admin')
def delete_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    db.session.delete(vehicle)
    db.session.commit()
    return jsonify({'message': 'Vehicle deleted'}), 200

@references_bp.route('/vehicles/<int:vehicle_id>', methods=['PUT'])
@require_role('admin')
def update_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    data = request.get_json()

    if 'license_plate' in data:
        vehicle.license_plate = data['license_plate']
    if 'model' in data:
        vehicle.model = data['model']
    if 'capacity' in data:
        vehicle.capacity = data['capacity']
    if 'owner' in data:
        vehicle.owner = data['owner']
    if 'executor_id' in data:
        vehicle.executor_id = data['executor_id']

    db.session.commit()
    return jsonify(vehicle.to_dict()), 200

# ============= CLIENTS =============
@references_bp.route('/clients', methods=['GET'])
@require_auth
def get_clients():
    clients = Client.query.all()
    return jsonify([client.to_dict() for client in clients]), 200

@references_bp.route('/clients', methods=['POST'])
@require_role('admin')
def create_client():
    data = request.get_json()
    client = Client(
        company_name=data.get('company_name'),
        contact_info=data.get('contact_info', '')
    )
    db.session.add(client)
    db.session.commit()
    return jsonify(client.to_dict()), 201

@references_bp.route('/clients/<int:client_id>', methods=['DELETE'])
@require_role('admin')
def delete_client(client_id):
    client = Client.query.get_or_404(client_id)
    db.session.delete(client)
    db.session.commit()
    return jsonify({'message': 'Client deleted'}), 200

# ============= ROUTES =============
@references_bp.route('/routes', methods=['GET'])
@require_auth
def get_routes():
    routes = Route.query.all()
    return jsonify([route.to_dict() for route in routes]), 200

@references_bp.route('/routes', methods=['POST'])
@require_role('admin')
def create_route():
    data = request.get_json()
    route = Route(
        route_name=data.get('route_name'),
        description=data.get('description', '')
    )
    db.session.add(route)
    db.session.commit()
    return jsonify(route.to_dict()), 201

@references_bp.route('/routes/<int:route_id>', methods=['DELETE'])
@require_role('admin')
def delete_route(route_id):
    route = Route.query.get_or_404(route_id)
    db.session.delete(route)
    db.session.commit()
    return jsonify({'message': 'Route deleted'}), 200


# ============= TEMPLATES =============
@references_bp.route('/templates', methods=['GET'])
@require_auth
def get_templates():
    customer_id = request.args.get('customer_id')
    archived_param = request.args.get('archived', 'false').lower()

    if archived_param == 'all':
        query = Template.query
    else:
        archived = archived_param == 'true'
        query = Template.query.filter_by(archived=archived)

    if customer_id:
        query = query.filter_by(customer_id=customer_id)

    templates = query.all()
    return jsonify([template.to_dict() for template in templates]), 200


@references_bp.route('/templates/<int:template_id>', methods=['GET'])
@require_auth
def get_template(template_id):
    template = Template.query.get_or_404(template_id)
    return jsonify(template.to_dict()), 200


@references_bp.route('/templates', methods=['POST'])
@require_role('admin')
def create_template():
    data = request.get_json()
    import json
    from datetime import datetime as dt

    end_date = None
    if data.get('end_date'):
        end_date = dt.strptime(data.get('end_date'), '%Y-%m-%d').date()

    template = Template(
        customer_id=data.get('customer_id'),
        route_name=data.get('route_name'),
        start_point=data.get('start_point'),
        end_point=data.get('end_point'),
        route_type=data.get('route_type'),
        pickup_time=data.get('pickup_time'),
        departure_time=data.get('departure_time'),
        capacity=data.get('capacity'),
        price_excl_vat=data.get('price_excl_vat'),
        region=data.get('region'),
        contract=data.get('contract'),
        type=data.get('type'),
        time_of_day=data.get('time_of_day'),
        executor=data.get('executor'),
        vehicle_id=data.get('vehicle_id'),
        driver_id=data.get('driver_id'),
        driver_phone=data.get('driver_phone'),
        weekdays=json.dumps(data.get('weekdays', [])),
        end_date=end_date
    )
    db.session.add(template)
    db.session.commit()
    return jsonify(template.to_dict()), 201


@references_bp.route('/templates/<int:template_id>', methods=['PUT'])
@require_role('admin')
def update_template(template_id):
    template = Template.query.get_or_404(template_id)
    data = request.get_json()
    import json
    from datetime import datetime as dt

    template.customer_id = data.get('customer_id', template.customer_id)
    template.route_name = data.get('route_name', template.route_name)
    template.start_point = data.get('start_point', template.start_point)
    template.end_point = data.get('end_point', template.end_point)
    template.route_type = data.get('route_type', template.route_type)
    template.pickup_time = data.get('pickup_time', template.pickup_time)
    template.departure_time = data.get('departure_time', template.departure_time)
    template.capacity = data.get('capacity', template.capacity)
    template.price_excl_vat = data.get('price_excl_vat', template.price_excl_vat)
    template.region = data.get('region', template.region)
    template.contract = data.get('contract', template.contract)
    template.type = data.get('type', template.type)
    template.time_of_day = data.get('time_of_day', template.time_of_day)
    template.executor = data.get('executor', template.executor)
    template.vehicle_id = data.get('vehicle_id', template.vehicle_id)
    template.driver_id = data.get('driver_id', template.driver_id)
    template.driver_phone = data.get('driver_phone', template.driver_phone)
    if 'weekdays' in data:
        template.weekdays = json.dumps(data.get('weekdays', []))
    if 'end_date' in data:
        if data.get('end_date'):
            template.end_date = dt.strptime(data.get('end_date'), '%Y-%m-%d').date()
        else:
            template.end_date = None

    db.session.commit()
    return jsonify(template.to_dict()), 200


@references_bp.route('/templates/<int:template_id>', methods=['DELETE'])
@require_role('admin')
def delete_template(template_id):
    template = Template.query.get_or_404(template_id)
    db.session.delete(template)
    db.session.commit()
    return jsonify({'message': 'Template deleted'}), 200


# ============= CONTRACTS =============
@references_bp.route('/contracts', methods=['GET'])
@require_auth
def get_contracts():
    customer_id = request.args.get('customer_id')
    if customer_id:
        contracts = Contract.query.filter_by(customer_id=customer_id).all()
    else:
        contracts = Contract.query.all()
    return jsonify([contract.to_dict() for contract in contracts]), 200


@references_bp.route('/contracts/<int:contract_id>', methods=['GET'])
@require_auth
def get_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    return jsonify(contract.to_dict()), 200


@references_bp.route('/contracts', methods=['POST'])
@require_role('admin')
def create_contract():
    data = request.get_json()
    contract = Contract(
        provider_entity=data.get('provider_entity'),
        customer_id=data.get('customer_id')
    )
    db.session.add(contract)
    db.session.commit()
    return jsonify(contract.to_dict()), 201


@references_bp.route('/contracts/<int:contract_id>', methods=['DELETE'])
@require_role('admin')
def delete_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    db.session.delete(contract)
    db.session.commit()
    return jsonify({'message': 'Contract deleted'}), 200

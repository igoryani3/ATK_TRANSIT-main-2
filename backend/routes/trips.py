from flask import Blueprint, request, jsonify, session
from models import Trip
from database import db
from datetime import datetime, date
from routes.auth import require_auth, require_role
from sqlalchemy import func
import json

trips_bp = Blueprint('trips', __name__)

def generate_trip_number():
    """Generate unique trip number in format TRIP-YYYYMMDD-XXXX"""
    today = datetime.now().strftime('%Y%m%d')
    prefix = f'TRIP-{today}-'
    last_trip = Trip.query.filter(Trip.trip_number.like(f'{prefix}%')).order_by(Trip.id.desc()).first()
    if last_trip:
        last_counter = int(last_trip.trip_number.split('-')[-1])
        new_counter = last_counter + 1
    else:
        new_counter = 1
    return f'{prefix}{new_counter:04d}'

@trips_bp.route('', methods=['GET'])
@require_auth
def get_trips():
    """Get trips. Optional ?date=YYYY-MM-DD or ?month=YYYY-MM for calendar aggregation."""
    date_param = request.args.get('date')
    month_param = request.args.get('month')

    if month_param:
        # Return counts per day for given month: {"2026-03-01": 3, ...}
        try:
            year, month = map(int, month_param.split('-'))
        except ValueError:
            return jsonify({'error': 'Invalid month format, use YYYY-MM'}), 400

        rows = (
            db.session.query(Trip.trip_date, func.count(Trip.id))
            .filter(
                func.strftime('%Y', Trip.trip_date) == str(year),
                func.strftime('%m', Trip.trip_date) == f'{month:02d}',
                Trip.trip_date.isnot(None)
            )
            .group_by(Trip.trip_date)
            .all()
        )
        result = {row[0].isoformat(): row[1] for row in rows}
        return jsonify(result), 200

    if date_param:
        try:
            trip_date = date.fromisoformat(date_param)
        except ValueError:
            return jsonify({'error': 'Invalid date format, use YYYY-MM-DD'}), 400
        trips = Trip.query.filter_by(trip_date=trip_date).order_by(Trip.created_at.asc()).all()
        return jsonify([trip.to_dict() for trip in trips]), 200

    # Default: all trips
    trips = Trip.query.order_by(Trip.created_at.desc()).all()
    return jsonify([trip.to_dict() for trip in trips]), 200

@trips_bp.route('/<int:trip_id>', methods=['GET'])
@require_auth
def get_trip(trip_id):
    """Get single trip by ID"""
    trip = Trip.query.get_or_404(trip_id)
    return jsonify(trip.to_dict()), 200

@trips_bp.route('', methods=['POST'])
@require_role('admin', 'dispatcher')
def create_trip():
    """Create a new trip (admin and dispatcher only)"""
    data = request.get_json()

    trip_number = generate_trip_number()

    waypoints = data.get('route_waypoints', [])
    if isinstance(waypoints, list):
        waypoints = json.dumps(waypoints)

    # Parse trip_date
    trip_date_raw = data.get('trip_date')
    trip_date_val = None
    if trip_date_raw:
        try:
            trip_date_val = date.fromisoformat(trip_date_raw)
        except ValueError:
            pass
    if trip_date_val is None:
        trip_date_val = date.today()

    trip = Trip(
        trip_number=trip_number,
        trip_date=trip_date_val,
        region=data.get('region'),
        contract=data.get('contract'),
        client_id=data.get('client_id'),
        direction=data.get('direction'),
        type=data.get('type'),
        people_count=data.get('people_count'),
        time_of_day=data.get('time_of_day'),
        submission_time=data.get('submission_time'),
        departure_time=data.get('departure_time'),
        route_start=data.get('route_start'),
        route_waypoints=waypoints,
        route_end=data.get('route_end'),
        trip_type=data.get('trip_type'),
        executor=data.get('executor'),
        vehicle_id=data.get('vehicle_id'),
        driver_id=data.get('driver_id'),
        driver_phone=data.get('driver_phone'),
        price_without_vat=data.get('price_without_vat'),
        price_with_vat=data.get('price_with_vat')
    )

    db.session.add(trip)
    db.session.commit()

    return jsonify(trip.to_dict()), 201

@trips_bp.route('/<int:trip_id>', methods=['PUT'])
@require_role('admin', 'dispatcher')
def update_trip(trip_id):
    """Update existing trip (admin and dispatcher only)"""
    trip = Trip.query.get_or_404(trip_id)
    data = request.get_json()

    trip.region = data.get('region', trip.region)
    trip.contract = data.get('contract', trip.contract)
    trip.client_id = data.get('client_id', trip.client_id)
    trip.direction = data.get('direction', trip.direction)
    trip.type = data.get('type', trip.type)
    trip.people_count = data.get('people_count', trip.people_count)
    trip.time_of_day = data.get('time_of_day', trip.time_of_day)
    trip.submission_time = data.get('submission_time', trip.submission_time)
    trip.departure_time = data.get('departure_time', trip.departure_time)
    trip.route_start = data.get('route_start', trip.route_start)
    trip.route_end = data.get('route_end', trip.route_end)
    trip.trip_type = data.get('trip_type', trip.trip_type)
    trip.executor = data.get('executor', trip.executor)
    trip.vehicle_id = data.get('vehicle_id', trip.vehicle_id)
    trip.driver_id = data.get('driver_id', trip.driver_id)
    trip.driver_phone = data.get('driver_phone', trip.driver_phone)
    trip.price_without_vat = data.get('price_without_vat', trip.price_without_vat)
    trip.price_with_vat = data.get('price_with_vat', trip.price_with_vat)

    trip_date_raw = data.get('trip_date')
    if trip_date_raw:
        try:
            trip.trip_date = date.fromisoformat(trip_date_raw)
        except ValueError:
            pass

    # Handle waypoints
    waypoints = data.get('route_waypoints')
    if waypoints is not None:
        if isinstance(waypoints, list):
            trip.route_waypoints = json.dumps(waypoints)
        else:
            trip.route_waypoints = waypoints

    db.session.commit()

    return jsonify(trip.to_dict()), 200

@trips_bp.route('/<int:trip_id>', methods=['DELETE'])
@require_role('admin', 'dispatcher')
def delete_trip(trip_id):
    """Delete a trip (admin and dispatcher only)"""
    trip = Trip.query.get_or_404(trip_id)
    db.session.delete(trip)
    db.session.commit()

    return jsonify({'message': 'Trip deleted successfully'}), 200

from flask import Blueprint, request, jsonify
from models import Template, Trip
from database import db
from routes.auth import require_auth, require_role
from datetime import datetime, timedelta, date as date_type
import json

templates_bp = Blueprint('templates', __name__)

WEEKDAY_MAP = {
    'monday': 0,
    'tuesday': 1,
    'wednesday': 2,
    'thursday': 3,
    'friday': 4,
    'saturday': 5,
    'sunday': 6
}

@templates_bp.route('/api/templates/generate-trips', methods=['POST'])
@require_role('admin')
def generate_trips_from_templates():
    """
    Generate trips from templates for the next N days
    Also archives templates that have passed their end_date
    """
    data = request.get_json()
    days_ahead = data.get('days_ahead', 30)  # Default: generate for next 30 days

    templates = Template.query.filter_by(archived=False).all()
    created_count = 0
    skipped_count = 0
    archived_count = 0

    today = date_type.today()

    for template in templates:
        # Check if template should be archived
        if template.end_date and template.end_date < today:
            template.archived = True
            archived_count += 1
            continue

        if not template.weekdays:
            continue

        weekdays = json.loads(template.weekdays)
        if not weekdays:
            continue

        # Convert weekday names to numbers
        template_weekdays = [WEEKDAY_MAP[day] for day in weekdays if day in WEEKDAY_MAP]

        # Determine start date (either last_trip_date + 1 or today)
        if template.last_trip_date and template.last_trip_date >= today:
            start_date = template.last_trip_date + timedelta(days=1)
        else:
            start_date = today

        # If template has end_date, use it; otherwise use days_ahead
        if template.end_date:
            end_date = template.end_date
        else:
            end_date = today + timedelta(days=days_ahead)

        # Generate trips for each matching weekday
        current_date = start_date
        last_generated_date = template.last_trip_date

        while current_date <= end_date:
            if current_date.weekday() in template_weekdays:
                # Check if trip already exists for this date and template
                date_str = current_date.isoformat()
                existing_trip = Trip.query.filter_by(
                    trip_date=current_date,
                    route_start=template.start_point,
                    route_end=template.end_point,
                    client_id=template.customer_id
                ).first()

                if not existing_trip:
                    # Generate unique trip number
                    trip_number = f"T-{template.id}-{current_date.strftime('%Y%m%d')}"

                    # Create new trip from template
                    new_trip = Trip(
                        trip_number=trip_number,
                        client_id=template.customer_id,
                        direction=template.route_name,
                        route_start=template.start_point,
                        route_end=template.end_point,
                        trip_type=template.route_type,
                        submission_time=template.pickup_time,
                        departure_time=template.departure_time,
                        people_count=int(template.capacity) if template.capacity else None,
                        price_without_vat=template.price_excl_vat,
                        price_with_vat=template.price_excl_vat * 1.2 if template.price_excl_vat else None,
                        region=template.region,
                        contract=template.contract,
                        type=template.type,
                        time_of_day=template.time_of_day,
                        executor=template.executor,
                        vehicle_id=template.vehicle_id,
                        driver_id=template.driver_id,
                        driver_phone=template.driver_phone,
                        trip_date=current_date
                    )

                    db.session.add(new_trip)
                    created_count += 1
                    last_generated_date = current_date
                else:
                    skipped_count += 1

            current_date += timedelta(days=1)

        # Update last_trip_date for template
        if last_generated_date:
            template.last_trip_date = last_generated_date

    db.session.commit()

    return jsonify({
        'message': 'Trips generated successfully',
        'created': created_count,
        'skipped': skipped_count,
        'archived': archived_count,
        'templates_processed': len(templates)
    }), 200

@templates_bp.route('/api/templates/<int:template_id>/trips', methods=['DELETE'])
@require_role('admin')
def delete_template_trips(template_id):
    """
    Delete all trips generated from a specific template
    """
    try:
        # Find template to verify it exists
        template = Template.query.get(template_id)
        if not template:
            return jsonify({'error': 'Template not found'}), 404

        # Find all trips with trip_number starting with T-{template_id}-
        trip_prefix = f"T-{template_id}-"
        trips = Trip.query.filter(Trip.trip_number.like(f"{trip_prefix}%")).all()

        deleted_count = len(trips)

        # Delete all matching trips
        for trip in trips:
            db.session.delete(trip)

        # Reset last_trip_date for the template
        template.last_trip_date = None

        db.session.commit()

        return jsonify({
            'message': f'Deleted {deleted_count} trips from template',
            'deleted_count': deleted_count
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

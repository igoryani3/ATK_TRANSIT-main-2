from flask import Blueprint, jsonify
import csv
import os

directions_bp = Blueprint('directions', __name__)

@directions_bp.route('/directions', methods=['GET'])
def get_directions():
    """Get all unique directions from CSV with their route details"""
    try:
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'routes_expanded.csv')
        
        # Dictionary to store direction data
        # Key: direction name, Value: list of variants
        directions_dict = {}
        
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                direction = row['Route_Name'].strip()
                client = row['Client'].strip()
                start = row['Start_Point'].strip()
                end = row['End_Point'].strip()
                route_type = row['Route_Type'].strip()
                pickup_time = row['Pickup_Time'].strip() if row['Pickup_Time'] else None
                departure_time = row['Departure_Time'].strip() if row['Departure_Time'] else None
                price = row['Price_Excl_VAT'].strip() if row['Price_Excl_VAT'] else None
                capacity = row['Capacity'].strip() if row['Capacity'] else None
                
                # Create unique key for this variant
                variant_key = f"{client}|{start}|{end}|{route_type}|{pickup_time}|{departure_time}"
                
                if direction not in directions_dict:
                    directions_dict[direction] = {
                        'client': client,
                        'variants': []
                    }
                
                # Check if this variant already exists
                variant_exists = False
                for variant in directions_dict[direction]['variants']:
                    if variant['key'] == variant_key:
                        variant_exists = True
                        break
                
                if not variant_exists:
                    directions_dict[direction]['variants'].append({
                        'key': variant_key,
                        'client': client,
                        'start_point': start,
                        'end_point': end,
                        'route_type': route_type,
                        'pickup_time': pickup_time,
                        'departure_time': departure_time,
                        'price_excl_vat': float(price) if price else None,
                        'capacity': float(capacity) if capacity else None
                    })
        
        # Convert to list format for frontend
        directions_list = []
        for direction_name, data in sorted(directions_dict.items()):
            directions_list.append({
                'name': direction_name,
                'client': data['client'],
                'variants': data['variants']
            })
        
        return jsonify(directions_list), 200
        
    except FileNotFoundError:
        return jsonify({'error': 'Routes CSV file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

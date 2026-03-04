from flask import Blueprint, request, jsonify
from models import ContractProvider
from database import db
from routes.auth import require_auth, require_role

contract_providers_bp = Blueprint('contract_providers', __name__)


@contract_providers_bp.route('/api/contract-providers', methods=['GET'])
@require_auth
def get_contract_providers():
    """Get all contract providers"""
    providers = ContractProvider.query.order_by(ContractProvider.name).all()
    return jsonify([provider.to_dict() for provider in providers])


@contract_providers_bp.route('/api/contract-providers', methods=['POST'])
@require_role('admin')
def create_contract_provider():
    """Create a new contract provider (admin only)"""
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400

    # Check for duplicates
    existing = ContractProvider.query.filter_by(name=data['name']).first()
    if existing:
        return jsonify({'error': 'Contract provider with this name already exists'}), 400

    provider = ContractProvider(name=data['name'])
    db.session.add(provider)
    db.session.commit()

    return jsonify(provider.to_dict()), 201


@contract_providers_bp.route('/api/contract-providers/<int:provider_id>', methods=['PUT'])
@require_role('admin')
def update_contract_provider(provider_id):
    """Update a contract provider (admin only)"""
    provider = ContractProvider.query.get_or_404(provider_id)
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400

    # Check for duplicates (excluding current provider)
    existing = ContractProvider.query.filter(
        ContractProvider.name == data['name'],
        ContractProvider.id != provider_id
    ).first()

    if existing:
        return jsonify({'error': 'Contract provider with this name already exists'}), 400

    provider.name = data['name']
    db.session.commit()

    return jsonify(provider.to_dict())


@contract_providers_bp.route('/api/contract-providers/<int:provider_id>', methods=['DELETE'])
@require_role('admin')
def delete_contract_provider(provider_id):
    """Delete a contract provider (admin only)"""
    provider = ContractProvider.query.get_or_404(provider_id)
    db.session.delete(provider)
    db.session.commit()

    return jsonify({'message': 'Contract provider deleted successfully'})

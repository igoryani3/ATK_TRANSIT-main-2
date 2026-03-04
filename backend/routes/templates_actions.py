from flask import Blueprint, request, jsonify
from models import Template
from database import db
from routes.auth import require_auth, require_role

templates_actions_bp = Blueprint('templates_actions', __name__)

@templates_actions_bp.route('/api/templates/<int:template_id>/archive', methods=['POST'])
@require_role('admin')
def archive_template(template_id):
    template = Template.query.get_or_404(template_id)
    template.archived = True
    db.session.commit()
    return jsonify({'message': 'Template archived', 'template': template.to_dict()}), 200


@templates_actions_bp.route('/api/templates/<int:template_id>/unarchive', methods=['POST'])
@require_role('admin')
def unarchive_template(template_id):
    template = Template.query.get_or_404(template_id)
    template.archived = False
    db.session.commit()
    return jsonify({'message': 'Template unarchived', 'template': template.to_dict()}), 200

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User

users_bp = Blueprint('users', __name__)

MASTER_PHONE = '+9868995742'

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users (admin/master only)"""
    current_user_phone = get_jwt_identity()
    current_user = User.query.filter_by(phone=current_user_phone).first()
    
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    # Only admin, manager, or master can view all users
    if current_user.role not in ['admin', 'manager'] and current_user.phone != MASTER_PHONE:
        return jsonify({'message': 'Unauthorized'}), 403
    
    users = User.query.all()
    return jsonify({
        'users': [user.to_dict() for user in users],
        'master_phone': MASTER_PHONE
    }), 200

@users_bp.route('/<phone>/role', methods=['PUT'])
@jwt_required()
def update_user_role(phone):
    """Update user role (master/admin only)"""
    current_user_phone = get_jwt_identity()
    current_user = User.query.filter_by(phone=current_user_phone).first()
    
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    # Only admin, manager, or master can update roles
    if current_user.role not in ['admin', 'manager'] and current_user.phone != MASTER_PHONE:
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Get target user
    target_user = User.query.filter_by(phone=phone).first()
    if not target_user:
        return jsonify({'message': 'Target user not found'}), 404
    
    # Master account cannot be modified
    if target_user.phone == MASTER_PHONE:
        return jsonify({'message': 'Cannot modify master account'}), 403
    
    # Get new role from request
    data = request.get_json()
    new_role = data.get('role')
    
    if not new_role or new_role not in ['user', 'admin', 'manager', 'driver']:
        return jsonify({'message': 'Invalid role. Must be: user, admin, manager, or driver'}), 400
    
    # Update role
    target_user.role = new_role
    db.session.commit()
    
    return jsonify({
        'message': 'Role updated successfully',
        'user': target_user.to_dict()
    }), 200

@users_bp.route('/<phone>', methods=['DELETE'])
@jwt_required()
def delete_user(phone):
    """Delete user (master only)"""
    current_user_phone = get_jwt_identity()
    current_user = User.query.filter_by(phone=current_user_phone).first()
    
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    # Only master can delete users
    if current_user.phone != MASTER_PHONE:
        return jsonify({'message': 'Only master account can delete users'}), 403
    
    # Get target user
    target_user = User.query.filter_by(phone=phone).first()
    if not target_user:
        return jsonify({'message': 'Target user not found'}), 404
    
    # Master account cannot be deleted
    if target_user.phone == MASTER_PHONE:
        return jsonify({'message': 'Cannot delete master account'}), 403
    
    # Delete user
    db.session.delete(target_user)
    db.session.commit()
    
    return jsonify({'message': 'User deleted successfully'}), 200

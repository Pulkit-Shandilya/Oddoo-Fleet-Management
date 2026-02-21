from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models import Driver, User

drivers_bp = Blueprint('drivers', __name__)

@drivers_bp.route('/', methods=['GET'])
@jwt_required()
def get_drivers():
    drivers = Driver.query.all()
    return jsonify({'drivers': [driver.to_dict() for driver in drivers]}), 200

@drivers_bp.route('/<string:phone>', methods=['GET'])
@jwt_required()
def get_driver(phone):
    driver = Driver.query.get(phone)
    
    if not driver:
        return jsonify({'message': 'Driver not found'}), 404
    
    return jsonify({'driver': driver.to_dict()}), 200

@drivers_bp.route('/', methods=['POST'])
@jwt_required()
def create_driver():
    current_user_phone = get_jwt_identity()
    user = User.query.get(current_user_phone)
    
    # Check if user has permission
    if user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('name') or not data.get('phone') or not data.get('license_number'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if phone number already exists
    if Driver.query.filter_by(phone=data['phone']).first():
        return jsonify({'message': 'Phone number already exists'}), 400
    
    # Check if license number already exists
    if Driver.query.filter_by(license_number=data['license_number']).first():
        return jsonify({'message': 'License number already exists'}), 400
    
    # Parse license expiry date if provided
    license_expiry = None
    if data.get('license_expiry'):
        try:
            license_expiry = datetime.strptime(data['license_expiry'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Invalid date format for license_expiry. Use YYYY-MM-DD'}), 400
    
    # Create new driver
    driver = Driver(
        phone=data['phone'],
        name=data['name'],
        email=data.get('email'),
        license_number=data['license_number'],
        license_expiry=license_expiry,
        status=data.get('status', 'available')
    )
    
    db.session.add(driver)
    db.session.commit()
    
    return jsonify({
        'message': 'Driver created successfully',
        'driver': driver.to_dict()
    }), 201

@drivers_bp.route('/<string:phone>', methods=['PUT'])
@jwt_required()
def update_driver(phone):
    current_user_phone = get_jwt_identity()
    user = User.query.get(current_user_phone)
    
    # Check if user has permission
    if user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    driver = Driver.query.get(phone)
    
    if not driver:
        return jsonify({'message': 'Driver not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'name' in data:
        driver.name = data['name']
    if 'email' in data:
        driver.email = data['email']
    if 'license_number' in data:
        driver.license_number = data['license_number']
    if 'license_expiry' in data:
        try:
            driver.license_expiry = datetime.strptime(data['license_expiry'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Invalid date format for license_expiry. Use YYYY-MM-DD'}), 400
    if 'status' in data:
        driver.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Driver updated successfully',
        'driver': driver.to_dict()
    }), 200

@drivers_bp.route('/<string:phone>', methods=['DELETE'])
@jwt_required()
def delete_driver(phone):
    current_user_phone = get_jwt_identity()
    user = User.query.get(current_user_phone)
    
    # Check if user has permission
    if user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    driver = Driver.query.get(phone)
    
    if not driver:
        return jsonify({'message': 'Driver not found'}), 404
    
    db.session.delete(driver)
    db.session.commit()
    
    return jsonify({'message': 'Driver deleted successfully'}), 200

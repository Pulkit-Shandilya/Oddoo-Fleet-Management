from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Vehicle, User

vehicles_bp = Blueprint('vehicles', __name__)

@vehicles_bp.route('/', methods=['GET'])
@jwt_required()
def get_vehicles():
    vehicles = Vehicle.query.all()
    return jsonify({'vehicles': [vehicle.to_dict() for vehicle in vehicles]}), 200

@vehicles_bp.route('/<string:vehicle_number>', methods=['GET'])
@jwt_required()
def get_vehicle(vehicle_number):
    vehicle = Vehicle.query.get(vehicle_number)
    
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404
    
    return jsonify({'vehicle': vehicle.to_dict()}), 200

@vehicles_bp.route('/', methods=['POST'])
@jwt_required()
def create_vehicle():
    current_user_phone = get_jwt_identity()
    user = User.query.get(current_user_phone)
    
    # Check if user has permission (admin or manager)
    if user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('vehicle_number'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if vehicle number already exists
    if Vehicle.query.filter_by(vehicle_number=data['vehicle_number']).first():
        return jsonify({'message': 'Vehicle number already exists'}), 400
    
    # Create new vehicle
    vehicle = Vehicle(
        vehicle_number=data['vehicle_number'],
        make=data.get('make'),
        model=data.get('model'),
        license_plate=data.get('license_plate'),
        holding_capacity=data.get('holding_capacity'),
        mileage=data.get('mileage', 0),
        status=data.get('status', 'active'),
        driver_phone=data.get('driver_phone')
    )
    
    db.session.add(vehicle)
    db.session.commit()
    
    return jsonify({
        'message': 'Vehicle created successfully',
        'vehicle': vehicle.to_dict()
    }), 201

@vehicles_bp.route('/<string:vehicle_number>', methods=['PUT'])
@jwt_required()
def update_vehicle(vehicle_number):
    current_user_phone = get_jwt_identity()
    user = User.query.get(current_user_phone)
    
    # Check if user has permission
    if user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    vehicle = Vehicle.query.get(vehicle_number)
    
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'holding_capacity' in data:
        vehicle.holding_capacity = data['holding_capacity']
    if 'mileage' in data:
        vehicle.mileage = data['mileage']
    if 'status' in data:
        vehicle.status = data['status']
    if 'driver_phone' in data:
        vehicle.driver_phone = data['driver_phone']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Vehicle updated successfully',
        'vehicle': vehicle.to_dict()
    }), 200

@vehicles_bp.route('/<string:vehicle_number>', methods=['DELETE'])
@jwt_required()
def delete_vehicle(vehicle_number):
    current_user_phone = get_jwt_identity()
    user = User.query.get(current_user_phone)
    
    # Check if user has permission
    if user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    vehicle = Vehicle.query.get(vehicle_number)
    
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404
    
    db.session.delete(vehicle)
    db.session.commit()
    
    return jsonify({'message': 'Vehicle deleted successfully'}), 200

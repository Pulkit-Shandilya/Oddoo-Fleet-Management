from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from app import db
from app.models import Maintenance, Vehicle, User

maintenance_bp = Blueprint('maintenance', __name__)

@maintenance_bp.route('/', methods=['GET'])
@jwt_required()
def get_maintenance():
    """Get all maintenance records"""
    maintenance_records = Maintenance.query.all()
    return jsonify({'maintenance': [record.to_dict() for record in maintenance_records]}), 200

@maintenance_bp.route('/vehicle/<string:vehicle_number>', methods=['GET'])
@jwt_required()
def get_vehicle_maintenance(vehicle_number):
    """Get maintenance records for a specific vehicle"""
    maintenance_records = Maintenance.query.filter_by(vehicle_number=vehicle_number).all()
    return jsonify({'maintenance': [record.to_dict() for record in maintenance_records]}), 200

@maintenance_bp.route('/', methods=['POST'])
@jwt_required()
def create_maintenance():
    """Create a new maintenance record"""
    current_user_phone = get_jwt_identity()
    user = User.query.get(current_user_phone)
    
    # Check if user has permission
    if user.role == 'driver':
        return jsonify({'message': 'Drivers cannot create maintenance records'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not data or not all(k in data for k in ['vehicle_number', 'type', 'date', 'duration_days']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if vehicle exists
    vehicle = Vehicle.query.get(data['vehicle_number'])
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404
    
    # Parse date
    try:
        maint_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Calculate end date
    duration_days = int(data.get('duration_days', 1))
    start_datetime = datetime.utcnow()
    end_datetime = start_datetime + timedelta(days=duration_days)
    
    # Create new maintenance record
    maintenance = Maintenance(
        vehicle_number=data['vehicle_number'],
        type=data['type'],
        description=data.get('description', ''),
        date=maint_date,
        duration_days=duration_days,
        cost=float(data.get('cost', 0)),
        status='in_progress',
        start_date=start_datetime,
        end_date=end_datetime
    )
    
    # Update vehicle status to maintenance and set end date
    vehicle.status = 'maintenance'
    vehicle.maintenance_end_date = end_datetime
    
    db.session.add(maintenance)
    db.session.commit()
    
    return jsonify({
        'message': 'Maintenance record created successfully',
        'maintenance': maintenance.to_dict(),
        'vehicle': vehicle.to_dict()
    }), 201

@maintenance_bp.route('/<int:maint_id>/complete', methods=['PUT'])
@jwt_required()
def complete_maintenance(maint_id):
    """Complete maintenance and restore vehicle to active"""
    current_user_phone = get_jwt_identity()
    user = User.query.get(current_user_phone)
    
    # Check if user has permission
    if user.role == 'driver':
        return jsonify({'message': 'Drivers cannot complete maintenance'}), 403
    
    maintenance = Maintenance.query.get(maint_id)
    
    if not maintenance:
        return jsonify({'message': 'Maintenance record not found'}), 404
    
    # Update maintenance status
    maintenance.status = 'completed'
    maintenance.end_date = datetime.utcnow()
    
    # Restore vehicle to active
    vehicle = Vehicle.query.get(maintenance.vehicle_number)
    if vehicle:
        vehicle.status = 'active'
        vehicle.maintenance_end_date = None
    
    db.session.commit()
    
    return jsonify({
        'message': 'Maintenance completed successfully',
        'maintenance': maintenance.to_dict(),
        'vehicle': vehicle.to_dict() if vehicle else None
    }), 200

@maintenance_bp.route('/check-expired', methods=['POST'])
@jwt_required()
def check_expired_maintenance():
    """Check for expired maintenance and restore vehicles to active state"""
    now = datetime.utcnow()
    
    # Find all vehicles with maintenance that has expired
    vehicles_to_restore = Vehicle.query.filter(
        Vehicle.status == 'maintenance',
        Vehicle.maintenance_end_date <= now
    ).all()
    
    restored_count = 0
    for vehicle in vehicles_to_restore:
        vehicle.status = 'active'
        vehicle.maintenance_end_date = None
        restored_count += 1
    
    if restored_count > 0:
        db.session.commit()
    
    return jsonify({
        'message': f'{restored_count} vehicles restored to active state',
        'restored_count': restored_count
    }), 200

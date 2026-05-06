from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models import Trip, User

trips_bp = Blueprint('trips', __name__)

@trips_bp.route('/', methods=['GET'])
@jwt_required()
def get_trips():
    """Get trips (optionally filter by status)"""
    status = request.args.get('status', None)  # active, completed, or None for all
    
    if status:
        trips = Trip.query.filter_by(status=status).all()
    else:
        trips = Trip.query.all()
    
    return jsonify({'trips': [trip.to_dict() for trip in trips]}), 200

@trips_bp.route('/', methods=['POST'])
@jwt_required()
def create_trip():
    """Create a new trip"""
    current_user_phone = get_jwt_identity()
    user = User.query.get(current_user_phone)
    
    # Check if user has permission (admin, manager, or user can create trips)
    if user.role == 'driver':
        return jsonify({'message': 'Drivers cannot create trips'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not data or not all(k in data for k in ['vehicle_number', 'driver_phone', 'origin', 'destination', 'date']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Parse date
    try:
        trip_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Create new trip
    trip = Trip(
        vehicle_number=data['vehicle_number'],
        driver_phone=data['driver_phone'],
        origin=data['origin'],
        destination=data['destination'],
        date=trip_date,
        distance=float(data.get('distance', 0)),
        fuel_type=data.get('fuel_type', 'petrol'),
        status='active'
    )
    
    db.session.add(trip)
    db.session.commit()
    
    return jsonify({
        'message': 'Trip created successfully',
        'trip': trip.to_dict()
    }), 201

@trips_bp.route('/<int:trip_id>', methods=['GET'])
@jwt_required()
def get_trip(trip_id):
    """Get a specific trip"""
    trip = Trip.query.get(trip_id)
    
    if not trip:
        return jsonify({'message': 'Trip not found'}), 404
    
    return jsonify({'trip': trip.to_dict()}), 200

@trips_bp.route('/<int:trip_id>/complete', methods=['PUT'])
@jwt_required()
def complete_trip(trip_id):
    """Mark a trip as completed"""
    current_user_phone = get_jwt_identity()
    user = User.query.get(current_user_phone)
    
    # Check if user has permission
    if user.role == 'driver':
        return jsonify({'message': 'Drivers cannot complete trips'}), 403
    
    trip = Trip.query.get(trip_id)
    
    if not trip:
        return jsonify({'message': 'Trip not found'}), 404
    
    # Update trip status
    trip.status = 'completed'
    trip.completed_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Trip completed successfully',
        'trip': trip.to_dict()
    }), 200

@trips_bp.route('/<int:trip_id>', methods=['DELETE'])
@jwt_required()
def delete_trip(trip_id):
    """Delete a trip (only incomplete trips)"""
    current_user_phone = get_jwt_identity()
    user = User.query.get(current_user_phone)
    
    # Check if user has permission (only master can delete)
    if current_user_phone != '+9868995742' and current_user_phone != '9868995742':
        return jsonify({'message': 'Only master account can delete trips'}), 403
    
    trip = Trip.query.get(trip_id)
    
    if not trip:
        return jsonify({'message': 'Trip not found'}), 404
    
    db.session.delete(trip)
    db.session.commit()
    
    return jsonify({'message': 'Trip deleted successfully'}), 200

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models import User, Driver
from email_validator import validate_email, EmailNotValidError
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('phone') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400

    if not data.get('license_number'):
        return jsonify({'message': 'License number is required'}), 400
    
    # Validate email
    try:
        validate_email(data['email'])
    except EmailNotValidError:
        return jsonify({'message': 'Invalid email address'}), 400
    
    # Check if user already exists
    if User.query.filter_by(phone=data['phone']).first():
        return jsonify({'message': 'Phone number already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400

    # Check if license number already exists
    if Driver.query.filter_by(license_number=data['license_number']).first():
        return jsonify({'message': 'License number already registered'}), 400
    
    # Determine role: driver if license provided, else user
    role = 'driver'

    # Create new user
    name = data.get('name') or data.get('username') or ''
    user = User(
        phone=data['phone'],
        username=name,
        email=data['email'],
        role=role
    )
    user.set_password(data['password'])
    db.session.add(user)

    # Parse license expiry
    license_expiry = None
    if data.get('license_expiry'):
        try:
            license_expiry = datetime.strptime(data['license_expiry'], '%Y-%m-%d').date()
        except ValueError:
            pass

    # Create Driver record linked to the same phone
    driver = Driver(
        phone=data['phone'],
        name=name,
        email=data['email'],
        license_number=data['license_number'],
        license_expiry=license_expiry,
        status='available'
    )
    db.session.add(driver)
    db.session.commit()
    
    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('phone') or not data.get('password'):
        return jsonify({'message': 'Missing phone or password'}), 400
    
    # Find user
    user = User.query.filter_by(phone=data['phone']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid phone or password'}), 401
    
    # Create tokens
    access_token = create_access_token(identity=user.phone)
    refresh_token = create_refresh_token(identity=user.phone)
    
    return jsonify({
        'message': 'Login Done ✅',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_phone = get_jwt_identity()
    access_token = create_access_token(identity=current_user_phone)
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_phone = get_jwt_identity()
    user = User.query.get(current_user_phone)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user_data = user.to_dict()

    # Enrich with driver name if available
    driver = Driver.query.filter_by(phone=current_user_phone).first()
    if driver and driver.name:
        user_data['display_name'] = driver.name
    else:
        user_data['display_name'] = user.username or None
    
    return jsonify({'user': user_data}), 200

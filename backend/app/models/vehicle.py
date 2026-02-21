from datetime import datetime
from app import db

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    
    id = db.Column(db.Integer, primary_key=True)
    vehicle_number = db.Column(db.String(50), unique=True, nullable=False)
    make = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer)
    vin = db.Column(db.String(17), unique=True)
    license_plate = db.Column(db.String(20), unique=True)
    status = db.Column(db.String(20), default='active')  # active, maintenance, inactive
    mileage = db.Column(db.Integer, default=0)
    fuel_type = db.Column(db.String(20))  # diesel, petrol, electric, hybrid
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'vehicle_number': self.vehicle_number,
            'make': self.make,
            'model': self.model,
            'year': self.year,
            'vin': self.vin,
            'license_plate': self.license_plate,
            'status': self.status,
            'mileage': self.mileage,
            'fuel_type': self.fuel_type,
            'driver_id': self.driver_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

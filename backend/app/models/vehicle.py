from datetime import datetime
from app import db

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    
    vehicle_number = db.Column(db.String(50), primary_key=True, nullable=False)
    holding_capacity = db.Column(db.Integer)  # passengers or cargo capacity
    mileage = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='active')  # active, maintenance, inactive
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    driver_phone = db.Column(db.String(20), db.ForeignKey('drivers.phone'), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.vehicle_number,
            'vehicle_number': self.vehicle_number,
            'holding_capacity': self.holding_capacity,
            'mileage': self.mileage,
            'status': self.status,
            'driver_phone': self.driver_phone,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

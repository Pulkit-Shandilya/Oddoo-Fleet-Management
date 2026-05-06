from datetime import datetime
from app import db

class Trip(db.Model):
    __tablename__ = 'trips'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    vehicle_number = db.Column(db.String(50), nullable=False)
    driver_phone = db.Column(db.String(20), nullable=False)
    origin = db.Column(db.String(255), nullable=False)
    destination = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False)
    distance = db.Column(db.Float, default=0)
    fuel_type = db.Column(db.String(20), default='petrol')  # petrol, diesel, electric
    status = db.Column(db.String(20), default='active')  # active, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'vehicle_number': self.vehicle_number,
            'driver_phone': self.driver_phone,
            'origin': self.origin,
            'destination': self.destination,
            'date': self.date.isoformat() if self.date else None,
            'distance': self.distance,
            'fuel_type': self.fuel_type,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

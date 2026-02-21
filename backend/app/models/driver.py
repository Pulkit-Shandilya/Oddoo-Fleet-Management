from datetime import datetime
from app import db

class Driver(db.Model):
    __tablename__ = 'drivers'
    
    phone = db.Column(db.String(20), primary_key=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    license_expiry = db.Column(db.Date)
    status = db.Column(db.String(20), default='available')  # available, assigned, inactive
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    vehicles = db.relationship('Vehicle', backref='driver', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.phone,
            'phone': self.phone,
            'license_number': self.license_number,
            'name': self.name,
            'email': self.email,
            'license_expiry': self.license_expiry.isoformat() if self.license_expiry else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

from datetime import datetime
from app import db

class Maintenance(db.Model):
    __tablename__ = 'maintenance'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    vehicle_number = db.Column(db.String(50), db.ForeignKey('vehicles.vehicle_number'), nullable=False)
    type = db.Column(db.String(100), nullable=False)  # oil change, repair, service, etc.
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.Date, nullable=False)
    duration_days = db.Column(db.Integer, default=1)  # How many days the maintenance will take
    cost = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed
    start_date = db.Column(db.DateTime, default=datetime.utcnow)  # When maintenance started
    end_date = db.Column(db.DateTime, nullable=True)  # When maintenance will be complete
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'vehicle_number': self.vehicle_number,
            'type': self.type,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'duration_days': self.duration_days,
            'cost': self.cost,
            'status': self.status,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

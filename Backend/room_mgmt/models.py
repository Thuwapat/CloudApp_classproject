from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Room(db.Model):
    __tablename__ = 'rooms'
    roomid = db.Column(db.Integer, primary_key=True)
    roomname = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def to_dict(self):
        return {
            'roomid': self.roomid,
            'roomname': self.roomname,
            'type': self.type,
            'capacity': self.capacity,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class RoomUsageLog(db.Model):
    __tablename__ = 'room_usage_logs'
    logid = db.Column(db.Integer, primary_key=True)
    roomid = db.Column(db.Integer, db.ForeignKey('rooms.roomid'), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    purpose = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'logid': self.logid,
            'roomid': self.roomid,
            'user_id': self.user_id,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'purpose': self.purpose,
            'created_at': self.created_at.isoformat()
        }
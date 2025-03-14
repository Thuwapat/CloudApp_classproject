from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Room(db.Model):
    __tablename__ = 'rooms'
    id = db.Column(db.Integer, primary_key=True)
    meetings_today = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {'id': self.id, 'meetings_today': self.meetings_today}

class Request(db.Model):
    __tablename__ = 'requests'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer)  # ลบ Foreign Key
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'))
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    reason = db.Column(db.String(200))
    status = db.Column(db.String(20), default='Pending')
    teacher_id = db.Column(db.Integer, nullable=True)  # ลบ Foreign Key

    def to_dict(self):
        return {
            'id': self.id,
            'room_id': self.room_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'reason': self.reason,
            'status': self.status,
            'student_id': self.student_id,
            'teacher_id': self.teacher_id
        }
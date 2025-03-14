from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Request(db.Model):
    __tablename__ = 'requests'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, nullable=False)
    room_id = db.Column(db.Integer, nullable=False)  # อ้างอิง roomid จาก room_mgmt
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default='Pending')
    teacher_id = db.Column(db.Integer)

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
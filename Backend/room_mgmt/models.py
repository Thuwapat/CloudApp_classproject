from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Table, Column, Integer, String, DateTime, ForeignKey, MetaData, text
from sqlalchemy.exc import OperationalError

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

# ฟังก์ชันสำหรับสร้างตาราง Logs ของห้องแบบ dynamic
def create_room_log_table(roomid):
    table_name = f"room_{roomid}_logs"
    
    # ตรวจสอบว่าตารางมีอยู่แล้วหรือไม่
    if table_name in db.metadata.tables:
        print(f"Table {table_name} already exists in metadata.")
        return db.metadata.tables[table_name]

    # สร้างตารางใหม่
    log_table = Table(
        table_name,
        db.metadata,
        Column('logid', Integer, primary_key=True),
        Column('user_id', Integer, nullable=False),
        Column('start_time', DateTime, nullable=False),
        Column('end_time', DateTime, nullable=False),
        Column('purpose', String(100)),
        Column('created_at', DateTime, server_default=db.func.current_timestamp()),
        Column('status', String(1), default='A')  # เพิ่มฟิลด์ status กับค่า default 'A'
    )

    # สร้างตารางใน database
    try:
        print(f"Creating table {table_name}...")
        with db.engine.connect() as conn:
            log_table.create(conn, checkfirst=True)
            conn.commit()
        print(f"Table {table_name} created successfully.")
    except OperationalError as e:
        print(f"Error creating table {table_name}: {e}")
        raise

    return log_table

# คลาสสำหรับเข้าถึงตาราง Logs (dynamic)
class RoomUsageLog:
    def __init__(self, roomid):
        self.table = create_room_log_table(roomid)

    def to_dict(self, row):
        return {
            'logid': row.logid,
            'user_id': row.user_id,
            'start_time': row.start_time.isoformat(),
            'end_time': row.end_time.isoformat(),
            'purpose': row.purpose,
            'created_at': row.created_at.isoformat(),
            'status': getattr(row, 'status', 'A')  # เพิ่ม status ใน dict
        }
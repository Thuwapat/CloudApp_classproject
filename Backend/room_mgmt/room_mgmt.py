from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import requests
from models import db, Room, RoomUsageLog, create_room_log_table
from sqlalchemy import inspect, text

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://localhost:3000", "https://localhost:5001"])

# ตั้งค่า database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_ROOM_MGMT_URL', 'postgresql://myuser:mypass@room_mgmt_db:5432/room_mgmt_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# ฟังก์ชันตรวจสอบ token
def validate_token(token):
    auth_url = os.getenv('AUTH_SERVICE_URL', 'http://authen_backend:5000')
    print(f"Calling validate_token with token: {token[:10]}...")
    try:
        response = requests.post(
            f'{auth_url}/validate-user',
            headers={'Authorization': f'Bearer {token}'},
            verify=False,
            timeout=5
        )
        print(f"Response from /validate-user: Status {response.status_code}, Text: {response.text}")
        if response.status_code == 200:
            return response.json()
        return {'error': 'Invalid token', 'status': response.status_code}
    except requests.RequestException as e:
        print(f"Error validating token: {e}")
        return {'error': f'Failed to validate token: {str(e)}', 'status': 500}

# เพิ่มห้องใหม่
@app.route('/rooms', methods=['POST'])
def add_room():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    user_data = validate_token(token.replace('Bearer ', ''))
    if 'error' in user_data:
        return jsonify({'error': user_data['error']}), user_data['status']
    if user_data.get('role') not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized: Only admins or teachers can add rooms'}), 403

    data = request.get_json()
    required_fields = ['roomid', 'roomname', 'type', 'capacity']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    if db.session.get(Room, data['roomid']):
        return jsonify({'error': 'Room ID already exists'}), 400

    new_room = Room(
        roomid=data['roomid'],
        roomname=data['roomname'],
        type=data['type'],
        capacity=data['capacity'],
        description=data.get('description', '')
    )
    db.session.add(new_room)
    db.session.commit()

    # สร้างตาราง Logs สำหรับห้องใหม่
    try:
        create_room_log_table(new_room.roomid)
    except Exception as e:
        print(f"Failed to create log table for room {new_room.roomid}: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to create log table for the room'}), 500

    return jsonify({'message': 'Room added successfully', 'room': new_room.to_dict()}), 201

# ดึงข้อมูลห้องทั้งหมด
@app.route('/rooms', methods=['GET'])
def get_rooms():
    rooms = Room.query.all()
    return jsonify([room.to_dict() for room in rooms]), 200

# ดึงข้อมูลห้องจาก roomid
@app.route('/rooms/<int:roomid>', methods=['GET'])
def get_room(roomid):
    room = db.session.get(Room, roomid)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    return jsonify(room.to_dict()), 200

# อัปเดตข้อมูลห้อง
@app.route('/rooms/<int:roomid>', methods=['PUT'])
def update_room(roomid):
    room = db.session.get(Room, roomid)
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    data = request.get_json()
    room.roomname = data.get('roomname', room.roomname)
    room.type = data.get('type', room.type)
    room.capacity = data.get('capacity', room.capacity)
    room.description = data.get('description', room.description)

    db.session.commit()
    return jsonify({'message': 'Room updated successfully', 'room': room.to_dict()}), 200

# ลบห้อง
@app.route('/rooms/<int:roomid>', methods=['DELETE'])
def delete_room(roomid):
    room = db.session.get(Room, roomid)
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    # ลบตาราง Logs ของห้องนี้
    table_name = f"room_{roomid}_logs"
    with db.engine.connect() as conn:
        conn.execute(text(f"DROP TABLE IF EXISTS {table_name}"))
        conn.commit()

    db.session.delete(room)
    db.session.commit()
    return jsonify({'message': 'Room deleted successfully'}), 200

# บันทึก Logs การเข้าใช้ห้อง
@app.route('/room-usage-logs', methods=['POST'])
def log_room_usage():
    data = request.get_json()
    required_fields = ['roomid', 'user_id', 'start_time', 'end_time']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    room = db.session.get(Room, data['roomid'])
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    room_log = RoomUsageLog(data['roomid'])
    table = room_log.table

    try:
        with db.engine.connect() as conn:
            conn.execute(
                table.insert().values(
                    user_id=data['user_id'],
                    start_time=data['start_time'],
                    end_time=data['end_time'],
                    purpose=data.get('purpose', '')
                )
            )
            conn.commit()
        return jsonify({'message': 'Room usage logged successfully'}), 201
    except Exception as e:
        print(f"Error logging room usage: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# ดึง Logs ตาม roomid
@app.route('/room-usage-logs/room/<int:roomid>', methods=['GET'])
def get_logs_by_room(roomid):
    room = db.session.get(Room, roomid)
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    # ตรวจสอบและสร้างตาราง Logs หากยังไม่มี
    table_name = f"room_{roomid}_logs"
    inspector = inspect(db.engine)
    if not inspector.has_table(table_name):
        try:
            create_room_log_table(roomid)
        except Exception as e:
            print(f"Failed to create log table for room {roomid}: {e}")
            return jsonify({'error': 'Failed to create log table'}), 500

    room_log = RoomUsageLog(roomid)
    table = room_log.table

    try:
        with db.engine.connect() as conn:
            result = conn.execute(table.select()).fetchall()
            logs = [room_log.to_dict(row) for row in result]
        return jsonify(logs), 200
    except Exception as e:
        print(f"Error fetching logs: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
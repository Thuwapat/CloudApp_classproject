from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from models import db, Room, RoomUsageLog
import requests

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://localhost:3000", "http://localhost:5001"])

# ตั้งค่า database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_ROOM_MGMT_URL', 'postgresql://myuser:mypass@room_mgmt_db:5432/room_mgmt_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

def validate_token(token):
    auth_url = os.getenv('AUTH_SERVICE_URL', 'http://authen_backend:5000')
    #print(f"Calling validate_token with token: {token[:10]}...")
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
        return None
    except requests.RequestException as e:
        print(f"Error validating token: {e}")
        return None
    
# เพิ่มห้องใหม่
@app.route('/rooms', methods=['POST'])
def add_room():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    user_data = validate_token(token.replace('Bearer ', ''))
    if not user_data:
        return jsonify({'error': 'Invalid token or authentication failed'}), 401
    if user_data.get('role') not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized: Only admins or teachers can add rooms'}), 403

    data = request.get_json()
    required_fields = ['roomid', 'roomname', 'type', 'capacity']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    if Room.query.get(data['roomid']):
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

    return jsonify({'message': 'Room added successfully', 'room': new_room.to_dict()}), 201

# ดึงข้อมูลห้องทั้งหมด
@app.route('/rooms', methods=['GET'])
def get_rooms():
    rooms = Room.query.all()
    return jsonify([room.to_dict() for room in rooms]), 200

# ดึงข้อมูลห้องจาก roomid
@app.route('/rooms/<int:roomid>', methods=['GET'])
def get_room(roomid):
    room = Room.query.get_or_404(roomid)
    return jsonify(room.to_dict()), 200

# อัปเดตข้อมูลห้อง
@app.route('/rooms/<int:roomid>', methods=['PUT'])
def update_room(roomid):
    room = Room.query.get_or_404(roomid)
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
    room = Room.query.get_or_404(roomid)
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

    room = Room.query.get(data['roomid'])
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    new_log = RoomUsageLog(
        roomid=data['roomid'],
        user_id=data['user_id'],
        start_time=data['start_time'],
        end_time=data['end_time'],
        purpose=data.get('purpose', '')
    )
    db.session.add(new_log)
    db.session.commit()

    return jsonify({'message': 'Room usage logged successfully', 'log': new_log.to_dict()}), 201

# ดึง Logs การใช้งานทั้งหมด
@app.route('/room-usage-logs', methods=['GET'])
def get_room_usage_logs():
    logs = RoomUsageLog.query.all()
    return jsonify([log.to_dict() for log in logs]), 200

# ดึง Logs ตาม roomid
@app.route('/room-usage-logs/room/<int:roomid>', methods=['GET'])
def get_logs_by_room(roomid):
    logs = RoomUsageLog.query.filter_by(roomid=roomid).all()
    return jsonify([log.to_dict() for log in logs]), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import requests
import jwt
import datetime
from models import db, Room, RoomUsageLog, create_room_log_table
from sqlalchemy import inspect, text
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://localhost:3000", "https://localhost:5001"])

# ตั้งค่า database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_ROOM_MGMT_URL', 'postgresql://myuser:mypass@room_mgmt_db:5432/room_mgmt_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

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

# ฟังก์ชันดึงข้อมูลผู้ใช้จาก authen_service
def get_user_info(user_id):
    auth_url = os.getenv('AUTH_SERVICE_URL', 'http://authen_backend:5000')
    secret_key = os.getenv('SECRET_KEY', 'your-secret-key')
    if not secret_key:
        print("SECRET_KEY is not set in environment variables")
        return {'name': 'Unknown', 'role': 'Unknown', 'email': 'N/A'}

    # สร้าง token ชั่วคราวสำหรับการเรียก internal
    internal_token = jwt.encode(
        {'role': 'admin', 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=5)},
        secret_key,
        algorithm='HS256'
    )

    session = requests.Session()
    retries = Retry(total=3, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
    session.mount('http://', HTTPAdapter(max_retries=retries))

    try:
        print(f"Fetching user info for user_id {user_id} from {auth_url}/validate-user-by-id with token: {internal_token[:10]}...")
        response = session.post(
            f'{auth_url}/validate-user-by-id',
            json={'user_id': user_id},
            headers={'Authorization': f'Bearer {internal_token}'},
            verify=False,
            timeout=5
        )
        print(f"Response from /validate-user-by-id: Status {response.status_code}, Text: {response.text}")
        if response.status_code == 200:
            user_data = response.json()
            return {
                'name': f"{user_data.get('first_name', 'Unknown')} {user_data.get('last_name', 'Unknown')}",
                'role': user_data.get('role', 'Unknown'),
                'email': user_data.get('email', 'N/A')  # เพิ่ม email
            }
        print(f"Failed to fetch user info, status code: {response.status_code}, response: {response.text}")
        return {'name': 'Unknown', 'role': 'Unknown', 'email': 'N/A'}
    except requests.RequestException as e:
        print(f"Error fetching user info for user_id {user_id}: {e}")
        return {'name': 'Unknown', 'role': 'Unknown', 'email': 'N/A'}

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
@app.route('/room-usage-logs/room/<int:roomid>', methods=['GET', 'PUT'])
def manage_logs_by_room(roomid):
    if request.method == 'GET':
        room = db.session.get(Room, roomid)
        if not room:
            return jsonify({'error': 'Room not found'}), 404

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
                logs = []
                for row in result:
                    user_info = get_user_info(row.user_id)
                    log_entry = room_log.to_dict(row)
                    log_entry['user_name'] = user_info['name']
                    log_entry['email'] = user_info.get('email', 'N/A')
                    log_entry['role'] = user_info['role']
                    # ดึง status จาก room_req
                    room_req_url = os.getenv('ROOM_REQ_URL', 'http://room_req_backend:5001')
                    try:
                        token = request.headers.get('Authorization', 'Bearer <default-token>')
                        response = requests.get(
                            f'{room_req_url}/requests',
                            params={'room_id': roomid, 'user_id': row.user_id},
                            headers={'Authorization': token}
                        )
                        if response.status_code == 200:
                            req_data = response.json()
                            matching_request = next(
                                (req for req in req_data if req['start_time'] == str(row.start_time) and req['end_time'] == str(row.end_time)),
                                None
                            )
                            log_entry['status'] = matching_request['status'] if matching_request else 'A'
                        else:
                            log_entry['status'] = 'A'
                    except requests.RequestException as e:
                        print(f"Error fetching request status: {e}")
                        log_entry['status'] = 'A'
                    logs.append(log_entry)
            return jsonify(logs), 200
        except Exception as e:
            print(f"Error fetching logs: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    elif request.method == 'PUT':
        data = request.get_json()
        user_id = data.get('user_id')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        status = data.get('status')

        if not all([user_id, start_time, end_time, status]):
            return jsonify({'error': 'Missing required fields'}), 400

        table_name = f"room_{roomid}_logs"
        if not inspector.has_table(table_name):
            return jsonify({'error': 'Log table not found'}), 404

        room_log = RoomUsageLog(roomid)
        table = room_log.table

        try:
            with db.engine.connect() as conn:
                conn.execute(
                    table.update()
                    .where(
                        (table.c.user_id == user_id) &
                        (table.c.start_time == start_time) &
                        (table.c.end_time == end_time)
                    )
                    .values(status=status)
                )
                conn.commit()
            return jsonify({'message': 'Log updated'}), 200
        except Exception as e:
            print(f"Error updating log: {e}")
            return jsonify({'error': 'Internal server error'}), 500

# ดึง Logs ของทุกห้อง
@app.route('/room-usage-logs/all', methods=['GET'])
def get_all_logs():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    user_data = validate_token(token.replace('Bearer ', ''))
    if 'error' in user_data:
        return jsonify({'error': user_data['error']}), user_data['status']
    if user_data.get('role') not in ['admin', 'teacher', 'student']:
        return jsonify({'error': 'Unauthorized: Only admins, teachers, or students can view logs'}), 403

    rooms = Room.query.all()
    all_logs = []

    # รับ limit จาก query parameter
    limit = request.args.get('limit', default=5, type=int)

    for room in rooms:
        table_name = f"room_{room.roomid}_logs"
        inspector = inspect(db.engine)
        if not inspector.has_table(table_name):
            try:
                create_room_log_table(room.roomid)
            except Exception as e:
                print(f"Failed to create log table for room {room.roomid}: {e}")
                continue

        room_log = RoomUsageLog(room.roomid)
        table = room_log.table

        try:
            with db.engine.connect() as conn:
                result = conn.execute(table.select().order_by(table.c.created_at.desc())).fetchall()
                for row in result:
                    user_info = get_user_info(row.user_id)
                    log_entry = {
                        'id': row.logid,
                        'user_name': user_info['name'],
                        'role': user_info['role'],
                        'room_name': room.roomname,
                        'time': row.start_time.isoformat(),
                        'purpose': row.purpose
                    }
                    all_logs.append(log_entry)
        except Exception as e:
            print(f"Error fetching logs for room {room.roomid}: {e}")
            continue

    # เรียงลำดับและจำกัดจำนวน Logs
    all_logs.sort(key=lambda x: x['time'], reverse=True)
    all_logs = all_logs[:limit]

    return jsonify(all_logs), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
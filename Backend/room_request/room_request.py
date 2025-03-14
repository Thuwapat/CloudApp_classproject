from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import requests
from datetime import datetime
from models import db, Request, Room

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://localhost:3000"])

# ตั้งค่า database URL
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_ROOM_URL', 'postgresql://myuser:mypass@room_req_db:5432/room_req_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')

db.init_app(app)

with app.app_context():
    db.create_all()

    # เพิ่มข้อมูล Dummy ในตาราง Room ถ้ายังไม่มีข้อมูล
    if Room.query.count() == 0:
        dummy_rooms = [
            Room(id=101, meetings_today=3),
            Room(id=102, meetings_today=2),
            Room(id=103, meetings_today=1),
        ]
        db.session.bulk_save_objects(dummy_rooms)
        db.session.commit()
        print("Added dummy rooms to the database.")

# Validate user from Authentication Service
def validate_token(token):
    auth_url = os.getenv('AUTH_SERVICE_URL', 'https://authen_backend:5000')
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
        return None
    except requests.RequestException as e:
        print(f"Error validating token: {e}")
        return None

# Create room request
@app.route('/request', methods=['POST'])
def create_request():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    print(f"Received token in /request: {token[:10]}...")  # แสดง token บางส่วน
    user_data = validate_token(token.replace('Bearer ', ''))
    if not user_data:
        return jsonify({'error': 'Invalid token or authentication failed'}), 401
    if user_data.get('role') != 'student':
        return jsonify({'error': 'Unauthorized: Not a student'}), 403

    data = request.get_json() or {}
    required_fields = ['room_id', 'start_time', 'end_time', 'reason']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        if start_time >= end_time:
            return jsonify({'error': 'End time must be after start time'}), 400

        new_request = Request(
            student_id=user_data.get('user_id'),
            room_id=data['room_id'],
            start_time=start_time,
            end_time=end_time,
            reason=data['reason'],
            status='Pending'
        )
        db.session.add(new_request)
        db.session.commit()

        return jsonify({'message': 'Request created', 'request_id': new_request.id}), 201
    except ValueError as e:
        return jsonify({'error': 'Invalid date format'}), 400
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

# View all requests (for teacher/admin)
@app.route('/requests', methods=['GET'])
def get_requests():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    user_data = validate_token(token.replace('Bearer ', ''))
    if not user_data:
        return jsonify({'error': 'Invalid token or authentication failed'}), 401
    if user_data.get('role') not in ['teacher', 'admin']:
        return jsonify({'error': 'Unauthorized: Not a teacher or admin'}), 403

    requests = Request.query.all()
    return jsonify([request.to_dict() for request in requests]), 200

# Get available rooms
@app.route('/rooms', methods=['GET'])
def get_rooms():
    rooms = Room.query.all()
    return jsonify([{'id': room.id, 'meetings_today': room.meetings_today} for room in rooms]), 200

# Approve request
@app.route('/requests/<int:request_id>/approve', methods=['PUT'])
def approve_request(request_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    user_data = validate_token(token.replace('Bearer ', ''))
    if not user_data:
        return jsonify({'error': 'Invalid token or authentication failed'}), 401
    if user_data.get('role') not in ['teacher', 'admin']:
        return jsonify({'error': 'Unauthorized: Not a teacher or admin'}), 403

    request = Request.query.get_or_404(request_id)
    if request.status != 'Pending':
        return jsonify({'error': 'Request is not pending'}), 400

    request.status = 'Approved'
    request.teacher_id = user_data.get('user_id')
    db.session.commit()

    return jsonify({'message': 'Request approved', 'request': request.to_dict()}), 200

# Reject request
@app.route('/requests/<int:request_id>/reject', methods=['PUT'])
def reject_request(request_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    user_data = validate_token(token.replace('Bearer ', ''))
    if not user_data:
        return jsonify({'error': 'Invalid token or authentication failed'}), 401
    if user_data.get('role') not in ['teacher', 'admin']:
        return jsonify({'error': 'Unauthorized: Not a teacher or admin'}), 403

    request = Request.query.get_or_404(request_id)
    if request.status != 'Pending':
        return jsonify({'error': 'Request is not pending'}), 400

    request.status = 'Rejected'
    request.teacher_id = user_data.get('user_id')
    db.session.commit()

    return jsonify({'message': 'Request rejected', 'request': request.to_dict()}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001, ssl_context=('/app/room_request/certificates/cert.pem', '/app/room_request/certificates/key.pem'))
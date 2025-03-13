from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import requests
from models import db, Request
import jwt as pyjwt
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://localhost:3000"])

# ตั้งค่า database URL สำหรับ Room Request (แยกจาก Authentication)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_ROOM_URL', 'postgresql://myuser:mypass@localhost:5432/room_req_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')

db.init_app(app)

with app.app_context():
    db.create_all()

# Validate user from Authentication Service
def validate_token(token):
    auth_url = os.getenv('AUTH_SERVICE_URL', 'https://localhost:5000')
    response = requests.post(f'{auth_url}/validate-user', headers={'Authorization': token})
    if response.status_code == 200:
        return response.json()
    return None

# Create room request
@app.route('/request', methods=['POST'])
def create_request():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    user_data = validate_token(token)
    if not user_data or user_data['role'] != 'student':
        return jsonify({'error': 'Unauthorized or not a student'}), 403

    data = request.get_json()
    required_fields = ['room_id', 'start_time', 'end_time', 'reason']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        start_time = datetime.fromisoformat(data['start_time'])
        end_time = datetime.fromisoformat(data['end_time'])
        if start_time >= end_time:
            return jsonify({'error': 'End time must be after start time'}), 400

        new_request = Request(
            student_id=user_data['user_id'],
            room_id=data['room_id'],
            start_time=start_time,
            end_time=end_time,
            reason=data['reason']
        )
        db.session.add(new_request)
        db.session.commit()

        return jsonify({'message': 'Request created', 'request_id': new_request.id}), 201
    except ValueError as e:
        return jsonify({'error': 'Invalid date format'}), 400

# View all requests (for teacher/admin)
@app.route('/requests', methods=['GET'])
def get_requests():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    user_data = validate_token(token)
    if not user_data or user_data['role'] not in ['teacher', 'admin']:
        return jsonify({'error': 'Unauthorized or not a teacher/admin'}), 403

    requests = Request.query.all()
    return jsonify([request.to_dict() for request in requests]), 200

# Approve/Reject request
@app.route('/requests/<int:request_id>', methods=['PUT'])
def update_request(request_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    user_data = validate_token(token)
    if not user_data or user_data['role'] not in ['teacher', 'admin']:
        return jsonify({'error': 'Unauthorized or not a teacher/admin'}), 403

    request = Request.query.get_or_404(request_id)
    data = request.get_json()
    status = data.get('status')

    if status not in ['approved', 'rejected']:
        return jsonify({'error': 'Invalid status'}), 400

    request.status = status
    request.teacher_id = user_data['user_id']
    db.session.commit()

    return jsonify({'message': f'Request {status}', 'request': request.to_dict()}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001, ssl_context=('/app/room_request/certificates/cert.pem', '/app/room_request/certificates/key.pem'))
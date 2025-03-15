from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import requests
from datetime import datetime
from models import db, Request

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://localhost:3000"])

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_ROOM_URL', 'postgresql://myuser:mypass@room_req_db:5432/room_req_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')

db.init_app(app)

with app.app_context():
    db.create_all()

def validate_token(token):
    auth_url = os.getenv('AUTH_SERVICE_URL', 'http://authen_backend:5000')
    try:
        response = requests.post(
            f'{auth_url}/validate-user',
            headers={'Authorization': f'Bearer {token}'},
            verify=False,
            timeout=5
        )
        if response.status_code == 200:
            return response.json()
        return None
    except requests.RequestException as e:
        print(f"Error validating token: {e}")
        return None

def validate_token_for_user(user_id, token):
    auth_url = os.getenv('AUTH_SERVICE_URL', 'http://authen_backend:5000')
    try:
        response = requests.post(
            f'{auth_url}/validate-user-by-id',
            json={'user_id': user_id},
            headers={'Authorization': f'Bearer {token}'},  # ใช้ token จาก request
            verify=False,
            timeout=5
        )
        print(f"validate_token_for_user response: {response.status_code}, {response.text}")
        if response.status_code == 200:
            return response.json()
        return None
    except requests.RequestException as e:
        print(f"Error validating user: {e}")
        return None

@app.route('/request', methods=['POST'])
def create_request():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    user_data = validate_token(token.replace('Bearer ', ''))
    if not user_data:
        return jsonify({'error': 'Invalid token or authentication failed'}), 401
    if user_data.get('role') != 'student':
        return jsonify({'error': 'Unauthorized: Not a student'}), 403

    data = request.get_json() or {}
    required_fields = ['room_id', 'start_time', 'end_time', 'reason']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    room_mgmt_url = os.getenv('ROOM_MGMT_URL', 'http://room_mgmt_backend:5002')
    try:
        response = requests.get(f'{room_mgmt_url}/rooms/{data["room_id"]}')
        if response.status_code != 200:
            return jsonify({'error': 'Room not found'}), 404
    except requests.RequestException as e:
        print(f"Error checking room: {e}")
        return jsonify({'error': 'Internal server error'}), 500

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
            status='P'
        )
        db.session.add(new_request)
        db.session.commit()

        try:
            requests.post(
                f'{room_mgmt_url}/room-usage-logs',
                json={
                    'roomid': data['room_id'],
                    'user_id': user_data.get('user_id'),
                    'start_time': data['start_time'],
                    'end_time': data['end_time'],
                    'purpose': data['reason']
                }
            )
        except requests.RequestException as e:
            print(f"Error logging room usage: {e}")

        return jsonify({'message': 'Request created', 'request_id': new_request.id}), 201
    except ValueError as e:
        return jsonify({'error': 'Invalid date format'}), 400
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/requests', methods=['GET'])
def get_requests():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    user_data = validate_token(token.replace('Bearer ', ''))
    if not user_data:
        return jsonify({'error': 'Invalid token or authentication failed'}), 401

    role = user_data.get('role')
    user_id = user_data.get('user_id')

    if role in ['teacher', 'admin']:
        requests_to_fetch = Request.query.filter_by(status='P').all()
    elif role == 'student':
        requests_to_fetch = Request.query.filter_by(student_id=user_id).all()
    else:
        return jsonify({'error': 'Unauthorized role'}), 403

    requests_data = []
    for req in requests_to_fetch:
        request_dict = req.to_dict()
        user_info = validate_token_for_user(req.student_id, token)  # ใช้ token จาก request
        if user_info:
            request_dict['requester_name'] = user_info.get('first_name', 'Unknown') + ' ' + user_info.get('last_name', 'Unknown')
        else:
            request_dict['requester_name'] = 'Unknown'
        requests_data.append(request_dict)

    return jsonify(requests_data), 200

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

    room_request = Request.query.get_or_404(request_id)
    if room_request.status != 'P':
        return jsonify({'error': 'Request is not pending'}), 400

    room_request.status = 'A'
    room_request.teacher_id = user_data.get('user_id')
    db.session.commit()

    room_mgmt_url = os.getenv('ROOM_MGMT_URL', 'http://room_mgmt_backend:5002')
    try:
        response = requests.put(
            f'{room_mgmt_url}/room-usage-logs/room/{room_request.room_id}',
            json={
                'user_id': room_request.student_id,
                'start_time': room_request.start_time.isoformat(),
                'end_time': room_request.end_time.isoformat(),
                'status': 'A'
            },
            headers={'Authorization': f'Bearer {token}'}
        )
        print(f"Update room usage log response: {response.status_code}, {response.text}")
    except requests.RequestException as e:
        print(f"Error updating room usage log: {e}")

    return jsonify({'message': 'Request approved', 'request': room_request.to_dict()}), 200

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

    room_request = Request.query.get_or_404(request_id)
    if room_request.status != 'P':
        return jsonify({'error': 'Request is not pending'}), 400

    room_request.status = 'R'
    room_request.teacher_id = user_data.get('user_id')
    db.session.commit()

    room_mgmt_url = os.getenv('ROOM_MGMT_URL', 'http://room_mgmt_backend:5002')
    try:
        response = requests.put(
            f'{room_mgmt_url}/room-usage-logs/room/{room_request.room_id}',
            json={
                'user_id': room_request.student_id,
                'start_time': room_request.start_time.isoformat(),
                'end_time': room_request.end_time.isoformat(),
                'status': 'R'
            },
            headers={'Authorization': f'Bearer {token}'}
        )
        print(f"Update room usage log response: {response.status_code}, {response.text}")
    except requests.RequestException as e:
        print(f"Error updating room usage log: {e}")

    return jsonify({'message': 'Request rejected', 'request': room_request.to_dict()}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
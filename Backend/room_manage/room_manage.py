from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import datetime
import jwt as pyjwt
from sqlalchemy import or_
import os
import requests
from models import User, Request

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://localhost:3000"])

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://username:password@localhost:5432/room_manage_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-for-room-service')

db = SQLAlchemy(app)

# Initialize Database
with app.app_context():
    db.create_all()

# API Endpoints
@app.route('/request', methods=['POST'])
def create_request():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    try:
        # ตรวจสอบ token ผ่าน Authentication Service
        validate_response = requests.post(
            'http://authen_backend:5000/validate-user',
            headers={'Authorization': token}
        )
        validate_data = validate_response.json()
        if validate_response.status_code != 200 or validate_data.get('role') != 'student':
            return jsonify({'error': 'Unauthorized'}), 403

        user_id = validate_data['user_id']
        user = User.query.get(user_id)  # หากมีตาราง User ใน room_manage_db
        if not user:
            return jsonify({'error': 'User not found in room service'}), 404

        request_data = request.get_json()
        room = request_data.get('room')
        date = datetime.datetime.strptime(request_data.get('date'), '%Y-%m-%d').date()
        start_time = datetime.datetime.strptime(request_data.get('start_time'), '%H:%M').time()
        end_time = datetime.datetime.strptime(request_data.get('end_time'), '%H:%M').time()
        purpose = request_data.get('purpose')

        if not all([room, date, start_time, end_time, purpose]):
            return jsonify({'error': 'Missing data'}), 400

        # ตรวจสอบการจองซ้ำ
        conflicting_requests = Request.query.filter(
            Request.room == room,
            Request.date == date,
            Request.start_time < end_time,
            Request.end_time > start_time,
            Request.status == "Approved"
        ).all()

        if conflicting_requests:
            return jsonify({'error': 'Room is already booked for this time slot'}), 400

        new_request = Request(
            user_id=user.id,
            room=room,
            date=date,
            start_time=start_time,
            end_time=end_time,
            purpose=purpose,
            status="Pending"
        )
        db.session.add(new_request)
        db.session.commit()

        return jsonify({'message': 'Request created successfully', 'request_id': new_request.id}), 201
    except pyjwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/requests', methods=['GET'])
def get_requests():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    try:
        data = pyjwt.decode(token.replace('Bearer ', ''), app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(data['user_id'])
        if not user or user.role not in ['teacher', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403

        requests = Request.query.all()
        return jsonify([{
            'id': req.id,
            'user_id': req.user_id,
            'user_name': req.user.first_name + ' ' + (req.user.last_name or ''),
            'room': req.room,
            'date': req.date.isoformat(),
            'start_time': req.start_time.strftime('%H:%M'),
            'end_time': req.end_time.strftime('%H:%M'),
            'purpose': req.purpose,
            'status': req.status,
            'created_at': req.created_at.isoformat()
        } for req in requests]), 200
    except pyjwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

@app.route('/request/<int:request_id>/approve', methods=['POST'])
def approve_request(request_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    try:
        data = pyjwt.decode(token.replace('Bearer ', ''), app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(data['user_id'])
        if not user or user.role not in ['teacher', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403

        req = Request.query.get_or_404(request_id)
        req.status = "Approved"
        db.session.commit()
        return jsonify({'message': 'Request approved'}), 200
    except pyjwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

@app.route('/request/<int:request_id>/reject', methods=['POST'])
def reject_request(request_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    try:
        data = pyjwt.decode(token.replace('Bearer ', ''), app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(data['user_id'])
        if not user or user.role not in ['teacher', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403

        req = Request.query.get_or_404(request_id)
        req.status = "Rejected"
        db.session.commit()
        return jsonify({'message': 'Request rejected'}), 200
    except pyjwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001, ssl_context=('/app/room_manage/certificates/cert.pem', '/app/room_manage/certificates/key.pem'))
from flask import Flask, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt as pyjwt
import datetime
from flask_cors import CORS
from models import db, User
import os
from requests_oauthlib import OAuth2Session
from oauthlib.oauth2 import LegacyApplicationClient
from models import User 

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://localhost:3000", "http://localhost:5001"])

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://myuser:mypass@localhost:5432/auth_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')

# Google OAuth 2.0 settings
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = 'https://localhost:5000/auth/google/callback'
GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/auth'
GOOGLE_TOKEN_URL = 'https://accounts.google.com/o/oauth2/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
GOOGLE_SCOPE = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]
db.init_app(app)

with app.app_context():
    db.create_all()

# Register endpoint
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    password = data.get('password')

    # Check for missing data
    if not all([email, first_name, last_name, password]):
        return jsonify({'error': 'Missing data'}), 400

    # Determine role based on email domain
    if email.endswith('@kku.ac.th'):
        role = 'teacher'
    elif email.endswith('@kkumail.com'):
        role = 'student'
    else:
        return jsonify({'error': 'Invalid email domain'}), 403

    # Check for existing user
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400

    # Hash the password and create new user
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(email=email, first_name=first_name, last_name=last_name, password=hashed_password, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Missing data'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = pyjwt.encode({
        'user_id': user.id,
        'role': user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200

# Protected route
@app.route('/protected', methods=['GET'])
def protected():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    try:
        data = pyjwt.decode(token.replace('Bearer ', ''), app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'message': 'Protected route',
            'user_id': data['user_id'],
            'role': data['role'],
            'first_name': user.first_name,
            'email': user.email
        }), 200
    except pyjwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except pyjwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

@app.route('/validate-user', methods=['POST'])
def validate_user():
    token = request.headers.get('Authorization')
    if not token:
        print("No token provided in /validate-user")
        return jsonify({'error': 'Token is missing'}), 401

    try:
        #print(f"Decoding token: {token[:10]}...")  
        data = pyjwt.decode(token.replace('Bearer ', ''), app.config['SECRET_KEY'], algorithms=['HS256'])
        #print(f"Decoded token data: {data}")
        user = User.query.get(data['user_id'])
        if not user:
            print(f"User not found: {data['user_id']}")
            return jsonify({'error': 'User not found'}), 404
        return jsonify({
            'user_id': user.id,
            'role': user.role,
            'first_name': user.first_name,
            'email': user.email
        }), 200
    except pyjwt.InvalidTokenError as e:
        print(f"Invalid token error: {e}")
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/validate-user-by-id', methods=['POST'])
def validate_user_by_id():
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        print("No user_id provided in /validate-user-by-id")
        return jsonify({'error': 'User ID is missing'}), 400

    token = request.headers.get('Authorization')
    if not token:
        print("No token provided in /validate-user-by-id")
        return jsonify({'error': 'Token is missing'}), 401

    try:
        print(f"Decoding token for /validate-user-by-id: {token[:10]}...")
        data = pyjwt.decode(token.replace('Bearer ', ''), app.config['SECRET_KEY'], algorithms=['HS256'])
        print(f"Decoded token data: {data}")
        if data.get('role') not in ['admin', 'teacher']:
            return jsonify({'error': 'Unauthorized'}), 403

        user = User.query.get(user_id)
        if not user:
            print(f"User not found: {user_id}")
            return jsonify({'error': 'User not found'}), 404
        return jsonify({
            'user_id': user.id,
            'role': user.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }), 200
    except pyjwt.InvalidTokenError as e:
        print(f"Invalid token error: {e}")
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'error': 'Server error'}), 500
    
# Start Google OAuth 2.0 process
@app.route('/auth/google', methods=['GET'])
def google_login():
    google = OAuth2Session(GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI, scope=GOOGLE_SCOPE, auto_refresh_url=GOOGLE_TOKEN_URL, auto_refresh_kwargs={'client_id': GOOGLE_CLIENT_ID, 'client_secret': GOOGLE_CLIENT_SECRET})
    authorization_url, state = google.authorization_url(GOOGLE_AUTH_URL, access_type='offline')
    return jsonify({'authorization_url': authorization_url})

# Callback from Google
@app.route('/auth/google/callback', methods=['GET'])
def google_callback():
    if os.getenv('FLASK_ENV') == 'development':
        os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
        import ssl
        ssl._create_default_https_context = ssl._create_unverified_context

    google = OAuth2Session(GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI, scope=GOOGLE_SCOPE, auto_refresh_url=GOOGLE_TOKEN_URL, auto_refresh_kwargs={'client_id': GOOGLE_CLIENT_ID, 'client_secret': GOOGLE_CLIENT_SECRET})
    token = google.fetch_token(GOOGLE_TOKEN_URL, client_secret=GOOGLE_CLIENT_SECRET, authorization_response=request.url, verify=False)

    user_info = google.get(GOOGLE_USERINFO_URL).json()
    email = user_info.get('email')
    first_name = user_info.get('given_name', 'Unknown')
    last_name = user_info.get('family_name', 'Unknown')

    user = User.query.filter_by(email=email).first()
    if not user:
        if email.endswith('@kku.ac.th'):
            role = 'teacher'
        elif email.endswith('@kkumail.com'):
            role = 'student'
        else:
            return jsonify({'error': 'Invalid email domain'}), 403

        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password='',
            role=role
        )
        db.session.add(user)
        db.session.commit()

    token = pyjwt.encode({
        'user_id': user.id,
        'role': user.role,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    frontend_url = f'http://localhost:3000/auth/callback?token={token}'
    return redirect(frontend_url)


@app.route('/profile/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    # ตรวจสอบ token เพื่อความปลอดภัย
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    try:
        # แก้ไข token โดยลบ "Bearer " ออกหากมี
        token = token.replace('Bearer ', '')
        data_token = pyjwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        # ตัวอย่าง: อนุญาตให้ update เฉพาะตัวเองหรือถ้า role เป็น teacher/admin
        if data_token['user_id'] != user_id and data_token.get('role') not in ['teacher', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403
    except pyjwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except pyjwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

    # รับข้อมูล JSON จาก client
    json_data = request.get_json()
    if not json_data:
        return jsonify({'error': 'No data provided'}), 400

    # กำหนด field ที่อนุญาตให้ update (รวมทั้ง RFID)
    allowed_fields = ['first_name', 'last_name', 'email', 'rfid']
    
    # ค้นหาผู้ใช้จาก database
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # อัปเดตเฉพาะ field ที่ส่งมาใน request
    for field in allowed_fields:
        if field in json_data:
            setattr(user, field, json_data[field])

    db.session.commit()

    return jsonify({
        'message': 'User updated successfully',
        'user': user.to_dict()
    }), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
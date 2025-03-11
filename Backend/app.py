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

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://myuser:mypass@localhost:5432/mydb')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')

# Google OAuth 2.0 settings
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = 'https://localhost:5000/auth/google/callback'
GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/auth'
GOOGLE_TOKEN_URL = 'https://accounts.google.com/o/oauth2/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
# OAuth 2.0 scope (ข้อมูลที่ต้องการจาก Google)
GOOGLE_SCOPE = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]
db.init_app(app)

with app.app_context():
    db.create_all()

# Register endpoint (เดิม)
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    password = data.get('password')
    role = data.get('role')

    if not all([email, first_name, last_name, password, role]):
        return jsonify({'error': 'Missing data'}), 400

    if role not in ['admin', 'teacher', 'student']:
        return jsonify({'error': 'Invalid role'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400

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
        return jsonify({'message': 'Protected route', 'user_id': data['user_id'], 'role': data['role']}), 200
    except pyjwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except pyjwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

# เริ่มกระบวนการ OAuth 2.0 ด้วย Google
@app.route('/auth/google', methods=['GET'])
def google_login():
    google = OAuth2Session(GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI, scope=GOOGLE_SCOPE, auto_refresh_url=GOOGLE_TOKEN_URL, auto_refresh_kwargs={'client_id': GOOGLE_CLIENT_ID, 'client_secret': GOOGLE_CLIENT_SECRET})
    authorization_url, state = google.authorization_url(GOOGLE_AUTH_URL, access_type='offline')
    return jsonify({'authorization_url': authorization_url})

# Callback จาก Google
@app.route('/auth/google/callback', methods=['GET'])
def google_callback():
    if os.getenv('FLASK_ENV') == 'development':
        os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
        import ssl
        ssl._create_default_https_context = ssl._create_unverified_context

    google = OAuth2Session(GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI, scope=GOOGLE_SCOPE, auto_refresh_url=GOOGLE_TOKEN_URL, auto_refresh_kwargs={'client_id': GOOGLE_CLIENT_ID, 'client_secret': GOOGLE_CLIENT_SECRET})
    token = google.fetch_token(GOOGLE_TOKEN_URL, client_secret=GOOGLE_CLIENT_SECRET, authorization_response=request.url, verify=False)

    # ดึงข้อมูลผู้ใช้จาก Google
    user_info = google.get(GOOGLE_USERINFO_URL).json()
    email = user_info.get('email')
    first_name = user_info.get('given_name', 'Unknown')
    last_name = user_info.get('family_name', 'Unknown')

    # ตรวจสอบว่าผู้ใช้มีอยู่ในระบบหรือไม่
    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password='',  # ไม่ต้องใช้ password สำหรับ OAuth
            role='student'
        )
        db.session.add(user)
        db.session.commit()

    # สร้าง JWT token
    token = pyjwt.encode({
        'user_id': user.id,
        'role': user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    # Redirect to frontend with token in query parameter
    frontend_url = f'http://localhost:3000/auth/callback?token={token}'
    return redirect(frontend_url)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000, ssl_context=('/app/cert.pem', '/app/key.pem'))
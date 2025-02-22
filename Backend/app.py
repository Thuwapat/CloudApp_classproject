from flask import Flask , request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# กำหนดค่าเชื่อมต่อฐานข้อมูล (ในที่นี้ใช้ SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


# Model สำหรับเก็บข้อมูลผู้ใช้
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        
      return jsonify({'error': 'Missing data'}), 400

    # ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
    
    # if User.query.filter((User.username == username) | (User.email == email)).first():
    #      return jsonify({'error': 'User already exists'}), 400

    # สร้าง hash ของ password เพื่อความปลอดภัย
    
    # hashed_password = generate_password_hash(password, method='sha256')
    # new_user = User(username=username, email=email, password=hashed_password)
    # db.session.add(new_user)
    # db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Missing data'}), 400

    # user = User.query.filter_by(username=username).first()
    # if not user or not check_password_hash(user.password, password):
    #     return jsonify({'error': 'Invalid credentials'}), 401

    # ถ้า login สำเร็จ คุณอาจสร้าง session หรือส่ง token กลับไปให้ client
    return jsonify({'message': 'Login successful'}), 200

@app.route('/test', methods=['GET'])
def getphoto():
    hello = "hello test"
    return hello, 200

if __name__ == '__main__':
     
    app.run(debug=True)

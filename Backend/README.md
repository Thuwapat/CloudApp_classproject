# ขั้นตอนการตั้งค่า Backend Project 
## 1. git clone project 
`git clone https://github.com/Thuwapat/CloudApp_classproject.git`

CD เข้า backend 
`cd Backend`

## 2. ทำการสร้าง virtual environment
`python3 -m venv venv` 
หากเกิดปัญหา ใช้ 
`Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process` เเล้วทำข้างต้นใหม่
ถ้าออกจาก venv เเล้วต้งการเข้าใหม่ `venv\Scripts\activate`

## 3. ติดตั้ง Dependencies
`pip install -r requirements.txt`

## Enter Docker DB
docker exec -it my_auth_db psql -U myuser -d auth_db
docker exec -it my_room_req_db psql -U myuser -d room_req_db

## Check users table
SELECT * FROM users;
SELECT * FROM requests;
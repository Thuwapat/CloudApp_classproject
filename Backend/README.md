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
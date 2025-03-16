# COE_Access
## Project Setup
1. git clone https://github.com/Thuwapat/CloudApp_classproject.git
2. docker-compose up -d
3. ไปที่ http://localhost:3000

![COE_Access (1)](https://github.com/user-attachments/assets/64ddcddf-cc3e-4ee8-a12f-e9b664e8c904)

## SSL Cert Command using openssl via git bash (กรณอยากใช้ OAuth 2.0 ของ Google)
## ขั้นตอนที่ 1 : Run commeand 
`openssl req -x509 -nodes -newkey rsa:2048 -keyout mycert.key -out mycert.crt -days 365 -subj "/CN=localhost"` 
จะได้  mycert.key 


## ขั้นตอนที่ 2: เปิดโปรแกรม Certificate Manager
เปิดหน้าต่าง Run:

กดปุ่ม Windows + R พร้อมกัน เพื่อเปิดหน้าต่าง Run
เรียก certmgr.msc:

พิมพ์ certmgr.msc ลงในช่อง Run แล้วกด Enter
โปรแกรม Certificate Manager จะเปิดขึ้นมา
## ขั้นตอนที่ 2: ไปยังโฟลเดอร์ Trusted Root Certification Authorities
ในหน้าต่าง Certificate Manager ทางด้านซ้ายมือจะมีโครงสร้างแบบ Tree
คลิกเพื่อเปิดโฟลเดอร์ Certificates - Current User (หรือถ้าต้องการนำเข้าแบบระบบทั้งหมด ให้ใช้ Certificate Manager สำหรับ Local Machine ผ่าน mmc แต่ในที่นี้เราจะสอนสำหรับ Current User)
ภายใน Certificates - Current User ให้เลื่อนลงมาหาโฟลเดอร์ Trusted Root Certification Authorities แล้วคลิกเปิด จากนั้นคลิกที่ Certificates ภายในโฟลเดอร์นั้น
 ## ขั้นตอนที่ 3: เริ่มการนำเข้าใบรับรอง
คลิกขวา:

คลิกขวาที่โฟลเดอร์ Certificates (ภายใน Trusted Root Certification Authorities)
เลือกเมนู Import:

เลือก All Tasks จากนั้นคลิก Import...
จะมี Certificate Import Wizard ปรากฏขึ้น
ขั้นตอนที่ 4: ใช้ Certificate Import Wizard
หน้าจอแรก – Introduction:

คลิก Next เพื่อเริ่มต้น
เลือกไฟล์ Certificate:

ในหน้าจอ File to Import ให้คลิก Browse…
ไปที่ที่ตั้งของไฟล์ใบรับรองของคุณ (mycert.key )หรือไฟล์ที่มีนามสกุลที่ Windows รองรับ
เลือกไฟล์ที่ต้องการนำเข้า แล้วคลิก Open
จากนั้นคลิก Next
เลือก Certificate Store:

หน้าจอถัดไปจะให้คุณเลือกที่เก็บ Certificate
เลือกตัวเลือก Place all certificates in the following store
ตรวจสอบให้แน่ใจว่าในช่องด้านล่างแสดงเป็น Trusted Root Certification Authorities
ถ้าไม่ใช่ ให้คลิก Browse… และเลือก Trusted Root Certification Authorities จากนั้นคลิก OK
คลิก Next
สรุปและนำเข้า:

หน้าจอสุดท้ายจะแสดงสรุปข้อมูลของ Certificate ที่จะนำเข้า
คลิก Finish เพื่อเริ่มนำเข้า
## ขั้นตอนที่ 5: ยืนยันการนำเข้าและตรวจสอบ
การแจ้งเตือนความปลอดภัย:

หากมีข้อความแจ้งเตือน (Security Warning) ว่าการนำเข้า Certificate ที่ไม่รู้จักอาจมีความเสี่ยง ให้ตรวจสอบข้อมูลของใบรับรอง จากนั้นคลิก Yes เพื่อยืนยัน
ข้อความสำเร็จ:

หากการนำเข้าเสร็จสมบูรณ์ จะมีข้อความแจ้งว่า “The import was successful.” ปรากฏขึ้น
รีสตาร์ทเบราว์เซอร์:

(รีสตาร์ทเครื่อง) 

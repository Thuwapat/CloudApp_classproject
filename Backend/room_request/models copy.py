import jwt
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJyb2xlIjoic3R1ZGVudCIsImV4cCI6MTc0MjAxNzc2MH0.IuXO9swPVtC0iW5tyz7kcwTBjl6tHGL48c8onMvcQRc"
try:
    decoded = jwt.decode(token, 'your-secret-key', algorithms=['HS256'])
    print(decoded)
except jwt.ExpiredSignatureError:
    print("Token expired")
except jwt.InvalidTokenError:
    print("Invalid token")
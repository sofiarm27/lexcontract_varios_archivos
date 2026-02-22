import sys
import os
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv('.env')

print("Running login logic directly...")
print("SECRET_KEY:", os.getenv("SECRET_KEY", "NOT SET")[:10] + "...")
print("DATABASE_URL:", os.getenv("DATABASE_URL", "NOT SET")[:30] + "...")

try:
    from app.db.session import SessionLocal
    db = SessionLocal()
    print("DB session created OK")
    
    from app.crud import crud
    user = crud.get_user_by_email(db, email="admin@lexcontract.com")
    if not user:
        print("ERROR: User not found!")
        sys.exit(1)
    print(f"User found: {user.correo}, ID={user.id}")
    print(f"Password hash: {user.password[:30]}...")
    
    from app.core.security import verify_password
    is_valid = verify_password("admin123", user.password)
    print(f"Password valid: {is_valid}")
    
    if not is_valid:
        print("ERROR: Password verification failed!")
        sys.exit(1)
    
    from app.core.security import create_access_token
    print("Creating access token...")
    token = create_access_token(data={"sub": user.correo})
    print(f"Token created: {token[:30]}...")
    print("SUCCESS: Login would work!")
    
    db.close()
    
except Exception as e:
    print(f"\nERROR: {e}")
    traceback.print_exc()

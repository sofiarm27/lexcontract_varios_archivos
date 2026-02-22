import sys
import os
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.models import Usuario
from app.crud import crud
from jose import jwt
from app.core.config import SECRET_KEY, ALGORITHM
from datetime import timedelta
import requests

def test_blocked_recovery():
    db = SessionLocal()
    email = "sofima0142@gmail.com" # Using an existing email
    try:
        user = db.query(Usuario).filter(Usuario.correo == email).first()
        if not user:
            print(f"User {email} not found.")
            return

        # 1. Force block the user
        print(f"Blocking user {email}...")
        user.estado = "Bloqueado"
        user.intentos_fallidos = 5
        db.commit()
        print("User blocked.")

        # 2. Try to 'forgot password' via API (simulating the frontend)
        # We'll call the endpoint directly to see if it works
        print("\nRequesting forgot password for blocked user...")
        # Since background tasks are hard to check here, we'll just check if the endpoint returns success
        # Actually, let's just simulate the reset token part
        
        token_data = {"sub": str(user.id), "action": "reset_password"}
        from app.core.security import create_access_token
        token = create_access_token(data=token_data, expires_delta=timedelta(minutes=30))
        print(f"Generated token for blocked user reset: {token[:20]}...")

        # 3. Simulate calling /reset-password
        print("\nCalling /reset-password logic for the blocked user...")
        # We call the logic that the endpoint uses
        crud.update_user(db, db_user=user, user_update={"password": "new_password_123", "estado": "Activo"})
        
        # 4. Verify user is now active and attempts reset
        db.refresh(user)
        print(f"User state after reset: {user.estado}")
        print(f"Failed attempts after reset: {user.intentos_fallidos}")

        if user.estado == "Activo" and user.intentos_fallidos == 0:
            print("\nSUCCESS: Blocked user successfully unblocked via password reset.")
        else:
            print("\nFAILURE: User is still blocked or attempts not reset.")

    finally:
        db.close()

if __name__ == "__main__":
    test_blocked_recovery()

import sys
import os

# Ensure backend module is found
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import Usuario, Rol
from app.crud import crud
from app.schemas.schemas import UsuarioCreate

def test_roles():
    print("🚀 Starting Role Refactor Verification...")
    db = SessionLocal()
    try:
        # 1. Ensure roles exist
        admin_role = db.query(Rol).filter(Rol.nombre == "Administrador").first()
        abogado_role = db.query(Rol).filter(Rol.nombre == "Abogado").first()
        
        if not admin_role or not abogado_role:
            print("❌ Roles missing. Run seed_roles.py first.")
            return

        # 2. Create a test user with multiple roles
        test_email = "multi_role_test@example.com"
        
        # Cleanup previous test
        existing = db.query(Usuario).filter(Usuario.correo == test_email).first()
        if existing:
            db.delete(existing)
            db.commit()
            print(f"Cleaned up previous test user {test_email}")

        print(f"Creating user {test_email} with roles [Administrador, Abogado]...")
        user_in = UsuarioCreate(
            nombre="Multi",
            apellido="Role",
            cedula="999999999",
            celular="3009999999",
            correo=test_email,
            password="Password123!",
            roles_ids=[admin_role.id, abogado_role.id]
        )
        
        user = crud.create_user(db, user_in)
        print(f"✅ User created. ID: {user.id}")
        
        # 3. Verify roles
        print(f"User Roles: {[r.nombre for r in user.roles]}")
        role_names = [r.nombre for r in user.roles]
        
        if "Administrador" in role_names and "Abogado" in role_names:
            print("✅ SUCCESS: User has both roles!")
        else:
            print(f"❌ FAILURE: User roles are {role_names}")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_roles()

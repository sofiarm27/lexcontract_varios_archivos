import sys
import os

# Añadir el directorio actual al path para poder importar 'app'
sys.path.append(os.getcwd())

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import Usuario, Rol
from app.core.security import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        # 1. Asegurar que el rol de administrador exista
        admin_role = db.query(Rol).filter(Rol.nombre.ilike("administrador")).first()
        if not admin_role:
            admin_role = Rol(nombre="Administrador")
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)
            print("Rol 'Administrador' creado.")

        # 2. Verificar si el usuario ya existe
        admin_email = "admin@lexcontract.com"
        admin_user = db.query(Usuario).filter(Usuario.correo == admin_email).first()
        
        if not admin_user:
            admin_user = Usuario(
                nombre="Admin",
                apellido="Sistema",
                cedula="123456789",
                celular="3000000000",
                correo=admin_email,
                password=get_password_hash("admin123"),
                # rol_id=admin_role.id,
                estado="Activo"
            )
            admin_user.roles.append(admin_role)
            db.add(admin_user)
            db.commit()
            print(f"Usuario {admin_email} creado exitosamente con rol {admin_role.nombre}.")
        else:
            # Asegurarse de que tenga el rol correcto
            if admin_role not in admin_user.roles:
                admin_user.roles.append(admin_role)
            db.commit()
            print(f"El usuario {admin_email} ya existe. Se ha asegurado su rol de administrador.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()

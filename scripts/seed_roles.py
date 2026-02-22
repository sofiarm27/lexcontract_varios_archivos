from app.db.session import SessionLocal
from app.models.models import Rol

def seed_roles():
    db = SessionLocal()
    try:
        roles_to_ensure = ["Administrador", "Abogado"]
        for role_name in roles_to_ensure:
            existing_role = db.query(Rol).filter(Rol.nombre == role_name).first()
            if not existing_role:
                print(f"Creating role: {role_name}")
                new_role = Rol(nombre=role_name)
                db.add(new_role)
            else:
                print(f"Role already exists: {role_name}")
        db.commit()
        print("Role seeding completed successfully.")
    except Exception as e:
        print(f"Error seeding roles: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_roles()

from datetime import date
from sqlalchemy.orm import Session
from app.models.auth import Usuario, Rol
from app.repositories import user_repository
from app.core.security import get_password_hash

def create_user(db: Session, user_data: dict, roles_ids: list):
    roles = db.query(Rol).filter(Rol.id.in_(roles_ids)).all()
    if len(roles) != len(roles_ids):
        raise ValueError("Uno o más roles no existen")

    raw_password = user_data.pop("password")
    db_user = Usuario(
        **user_data,
        password=get_password_hash(raw_password)
    )
    db_user.roles = roles
    return user_repository.create_user(db, db_user)

def update_user(db: Session, db_user: Usuario, user_update: dict):
    for key, value in user_update.items():
        if key == "cedula": continue
        if key == "password" and value:
            setattr(db_user, key, get_password_hash(value))
        elif key == "estado" and value == "Activo":
            db_user.intentos_fallidos = 0
            setattr(db_user, key, value)
        elif key == "roles_ids" and value:
            roles = db.query(Rol).filter(Rol.id.in_(value)).all()
            if len(roles) != len(value):
                raise ValueError("Uno o más roles no existen")
            db_user.roles = roles
        elif value is not None:
            setattr(db_user, key, value)
    return user_repository.update_user(db, db_user)

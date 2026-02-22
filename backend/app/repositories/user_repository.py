from sqlalchemy.orm import Session
from app.models.auth import Usuario, Rol

def get_user_by_email(db: Session, email: str):
    return db.query(Usuario).filter(Usuario.correo == email).first()

def get_user_by_cedula(db: Session, cedula: str):
    return db.query(Usuario).filter(Usuario.cedula == cedula).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Usuario).offset(skip).limit(limit).all()

def get_roles(db: Session):
    return db.query(Rol).all()

def get_role_by_id(db: Session, role_id: int):
    return db.query(Rol).filter(Rol.id == role_id).first()

def create_user(db: Session, db_user: Usuario):
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: Usuario):
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_role(db: Session, db_role: Rol):
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

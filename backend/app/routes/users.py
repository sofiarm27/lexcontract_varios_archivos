from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, check_admin_role, verify_password, validate_password_strength
from app.core.email import send_welcome_email
from app.schemas.auth import UsuarioSchema, UsuarioCreate, UsuarioUpdate, ChangePasswordRequest, RolSchema, RolCreate
from app.repositories import user_repository
from app.services import auth_service
from app.models.auth import Usuario

router = APIRouter()

@router.get("/me", response_model=UsuarioSchema)
def read_user_me(current_user: Any = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UsuarioSchema)
def update_user_me(
    user_update: UsuarioUpdate, 
    db: Session = Depends(get_db), 
    current_user: Any = Depends(get_current_user)
):
    db_user = db.query(Usuario).filter(Usuario.id == current_user.id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Check for duplicates if email or cedula are being updated
    if user_update.correo and user_update.correo != db_user.correo:
        if user_repository.get_user_by_email(db, email=user_update.correo):
            raise HTTPException(status_code=400, detail="El correo ya está registrado por otro usuario")
    
    if user_update.cedula and user_update.cedula != db_user.cedula:
        if user_repository.get_user_by_cedula(db, cedula=user_update.cedula):
            raise HTTPException(status_code=400, detail="La cédula ya está registrada por otro usuario")

    return auth_service.update_user(db, db_user=db_user, user_update=user_update.model_dump(exclude_unset=True))

@router.post("/me/change-password")
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    db_user = db.query(Usuario).filter(Usuario.id == current_user.id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if not verify_password(data.current_password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta"
        )
    
    validate_password_strength(data.new_password)
    auth_service.update_user(db, db_user=db_user, user_update={"password": data.new_password})
    return {"message": "Contraseña actualizada exitosamente"}

@router.get("/abogados", response_model=List[UsuarioSchema])
def get_abogados(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    users = user_repository.get_users(db, limit=1000)
    abogados = [u for u in users if any(r.nombre.lower() == "abogado" for r in u.roles)]
    return abogados

@router.post("/", response_model=UsuarioSchema, status_code=201)
def create_user(
    user: UsuarioCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Any = Depends(check_admin_role)
):
    validate_password_strength(user.password)
    if user_repository.get_user_by_email(db, email=user.correo):
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    if user_repository.get_user_by_cedula(db, cedula=user.cedula):
        raise HTTPException(status_code=400, detail="La cédula ya está registrada")
    
    new_user = auth_service.create_user(db=db, user_data=user.model_dump(exclude={"roles_ids"}), roles_ids=user.roles_ids)
    
    full_name = f"{new_user.nombre} {new_user.apellido}"
    background_tasks.add_task(send_welcome_email, new_user.correo, full_name)
    return new_user

@router.get("/", response_model=List[UsuarioSchema])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: Any = Depends(check_admin_role)
):
    return user_repository.get_users(db, skip=skip, limit=limit)

@router.put("/{user_id}", response_model=UsuarioSchema)
def update_user(
    user_id: int,
    user_update: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(check_admin_role)
):
    db_user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Check for duplicates if email or cedula are being updated
    if user_update.correo and user_update.correo != db_user.correo:
        if user_repository.get_user_by_email(db, email=user_update.correo):
            raise HTTPException(status_code=400, detail="El correo ya está registrado por otro usuario")
    
    if user_update.cedula and user_update.cedula != db_user.cedula:
        if user_repository.get_user_by_cedula(db, cedula=user_update.cedula):
            raise HTTPException(status_code=400, detail="La cédula ya está registrada por otro usuario")

    return auth_service.update_user(db=db, db_user=db_user, user_update=user_update.model_dump(exclude_unset=True))

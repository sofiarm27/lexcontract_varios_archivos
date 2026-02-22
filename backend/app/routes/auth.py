from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from jose import JWTError, jwt

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash, validate_password_strength
from app.core.config import SECRET_KEY, ALGORITHM
from app.core.email import send_password_reset_email
from app.schemas.auth import Token, ForgotPasswordRequest, ResetPasswordRequest
from app.repositories import user_repository
from app.services import auth_service
from app.models.auth import Usuario

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_repository.get_user_by_email(db, email=form_data.username)
    
    if not user:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

    if user.estado == "Bloqueado":
        raise HTTPException(status_code=403, detail="Cuenta bloqueada temporalmente")

    if user.estado == "Inactivo":
        raise HTTPException(status_code=403, detail="Su cuenta ha sido desactivada. Contacte al administrador.")

    if not verify_password(form_data.password, user.password):
        user.intentos_fallidos += 1
        if user.intentos_fallidos >= 3:
            user.estado = "Bloqueado"
            db.add(user)
            db.commit()
            raise HTTPException(status_code=403, detail="Cuenta bloqueada temporalmente")
        
        db.add(user)
        db.commit()
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

    user.intentos_fallidos = 0
    user.ultima_conexion = func.now()
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = user_repository.get_user_by_email(db, email=request.correo)
    if not user:
        return {"message": "Si el correo está registrado, recibirás instrucciones brevemente"}
    
    token_data = {"sub": str(user.id), "action": "reset_password"}
    token = create_access_token(data=token_data, expires_delta=timedelta(minutes=30))
    
    reset_link = f"http://localhost:5173/reset-password/{token}"
    full_name = f"{user.nombre} {user.apellido}"
    
    background_tasks.add_task(send_password_reset_email, user.correo, full_name, reset_link)
    
    return {"message": "Si el correo está registrado, recibirás instrucciones brevemente"}

@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        action = payload.get("action")
        
        if user_id is None or action != "reset_password":
            raise HTTPException(status_code=400, detail="Token inválido o expirado")
            
        validate_password_strength(request.new_password)
        user = db.query(Usuario).filter(Usuario.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
        # Use service for updates
        auth_service.update_user(db, db_user=user, user_update={
            "password": request.new_password, 
            "estado": "Activo"
        })
        
        return {"message": "Contraseña restablecida exitosamente"}
        
    except (JWTError, ValueError):
        raise HTTPException(status_code=400, detail="Token inválido o expirado")

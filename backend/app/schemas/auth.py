from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator
import re

class Token(BaseModel):
    access_token: str
    token_type: str

class RolBase(BaseModel):
    nombre: str

class RolCreate(RolBase):
    pass

class RolSchema(RolBase):
    id: int
    class Config:
        from_attributes = True

class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    cedula: str
    celular: Optional[str] = None
    correo: EmailStr
    estado: Optional[str] = "Activo"
    intentos_fallidos: Optional[int] = 0
    biografia: Optional[str] = None
    ultima_conexion: Optional[datetime] = None

    @field_validator("cedula")
    @classmethod
    def validate_cedula(cls, v):
        if v is None: return v
        if not v.isdigit(): raise ValueError("La cédula debe contener solo números")
        if not (6 <= len(v) <= 10): raise ValueError("La cédula debe tener entre 6 y 10 dígitos")
        return v

    @field_validator("celular")
    @classmethod
    def validate_celular(cls, v):
        if v is None: return v
        if not re.match(r"^[0-9]{10}$", v): raise ValueError("El celular debe tener exactamente 10 dígitos numéricos")
        return v

class UsuarioCreate(UsuarioBase):
    password: str
    roles_ids: List[int]

class UsuarioSchema(UsuarioBase):
    id: int
    fecha_creacion: datetime
    ultima_conexion: Optional[datetime] = None
    roles: List[RolSchema] = []
    class Config:
        from_attributes = True

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    cedula: Optional[str] = None
    celular: Optional[str] = None
    correo: Optional[EmailStr] = None
    password: Optional[str] = None
    biografia: Optional[str] = None
    estado: Optional[str] = None
    roles_ids: Optional[List[int]] = None

    @field_validator("cedula")
    @classmethod
    def validate_cedula(cls, v):
        if v is None: return v
        if not v.isdigit(): raise ValueError("La cédula debe contener solo números")
        if not (6 <= len(v) <= 10): raise ValueError("La cédula debe tener entre 6 y 10 dígitos")
        return v

    @field_validator("celular")
    @classmethod
    def validate_celular(cls, v):
        if v is None: return v
        if not re.match(r"^[0-9]{10}$", v): raise ValueError("El celular debe tener exactamente 10 dígitos numéricos")
        return v

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    correo: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

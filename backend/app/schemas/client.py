from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
import re

class ClienteBase(BaseModel):
    cedula: str
    nombre: str
    apellido: str
    celular: Optional[str] = None
    correo: Optional[EmailStr] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = "Activo"
    is_deleted: Optional[bool] = False
    usuario_id: Optional[int] = None

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

class ClienteCreate(ClienteBase):
    pass

class ClienteSchema(ClienteBase):
    id: int
    class Config:
        from_attributes = True

class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    celular: Optional[str] = None
    correo: Optional[EmailStr] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    is_deleted: Optional[bool] = None
    usuario_id: Optional[int] = None
    cedula: Optional[str] = None

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

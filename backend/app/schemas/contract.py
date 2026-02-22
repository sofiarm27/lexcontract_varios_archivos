from datetime import date
from typing import Optional, List, Any, Dict, Union
from decimal import Decimal
from pydantic import BaseModel
from .auth import UsuarioSchema
from .client import ClienteSchema

class ContratoBase(BaseModel):
    id: Optional[str] = None
    titulo: Optional[str] = None
    cliente_id: Optional[int] = None
    abogado_id: Optional[int] = None
    plantilla_id: Optional[int] = None
    estado: Optional[str] = "BORRADOR"
    tipo: Optional[str] = None
    total: Optional[Decimal] = None
    clauses: Optional[Union[Dict[str, Any], List[Any]]] = None
    variables_adicionales: Optional[Dict[str, Any]] = None
    es_biblioteca: Optional[bool] = False

class ContratoCreate(ContratoBase):
    cliente_id: int
    abogado_id: int

class ContratoUpdate(BaseModel):
    titulo: Optional[str] = None
    cliente_id: Optional[int] = None
    abogado_id: Optional[int] = None
    plantilla_id: Optional[int] = None
    estado: Optional[str] = None
    tipo: Optional[str] = None
    total: Optional[Decimal] = None
    clauses: Optional[Union[Dict[str, Any], List[Any]]] = None
    variables_adicionales: Optional[Dict[str, Any]] = None
    fecha: Optional[date] = None

class ContratoSchema(ContratoBase):
    fecha: Optional[date] = None
    es_biblioteca: bool
    cliente: Optional[ClienteSchema] = None
    abogado: Optional[UsuarioSchema] = None
    class Config:
        from_attributes = True

class ClausulaCreate(BaseModel):
    titulo: str
    texto: str

class PlantillaCreate(BaseModel):
    titulo: str
    tipo: Optional[str] = "Insolvencia Económica"
    descripcion: Optional[str] = None
    clauses: List[Dict[str, Any]] # List of {"titulo": "...", "texto": "...", "variables": [...]}

class ContratoFromPlantilla(BaseModel):
    cliente_id: int
    abogado_id: int
    variables_adicionales: Optional[Dict[str, Any]] = None

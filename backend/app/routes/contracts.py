from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.contract import ContratoSchema, ContratoCreate, ContratoUpdate, ClausulaCreate, PlantillaCreate, ContratoFromPlantilla
from app.repositories import contract_repository
from app.services import contract_service
from app.models.contract import Contrato

router = APIRouter()

@router.get("/clausulas", response_model=List[ContratoSchema])
def list_clausulas(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    return contract_repository.get_contracts(db, es_biblioteca=True, tipo="clausula")

@router.get("/plantillas", response_model=List[ContratoSchema])
def list_plantillas(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    return contract_repository.get_contracts(db, es_biblioteca=True, tipo="plantilla")

@router.post("/clausula", response_model=ContratoSchema)
def create_clausula(
    clausula: ClausulaCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    return contract_service.create_library_item(db, clausula.model_dump(), "clausula")

@router.post("/plantilla", response_model=ContratoSchema)
def create_plantilla(
    plantilla: PlantillaCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    return contract_service.create_library_item(db, plantilla.model_dump(), "plantilla")

@router.put("/clausula/{id}", response_model=ContratoSchema)
def update_clausula(
    id: str,
    clausula: ClausulaCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    updated_item = contract_service.update_contract(db, id, clausula.model_dump())
    if not updated_item:
        raise HTTPException(status_code=404, detail="Cláusula no encontrada")
    return updated_item

@router.put("/plantilla/{id}", response_model=ContratoSchema)
def update_plantilla(
    id: str,
    plantilla: PlantillaCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    updated_item = contract_service.update_contract(db, id, plantilla.model_dump())
    if not updated_item:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    return updated_item

@router.delete("/clausula/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_clausula(
    id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    item = db.query(Contrato).filter(Contrato.id == id, Contrato.es_biblioteca == True).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cláusula no encontrada")
    contract_repository.delete_contract(db, item)
    return None

@router.delete("/plantilla/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plantilla(
    id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    item = db.query(Contrato).filter(Contrato.id == id, Contrato.es_biblioteca == True).first()
    if not item:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    contract_repository.delete_contract(db, item)
    return None

@router.post("/generar-desde-plantilla/{id}", response_model=ContratoSchema)
def generate_contract(
    id: str,
    contract_data: ContratoFromPlantilla,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    contract = contract_service.generate_contract_from_template(db, id, contract_data.model_dump())
    if not contract:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    return contract

@router.get("/{id}", response_model=ContratoSchema)
def get_contract(
    id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    contract = contract_repository.get_contract_by_id(db, id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return contract

@router.put("/{id}", response_model=ContratoSchema)
def update_contract(
    id: str,
    contract: ContratoUpdate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    updated_contract = contract_service.update_contract(db, id, contract.model_dump(exclude_unset=True))
    if not updated_contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return updated_contract

@router.post("/", response_model=ContratoSchema)
def create_contract(
    contract: ContratoCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    return contract_service.create_contract(db=db, contract_data=contract.model_dump())

@router.get("/", response_model=List[ContratoSchema])
def read_contracts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    is_admin = any(role.nombre.lower() == "administrador" for role in current_user.roles)
    filter_user_id = None if is_admin else current_user.id
    return contract_repository.get_contracts(db, skip=skip, limit=limit, user_id=filter_user_id)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contract(
    id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    contract = contract_repository.get_contract_by_id(db, id)
    if not contract:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    contract_repository.delete_contract(db, contract)
    return None

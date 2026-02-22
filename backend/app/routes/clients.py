from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.client import ClienteSchema, ClienteCreate, ClienteUpdate
from app.repositories import client_repository
from app.models.client import Cliente

router = APIRouter()

@router.post("/", response_model=ClienteSchema)
def create_client(
    client: ClienteCreate, 
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    # Check for duplicate cedula
    existing = client_repository.get_client_by_cedula(db, cedula=client.cedula)
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un cliente con esta cédula")
    db_client = Cliente(**client.model_dump(exclude={"usuario_id"}), usuario_id=current_user.id)
    return client_repository.create_client(db=db, db_client=db_client)

@router.get("/next-id")
def get_next_client_id(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    next_id = client_repository.get_next_client_id(db)
    return {"next_id": next_id}

@router.get("/", response_model=List[ClienteSchema])
def read_clients(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    return client_repository.get_clients(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/{client_id}", response_model=ClienteSchema)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    db_client = client_repository.get_client(db, client_id=client_id, user_id=current_user.id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return db_client

@router.put("/{client_id}", response_model=ClienteSchema)
def update_client(
    client_id: int,
    client_update: ClienteUpdate, 
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    db_client = client_repository.get_client(db, client_id=client_id, user_id=current_user.id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Check for duplicates if email or cedula are being updated
    if client_update.correo and client_update.correo != db_client.correo:
        if db.query(Cliente).filter(Cliente.correo == client_update.correo, Cliente.id != client_id).first():
            raise HTTPException(status_code=400, detail="El correo ya está registrado por otro cliente")
            
    if client_update.cedula and client_update.cedula != db_client.cedula:
        if client_repository.get_client_by_cedula(db, cedula=client_update.cedula):
            raise HTTPException(status_code=400, detail="La cédula ya está registrada por otro cliente")

    for key, value in client_update.model_dump(exclude_unset=True).items():
        if key == "cedula": continue
        setattr(db_client, key, value)
    
    return client_repository.update_client(db=db, db_client=db_client)

@router.delete("/{client_id}", response_model=ClienteSchema)
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    db_client = client_repository.get_client(db, client_id=client_id, user_id=current_user.id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    db_client.is_deleted = True
    return client_repository.update_client(db, db_client=db_client)

@router.post("/{client_id}/restore", response_model=ClienteSchema)
def restore_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    db_client = db.query(Cliente).filter(
        Cliente.id == client_id, 
        Cliente.usuario_id == current_user.id
    ).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    db_client.is_deleted = False
    return client_repository.update_client(db, db_client=db_client)

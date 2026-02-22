from sqlalchemy.orm import Session
from app.models.contract import Contrato

def get_contract_by_id(db: Session, contract_id: str):
    return db.query(Contrato).filter(Contrato.id == contract_id).first()

def get_contracts(db: Session, skip: int = 0, limit: int = 100, user_id: int = None, es_biblioteca: bool = False, tipo: str = None):
    query = db.query(Contrato).filter(Contrato.es_biblioteca == es_biblioteca, Contrato.is_deleted == False)
    if user_id:
        query = query.filter(Contrato.abogado_id == user_id)
    if tipo:
        query = query.filter(Contrato.tipo == tipo)
    return query.offset(skip).limit(limit).all()

def create_contract(db: Session, db_contract: Contrato):
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract

def update_contract(db: Session, db_contract: Contrato):
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract

def delete_contract(db: Session, db_contract: Contrato):
    db_contract.is_deleted = True
    db.add(db_contract)
    db.commit()

def get_all_ids_by_prefix(db: Session, prefix: str):
    return db.query(Contrato.id).filter(Contrato.id.like(f"{prefix}%")).all()

def count_contracts(db: Session, user_id: int = None, estado: str = None, es_biblioteca: bool = False):
    query = db.query(Contrato).filter(Contrato.es_biblioteca == es_biblioteca, Contrato.is_deleted == False)
    if user_id:
        query = query.filter(Contrato.abogado_id == user_id)
    if estado:
        query = query.filter(Contrato.estado == estado)
    return query.count()

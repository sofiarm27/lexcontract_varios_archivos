from sqlalchemy.orm import Session
from app.repositories import contract_repository, client_repository

def get_firm_stats(db: Session):
    return {
        "totalContracts": contract_repository.count_contracts(db),
        "totalClients": client_repository.count_clients(db)
    }

def get_user_stats(db: Session, user_id: int):
    return {
        "myContracts": contract_repository.count_contracts(db, user_id=user_id),
        "myClients": client_repository.count_clients(db, user_id=user_id),
        "contractStatus": {
            "expired": contract_repository.count_contracts(db, user_id=user_id, estado="VENCIDO"),
            "drafts": contract_repository.count_contracts(db, user_id=user_id, estado="BORRADOR"),
            "completed": contract_repository.count_contracts(db, user_id=user_id, estado="TERMINADO")
        }
    }

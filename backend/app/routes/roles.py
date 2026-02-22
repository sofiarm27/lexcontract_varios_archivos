from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import check_admin_role
from app.schemas.auth import RolSchema
from app.repositories import user_repository

router = APIRouter()

@router.get("/", response_model=List[RolSchema])
def read_roles(
    db: Session = Depends(get_db),
    current_user: Any = Depends(check_admin_role)
):
    return user_repository.get_roles(db)

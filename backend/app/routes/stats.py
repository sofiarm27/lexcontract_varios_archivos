from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.stats import StatsSchema
from app.services import stats_service

router = APIRouter()

@router.get("/", response_model=StatsSchema)
def get_stats(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    firm_stats = stats_service.get_firm_stats(db)
    user_stats = stats_service.get_user_stats(db, user_id=current_user.id)
    return {"firmStats": firm_stats, "userStats": user_stats}

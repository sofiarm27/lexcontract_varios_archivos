from datetime import date, datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel

class PagoSchema(BaseModel):
    id: int
    contrato_id: str
    monto_total: Decimal
    fecha_pago: Optional[date]
    estado: str
    class Config:
        from_attributes = True

class AbonoSchema(BaseModel):
    id: int
    pago_id: int
    monto: Decimal
    fecha_abono: datetime
    class Config:
        from_attributes = True

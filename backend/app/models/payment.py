from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Date
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Pago(Base):
    """
    Detailed Payment model to track contract installments or single payments.
    Includes context about the total process value and the payment type.
    """
    __tablename__ = "pago"
    id = Column(Integer, primary_key=True, index=True)
    contrato_id = Column(String(50), ForeignKey("contrato.id"))
    tipo_pago = Column(String(20)) # UNICO, ABONO
    monto_total_contrato = Column(Numeric(15, 2))
    monto_abono = Column(Numeric(15, 2))
    fecha_vencimiento = Column(Date)
    fecha_pago = Column(Date, nullable=True)
    estado = Column(String(20), default="PENDIENTE") # PENDIENTE, PAGADO, VENCIDO

    contrato = relationship("Contrato", back_populates="pagos")

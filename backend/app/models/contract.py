from sqlalchemy import Column, Integer, String, ForeignKey, Date, Numeric, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.db.base_class import Base

class Plantilla(Base):
    __tablename__ = "plantilla"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(50))
    ultima_mod = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    autor = Column(String(100))
    clause_ids = Column(JSONB)
    contratos = relationship("Contrato", back_populates="plantilla")

class Contrato(Base):
    __tablename__ = "contrato"
    id = Column(String(50), primary_key=True, index=True)
    titulo = Column(String(255))
    cliente_id = Column(Integer, ForeignKey("cliente.id"))
    abogado_id = Column(Integer, ForeignKey("usuario.id"))
    plantilla_id = Column(Integer, ForeignKey("plantilla.id"))
    estado = Column(String(20), default="BORRADOR")
    tipo = Column(String(50))
    es_biblioteca = Column(Boolean, default=False)
    fecha = Column(Date, server_default=func.current_date())
    total = Column(Numeric(15, 2))
    clauses = Column(JSONB)
    variables_adicionales = Column(JSONB)
    is_deleted = Column(Boolean, default=False)
    
    cliente = relationship("Cliente", back_populates="contratos")
    abogado = relationship("Usuario", back_populates="contratos")
    plantilla = relationship("Plantilla", back_populates="contratos")
    pagos = relationship("Pago", back_populates="contrato")

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Cliente(Base):
    __tablename__ = "cliente"
    id = Column(Integer, primary_key=True, index=True)
    cedula = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(200), nullable=False)
    apellido = Column(String(100), nullable=False)
    celular = Column(String(20))
    correo = Column(String(100))
    direccion = Column(String(255))
    ciudad = Column(String(100))
    estado = Column(String(20), default="Activo")
    is_deleted = Column(Boolean, default=False)
    usuario_id = Column(Integer, ForeignKey("usuario.id"), nullable=True)
    contratos = relationship("Contrato", back_populates="cliente")

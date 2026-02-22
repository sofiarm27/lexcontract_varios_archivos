from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

# Association Table for M:N relationship between Usuario and Rol
usuario_rol = Table(
    'usuario_rol', Base.metadata,
    Column('usuario_id', Integer, ForeignKey('usuario.id', ondelete="CASCADE"), primary_key=True),
    Column('rol_id', Integer, ForeignKey('rol.id', ondelete="CASCADE"), primary_key=True)
)

class Rol(Base):
    __tablename__ = "rol"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    usuarios = relationship("Usuario", secondary=usuario_rol, back_populates="roles")

class Usuario(Base):
    __tablename__ = "usuario"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    cedula = Column(String(20), unique=True, nullable=False)
    celular = Column(String(20))
    correo = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    estado = Column(String(20), default="Activo")
    intentos_fallidos = Column(Integer, default=0)
    biografia = Column(Text)
    ultima_conexion = Column(DateTime(timezone=True))
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    
    roles = relationship("Rol", secondary=usuario_rol, back_populates="usuarios")
    contratos = relationship("Contrato", back_populates="abogado")

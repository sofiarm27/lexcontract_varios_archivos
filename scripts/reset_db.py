import sys
import os

# Añadir el directorio actual al path
sys.path.append(os.getcwd())

from app.db.base_class import Base
from app.db.session import engine
from app.models.models import Usuario, Rol, Cliente, Plantilla, Contrato, Pago, Abono

def reset_database():
    print("ADVERTENCIA: Esto borrara todas las tablas de la base de datos.")
    confirm = input("¿Estas seguro de que deseas continuar? (s/n): ")
    if confirm.lower() != 's':
        print("Operacion cancelada.")
        return

    print("Borrando tablas existentes...")
    
    # Intenta borrar las vistas primero para evitar errores de dependencia
    from sqlalchemy import text
    with engine.connect() as connection:
        try:
            print("  - Borrando vistas...")
            connection.execute(text("DROP VIEW IF EXISTS vista_contratos_completos, vista_estado_pagos CASCADE"))
            print("  - Borrando tablas con CASCADE...")
            connection.execute(text("DROP TABLE IF EXISTS abono, pago, contrato, plantilla, cliente, usuario, rol CASCADE"))
            connection.commit()
        except Exception as e:
            print(f"  - Nota: Error al borrar objetos manualmente: {e}")

    Base.metadata.drop_all(bind=engine)
    
    print("Creando nuevas tablas segun los modelos actuales...")
    Base.metadata.create_all(bind=engine)
    
    print("Base de datos reseteada exitosamente.")
    print("Ahora puedes ejecutar 'python seed_admin.py' para crear el usuario administrador.")

if __name__ == "__main__":
    reset_database()

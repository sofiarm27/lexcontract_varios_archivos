from datetime import date
from sqlalchemy.orm import Session
from app.models.contract import Contrato
from app.models.payment import Pago
from app.repositories import contract_repository

def generate_id(db: Session, prefix_base: str):
    year = date.today().year
    prefix = f"{prefix_base}-{year}-"
    existing_ids = contract_repository.get_all_ids_by_prefix(db, prefix)
    
    max_num = 0
    for (eid,) in existing_ids:
        try:
            num = int(eid.replace(prefix, ""))
            if num > max_num: max_num = num
        except ValueError: continue
    
    next_num = max_num + 1
    return f"{prefix}{str(next_num).zfill(3)}"

def sync_payments(db: Session, db_contract: Contrato):
    """
    Synchronizes installments from variables_adicionales into the Pago table.
    Now includes tipo_pago, monto_total_contrato, and monto_abono.
    """
    if db_contract.es_biblioteca:
        return
    
    vars_adicionales = db_contract.variables_adicionales or {}
    modalidad = vars_adicionales.get("modalidadPago")
    installments = vars_adicionales.get("installments", [])
    
    # Clean existing payments for this contract to refresh
    db.query(Pago).filter(Pago.contrato_id == db_contract.id).delete()
    
    # If it's single payment, create one record
    if (modalidad == "unico" or not installments) and db_contract.total > 0:
        pago_unico = Pago(
            contrato_id=db_contract.id,
            tipo_pago="UNICO",
            monto_total_contrato=db_contract.total,
            monto_abono=db_contract.total,
            fecha_vencimiento=db_contract.fecha,
            estado="PENDIENTE"
        )
        db.add(pago_unico)
    else:
        # Multiple installments
        for inst in installments:
            monto = inst.get("monto", 0)
            if isinstance(monto, str):
                try:
                    monto = float(monto.replace(",", ""))
                except:
                    monto = 0
            
            pago = Pago(
                contrato_id=db_contract.id,
                tipo_pago="ABONO",
                monto_total_contrato=db_contract.total,
                monto_abono=monto,
                fecha_vencimiento=inst.get("fecha") if inst.get("fecha") else None,
                estado="PENDIENTE"
            )
            db.add(pago)
    
    db.commit()

def create_contract(db: Session, contract_data: dict):
    if not contract_data.get("id"):
        contract_data["id"] = generate_id(db, "CNT")
    db_contract = Contrato(**contract_data)
    created_contract = contract_repository.create_contract(db, db_contract)
    sync_payments(db, created_contract)
    return created_contract

def create_library_item(db: Session, item_data: dict, tipo: str):
    prefix_str = "PLT" if tipo == "plantilla" else "LIB"
    item_id = generate_id(db, prefix_str)

    if tipo == "plantilla":
        clauses_content = item_data.get("clauses")
    else:
        clauses_content = {"titulo": item_data.get("titulo"), "texto": item_data.get("texto")}

    db_item = Contrato(
        id=item_id,
        titulo=item_data.get("titulo"),
        clauses=clauses_content,
        tipo=tipo,
        es_biblioteca=True,
        estado="ACTIVO",
        fecha=date.today(),
        total=0,
        cliente_id=None,
        abogado_id=None,
        variables_adicionales={"areaPractica": item_data.get("tipo", "Insolvencia Económica")}
    )
    return contract_repository.create_contract(db, db_item)

def generate_contract_from_template(db: Session, plantilla_id: str, contract_data: dict):
    template = contract_repository.get_contract_by_id(db, plantilla_id)
    if not template or not template.es_biblioteca or template.tipo != "plantilla":
        return None

    new_id = generate_id(db, "CNT")
    new_contract_data = {
        "id": new_id,
        "titulo": f"Contrato basado en {template.titulo}",
        "cliente_id": contract_data.get("cliente_id"),
        "abogado_id": contract_data.get("abogado_id"),
        "tipo": "contrato",
        "es_biblioteca": False,
        "estado": "Borrador",
        "clauses": template.clauses,
        "variables_adicionales": contract_data.get("variables_adicionales")
    }
    db_contract = Contrato(**new_contract_data)
    created_contract = contract_repository.create_contract(db, db_contract)
    sync_payments(db, created_contract)
    return created_contract

def update_contract(db: Session, contract_id: str, contract_update: dict):
    db_contract = contract_repository.get_contract_by_id(db, contract_id)
    if not db_contract: return None
    
    # Handle specific mapping for Legal Library items
    if db_contract.es_biblioteca:
        # For clauses, map 'texto' to the JSONB 'clauses' structure
        if db_contract.tipo == "clausula" and "texto" in contract_update:
            db_contract.clauses = {
                "titulo": contract_update.get("titulo", db_contract.titulo),
                "texto": contract_update["texto"]
            }
        
        # map 'tipo' to areaPractica in variables_adicionales
        if "tipo" in contract_update:
            # ensure we create a NEW dict so SQLAlchemy detects the change
            vars_adicionales = dict(db_contract.variables_adicionales or {})
            vars_adicionales["areaPractica"] = contract_update["tipo"]
            db_contract.variables_adicionales = vars_adicionales

    # Update other fields (ensuring we don't accidentally overwrite 'clauses' if not intended)
    for key, value in contract_update.items():
        if key in ["texto", "tipo"] and db_contract.es_biblioteca:
            continue
        if value is not None and hasattr(db_contract, key):
            setattr(db_contract, key, value)
            
    updated_contract = contract_repository.update_contract(db, db_contract)
    sync_payments(db, updated_contract)
    return updated_contract

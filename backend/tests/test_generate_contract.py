import requests
import json

BASE_URL = "http://127.0.0.1:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZXhwIjoxNzcxNDkzNzM1fQ.M0jS8X09yIDyisG1o09MUGIs4WqUgEFKQDqiZhIrB4U"

def test_generate_from_template():
    # 1. Obtener una plantilla existente (usamos la que creamos antes o listamos)
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    print("Buscando plantillas disponibles...")
    resp_list = requests.get(f"{BASE_URL}/contracts/plantillas", headers=headers)
    print(f"Status: {resp_list.status_code}")
    if resp_list.status_code != 200:
        print(f"Error listing templates: {resp_list.text}")
        return
    
    plantillas = resp_list.json()
    print(f"Plantillas encontradas: {len(plantillas)}")
    if not plantillas:
        print("No se encontraron plantillas. Por favor, crea una primero.")
        return
    
    template_id = resp_list.json()[0]['id']
    print(f"Usando Plantilla: {template_id}")

    # 2. Generar Contrato
    print("\n--- Generando Contrato desde Plantilla ---")
    url = f"{BASE_URL}/contracts/generar-desde-plantilla/{template_id}"
    headers["Content-Type"] = "application/json"
    
    # Datos requeridos por ContratoFromPlantilla
    data = {
        "cliente_id": 1, 
        "abogado_id": 7,
        "variables_adicionales": {
            "fecha_inicio": "2026-03-01",
            "monto_acordado": "5000"
        }
    }
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        print("✅ Contrato generado exitosamente.")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"❌ Error al generar contrato: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_generate_from_template()

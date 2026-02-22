import requests
import json

BASE_URL = "http://127.0.0.1:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZXhwIjoxNzcxNDc2NjM0fQ.bjWWehqdrLuYJxChlARJjMNBlbEmABpaNVrXwB_krbc"

def test_templates():
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    
    # 1. Crear una Plantilla
    print("\n--- Paso 1: Creando una Plantilla ---")
    url_post = f"{BASE_URL}/contracts/plantilla"
    template_data = {
        "titulo": "Contrato de Prestación de Servicios Estándar",
        "descripcion": "Plantilla básica para servicios profesionales",
        "clauses": [
            {"titulo": "Objeto", "texto": "El contratista se obliga a realizar..."},
            {"titulo": "Precio", "texto": "El valor del contrato será de..."}
        ]
    }
    
    response_post = requests.post(url_post, headers=headers, json=template_data)
    if response_post.status_code == 200:
        print("✅ Plantilla creada exitosamente.")
        print(json.dumps(response_post.json(), indent=2))
    else:
        print(f"❌ Error al crear plantilla: {response_post.status_code}")
        print(response_post.text)
        return

    # 2. Listar Plantillas
    print("\n--- Paso 2: Listando Plantillas ---")
    url_get = f"{BASE_URL}/contracts/plantillas"
    response_get = requests.get(url_get, headers=headers)
    if response_get.status_code == 200:
        plantillas = response_get.json()
        print(f"✅ Se encontraron {len(plantillas)} plantillas.")
        for p in plantillas:
            print(f"- {p.get('id')}: {p.get('titulo')}")
    else:
        print(f"❌ Error al listar plantillas: {response_get.status_code}")

if __name__ == "__main__":
    test_templates()

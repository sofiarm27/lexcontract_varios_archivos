import requests
import json

BASE_URL = "http://127.0.0.1:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZXhwIjoxNzcxNDc2NjM0fQ.bjWWehqdrLuYJxChlARJjMNBlbEmABpaNVrXwB_krbc"

def test_list_library():
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    # Test Clausulas
    print("\nListing Clausulas...")
    response = requests.get(f"{BASE_URL}/contracts/clausulas", headers=headers)
    if response.status_code == 200:
        clausulas = response.json()
        print(f"✅ Found {len(clausulas)} clausulas.")
        if clausulas:
            print(f"First one: {clausulas[0].get('id')} - {clausulas[0].get('titulo')}")
    else:
        print(f"❌ Error Listing Clausulas: {response.status_code}")
        print(response.text)

    # Test Plantillas
    print("\nListing Plantillas...")
    response = requests.get(f"{BASE_URL}/contracts/plantillas", headers=headers)
    if response.status_code == 200:
        plantillas = response.json()
        print(f"✅ Found {len(plantillas)} plantillas.")
        if plantillas:
            print(f"First one: {plantillas[0].get('id')} - {plantillas[0].get('titulo')}")
    else:
        print(f"❌ Error Listing Plantillas: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_list_library()

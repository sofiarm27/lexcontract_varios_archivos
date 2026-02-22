import requests
import json

BASE_URL = "http://127.0.0.1:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZXhwIjoxNzcxNDc2NjM0fQ.bjWWehqdrLuYJxChlARJjMNBlbEmABpaNVrXwB_krbc" # Using the token from the user request

def test_create_clausula():
    url = f"{BASE_URL}/contracts/clausula"
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
        "titulo": "Cláusula de Confidencialidad de Prueba",
        "texto": "Las partes acuerdan mantener estricta confidencialidad sobre la información compartida..."
    }
    
    print(f"Sending POST request to {url}...")
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ Success: Clause created successfully.")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Failure: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error during request: {e}")

if __name__ == "__main__":
    test_create_clausula()

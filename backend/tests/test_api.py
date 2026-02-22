import requests

# Step 1: Get a token
login_data = {
    "username": "s.aristi.m@gmail.com",
    "password": "Admin123*",
    "grant_type": "password"
}
resp = requests.post("http://127.0.0.1:8000/token", data=login_data)
print(f"Login status: {resp.status_code}")

if resp.status_code == 200:
    token = resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Get clausulas
    r_clausulas = requests.get("http://127.0.0.1:8000/contracts/clausulas", headers=headers)
    print(f"Clausulas status: {r_clausulas.status_code}")
    if r_clausulas.ok:
        data = r_clausulas.json()
        print(f"Clausulas count: {len(data)}")
        for item in data:
            print(f"  - {item.get('id')}: {item.get('titulo')}")
    else:
        print(f"Clausulas error: {r_clausulas.text[:500]}")
    
    # Step 3: Get plantillas
    r_plantillas = requests.get("http://127.0.0.1:8000/contracts/plantillas", headers=headers)
    print(f"Plantillas status: {r_plantillas.status_code}")
    if r_plantillas.ok:
        data = r_plantillas.json()
        print(f"Plantillas count: {len(data)}")
        for item in data:
            print(f"  - {item.get('id')}: {item.get('titulo')}")
    else:
        print(f"Plantillas error: {r_plantillas.text[:500]}")
else:
    print(f"Login failed: {resp.text}")

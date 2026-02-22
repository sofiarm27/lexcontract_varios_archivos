from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.base_class import Base # Keep for sync for now
from app.core.database import engine
from app.routes import auth, clients, contracts, users, stats, roles

# Synchronize models (using core engine)
print("Sincronizando modelos con la base de datos...")
# We need to ensure all models are imported so Base knows them
from app.models import auth as auth_models, client, contract, payment
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LexContract API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://[::1]:5173",
        "http://[::1]:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "LexContract API is running (Professional Architecture)"}

# Include routers with exact prefixes to match original paths
app.include_router(auth.router, tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(clients.router, prefix="/clients", tags=["clients"])
app.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
app.include_router(stats.router, prefix="/stats", tags=["stats"])
app.include_router(roles.router, prefix="/roles", tags=["roles"])

# For backward compatibility with root /token and /forgot-password
# (Already handled by auth.router without prefix)

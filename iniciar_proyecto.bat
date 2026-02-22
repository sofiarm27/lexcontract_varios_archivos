@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo    INICIANDO PROYECTO LEXCONTRACT
echo ==========================================

:: 1. Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no esta instalado o no esta en el PATH.
    pause
    exit /b
)

:: 2. Verificar Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado o no esta en el PATH.
    pause
    exit /b
)

:: 3. Verificar si el puerto 8000 esta ocupado
netstat -ano | findstr :8000 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo [ADVERTENCIA] El puerto 8000 (Backend) ya esta en uso. 
    echo Asegurate de cerrar procesos viejos.
)

:: 4. Instalar dependencias del Backend (opcional/rapido)
echo [1/3] Verificando dependencias del Backend...
cd backend
pip install -r requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la instalacion de dependencias del Backend.
)
cd ..

:: 5. Iniciar Backend en segundo plano
echo [2/3] Iniciando Backend en nueva ventana...
start "LexContract Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: 6. Iniciar Frontend
echo [3/3] Iniciando Frontend...
echo.
echo ==========================================
echo SI TODO VA BIEN, EL FRONTEND SE ABRIRA EN:
echo http://localhost:5173
echo ==========================================
echo.

cmd /c npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] El Frontend no pudo iniciar. 
    echo Intenta ejecutar 'npm install' si es la primera vez.
)

pause

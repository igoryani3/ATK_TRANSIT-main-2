@echo off
echo ========================================
echo   ATK Transit CRM - Development Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo [1/4] Installing Python dependencies...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet
cd ..

echo [2/5] Installing Node.js dependencies...
cd frontend
if not exist node_modules (
    npm install
)
cd ..

echo [3/5] Initializing database...
cd backend
call venv\Scripts\activate.bat

REM Clean Python cache to prevent stale bytecode issues
echo Cleaning Python cache...
for /d /r %%i in (__pycache__) do @if exist "%%i" rd /s /q "%%i"
if exist *.pyc del /s /q *.pyc >nul 2>&1

REM Check if database exists and has correct schema
if not exist atk_transit.db (
    echo Database not found. Creating new database...
    python reset_database.py
    python migrate_csv_data.py
) else (
    echo Database found. Verifying schema...
    REM If you need to force reset, delete atk_transit.db manually
)
cd ..

echo [4/5] Starting Flask backend server...
start "ATK Transit - Backend" cmd /k "cd backend && venv\Scripts\activate && python app.py"

timeout /t 3 /nobreak >nul

echo [5/5] Starting Next.js frontend server...
start "ATK Transit - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Servers are starting...
echo ========================================
echo.
<<<<<<< HEAD
echo Backend:  http://localhost:5555
echo Frontend: http://localhost:3333
=======
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
>>>>>>> dd8253c808e8aa07b5293422ac7cd77a72602389
echo.
echo Login credentials:
echo   Username: dispatcher
echo   Password: dispatcher123
echo.
echo Press any key to stop all servers...
pause >nul

echo Stopping servers...
taskkill /FI "WINDOWTITLE eq ATK Transit - Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq ATK Transit - Frontend*" /F >nul 2>&1
echo Servers stopped.

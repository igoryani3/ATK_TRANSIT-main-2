@echo off
echo ========================================
echo   Reset Database with New Schema
echo ========================================
echo.
echo This will:
echo 1. Delete existing database
echo 2. Create new database with updated schema
echo 3. Import all data from CSV files
echo.
echo Press Ctrl+C to cancel, or
pause

cd backend

if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found
    echo Please run start_dev.bat first
    pause
    exit /b 1
)

echo.
echo [1/3] Deleting old database...
if exist atk_transit.db (
    del /F atk_transit.db
    echo Old database deleted.
) else (
    echo No existing database found.
)

echo.
echo [2/3] Creating new database with schema...
python reset_database.py

echo.
echo [3/3] Importing data from CSV files...
python migrate_csv_data.py

echo.
echo ========================================
echo   Database Reset Complete!
echo ========================================
echo.
echo You can now run start_dev.bat to launch the servers.
echo.
pause

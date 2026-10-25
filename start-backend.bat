@echo off
cd /d "%~dp0"
docker compose up -d db
cd backend
set PYTHONUTF8=1
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000

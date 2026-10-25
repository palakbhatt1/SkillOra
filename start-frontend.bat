@echo off
cd /d "%~dp0frontend"
if not exist .next call npm run build
npm run start

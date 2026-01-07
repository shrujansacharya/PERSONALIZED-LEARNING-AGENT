@echo off
echo ================================
echo Starting LEARNMYWAY
echo ================================

cd backend

echo Starting Python API...
start "" /b python api.py

timeout /t 2 > nul

echo Starting Node Server...
start "" /b node server.js

cd ..

timeout /t 2 > nul

echo Starting Frontend...
npm run dev

echo ================================
echo All services running
echo ================================

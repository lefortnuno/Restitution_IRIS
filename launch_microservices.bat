@echo off
chcp 65001 > nul
title Lancement Micro-services IRIS

:: Création du dossier logs
if not exist "logs" mkdir logs

echo ========================================
echo  Lancement des micro-services Django
echo ========================================
  

start "RESTT_SOUTT" cmd /k "cd /d api_restitution && C:\Users\AC2I\Envs\iris_rest\Scripts\activate && python manage.py runserver 0.0.0.0:1234 > ..\logs\RESTT.log 2>&1"
echo ✓ RESTT en cours d'exécution
echo   Logs : logs\RESTT.log
echo.
 
start "CELERY_SOUTT" cmd /k "cd /d api_restitution && C:\Users\AC2I\Envs\iris_rest\Scripts\activate && celery -A config worker -P solo -l info > ..\logs\CELERY.log 2>&1"
echo ✓ CELERY en cours d'exécution
echo   Logs : logs\CELERY.log
echo.

echo ========================================
echo  Lancement du frontend React
echo ========================================
start "IRIS_FRONTEND_SOUTT" cmd /k "cd /d restitution_ui && npm start > ..\logs\IRIS_FRONTEND.log 2>&1"
echo ✓ Frontend en cours d'exécution
echo   Logs : logs\IRIS_FRONTEND.log
echo.

echo ========================================
echo Tous les services sont en cours d'exécution
echo Appuyez sur une touche pour tout arrêter.
echo ========================================
echo.
pause >nul

echo Arrêt de tous les micro-services...
taskkill /F /T /IM python.exe >nul 2>&1
taskkill /F /T /IM node.exe >nul 2>&1
taskkill /F /T /IM celery.exe >nul 2>&1

:: Fermeture de toutes les fenêtres cmd ouvertes par ce script 
taskkill /F /FI "WINDOWTITLE eq RESTT_SOUTT" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq CELERY_SOUTT" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq IRIS_FRONTEND_SOUTT" >nul 2>&1

echo Tous les services sont arrêtés.
timeout /t 2 >nul
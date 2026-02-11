@echo off
REM Script de inicio rápido para CRGM-API (Windows)
REM Autor: CRGM Industrial
REM Fecha: 2026-02-10

echo ==================================================
echo   🚀 CRGM-API - Sistema Operativo Industrial
echo ==================================================
echo.

REM Cambiar al directorio src
cd /d "%~dp0src"

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Python no está instalado
    echo    Descarga desde: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✓ Python detectado
echo.

REM Verificar si el puerto 8000 está en uso
netstat -ano | findstr :8000 | findstr LISTENING >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Puerto 8000 ya en uso
    echo    Detén el servidor existente o usa otro puerto
    set /p respuesta="   ¿Quieres continuar de todas formas? (s/n): "
    if /i not "%respuesta%"=="s" exit /b 1
)

echo 🌐 Iniciando servidor HTTP en puerto 8000...
echo    Directorio: %CD%
echo.
echo ==================================================
echo   🎯 ACCEDE A LA APLICACIÓN:
echo   http://localhost:8000
echo   http://127.0.0.1:8000
echo.
echo   🔑 TOKEN POR DEFECTO: CRGM2026
echo ==================================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

REM Abrir navegador automáticamente después de 2 segundos
start "" /min cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8000"

REM Iniciar servidor
python -m http.server 8000

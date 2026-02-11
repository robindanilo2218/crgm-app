#!/bin/bash

# Script de inicio rápido para CRGM-API
# Autor: CRGM Industrial
# Fecha: 2026-02-10

echo "=================================================="
echo "  🚀 CRGM-API - Sistema Operativo Industrial"
echo "=================================================="
echo ""

# Cambiar al directorio del script (raíz del proyecto)
cd "$(dirname "$0")"

# Verificar si Python3 está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ ERROR: Python3 no está instalado"
    echo "   Instala con: sudo apt install python3"
    exit 1
fi

echo "✓ Python3 detectado"
echo ""

# Verificar el puerto 8000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Puerto 8000 ya en uso"
    echo "   Detén el servidor existente o usa otro puerto"
    read -p "   ¿Quieres detener el servidor actual? (s/n): " respuesta
    if [[ $respuesta == "s" || $respuesta == "S" ]]; then
        pkill -f "python3 -m http.server 8000"
        echo "   ✓ Servidor detenido"
        sleep 1
    else
        exit 1
    fi
fi

echo "🌐 Iniciando servidor HTTP en puerto 8000..."
echo "   Directorio: $(pwd)"
echo ""
echo "=================================================="
echo "  🎯 ACCEDE A LA APLICACIÓN:"
echo "  http://localhost:8000"
echo ""
echo "  📋 MÓDULOS DISPONIBLES:"
echo "  ⚡ Editor de Diagramas Eléctricos"
echo "  📋 Gestor de Proyectos Industriales"
echo ""
echo "  🔑 TOKEN POR DEFECTO: CRGM2026"
echo "  👤 Usuario: Administrador (Nivel 999)"
echo "=================================================="
echo ""
echo "💡 CONSEJO: En WSL, abre http://localhost:8000 manualmente"
echo "            en tu navegador de Windows"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar servidor desde la raíz del proyecto
python3 -m http.server 8000

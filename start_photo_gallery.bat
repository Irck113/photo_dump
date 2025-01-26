@echo off
echo Iniciando Galeria de Fotos...
start "" "http://localhost:8000"
cd /d "%~dp0"
deno run --allow-read --allow-net --allow-env --allow-write --allow-run --unstable server.ts

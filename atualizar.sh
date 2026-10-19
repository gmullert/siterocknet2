#!/usr/bin/env bash
set -e

echo "==========================================="
echo "  Atualização do Sistema Rocknet Telecom   "
echo "==========================================="

echo "[1/4] Baixando atualizações do repositório..."
git pull origin main || git pull

echo "[2/4] Instalando dependências..."
npm install

echo "[3/4] Compilando assets de produção..."
npm run build

echo "[4/4] Reiniciando aplicação..."
if command -v docker-compose &> /dev/null; then
  docker-compose down
  docker-compose up -d --build
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
  docker compose down
  docker compose up -d --build
elif command -v pm2 &> /dev/null; then
  pm2 restart all || pm2 start npm --name "rocknet" -- start
else
  echo "Containers ou PM2 não detectados. Para iniciar manualmente: npm start"
fi

echo "==========================================="
echo "  Atualização concluída com sucesso!       "
echo "==========================================="

#!/bin/sh
set -e

echo ">>> Aplicando migrações do banco de dados..."
cd /app/packages/database
./node_modules/.bin/prisma migrate deploy --config prisma.config.ts
echo ">>> Migrações concluídas."

echo ">>> Iniciando servidor API..."
cd /app
exec node apps/api/dist/server.js

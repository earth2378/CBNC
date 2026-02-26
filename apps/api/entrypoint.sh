#!/bin/sh
set -e

echo "[db] Running migrations..."
npx drizzle-kit migrate

echo "[db] Running seed..."
npm run db:seed

echo "[api] Starting server..."
exec node dist/server.js

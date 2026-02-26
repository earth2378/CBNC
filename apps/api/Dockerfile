FROM node:20-alpine

WORKDIR /app

# Copy monorepo root tsconfig so apps/api/tsconfig.json can extend it
COPY tsconfig.base.json ./

# Install dependencies
COPY apps/api/package.json apps/api/package-lock.json* ./apps/api/
RUN cd apps/api && npm install

# Copy api source
COPY apps/api/ ./apps/api/

WORKDIR /app/apps/api

RUN npm run build

COPY apps/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

CMD ["sh", "entrypoint.sh"]

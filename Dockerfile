# Multi-stage build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY firebase-applet-config.json ./

# Cloud Run injects PORT; default to 3000 for local Docker
ENV PORT=3000
EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]

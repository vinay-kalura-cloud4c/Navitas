# ----------- Stage 1: Build Frontend -----------
FROM node:20-alpine AS frontend

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ----------- Stage 2: Build Backend -----------
FROM node:20-alpine

WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./

# Copy frontend build assets into backend's serving path (adjust if needed, e.g., to ./public if your server.js expects that)
COPY --from=frontend /app/frontend/build ./frontend/build

EXPOSE 3000
ENV NODE_ENV production
CMD ["node", "server.js"]

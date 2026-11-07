# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files if using workspaces or server package
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install --workspace=server

# Copy server source code and tsconfig
COPY server/ ./server/

# Compile TypeScript
RUN npm run build:server

# ==========================================
# 2. Production Runtime Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install --workspace=server --omit=dev

# Copy compiled JavaScript output
COPY --from=builder /app/server/dist ./server/dist

EXPOSE 5000

USER node

CMD ["node", "server/dist/server.js"]


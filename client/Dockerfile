# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./
COPY client/package*.json ./client/

# Install client dependencies
RUN npm install --workspace=client

# Copy client source code
COPY client/ ./client/

# Build client for production
RUN npm run build:client

# ==========================================
# 2. Production Nginx Stage
# ==========================================
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend assets from builder stage
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


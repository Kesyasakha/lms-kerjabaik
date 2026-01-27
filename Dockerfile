# ============================================
# Dockerfile untuk LMS Academy
# Struktur: frontend/ folder di root
# ============================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files dari folder frontend
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy seluruh folder frontend
COPY frontend/ ./

# Build aplikasi
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve secara global
RUN npm install -g serve

# Copy hasil build dari stage builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start aplikasi dengan serve
CMD ["serve", "-s", "dist", "-l", "3000", "-n"]

# ============================================
# Dockerfile dengan Build Arguments Support
# Untuk inject environment variables saat build
# ============================================

# STAGE 1: BUILD
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments dari Dokploy
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG NODE_ENV=production

# Set as environment variables untuk tersedia saat build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV NODE_ENV=$NODE_ENV

# Copy package files dari frontend folder
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY frontend/ ./

# Build aplikasi - environment variables tersedia di sini!
RUN npm run build

# Verify build output
RUN ls -la dist/

# STAGE 2: PRODUCTION
FROM nginx:alpine

# Copy hasil build dari builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config untuk SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

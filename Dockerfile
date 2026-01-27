# ============================================
# Dockerfile dengan Build Arguments Support
# Untuk inject environment variables saat build
# Updated: 2026-01-27 - Fixed devDependencies installation
# ============================================

# STAGE 1: BUILD
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments dari Dokploy
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set as environment variables untuk tersedia saat build
# JANGAN set NODE_ENV=production di sini karena akan membuat npm ci skip devDependencies
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Copy package files dari frontend folder
COPY frontend/package*.json ./

# Install ALL dependencies including devDependencies (vite is in devDependencies)
# CRITICAL: Must use npm install (NOT npm ci) and set NODE_ENV=development
# npm ci will skip devDependencies if NODE_ENV=production is set anywhere
# This ensures vite and other devDependencies are installed
RUN NODE_ENV=development npm install --legacy-peer-deps

# Verify that vite is installed (exit with error if not found)
RUN test -f node_modules/.bin/vite || (echo "ERROR: vite not found in node_modules!" && exit 1)

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

# Set proper permissions untuk nginx
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

# Copy custom nginx config untuk SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verify files exist
RUN ls -la /usr/share/nginx/html/ && \
    test -f /usr/share/nginx/html/index.html || (echo "ERROR: index.html not found!" && exit 1)

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

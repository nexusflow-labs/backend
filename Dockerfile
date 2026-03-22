# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:25-alpine AS deps

# Install build dependencies for native modules (argon2, bcrypt)
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# ============================================
# Stage 2: Builder
# ============================================
FROM node:25-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# ============================================
# Stage 3: Production dependencies
# ============================================
FROM node:25-alpine AS prod-deps

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --omit=optional

# ============================================
# Stage 4: Production runner
# ============================================
FROM node:25-alpine AS runner

# Install runtime dependencies for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy production dependencies with correct ownership
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy Prisma files (schema + migrations for deploy)
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Copy generated Prisma client
COPY --from=builder --chown=nestjs:nodejs /app/generated ./generated

# Copy package.json for metadata
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/src/main.js"]

# Stage 1: Build Frontend
FROM oven/bun:1-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile
COPY frontend .
RUN bun run build

# Stage 2: Runtime (Backend + Static Frontend)
FROM oven/bun:1-alpine
WORKDIR /app

# Install Backend Deps (production only)
COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy Backend Source
COPY backend .

# Copy Built Frontend to Backend's Public dir
COPY --from=frontend /app/dist ./public

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose API & Frontend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Start Elysia
CMD ["bun", "run", "src/index.ts"]

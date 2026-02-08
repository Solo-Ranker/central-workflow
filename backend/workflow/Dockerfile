# -----------------------------
# 1️⃣ Build stage
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN corepack enable && pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY . .

# Build TypeScript → dist
RUN pnpm run build


# -----------------------------
# 2️⃣ Production stage
# -----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only required files as root
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY package.json ./

# Security: non-root user
RUN addgroup -S hono && adduser -S hono -G hono
USER hono


ENV NODE_ENV=production
EXPOSE 8080

# Start app
CMD ["node", "dist/src/index.js"]

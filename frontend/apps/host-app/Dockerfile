# -----------------------------
# Build stage
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Build arguments
ARG APP_NAME
ARG USER_APP_URL
ARG ACCOUNT_APP_URL
ARG PROMOTION_APP_URL
ARG REACT_APP_API_URL

ENV USER_APP_URL=${USER_APP_URL}
ENV ACCOUNT_APP_URL=${ACCOUNT_APP_URL}
ENV PROMOTION_APP_URL=${PROMOTION_APP_URL}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

RUN echo "REACT_APP_API_URL=$REACT_APP_API_URL"

# Make args available to build tools
ENV NODE_ENV=production

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy monorepo sources
COPY packages ./packages
COPY apps ./apps

# Install deps
RUN pnpm install --frozen-lockfile

# Build selected app
RUN pnpm --filter ${APP_NAME} build


# -----------------------------
# Runtime stage
# -----------------------------
FROM nginx:1.25-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build argument again (ARG is per-stage)
ARG APP_NAME

# Copy built assets
COPY --from=builder /app/apps/${APP_NAME}/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

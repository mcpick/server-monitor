# Build stage
FROM cgr.dev/chainguard/node:latest-dev AS build

LABEL maintainer="Server Monitor"
LABEL description="TanStack Start dashboard for server monitoring"

USER root
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=10.17.1
RUN npm install -g pnpm@$PNPM_VERSION

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY . .

# Build application
RUN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod

# Production stage
FROM cgr.dev/chainguard/node:latest

WORKDIR /app

# Copy built application
COPY --from=build --chown=node:node /app/.output /app/.output
COPY --from=build --chown=node:node /app/node_modules /app/node_modules

# Expose port 3000
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD [".output/server/index.mjs"]

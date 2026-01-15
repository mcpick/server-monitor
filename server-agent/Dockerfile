FROM ubuntu:22.04

LABEL maintainer="Server Monitor"
LABEL description="Go daemon for collecting system metrics"

# Install ca-certificates for HTTPS connections to Turso and curl for health checks
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for running the agent
RUN useradd --system --no-create-home --shell /usr/sbin/nologin server-agent

# Copy the pre-built binary
COPY server-agent /usr/local/bin/server-agent
RUN chmod +x /usr/local/bin/server-agent

# Environment variables (should be overridden at runtime)
ENV TURSO_DATABASE_URL=""
ENV TURSO_AUTH_TOKEN=""
ENV COLLECTION_INTERVAL="5s"
ENV HOSTNAME=""
ENV SERVER_ID=""
ENV HEALTH_PORT="8081"

# Expose health check port
EXPOSE 8081

# Run as non-root user
USER server-agent

# Health check using HTTP endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8081/ready || exit 1

ENTRYPOINT ["/usr/local/bin/server-agent"]

FROM ubuntu:22.04

LABEL maintainer="Server Monitor"
LABEL description="Go daemon for collecting system metrics"

# Install ca-certificates for HTTPS connections to Turso
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
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

# Run as non-root user
USER server-agent

# Health check using process existence
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD pgrep server-agent || exit 1

ENTRYPOINT ["/usr/local/bin/server-agent"]

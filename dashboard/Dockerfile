FROM nginx:alpine

LABEL maintainer="Server Monitor"
LABEL description="React dashboard for server monitoring"

# Copy built static files
COPY dist/ /usr/share/nginx/html/

# Copy nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Environment variable injection script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use custom entrypoint for env var injection
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

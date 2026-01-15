#!/bin/sh
set -e

# Environment variable injection for Vite apps
# This replaces placeholder values in the built JS files with runtime environment variables

# Find and replace environment variable placeholders in JS files
if [ -n "$VITE_TURSO_DATABASE_URL" ]; then
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_TURSO_DATABASE_URL_PLACEHOLDER|$VITE_TURSO_DATABASE_URL|g" {} \;
fi

if [ -n "$VITE_TURSO_AUTH_TOKEN" ]; then
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_TURSO_AUTH_TOKEN_PLACEHOLDER|$VITE_TURSO_AUTH_TOKEN|g" {} \;
fi

if [ -n "$VITE_AUTH_USERNAME" ]; then
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_AUTH_USERNAME_PLACEHOLDER|$VITE_AUTH_USERNAME|g" {} \;
fi

if [ -n "$VITE_AUTH_PASSWORD_HASH" ]; then
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_AUTH_PASSWORD_HASH_PLACEHOLDER|$VITE_AUTH_PASSWORD_HASH|g" {} \;
fi

# Execute the main command (nginx)
exec "$@"

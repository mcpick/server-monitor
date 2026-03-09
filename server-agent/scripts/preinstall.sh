#!/bin/sh
set -e

# Create server-agent system user and group if they don't exist
if ! getent group server-agent >/dev/null 2>&1; then
    groupadd --system server-agent
fi

if ! getent passwd server-agent >/dev/null 2>&1; then
    useradd --system --no-create-home --shell /usr/sbin/nologin --gid server-agent server-agent
fi

# Create config directory
mkdir -p /etc/server-agent

#!/bin/sh
set -e

# Reload systemd to pick up new/updated service file
systemctl daemon-reload

# Enable the service to start on boot
systemctl enable server-agent

# Only restart the service if the env file has been configured
if [ -f /etc/server-agent/server-agent.env ]; then
    systemctl restart server-agent
fi

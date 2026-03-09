#!/bin/sh
set -e

if [ "$(id -u)" -ne 0 ]; then
    echo "Error: must run as root" >&2
    exit 1
fi

REPO="mcpick/server-monitor"
ARCH=$(dpkg --print-architecture)

# Get latest agent release tag
LATEST_TAG=$(curl -sf "https://api.github.com/repos/${REPO}/releases?per_page=100" \
    | grep -o '"tag_name": "agent/v[^"]*"' \
    | head -1 \
    | grep -o 'agent/v[^"]*')

if [ -z "$LATEST_TAG" ]; then
    echo "Error: could not find latest agent release"
    exit 1
fi

LATEST_VERSION=$(echo "$LATEST_TAG" | sed 's|agent/v||')

# Get currently installed version
INSTALLED_VERSION=$(dpkg-query -W -f='${Version}' server-agent 2>/dev/null || echo "none")

if [ "$INSTALLED_VERSION" = "$LATEST_VERSION" ]; then
    echo "Already up to date: v${INSTALLED_VERSION}"
    exit 0
fi

echo "Updating server-agent: ${INSTALLED_VERSION} -> ${LATEST_VERSION}"

DEB_FILE="server-agent_${LATEST_VERSION}_linux_${ARCH}.deb"
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/${DEB_FILE}"

TMP_DEB=$(mktemp /tmp/server-agent-XXXXXX.deb)
trap 'rm -f "$TMP_DEB"' EXIT

echo "Downloading ${DEB_FILE}..."
curl -sfL "$DOWNLOAD_URL" -o "$TMP_DEB"

echo "Installing..."
dpkg -i "$TMP_DEB"

echo "Updated to v${LATEST_VERSION}"

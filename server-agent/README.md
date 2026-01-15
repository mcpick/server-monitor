# Server Monitor Agent

A Go daemon that collects system metrics and sends them to a Turso database.

## Building

```bash
# Build for current platform
go build -o server-agent .

# Build for Linux (amd64)
GOOS=linux GOARCH=amd64 go build -o server-agent .

# Build for Linux (arm64)
GOOS=linux GOARCH=arm64 go build -o server-agent .
```

## Installation

### 1. Create a system user

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin server-agent
```

### 2. Install the binary

```bash
sudo cp server-agent /usr/local/bin/
sudo chmod +x /usr/local/bin/server-agent
```

### 3. Configure environment

```bash
sudo mkdir -p /etc/server-agent
sudo cp server-agent.env.example /etc/server-agent/server-agent.env
sudo chmod 600 /etc/server-agent/server-agent.env
sudo chown server-agent:server-agent /etc/server-agent/server-agent.env
```

Edit `/etc/server-agent/server-agent.env` with your Turso credentials.

### 4. Install systemd service

```bash
sudo cp server-agent.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable server-agent
sudo systemctl start server-agent
```

### 5. Verify installation

```bash
sudo systemctl status server-agent
sudo journalctl -u server-agent -f
```

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TURSO_DATABASE_URL` | Yes | - | Turso database URL |
| `TURSO_AUTH_TOKEN` | Yes | - | Turso authentication token |
| `COLLECTION_INTERVAL` | No | `5s` | Metrics collection interval |
| `HOSTNAME` | No | System hostname | Custom hostname for this server |
| `SERVER_ID` | No | Auto-generated | Unique identifier for this server |

## Metrics Collected

- **CPU**: Usage percentage, load averages (1m, 5m, 15m)
- **Memory**: Total, used, available, cached bytes
- **Swap**: Total, used, free bytes
- **Disk Usage**: Per-mount total, used, free bytes
- **Disk I/O**: Per-device read/write bytes and counts
- **Network**: Per-interface bytes/packets sent/received
- **Processes**: Top 10 processes by CPU/memory usage

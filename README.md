# Server Monitor

A server monitoring tool with a Go daemon for collecting system metrics and a React dashboard for visualization.

## Components

- **server-agent**: Go daemon that collects CPU, memory, disk, network, and process metrics
- **dashboard**: React dashboard for visualizing metrics with TailwindCSS and Recharts
- **sqld**: Local Turso-compatible SQLite database

## Quick Start with Docker Compose

The easiest way to run the full stack locally is with Docker Compose.

### Prerequisites

- Docker and Docker Compose installed
- Go 1.21+ (for building the server-agent binary)
- Node.js 18+ and pnpm (for building the dashboard)

### Build and Run

1. **Build the Go daemon binary for Linux:**

   ```bash
   cd server-agent
   GOOS=linux GOARCH=amd64 go build -o server-agent .
   cd ..
   ```

2. **Build the React dashboard:**

   ```bash
   cd dashboard
   pnpm install
   pnpm build
   cd ..
   ```

3. **Copy the environment template:**

   ```bash
   cp .env.docker .env
   ```

4. **Start all services:**

   ```bash
   docker compose up --build
   ```

5. **Access the dashboard:**

   Open http://localhost:3000 in your browser.

   Default credentials:
   - Username: `admin`
   - Password: `admin`

### Services

| Service | Port | Description |
|---------|------|-------------|
| sqld | 8080 | Local Turso-compatible database |
| server-agent | - | Metrics collection daemon |
| dashboard | 3000 | React dashboard (nginx) |

### Configuration

Environment variables can be customized in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `TURSO_DATABASE_URL` | `http://sqld:8080` | Database URL for server-agent |
| `TURSO_AUTH_TOKEN` | (empty) | Auth token for Turso (optional for local sqld) |
| `COLLECTION_INTERVAL` | `5s` | Metrics collection interval |
| `HOSTNAME` | `docker-agent` | Server hostname for identification |
| `VITE_TURSO_DATABASE_URL` | `http://localhost:8080` | Database URL for dashboard (browser) |
| `VITE_AUTH_USERNAME` | `admin` | Dashboard login username |
| `VITE_AUTH_PASSWORD_HASH` | (hash of "admin") | SHA-256 hash of the password |

### Changing the Password

Generate a new password hash:

```bash
echo -n "your-password" | shasum -a 256 | cut -d' ' -f1
```

Update `VITE_AUTH_PASSWORD_HASH` in your `.env` file with the generated hash.

### Stopping Services

```bash
docker compose down
```

To also remove the database volume:

```bash
docker compose down -v
```

## Development

### Server Agent (Go)

```bash
cd server-agent
go mod download
go run .
```

### Dashboard (React)

```bash
cd dashboard
pnpm install
pnpm dev
```

## License

MIT

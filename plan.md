# Server Monitoring Tool - Implementation Plan

## Overview

A two-part server monitoring system:
1. **Go daemon** running on Ubuntu server collecting system metrics
2. **React dashboard** for visualizing metrics with time-range queries
3. **Turso** (edge SQLite) as the cloud database

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Ubuntu Server  │     │     Turso       │     │ React Dashboard │
│                 │     │   (libSQL)      │     │                 │
│  ┌───────────┐  │     │                 │     │  ┌───────────┐  │
│  │ Go Daemon │──┼────▶│  metrics.db     │◀────┼──│  Charts   │  │
│  │ (gopsutil)│  │     │                 │     │  │ (Recharts)│  │
│  └───────────┘  │     │  - cpu          │     │  └───────────┘  │
│                 │     │  - memory       │     │                 │
│  Every 5 sec    │     │  - disk         │     │  Basic Auth     │
│                 │     │  - network      │     │                 │
└─────────────────┘     │  - processes    │     └─────────────────┘
                        │  - swap         │
                        └─────────────────┘
```

---

## Part 1: Go Daemon (`server-agent/`)

### Technology Stack
- **Go 1.21+**
- **gopsutil/v4** - System metrics collection (no cgo, cross-platform)
- **go-libsql** - Turso's Go driver
- No web framework needed - simple scheduled goroutine

### Metrics Collected

| Metric | gopsutil Package | Data Points |
|--------|------------------|-------------|
| CPU | `cpu` | Per-core usage %, load averages |
| Memory | `mem` | Total, used, available, cached |
| Swap | `mem` | Total, used, free |
| Disk Usage | `disk` | Per-partition used/free/total |
| Disk I/O | `disk` | Read/write bytes, IOPS |
| Network | `net` | Bytes sent/received per interface |
| Top Processes | `process` | Top 10 by CPU/memory |

### Project Structure

```
server-agent/
├── main.go              # Entry point, scheduler
├── collector/
│   ├── types.go         # Metric structs
│   ├── cpu.go
│   ├── memory.go
│   ├── disk.go
│   ├── network.go
│   └── process.go
├── storage/
│   └── turso.go         # Turso client wrapper
├── config/
│   └── config.go        # Configuration (env vars)
├── go.mod
└── go.sum
```

### Configuration (Environment Variables)

```bash
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
COLLECTION_INTERVAL=5s
HOSTNAME=my-server          # Optional, auto-detected
```

### Implementation Approach

**Custom solution** (no framework) - A simple daemon doesn't need Chi/Fiber/Echo. The standard library is sufficient:

```go
// Simplified main.go structure
func main() {
    // Load config
    // Initialize Turso client
    // Start collection ticker
    ticker := time.NewTicker(5 * time.Second)
    for range ticker.C {
        metrics := collectAll()
        storage.Push(metrics)
    }
}
```

---

## Part 2: Database Schema (Turso/libSQL)

### Tables

```sql
-- System identification
CREATE TABLE servers (
    id TEXT PRIMARY KEY,
    hostname TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

-- CPU metrics (aggregated)
CREATE TABLE cpu_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    usage_percent REAL NOT NULL,
    load_1m REAL,
    load_5m REAL,
    load_15m REAL,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Memory metrics
CREATE TABLE memory_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    total_bytes INTEGER NOT NULL,
    used_bytes INTEGER NOT NULL,
    available_bytes INTEGER NOT NULL,
    cached_bytes INTEGER,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Swap metrics
CREATE TABLE swap_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    total_bytes INTEGER NOT NULL,
    used_bytes INTEGER NOT NULL,
    free_bytes INTEGER NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Disk usage (per partition)
CREATE TABLE disk_usage_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    mount_point TEXT NOT NULL,
    total_bytes INTEGER NOT NULL,
    used_bytes INTEGER NOT NULL,
    free_bytes INTEGER NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Disk I/O
CREATE TABLE disk_io_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    device TEXT NOT NULL,
    read_bytes INTEGER NOT NULL,
    write_bytes INTEGER NOT NULL,
    read_count INTEGER,
    write_count INTEGER,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Network metrics (per interface)
CREATE TABLE network_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    interface TEXT NOT NULL,
    bytes_sent INTEGER NOT NULL,
    bytes_recv INTEGER NOT NULL,
    packets_sent INTEGER,
    packets_recv INTEGER,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Top processes snapshot
CREATE TABLE process_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    pid INTEGER NOT NULL,
    name TEXT NOT NULL,
    cpu_percent REAL NOT NULL,
    memory_percent REAL NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Indexes for time-range queries
CREATE INDEX idx_cpu_timestamp ON cpu_metrics(server_id, timestamp);
CREATE INDEX idx_memory_timestamp ON memory_metrics(server_id, timestamp);
CREATE INDEX idx_swap_timestamp ON swap_metrics(server_id, timestamp);
CREATE INDEX idx_disk_usage_timestamp ON disk_usage_metrics(server_id, timestamp);
CREATE INDEX idx_disk_io_timestamp ON disk_io_metrics(server_id, timestamp);
CREATE INDEX idx_network_timestamp ON network_metrics(server_id, timestamp);
CREATE INDEX idx_process_timestamp ON process_metrics(server_id, timestamp);
```

---

## Part 3: React Dashboard (`dashboard/`)

### Technology Stack
- **React 18** with TypeScript
- **Vite** - Build tool
- **Recharts** - Charting library (React-native, good for time series)
- **@libsql/client** - Turso client for browser
- **TailwindCSS** - Styling
- **date-fns** - Date handling for time range queries

### Project Structure

```
dashboard/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── charts/
│   │   │   ├── CPUChart.tsx
│   │   │   ├── MemoryChart.tsx
│   │   │   ├── SwapChart.tsx
│   │   │   ├── DiskUsageChart.tsx
│   │   │   ├── DiskIOChart.tsx
│   │   │   ├── NetworkChart.tsx
│   │   │   └── ProcessList.tsx
│   │   ├── TimeRangeSelector.tsx
│   │   ├── ServerSelector.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── MetricCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   └── Login.tsx
│   ├── hooks/
│   │   └── useMetrics.ts
│   ├── lib/
│   │   ├── turso.ts
│   │   └── auth.ts
│   └── types/
│       └── metrics.ts
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Features
1. **Time Range Selection**: Last hour, 6h, 24h, 7 days, 30 days, custom
2. **Auto-refresh**: Poll for new data every 5-10 seconds
3. **Multiple Servers**: Support viewing different monitored servers
4. **Basic Auth**: Simple middleware/protected route

### Basic Auth Implementation
- Environment variable for username/password hash
- Protected route wrapper
- Simple login form storing token in localStorage

---

## Implementation Phases

### Phase 1: Go Daemon
1. Initialize Go module and install dependencies (gopsutil, go-libsql)
2. Create config loader from environment variables
3. Implement metric collectors (cpu, memory, disk, network, processes)
4. Implement Turso storage client
5. Create main scheduler loop
6. Add graceful shutdown handling
7. Create systemd service file for Ubuntu

### Phase 2: Database Setup
1. Create Turso database via CLI/dashboard
2. Run schema migrations
3. Test connectivity from Go daemon

### Phase 3: React Dashboard
1. Scaffold React + Vite + TypeScript project
2. Set up TailwindCSS
3. Implement Turso client connection
4. Build chart components with Recharts
5. Add time range selector
6. Implement basic auth
7. Add auto-refresh functionality

### Phase 4: Testing & Quality
1. Write Go tests for collectors and storage
2. Set up golangci-lint for Go
3. Write React component tests with Vitest
4. Set up ESLint and TypeScript checks

### Phase 5: Deployment
1. Build Go binary for Linux AMD64
2. Create systemd service file
3. Deploy dashboard (Vercel/Netlify/self-hosted)
4. Configure environment variables

---

## Verification Plan

1. **Daemon Testing**:
   - Run daemon locally, verify metrics appear in Turso
   - Check all metric types are collected
   - Verify 5-second interval timing

2. **Dashboard Testing**:
   - Verify charts render with real data
   - Test time range filtering
   - Test basic auth login/logout
   - Check auto-refresh works

3. **End-to-End**:
   - Deploy daemon on Ubuntu server
   - Verify data flows through to dashboard
   - Test historical queries work correctly

---

## Files to Create

### Go Daemon
- `server-agent/main.go`
- `server-agent/collector/types.go`
- `server-agent/collector/cpu.go`
- `server-agent/collector/memory.go`
- `server-agent/collector/disk.go`
- `server-agent/collector/network.go`
- `server-agent/collector/process.go`
- `server-agent/storage/turso.go`
- `server-agent/config/config.go`
- `server-agent/server-agent.service` (systemd)

### Dashboard
- `dashboard/src/main.tsx`
- `dashboard/src/App.tsx`
- `dashboard/src/components/charts/*.tsx` (7 files)
- `dashboard/src/components/*.tsx` (7 files)
- `dashboard/src/pages/*.tsx` (2 files)
- `dashboard/src/hooks/useMetrics.ts`
- `dashboard/src/lib/turso.ts`
- `dashboard/src/lib/auth.ts`
- `dashboard/src/types/metrics.ts`

### Shared
- `schema.sql` (database schema)

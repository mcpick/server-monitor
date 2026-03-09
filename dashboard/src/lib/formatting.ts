export function formatBytes(bytes: number): string {
    const tb = bytes / (1024 * 1024 * 1024 * 1024);
    if (tb >= 1) {
        return `${tb.toFixed(1)} TB`;
    }
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
        return `${gb.toFixed(1)} GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
}

export function formatRate(bytesPerSecond: number): string {
    const mbps = bytesPerSecond / (1024 * 1024);
    if (mbps >= 1) {
        return `${mbps.toFixed(1)} MB/s`;
    }
    const kbps = bytesPerSecond / 1024;
    return `${kbps.toFixed(0)} KB/s`;
}

export function getStatusColor(percent: number): string {
    if (percent > 50) {
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
    }
    if (percent > 25) {
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
    }
    return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
}

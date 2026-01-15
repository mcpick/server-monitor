# Server Monitor Dashboard

A React dashboard for visualizing server metrics collected by the server-agent.

## Development

```bash
# Install dependencies
pnpm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your credentials

# Start development server
pnpm dev

# Run tests
pnpm test

# Run linter
pnpm lint
```

## Building for Production

```bash
# Build production bundle
pnpm build

# Preview production build locally
pnpm preview
```

## Deployment

### Environment Variables

All environment variables must be prefixed with `VITE_` to be available in the browser.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_TURSO_DATABASE_URL` | Yes | Turso database URL |
| `VITE_TURSO_AUTH_TOKEN` | Yes | Turso authentication token |
| `VITE_AUTH_USERNAME` | Yes | Login username |
| `VITE_AUTH_PASSWORD_HASH` | Yes | SHA-256 hash of login password |

### Generate Password Hash

```bash
echo -n "your-password" | shasum -a 256 | cut -d' ' -f1
```

### Deploy to Vercel

1. Connect your repository to Vercel
2. Set the environment variables in the Vercel dashboard
3. Deploy

### Deploy to Netlify

1. Connect your repository to Netlify
2. Set build command: `pnpm build`
3. Set publish directory: `dist`
4. Set environment variables in the Netlify dashboard
5. Deploy

### Self-Hosted (Nginx)

1. Build the production bundle:
   ```bash
   pnpm build
   ```

2. Copy `dist/` to your web server:
   ```bash
   scp -r dist/* user@server:/var/www/dashboard/
   ```

3. Configure Nginx:
   ```nginx
   server {
       listen 80;
       server_name dashboard.example.com;
       root /var/www/dashboard;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

## Stack

- React 19
- TypeScript
- Vite
- TailwindCSS v4
- Recharts
- libSQL (Turso)

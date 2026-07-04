# Deployment Guide - AG Agent Social Media

## Prerequisites
- Docker and Docker Compose installed
- Environment variables configured

## Google Cloud Run (primary target)

### 1. One-time setup
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com
gcloud artifacts repositories create fourdoor --repository-format=docker --location=europe-west1
```

### 2. Build and push the image
```bash
gcloud auth configure-docker europe-west1-docker.pkg.dev
docker build -t europe-west1-docker.pkg.dev/YOUR_PROJECT_ID/fourdoor/app:latest .
docker push europe-west1-docker.pkg.dev/YOUR_PROJECT_ID/fourdoor/app:latest
```

### 3. Deploy
```bash
gcloud run deploy fourdoor-app \
  --image europe-west1-docker.pkg.dev/YOUR_PROJECT_ID/fourdoor/app:latest \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,APP_URL=https://your-domain.com \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest,PAYPAL_CLIENT_SECRET=PAYPAL_CLIENT_SECRET:latest
```
Store all secrets in Secret Manager (`gcloud secrets create ...`) rather than plain env vars. Cloud Run injects `PORT` automatically — the server reads it.

### 4. Required secrets checklist
GEMINI_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID, PAYPAL_PLAN_ID_* (3), LINKEDIN/FACEBOOK/X/TIKTOK client secrets, CRON_SECRET. `VITE_*` variables are baked in at build time — pass them as `--build-arg` or set them in the environment before `docker build`.

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in your API keys and secrets:
```bash
cp .env.example .env
```

### 3. Run development server
```bash
npm run dev
```

App runs on `http://localhost:3000`

## Docker Deployment

### Quick Start with Compose

```bash
# Build and run
docker compose up --build

# Run in background
docker compose up -d

# View logs
docker compose logs -f app

# Stop
docker compose down
```

### Build Docker Image

```bash
docker build -t ag-agent-socialmedia:latest .
```

### Run Container

```bash
docker run -d \
  --name ag-agent \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY=your_key \
  -e PAYPAL_CLIENT_SECRET=your_secret \
  -e PAYPAL_WEBHOOK_ID=your_id \
  -e TIKTOK_CLIENT_KEY=your_key \
  -e TIKTOK_CLIENT_SECRET=your_secret \
  -e APP_URL=https://your-domain.com \
  -v $(pwd)/firebase-applet-config.json:/app/firebase-applet-config.json:ro \
  ag-agent-socialmedia:latest
```

## Environment Variables

### Required for Production
- `PAYPAL_CLIENT_SECRET` - PayPal secret
- `PAYPAL_WEBHOOK_ID` - PayPal webhook ID
- `TIKTOK_CLIENT_KEY` - TikTok client key
- `TIKTOK_CLIENT_SECRET` - TikTok client secret

### OAuth Configuration
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_FACEBOOK_APP_ID`
- `VITE_LINKEDIN_CLIENT_ID`
- `VITE_X_CLIENT_ID`
- `VITE_TIKTOK_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `FACEBOOK_CLIENT_SECRET`
- `X_CLIENT_SECRET`
- `TIKTOK_CLIENT_SECRET`

### AI APIs
- `GEMINI_API_KEY` - Google Gemini API key
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic Claude API key

### PayPal
- `VITE_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_PLAN_ID_STARTER`
- `PAYPAL_PLAN_ID_PRO`
- `PAYPAL_PLAN_ID_AGENCY`

## Firebase Configuration

The app requires `firebase-applet-config.json` in the root directory. Mount it in production:

```bash
-v $(pwd)/firebase-applet-config.json:/app/firebase-applet-config.json:ro
```

## Health Check

```bash
curl http://localhost:3000/api/health
```

## Troubleshooting

### Port already in use
```bash
# Change port in docker-compose.yml or use
docker run -p 8080:3000 ag-agent-socialmedia:latest
```

### Build issues
```bash
# Clean build
docker build --no-cache -t ag-agent-socialmedia:latest .
```

### Container exits immediately
```bash
# Check logs
docker logs container_name

# Check environment variables
docker run --env-file .env ag-agent-socialmedia:latest
```

## Production Deployment

### Using Docker Compose (single host)

```yaml
# .env.production
NODE_ENV=production
GEMINI_API_KEY=your_prod_key
APP_URL=https://your-domain.com
# ... all required secrets
```

### Using Kubernetes

```bash
kubectl create configmap ag-config --from-file=firebase-applet-config.json
kubectl create secret generic ag-secrets --from-env-file=.env.production
kubectl apply -f deployment.yaml
```

### Using Docker Swarm

```bash
docker swarm init
docker service create \
  --name ag-agent \
  --publish 3000:3000 \
  --env-file .env.production \
  ag-agent-socialmedia:latest
```

## Available Scripts

- `npm run dev` - Development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Type check

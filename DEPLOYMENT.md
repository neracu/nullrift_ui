# NullRift UI - Deployment Guide

Complete guide for deploying NullRift UI to production.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Build Configuration](#build-configuration)
4. [Deployment Platforms](#deployment-platforms)
5. [Post-Deployment](#post-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required
- Node.js 18+ installed
- npm or yarn package manager
- IBM watsonx.ai API credentials
- Git repository access

### Recommended
- Domain name (for custom domain)
- SSL certificate (usually provided by platform)
- Error tracking service (Sentry, etc.)
- Analytics service (Google Analytics, Plausible, etc.)

---

## Environment Variables

### Required Variables

Create a `.env.production` file with the following variables:

```env
# watsonx.ai Configuration (REQUIRED)
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# Next.js Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Optional Variables

```env
# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com

# Error Tracking (Optional)
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_token

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
```

### Environment Variable Security

**⚠️ IMPORTANT:**
- Never commit `.env` files to version control
- Use platform-specific environment variable management
- Rotate API keys regularly
- Use different keys for staging and production

---

## Build Configuration

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Run Type Check

```bash
npm run type-check
```

### 3. Run Linter

```bash
npm run lint
```

### 4. Build for Production

```bash
npm run build
```

### 5. Test Production Build Locally

```bash
npm start
```

Visit `http://localhost:3000` to verify the build.

---

## Deployment Platforms

### Vercel (Recommended)

Vercel is the recommended platform for Next.js applications.

#### Deploy via Vercel CLI

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

#### Deploy via GitHub Integration

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

2. **Configure Project:**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all required variables
   - Separate variables for Production, Preview, and Development

4. **Deploy:**
   - Push to main branch
   - Vercel automatically deploys

#### Custom Domain on Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

---

### Netlify

#### Deploy via Netlify CLI

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login:**
```bash
netlify login
```

3. **Initialize:**
```bash
netlify init
```

4. **Deploy:**
```bash
netlify deploy --prod
```

#### Deploy via Git Integration

1. **Connect Repository:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18

3. **Environment Variables:**
   - Go to Site Settings → Environment Variables
   - Add all required variables

4. **Deploy:**
   - Push to main branch
   - Netlify automatically builds and deploys

---

### AWS Amplify

#### Deploy via AWS Console

1. **Connect Repository:**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your Git provider

2. **Configure Build:**
   - App name: nullrift-ui
   - Environment: production
   - Build settings: Auto-detected (Next.js)

3. **Environment Variables:**
   - Add all required variables in Amplify Console

4. **Deploy:**
   - Save and deploy
   - AWS Amplify builds and deploys automatically

#### Custom Domain on AWS Amplify

1. Go to App Settings → Domain management
2. Add domain
3. Configure DNS records
4. Wait for SSL certificate

---

### Docker Deployment

#### Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  nullrift-ui:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - WATSONX_API_KEY=${WATSONX_API_KEY}
      - WATSONX_PROJECT_ID=${WATSONX_PROJECT_ID}
      - WATSONX_URL=${WATSONX_URL}
    restart: unless-stopped
```

#### Deploy with Docker

```bash
# Build image
docker build -t nullrift-ui .

# Run container
docker run -p 3000:3000 \
  -e WATSONX_API_KEY=your_key \
  -e WATSONX_PROJECT_ID=your_project \
  -e WATSONX_URL=your_url \
  nullrift-ui

# Or use docker-compose
docker-compose up -d
```

---

## Post-Deployment

### 1. Verify Deployment

**Check Health Endpoint:**
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-16T09:00:00.000Z",
  "version": "1.0.0"
}
```

**Test Key Features:**
- [ ] Landing page loads
- [ ] Builder page accessible
- [ ] Component generation works
- [ ] Export functionality works
- [ ] All API endpoints respond

### 2. Configure DNS

**For Custom Domain:**
1. Add A record pointing to your server IP
2. Add CNAME record for www subdomain
3. Wait for DNS propagation (up to 48 hours)
4. Verify with `dig your-domain.com`

### 3. SSL Certificate

**Automatic (Recommended):**
- Vercel, Netlify, and AWS Amplify provide automatic SSL
- Certificate auto-renews

**Manual (if needed):**
- Use Let's Encrypt for free SSL
- Configure certificate in your web server
- Set up auto-renewal

### 4. Performance Optimization

**Enable Caching:**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

**Enable Compression:**
- Vercel and Netlify enable this by default
- For custom servers, enable gzip/brotli compression

---

## Monitoring & Maintenance

### Error Tracking

#### Sentry Integration

1. **Install Sentry:**
```bash
npm install @sentry/nextjs
```

2. **Configure Sentry:**
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

3. **Add to Environment Variables:**
```env
SENTRY_DSN=your_sentry_dsn
```

### Analytics

#### Google Analytics

1. **Add GA Script:**
```javascript
// app/layout.tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
```

2. **Add Environment Variable:**
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Performance Monitoring

**Vercel Analytics:**
- Automatically enabled on Vercel
- View in Vercel Dashboard

**Lighthouse CI:**
```bash
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage
```

### Uptime Monitoring

**Recommended Services:**
- UptimeRobot (free)
- Pingdom
- StatusCake
- Better Uptime

**Setup:**
1. Create account
2. Add your domain
3. Set check interval (5 minutes recommended)
4. Configure alerts (email, SMS, Slack)

---

## Troubleshooting

### Build Failures

**Issue: Type errors during build**
```bash
# Solution: Run type check locally
npm run type-check
# Fix all TypeScript errors before deploying
```

**Issue: Missing environment variables**
```bash
# Solution: Verify all required variables are set
# Check platform-specific environment variable settings
```

**Issue: Out of memory during build**
```bash
# Solution: Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Runtime Errors

**Issue: API calls failing**
- Verify environment variables are set correctly
- Check watsonx.ai API key is valid
- Verify network connectivity
- Check API rate limits

**Issue: 404 errors**
- Verify build output directory
- Check routing configuration
- Ensure all pages are built correctly

**Issue: Slow performance**
- Enable caching headers
- Optimize images
- Check bundle size
- Enable compression

### Deployment Issues

**Issue: Deployment stuck**
- Check build logs for errors
- Verify Git repository access
- Check platform status page
- Contact platform support

**Issue: Domain not resolving**
- Verify DNS records
- Wait for DNS propagation
- Check nameserver configuration
- Use DNS checker tools

---

## Rollback Procedure

### Vercel
1. Go to Deployments
2. Find previous successful deployment
3. Click "Promote to Production"

### Netlify
1. Go to Deploys
2. Find previous deploy
3. Click "Publish deploy"

### Git-based
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

---

## Security Checklist

- [ ] Environment variables secured
- [ ] API keys rotated regularly
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation in place
- [ ] Dependencies updated
- [ ] Vulnerability scanning enabled

---

## Maintenance Schedule

### Daily
- Monitor error rates
- Check uptime status
- Review performance metrics

### Weekly
- Review analytics
- Check for dependency updates
- Monitor API usage

### Monthly
- Security audit
- Performance optimization
- Backup verification
- Cost review

### Quarterly
- Major dependency updates
- Security penetration testing
- Disaster recovery drill
- Documentation review

---

## Support & Resources

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [watsonx.ai Documentation](https://www.ibm.com/docs/en/watsonx-as-a-service)

### Community
- GitHub Issues
- Discord Server
- Stack Overflow

### Emergency Contacts
- Platform Support
- watsonx.ai Support
- DevOps Team

---

**Made with ❤️ by Bob**

*This deployment guide ensures a smooth, secure, and reliable deployment of NullRift UI to production.*
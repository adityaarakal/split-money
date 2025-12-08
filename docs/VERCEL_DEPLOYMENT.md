# Vercel Deployment Guide

## 🚀 Deployment to Vercel

The Split Money PWA is deployed to **Vercel** for fast, global CDN distribution.

---

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Integration**: Connect your GitHub account to Vercel
3. **Repository Access**: Grant Vercel access to `adityaarakal/split-money`

---

## 🔧 Setup Instructions

### Option 1: Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Select `adityaarakal/split-money` repository
   - Click "Import"

2. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: ⚠️ **IMPORTANT**: Leave empty/blank (root of repository)
     - If you see `frontend` here, **DELETE IT** - this will cause deployment failures
     - Dashboard settings override `vercel.json` for Root Directory
   - **Build Command**: `npm run build` (auto-filled from `vercel.json`)
   - **Output Directory**: `dist` (auto-filled from `vercel.json`)
   - **Install Command**: `npm install --ignore-scripts` (auto-filled from `vercel.json`)

3. **Environment Variables** (if needed)
   - Add any required environment variables
   - Click "Deploy"

### Option 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Production Deploy**
   ```bash
   vercel --prod
   ```

---

## ⚙️ Configuration

### vercel.json

The project includes a `vercel.json` configuration file:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install --ignore-scripts",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Key Settings

- **Build Command**: Builds the PWA
- **Output Directory**: `dist` (Vite build output)
- **Rewrites**: SPA routing support (all routes → index.html)
- **Headers**: Service worker and asset caching configuration

---

## 🔄 Automatic Deployment

### Deployment Triggers

Vercel automatically deploys on:

1. **Push to `main` branch**
   - Creates production deployment
   - URL: `https://split-money.vercel.app` (or custom domain)

2. **Pull Requests**
   - Creates preview deployment
   - URL: `https://split-money-git-<branch>-<username>.vercel.app`

3. **Manual Deployment**
   - Via Vercel dashboard or CLI

### Deployment Status

- Check deployment status in Vercel dashboard
- GitHub integration shows deployment status in PRs
- Deployment logs available in Vercel dashboard

---

## 🌐 Custom Domain

### Setup Custom Domain

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `splitmoney.app`)

2. **Configure DNS**
   - Add CNAME record pointing to Vercel
   - Or use A record for apex domain

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - HTTPS enabled by default

---

## 📊 Performance

### Vercel Benefits

- **Global CDN**: Fast content delivery worldwide
- **Edge Network**: Low latency for all users
- **Automatic HTTPS**: SSL certificates managed automatically
- **Preview Deployments**: Test PRs before merging
- **Analytics**: Built-in performance monitoring

### Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Performance**: > 90
- **Core Web Vitals**: All green

---

## 🔍 Monitoring

### Vercel Analytics

- **Web Analytics**: Track page views and performance
- **Speed Insights**: Monitor Core Web Vitals
- **Real User Monitoring**: Track actual user performance

### Lighthouse CI

- Runs after deployment (via GitHub Actions)
- Validates performance, accessibility, PWA, SEO
- See `.github/workflows/lighthouse.yml`

---

## 🐛 Troubleshooting

### Build Failures

1. **Root Directory Error**
   - **Error**: `The specified Root Directory "frontend" does not exist`
   - **Fix**: Go to Project Settings → General → Root Directory → Clear/Delete the value
   - **See**: `docs/FIX_VERCEL_ROOT_DIRECTORY.md` for detailed instructions
   - Dashboard settings override `vercel.json` for Root Directory

2. **Check Build Logs**
   - View logs in Vercel dashboard
   - Check for dependency issues

3. **Local Build Test**
   ```bash
   npm run build
   ```

4. **Environment Variables**
   - Ensure all required env vars are set in Vercel

### Service Worker Issues

- **Cache Headers**: Configured in `vercel.json`
- **Service Worker Path**: Must be at root (`/sw.js`)
- **Update Strategy**: Service worker updates automatically

### Routing Issues

- **SPA Routing**: Handled by rewrites in `vercel.json`
- **404 Errors**: Should redirect to `index.html`

---

## 📝 Deployment Checklist

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project imported in Vercel
- [ ] Build settings configured
- [ ] Environment variables set (if needed)
- [ ] Custom domain configured (optional)
- [ ] First deployment successful
- [ ] Lighthouse CI configured
- [ ] Monitoring enabled

---

## 🔗 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [PWA Deployment Best Practices](https://web.dev/pwa-checklist/)

---

**Deployment Platform**: Vercel  
**Status**: Configured and ready  
**Last Updated**: 2024-12-06


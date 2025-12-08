# Vercel Deployment Troubleshooting Guide

## 🚨 Common Errors and Solutions

### 1. Root Directory Error

**Error:**
```
The specified Root Directory "frontend" does not exist. Please update your Project Settings.
```

**Solution:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`split-money` or `split-money-frontend`)
3. Go to **Settings** → **General**
4. Find **Root Directory** field
5. **DELETE/CLEAR** the value (make it empty/blank)
6. Click **Save**
7. Vercel will auto-redeploy

**Why:** Dashboard settings override `vercel.json` for Root Directory.

---

### 2. Build Command Not Found

**Error:**
```
Command "npm run build" exited with 1
```

**Solution:**
1. **Verify local build works:**
   ```bash
   npm install
   npm run build
   ```

2. **Check Vercel Settings:**
   - Settings → General → Build Command
   - Should be: `npm run build`
   - If different, update to `npm run build`

3. **Check package.json scripts:**
   - Ensure `"build": "tsc && vite build"` exists in `package.json`

---

### 3. Output Directory Not Found

**Error:**
```
No Output Directory named "dist" found after the Build completed.
```

**Solution:**
1. **Verify build creates `dist/` folder:**
   ```bash
   npm run build
   ls -la dist/
   ```

2. **Check Vercel Settings:**
   - Settings → General → Output Directory
   - Should be: `dist`
   - If different, update to `dist`

3. **Check vercel.json:**
   - Ensure `"outputDirectory": "dist"` is set

---

### 4. Install Command Fails

**Error:**
```
Command "npm install" exited with 1
```

**Solution:**
1. **Check Vercel Settings:**
   - Settings → General → Install Command
   - Should be: `npm install --ignore-scripts`
   - This prevents Husky from failing in CI

2. **If using vercel.json:**
   - Ensure `"installCommand": "npm install --ignore-scripts"` is set

---

### 5. Framework Detection Issues

**Error:**
```
Framework not detected
```

**Solution:**
1. **Set Framework explicitly:**
   - Settings → General → Framework Preset
   - Select: **Vite**
   - Or leave as **Other** if Vite not available

2. **Check vercel.json:**
   - Ensure `"framework": "vite"` is set

---

### 6. Node.js Version Issues

**Error:**
```
Unsupported Node.js version
```

**Solution:**
1. **Set Node.js version in Vercel:**
   - Settings → General → Node.js Version
   - Select: **18.x** or **20.x** (recommended)

2. **Or add `.nvmrc` file:**
   ```bash
   echo "20" > .nvmrc
   git add .nvmrc
   git commit -m "chore: Set Node.js version to 20"
   git push
   ```

---

### 7. Environment Variables Missing

**Error:**
```
Environment variable not found
```

**Solution:**
1. Go to Settings → Environment Variables
2. Add required variables:
   - `NODE_ENV=production` (usually auto-set)
   - Add any custom variables your app needs

---

### 8. Service Worker Issues

**Error:**
```
Service worker registration failed
```

**Solution:**
1. **Check vercel.json headers:**
   - Ensure `/sw.js` has correct Cache-Control headers
   - Already configured in `vercel.json`

2. **Verify service worker path:**
   - Service worker should be at `/sw.js` (root)
   - Check `vite.config.ts` PWA plugin configuration

---

## 🔍 Diagnostic Steps

### Step 1: Verify Local Build

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Build
npm run build

# Verify dist folder exists
ls -la dist/
```

**Expected:** `dist/` folder with `index.html`, `assets/`, `sw.js`, etc.

---

### Step 2: Check Vercel Configuration

1. **Dashboard Settings:**
   - Root Directory: *(empty/blank)*
   - Framework Preset: Vite (or Other)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install --ignore-scripts`
   - Node.js Version: 18.x or 20.x

2. **vercel.json:**
   - Should match dashboard settings
   - Located at project root

---

### Step 3: Check Build Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the failed deployment
3. Click **Build Logs** tab
4. Look for:
   - Error messages
   - Which step failed (Install, Build, Deploy)
   - Node.js version used
   - Commands executed

---

### Step 4: Test with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (will show what Vercel detects)
vercel

# Production deploy
vercel --prod
```

This helps identify configuration mismatches.

---

## ✅ Quick Fix Checklist

- [ ] Root Directory is **empty/blank** in Vercel dashboard
- [ ] Build Command is `npm run build`
- [ ] Output Directory is `dist`
- [ ] Install Command is `npm install --ignore-scripts`
- [ ] Node.js version is 18.x or 20.x
- [ ] Local build succeeds (`npm run build`)
- [ ] `dist/` folder is created locally
- [ ] `vercel.json` exists and is correct
- [ ] No environment variables missing
- [ ] Framework is set to Vite (or auto-detected)

---

## 🆘 Still Failing?

If deployment still fails after checking all above:

1. **Share Build Logs:**
   - Copy the full error from Vercel dashboard
   - Include the step that failed (Install/Build/Deploy)

2. **Check Repository:**
   - Ensure code is pushed to `main` branch
   - Verify `vercel.json` is committed
   - Check `package.json` has correct scripts

3. **Try Manual Redeploy:**
   - Vercel Dashboard → Deployments → Click "..." → Redeploy
   - Or trigger via: `git commit --allow-empty -m "trigger redeploy" && git push`

4. **Contact Support:**
   - Vercel Support: [vercel.com/support](https://vercel.com/support)
   - Include: Project name, error logs, configuration screenshots

---

## 📋 Current Configuration

**vercel.json:**
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install --ignore-scripts",
  "framework": "vite"
}
```

**Expected Dashboard Settings:**
- Root Directory: *(empty)*
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install --ignore-scripts`
- Framework: Vite
- Node.js: 18.x or 20.x

---

**Last Updated:** 2024-12-08  
**Status:** Active troubleshooting guide


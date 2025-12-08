# 🚀 Fresh Vercel Deployment Setup

## Step 1: Delete Old Vercel Project

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Find Your Project**
   - Look for: `split-money` or `split-money-frontend`
   - Click on it

3. **Delete Project**
   - Go to **Settings** → Scroll to bottom
   - Click **Delete Project**
   - Confirm deletion
   - ✅ Old project with wrong settings is gone

---

## Step 2: Create New Vercel Project

1. **Import Project**
   - Click **Add New Project** (or **New Project**)
   - Select repository: `adityaarakal/split-money`
   - Click **Import**

2. **Configure Project Settings**

   **Framework Preset:**
   - Select: **Vite** (or **Other** if Vite not available)

   **Root Directory:**
   - ⚠️ **LEAVE EMPTY/BLANK** (this is critical!)
   - Do NOT enter anything here
   - Empty = root of repository ✅

   **Build Command:**
   - `npm run build`
   - (Should auto-detect from `vercel.json`)

   **Output Directory:**
   - `dist`
   - (Should auto-detect from `vercel.json`)

   **Install Command:**
   - `npm install --ignore-scripts`
   - (Should auto-detect from `vercel.json`)

   **Node.js Version:**
   - Select: **20.x** (or 18.x)
   - (Can also use `.nvmrc` file - already in repo)

3. **Environment Variables**
   - Add any required env vars (if needed)
   - For now, leave empty

4. **Deploy**
   - Click **Deploy**
   - ✅ Fresh deployment starts!

---

## Step 3: Verify Deployment

1. **Watch Build Logs**
   - Should NOT see "Root Directory 'frontend' does not exist"
   - Build should proceed normally
   - Should complete successfully

2. **Check Deployment URL**
   - Once deployed, visit the provided URL
   - Site should load correctly

---

## ✅ What's Already Configured

Your `vercel.json` is already correct:
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ Install command: `npm install --ignore-scripts`
- ✅ Framework: `vite`
- ✅ SPA rewrites configured
- ✅ Service worker headers configured

**You just need to create a fresh project in the dashboard!**

---

## 🎯 Quick Checklist

- [ ] Deleted old Vercel project
- [ ] Created new project from GitHub repo
- [ ] Root Directory is **EMPTY/BLANK** ✅
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install --ignore-scripts`
- [ ] Node.js: 20.x
- [ ] Clicked Deploy
- [ ] Build succeeded ✅
- [ ] Site is accessible ✅

---

## 📝 Why This Works

- **Fresh project** = No old "frontend" Root Directory setting
- **Empty Root Directory** = Uses repository root (correct!)
- **vercel.json** = Already configured correctly
- **Clean slate** = No legacy configuration issues

---

**Time Required:** 2-3 minutes  
**Result:** Clean, working Vercel deployment ✅



# Fix Vercel Root Directory Error

## 🚨 Problem

Vercel deployment is failing with the error:
```
The specified Root Directory "frontend" does not exist. Please update your Project Settings.
```

This happens because Vercel's **Project Settings** in the dashboard override the `vercel.json` file for the Root Directory setting.

---

## ✅ Solution

You need to manually update the Root Directory setting in the Vercel dashboard.

### Steps to Fix:

1. **Go to Vercel Dashboard**
   - Navigate to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project: `split-money` or `split-money-frontend`

2. **Open Project Settings**
   - Click on your project
   - Go to **Settings** tab
   - Scroll down to **General** section

3. **Update Root Directory**
   - Find the **Root Directory** field
   - **Clear/Delete** the value `frontend` (make it empty)
   - Leave it **blank** (root of repository)
   - Click **Save**

4. **Redeploy**
   - After saving, Vercel will automatically trigger a new deployment
   - Or manually click **Redeploy** from the Deployments page

---

## 📋 Expected Settings

After fixing, your Vercel project settings should be:

- **Framework Preset**: Vite (or auto-detected)
- **Root Directory**: *(empty/blank)*
- **Build Command**: `npm run build` (from `vercel.json`)
- **Output Directory**: `dist` (from `vercel.json`)
- **Install Command**: `npm install --ignore-scripts` (from `vercel.json`)

---

## 🔍 Verification

After updating the settings:

1. **Check Build Logs**
   - The build should start from the repository root
   - No more "Root Directory 'frontend' does not exist" error

2. **Verify Build Success**
   - Build should complete successfully
   - Deployment should be live

---

## 📝 Note

- The `vercel.json` file is already correctly configured
- The issue is only in the Vercel dashboard settings
- Dashboard settings take precedence over `vercel.json` for Root Directory
- Once cleared, `vercel.json` will handle all other settings

---

## 🔗 Related Files

- `vercel.json` - Already correctly configured
- `docs/VERCEL_DEPLOYMENT.md` - Full deployment guide

---

**Status**: Requires manual dashboard update  
**Priority**: High (blocks deployment)  
**Last Updated**: 2024-12-08


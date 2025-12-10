# 🚨 URGENT: Fix Vercel Root Directory Error

## The Error

```
The specified Root Directory "frontend" does not exist. Please update your Project Settings.
```

## ⚠️ CRITICAL: This Cannot Be Fixed in Code

**Root Directory is a Vercel Dashboard setting that overrides `vercel.json`.**

The `vercel.json` file is correct, but Vercel uses the dashboard setting which is still set to `"frontend"`.

---

## ✅ REQUIRED FIX (Takes 30 seconds)

**You MUST manually update the Vercel dashboard:**

### Step-by-Step Instructions:

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Login if needed

2. **Select Your Project**
   - Find and click: `split-money` or `split-money-frontend`
   - (Whichever project is failing)

3. **Open Settings**
   - Click the **Settings** tab (top navigation)

4. **Go to General Section**
   - Scroll down to **General** section

5. **Find Root Directory Field**
   - Look for **Root Directory** input field
   - Current value: `frontend` ❌

6. **Clear the Value**
   - **DELETE** the text `frontend`
   - **Leave it EMPTY/BLANK** ✅
   - Do NOT enter `.` or any other value

7. **Save**
   - Click **Save** button
   - Vercel will automatically trigger a new deployment

---

## 🔍 How to Verify It's Fixed

After saving:

1. **Check Deployment**
   - Go to **Deployments** tab
   - Latest deployment should show **Building** or **Ready**

2. **Check Build Logs**
   - Click on the latest deployment
   - Build Logs should NOT show "Root Directory 'frontend' does not exist"
   - Build should proceed normally

3. **Verify Site Works**
   - Once deployed, visit: https://split-money.vercel.app
   - Site should load correctly

---

## 📋 Why This Happens

- ✅ Code is correct (`vercel.json` is properly configured)
- ✅ Project structure is correct (no `frontend` folder)
- ❌ **Vercel dashboard still has old setting**

**Dashboard settings override `vercel.json` for Root Directory.**

---

## 🎯 Quick Checklist

- [ ] Logged into Vercel dashboard
- [ ] Selected correct project (`split-money` or `split-money-frontend`)
- [ ] Went to Settings → General
- [ ] Found Root Directory field
- [ ] Deleted `frontend` value (made it empty)
- [ ] Clicked Save
- [ ] Verified new deployment started
- [ ] Checked build logs - no Root Directory error

---

**Status:** ⚠️ REQUIRES MANUAL DASHBOARD UPDATE  
**Time Required:** 30 seconds  
**Priority:** CRITICAL - Blocks all deployments




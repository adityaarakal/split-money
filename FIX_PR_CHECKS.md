# Fix PR Checks - Manual Steps Required

## Issue
PR checks are failing because the workflow still has Android checks that try to run JDK/Gradle tasks.

## Solution
The enforcement files need to be unlocked to remove obsolete Android checks.

## Steps to Fix

### 1. Unlock Enforcement Files

Run this command and provide the reason when prompted:

```bash
bash scripts/unlock-enforcement.sh
```

**Reason to provide:**
```
Remove obsolete Android checks - Web PWA only project. Adding Web-only checks.
```

### 2. The workflow file has already been updated

The `.github/workflows/pr-checks.yml` file has been updated to remove all Android checks. After unlocking, restore it:

```bash
git stash pop
git add .github/workflows/pr-checks.yml
git commit -m "fix: Remove Android checks from PR workflow - Web PWA only"
git push
```

### 3. Fix Vercel Deployment

The Vercel deployments are failing. Check:
1. Vercel project settings - ensure `vercel.json` is being used
2. Build command should be: `cd frontend && npm run build`
3. Output directory should be: `frontend/dist`
4. Root directory should be: `.` (project root)

### 4. Update PR Title

Update the PR title to remove "Android app" reference:
```
feat: Initial project setup with React PWA frontend and Vercel deployment
```

## What Was Fixed

- ✅ Removed JDK setup step
- ✅ Removed Android linting checks  
- ✅ Removed Android Kotlin compilation checks
- ✅ Removed Android build validation
- ✅ Removed Android test checks
- ✅ Updated to frontend E2E tests (Playwright)
- ✅ Updated step numbering (5 steps -> 4 steps)

## Expected Result

After these fixes:
- ✅ PR Quality Checks should pass
- ✅ Vercel deployments should succeed
- ✅ All checks will be Web PWA focused


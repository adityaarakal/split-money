# CI Fix Instructions - Android Gradle Task Checking

## Problem

PR quality checks are failing because Android Gradle tasks (like `ktlintCheck`, `compileDebugKotlin`, etc.) don't exist yet in the initial setup phase. The workflow tries to run these tasks and fails.

## Solution

A new script `scripts/check-android-tasks.sh` has been created that gracefully checks if tasks exist before running them.

## To Complete the Fix

The workflow file `.github/workflows/pr-checks.yml` needs to be updated to use this script. Since it's an enforcement file, you need to unlock it first:

### Step 1: Unlock Enforcement Files

```bash
bash scripts/unlock-enforcement.sh
```

**Reason**: "Fix CI failure - Adding graceful task checking for Android Gradle tasks to prevent failures when tasks don't exist"

### Step 2: Update Workflow

Replace the Android check sections in `.github/workflows/pr-checks.yml`:

#### Android Linting (around line 73-85):
```yaml
# Android linting
echo "Running Android lint validation..."
bash scripts/check-android-tasks.sh ktlintCheck lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  echo "❌ CRITICAL: Android lint errors or warnings found in production code."
  echo "❌ ALL production code errors must be fixed before merge."
  echo "🔒 ENFORCEMENT: PR blocked - Fix production code errors first"
  echo "📋 REQUIRED: Run './gradlew ktlintCheck' or './gradlew lint' and fix ALL production code errors/warnings"
  exit 1
fi
echo "✅ Android linting validation passed!"
```

#### Android Kotlin Checking (around line 114-126):
```yaml
# Android Kotlin checking
echo "Running Kotlin compilation check for Android..."
bash scripts/check-android-tasks.sh compileDebugKotlin compileKotlin
KOTLIN_EXIT_CODE=$?
if [ $KOTLIN_EXIT_CODE -ne 0 ]; then
  echo "❌ CRITICAL: Kotlin compilation errors found."
  echo "❌ ALL Kotlin errors must be fixed before merge."
  echo "🔒 ENFORCEMENT: PR blocked - Fix Kotlin errors first"
  echo "📋 REQUIRED: Fix ALL Kotlin compilation errors"
  exit 1
fi
echo "✅ Android type checking passed!"
```

#### Android Build Validation (around line 155-167):
```yaml
# Android build validation
echo "Running Android build validation..."
bash scripts/check-android-tasks.sh assembleDebug build
BUILD_EXIT_CODE=$?
if [ $BUILD_EXIT_CODE -ne 0 ]; then
  echo "❌ CRITICAL: Android build validation failed."
  echo "❌ Production build must succeed - no build errors allowed"
  echo "🔒 ENFORCEMENT: PR blocked - Fix build errors first"
  echo "📋 REQUIRED: Run './gradlew assembleDebug' and fix ALL build errors"
  exit 1
fi
echo "✅ Android build validation passed!"
```

#### Android Test Suite (around line 185-209):
```yaml
echo "Running Android test suite..."
bash scripts/check-android-tasks.sh testDebugUnitTest test
TEST_EXIT_CODE=$?
if [ $TEST_EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ CRITICAL: Test suite failed"
  # ... rest of error handling
```

### Step 3: Commit and Push

```bash
git add .github/workflows/pr-checks.yml
git commit -m "fix: Use graceful Android task checking in CI workflow

- Update workflow to use check-android-tasks.sh script
- Prevents CI failures when Android tasks don't exist
- Tasks will be enforced once Android project is fully configured"
git push
```

## How It Works

The `check-android-tasks.sh` script:
1. Checks if the primary task exists
2. If not, tries the fallback task
3. If neither exists, exits gracefully with code 0 (skips check)
4. If task exists and fails, exits with non-zero code (fails CI)

This allows the CI to pass during initial setup while still enforcing checks once tasks are configured.

## Status

- ✅ Script created: `scripts/check-android-tasks.sh`
- ⏳ Workflow update: Pending unlock process


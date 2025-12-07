#!/bin/bash

# ============================================================================
# MANDATORY RESPONSIVE DESIGN VALIDATION
# ============================================================================
# This script validates that all UI components are responsive
# ENFORCEMENT: Responsive design is MANDATORY for all deliverables
# POLICY: All UI must work perfectly on mobile, tablet, and desktop

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo ""
echo "🚨 MANDATORY RESPONSIVE DESIGN VALIDATION"
echo "⚠️  RESPONSIVE DESIGN IS REQUIRED - ALL UI MUST BE RESPONSIVE"
echo "📋 REQUIRED: All components must work on mobile (320px+), tablet (768px+), and desktop (1024px+)"
echo ""

VALIDATION_FAILED=0

# ============================================================================
# WEB PWA RESPONSIVE DESIGN CHECKS
# ============================================================================

if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
  echo "📱 Checking Web PWA Responsive Design..."
  
  # Check for viewport meta tag
  if grep -q 'name="viewport"' frontend/index.html; then
    echo "  ✅ Viewport meta tag found"
  else
    echo "  ❌ CRITICAL: Viewport meta tag missing"
    echo "  📋 REQUIRED: Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
    VALIDATION_FAILED=1
  fi
  
  # Check for responsive CSS (media queries)
  RESPONSIVE_FILES=$(find frontend/src -name "*.css" -o -name "*.tsx" -o -name "*.ts" | xargs grep -l "@media\|useMediaQuery\|responsive\|breakpoint" 2>/dev/null || echo "")
  if [ -n "$RESPONSIVE_FILES" ]; then
    RESPONSIVE_COUNT=$(echo "$RESPONSIVE_FILES" | wc -l | tr -d ' ')
    echo "  ✅ Found responsive design patterns in $RESPONSIVE_COUNT file(s)"
  else
    echo "  ⚠️  WARNING: No responsive design patterns detected"
    echo "  📋 REQUIRED: Add responsive breakpoints and media queries"
    echo "  📋 SUGGESTED: Use Material UI breakpoints or Tailwind responsive classes"
  fi
  
  # Check for Material UI responsive components
  if grep -r "useMediaQuery\|@mui/material" frontend/src --include="*.tsx" --include="*.ts" >/dev/null 2>&1; then
    echo "  ✅ Material UI responsive utilities detected"
  else
    echo "  ⚠️  WARNING: Material UI responsive utilities not detected"
    echo "  📋 REQUIRED: Use Material UI breakpoints or implement responsive design"
  fi
  
  # Check for responsive layout components
  if grep -r "Grid\|Container\|Box\|Stack" frontend/src --include="*.tsx" >/dev/null 2>&1; then
    echo "  ✅ Responsive layout components detected"
  else
    echo "  ⚠️  WARNING: Responsive layout components not detected"
    echo "  📋 REQUIRED: Use responsive layout components (Grid, Container, etc.)"
  fi
  
  # Check Playwright config for responsive testing
  if [ -f "frontend/playwright.config.ts" ]; then
    if grep -q "Mobile\|Tablet\|Desktop\|viewport" frontend/playwright.config.ts; then
      echo "  ✅ Responsive testing configured in Playwright"
    else
      echo "  ⚠️  WARNING: Responsive testing not configured in Playwright"
      echo "  📋 REQUIRED: Add responsive viewport tests"
    fi
  fi
fi

# ============================================================================
# ANDROID RESPONSIVE DESIGN CHECKS
# ============================================================================

if [ -f "app/build.gradle" ] || [ -f "app/build.gradle.kts" ]; then
  echo ""
  echo "📱 Checking Android Responsive Design..."
  
  # Check for responsive layouts (different screen sizes)
  if [ -d "app/src/main/res" ]; then
    # Check for layout variants (sw600dp, sw720dp, etc.)
    LAYOUT_VARIANTS=$(find app/src/main/res -type d -name "layout-*" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$LAYOUT_VARIANTS" -gt 0 ]; then
      echo "  ✅ Found $LAYOUT_VARIANTS responsive layout variant(s)"
    else
      echo "  ⚠️  WARNING: No responsive layout variants found"
      echo "  📋 REQUIRED: Create layout variants for different screen sizes"
      echo "  📋 SUGGESTED: layout-sw600dp (tablets), layout-sw720dp (large tablets)"
    fi
    
    # Check for values variants (sw600dp, sw720dp)
    VALUES_VARIANTS=$(find app/src/main/res -type d -name "values-*" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$VALUES_VARIANTS" -gt 0 ]; then
      echo "  ✅ Found $VALUES_VARIANTS responsive values variant(s)"
    fi
    
    # Check for ConstraintLayout (supports responsive design)
    if grep -r "ConstraintLayout\|androidx.constraintlayout" app/src/main/res --include="*.xml" >/dev/null 2>&1; then
      echo "  ✅ ConstraintLayout detected (supports responsive design)"
    else
      echo "  ⚠️  WARNING: ConstraintLayout not detected"
      echo "  📋 REQUIRED: Use ConstraintLayout or responsive layout managers"
    fi
  fi
  
  # Check AndroidManifest for screen size support
  if [ -f "app/src/main/AndroidManifest.xml" ]; then
    if grep -q "supports-screens\|compatible-screens" app/src/main/AndroidManifest.xml; then
      echo "  ✅ Screen size support configured"
    else
      echo "  ⚠️  WARNING: Screen size support not explicitly configured"
      echo "  📋 RECOMMENDED: Add supports-screens configuration"
    fi
  fi
fi

# ============================================================================
# VALIDATION RESULT
# ============================================================================

echo ""
if [ $VALIDATION_FAILED -eq 0 ]; then
  echo "✅ Responsive design validation passed!"
  echo "📋 All UI components must be tested on multiple screen sizes"
  echo "📋 REQUIRED: Test on mobile (320px), tablet (768px), desktop (1024px+)"
  exit 0
else
  echo "❌ CRITICAL: Responsive design validation failed"
  echo "❌ ENFORCEMENT: Responsive design is MANDATORY"
  echo "📋 REQUIRED: Fix responsive design issues before proceeding"
  echo "📋 POLICY: All UI must work perfectly on all screen sizes"
  exit 1
fi


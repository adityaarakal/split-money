#!/bin/bash

# Verify Vercel Configuration
# This script checks if the project is configured correctly for Vercel deployment

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verifying Vercel Configuration...${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Check 1: vercel.json exists
echo -e "${BLUE}▶ Checking: vercel.json exists${NC}"
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✅ vercel.json found${NC}"
else
    echo -e "${RED}❌ vercel.json not found${NC}"
    ((ERRORS++))
fi
echo ""

# Check 2: vercel.json has correct structure
if [ -f "vercel.json" ]; then
    echo -e "${BLUE}▶ Checking: vercel.json structure${NC}"
    
    # Check buildCommand
    if grep -q '"buildCommand"' vercel.json && grep -q 'npm run build' vercel.json; then
        echo -e "${GREEN}✅ buildCommand: npm run build${NC}"
    else
        echo -e "${RED}❌ buildCommand missing or incorrect${NC}"
        ((ERRORS++))
    fi
    
    # Check outputDirectory
    if grep -q '"outputDirectory"' vercel.json && grep -q '"dist"' vercel.json; then
        echo -e "${GREEN}✅ outputDirectory: dist${NC}"
    else
        echo -e "${RED}❌ outputDirectory missing or incorrect${NC}"
        ((ERRORS++))
    fi
    
    # Check installCommand
    if grep -q '"installCommand"' vercel.json && grep -q 'npm install --ignore-scripts' vercel.json; then
        echo -e "${GREEN}✅ installCommand: npm install --ignore-scripts${NC}"
    else
        echo -e "${YELLOW}⚠️  installCommand missing or incorrect${NC}"
        ((WARNINGS++))
    fi
    
    # Check framework
    if grep -q '"framework"' vercel.json && grep -q '"vite"' vercel.json; then
        echo -e "${GREEN}✅ framework: vite${NC}"
    else
        echo -e "${YELLOW}⚠️  framework missing or incorrect${NC}"
        ((WARNINGS++))
    fi
    echo ""
fi

# Check 3: package.json has build script
echo -e "${BLUE}▶ Checking: package.json build script${NC}"
if [ -f "package.json" ]; then
    if grep -q '"build"' package.json && grep -q 'vite build' package.json; then
        echo -e "${GREEN}✅ Build script found in package.json${NC}"
    else
        echo -e "${RED}❌ Build script missing or incorrect${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${RED}❌ package.json not found${NC}"
    ((ERRORS++))
fi
echo ""

# Check 4: No frontend directory (should be in root)
echo -e "${BLUE}▶ Checking: Project structure${NC}"
if [ -d "frontend" ]; then
    echo -e "${YELLOW}⚠️  'frontend' directory exists - this may cause issues${NC}"
    echo -e "${YELLOW}   Project should be in root, not in frontend/ folder${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✅ No frontend directory (project in root)${NC}"
fi
echo ""

# Check 5: dist folder can be created (test build)
echo -e "${BLUE}▶ Checking: Build output${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ dist/ folder exists${NC}"
    DIST_FILES=$(find dist -type f | wc -l | tr -d ' ')
    echo -e "${BLUE}   Found $DIST_FILES files in dist/${NC}"
else
    echo -e "${YELLOW}⚠️  dist/ folder not found (run 'npm run build' to create)${NC}"
    ((WARNINGS++))
fi
echo ""

# Check 6: Node version file
echo -e "${BLUE}▶ Checking: Node.js version${NC}"
if [ -f ".nvmrc" ]; then
    NODE_VERSION=$(cat .nvmrc | tr -d ' ')
    echo -e "${GREEN}✅ .nvmrc found (Node.js $NODE_VERSION)${NC}"
else
    echo -e "${YELLOW}⚠️  .nvmrc not found (recommended for consistency)${NC}"
    ((WARNINGS++))
fi
echo ""

# Summary
echo "=========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo -e "${GREEN}Configuration is ready for Vercel deployment.${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Ensure Root Directory is empty in Vercel dashboard"
    echo "  2. Push code to trigger deployment"
    echo "  3. Check deployment logs if issues occur"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Configuration has $WARNINGS warning(s)${NC}"
    echo ""
    echo -e "${GREEN}Configuration should work, but consider fixing warnings.${NC}"
    exit 0
else
    echo -e "${RED}❌ Configuration has $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo -e "${RED}Please fix errors before deploying to Vercel.${NC}"
    exit 1
fi



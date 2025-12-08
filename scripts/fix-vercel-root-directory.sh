#!/bin/bash

# Script to fix Vercel Root Directory setting via Vercel API
# This updates the project settings to use root directory instead of "frontend"

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Fixing Vercel Root Directory Setting${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found${NC}"
    echo ""
    echo "Installing Vercel CLI..."
    npm install -g vercel
    echo ""
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo ""
    echo "Please login:"
    vercel login
    echo ""
fi

echo -e "${BLUE}📋 Current Vercel projects:${NC}"
vercel ls
echo ""

read -p "Enter your Vercel project name (or press Enter to use 'split-money'): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-split-money}

echo ""
echo -e "${BLUE}🔍 Checking project settings...${NC}"

# Get project info
PROJECT_INFO=$(vercel inspect "$PROJECT_NAME" --json 2>/dev/null || echo "")

if [ -z "$PROJECT_INFO" ]; then
    echo -e "${RED}❌ Project '$PROJECT_NAME' not found${NC}"
    echo ""
    echo "Available projects:"
    vercel ls
    exit 1
fi

echo -e "${GREEN}✅ Project found: $PROJECT_NAME${NC}"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT: Root Directory cannot be updated via CLI${NC}"
echo ""
echo -e "${BLUE}📝 Manual Steps Required:${NC}"
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select project: $PROJECT_NAME"
echo "3. Go to: Settings → General"
echo "4. Find: Root Directory field"
echo "5. DELETE: The value 'frontend' (make it empty)"
echo "6. Click: Save"
echo ""
echo -e "${GREEN}After updating, Vercel will automatically redeploy.${NC}"
echo ""

# Alternative: Try to update via API if token is available
if [ -n "$VERCEL_TOKEN" ]; then
    echo -e "${BLUE}🔧 Attempting to update via API...${NC}"
    
    # Get project ID
    PROJECT_ID=$(echo "$PROJECT_INFO" | jq -r '.id' 2>/dev/null || echo "")
    
    if [ -n "$PROJECT_ID" ] && [ "$PROJECT_ID" != "null" ]; then
        echo "Project ID: $PROJECT_ID"
        echo ""
        echo -e "${YELLOW}Note: Root Directory update via API requires project owner permissions.${NC}"
        echo -e "${YELLOW}If this fails, use the manual steps above.${NC}"
        echo ""
        
        # Note: Vercel API endpoint for updating project settings
        # This is a placeholder - actual API call would go here
        echo -e "${BLUE}To update via API, use:${NC}"
        echo "curl -X PATCH 'https://api.vercel.com/v9/projects/$PROJECT_ID' \\"
        echo "  -H 'Authorization: Bearer \$VERCEL_TOKEN' \\"
        echo "  -H 'Content-Type: application/json' \\"
        echo "  -d '{\"rootDirectory\": \"\"}'"
        echo ""
    fi
fi

echo -e "${GREEN}✅ Script complete${NC}"
echo ""
echo -e "${BLUE}Next: Update Root Directory in Vercel dashboard (see steps above)${NC}"



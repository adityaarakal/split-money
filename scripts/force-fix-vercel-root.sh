#!/bin/bash

# Force fix Vercel Root Directory via API
# This script uses Vercel API to directly update the project settings

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Force Fixing Vercel Root Directory via API${NC}"
echo ""

# Check for Vercel token
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  VERCEL_TOKEN not set${NC}"
    echo ""
    echo "Get your token from: https://vercel.com/account/tokens"
    echo ""
    read -p "Enter Vercel token (or press Enter to skip API method): " TOKEN
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ Skipping API method${NC}"
        echo ""
        echo -e "${BLUE}📝 Manual Method Required:${NC}"
        echo "1. Go to: https://vercel.com/dashboard"
        echo "2. Select project → Settings → General"
        echo "3. Root Directory → DELETE 'frontend' (make empty)"
        echo "4. Save"
        exit 0
    fi
    export VERCEL_TOKEN="$TOKEN"
fi

# Get project name
read -p "Enter Vercel project name [split-money]: " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-split-money}

echo ""
echo -e "${BLUE}🔍 Fetching project info...${NC}"

# Get project ID
PROJECT_RESPONSE=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v9/projects/$PROJECT_NAME" || echo "")

if [ -z "$PROJECT_RESPONSE" ] || echo "$PROJECT_RESPONSE" | grep -q "not found"; then
    echo -e "${RED}❌ Project '$PROJECT_NAME' not found${NC}"
    echo ""
    echo "Available projects:"
    curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
        "https://api.vercel.com/v9/projects" | jq -r '.projects[].name' 2>/dev/null || echo "Could not fetch projects"
    exit 1
fi

PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.id' 2>/dev/null || echo "")

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
    echo -e "${RED}❌ Could not get project ID${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found project: $PROJECT_NAME (ID: $PROJECT_ID)${NC}"
echo ""

# Update project settings
echo -e "${BLUE}🔧 Updating Root Directory to empty...${NC}"

UPDATE_RESPONSE=$(curl -s -X PATCH \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"rootDirectory": ""}' \
    "https://api.vercel.com/v9/projects/$PROJECT_ID" || echo "")

if echo "$UPDATE_RESPONSE" | grep -q "error\|Error"; then
    echo -e "${RED}❌ Failed to update:${NC}"
    echo "$UPDATE_RESPONSE" | jq '.' 2>/dev/null || echo "$UPDATE_RESPONSE"
    echo ""
    echo -e "${YELLOW}⚠️  API update failed. Use manual method:${NC}"
    echo "1. Dashboard → Project → Settings → General"
    echo "2. Root Directory → DELETE 'frontend'"
    echo "3. Save"
    exit 1
fi

echo -e "${GREEN}✅ Root Directory updated successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Updated settings:${NC}"
echo "$UPDATE_RESPONSE" | jq '{name: .name, rootDirectory: .rootDirectory}' 2>/dev/null || echo "Settings updated"

echo ""
echo -e "${GREEN}✅ Done! Vercel will automatically redeploy.${NC}"


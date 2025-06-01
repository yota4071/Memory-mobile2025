#!/bin/bash

echo "========================================"
echo "Memory Mobile 2025 - macOS/Linux Setup"
echo "========================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n📋 Step 1: Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker Desktop first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

echo -e "\n🐳 Step 2: Starting PostgreSQL container..."
cd apps/api
if ! docker-compose up -d; then
    echo -e "${RED}❌ Failed to start Docker container${NC}"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL container started${NC}"

echo -e "\n📊 Step 3: Setting up database schema..."
cd ../..
docker cp database/schema/complete_schema.sql api-postgres-1:/tmp/complete_schema.sql
docker exec -it api-postgres-1 psql -U devuser -d memorydb -f /tmp/complete_schema.sql
echo -e "${GREEN}✅ Database schema applied${NC}"

echo -e "\n📦 Step 4: Installing API dependencies..."
cd apps/api
if ! npm install; then
    echo -e "${RED}❌ Failed to install API dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ API dependencies installed${NC}"

echo -e "\n📱 Step 5: Installing Mobile dependencies..."
cd ../mobile
if ! npm install; then
    echo -e "${RED}❌ Failed to install Mobile dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Mobile dependencies installed${NC}"

echo -e "\n🔧 Step 6: Checking IP address..."
if command -v ifconfig &> /dev/null; then
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
elif command -v ip &> /dev/null; then
    IP=$(ip route get 1 | awk '{print $NF;exit}')
else
    IP="192.168.1.XXX"
fi

echo -e "Your IP address: ${BLUE}$IP${NC}"
echo ""
echo -e "${YELLOW}⚠️  Important: Update the IP address in:${NC}"
echo -e "   apps/mobile/src/contexts/AuthContext.tsx"
echo -e "   Change line 6 to: return 'http://$IP:3001/dev';"

echo ""
echo "========================================"
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Update IP address in AuthContext.tsx"
echo "2. Start API server: cd apps/api && npx serverless offline"
echo "3. Start mobile app: cd apps/mobile && npm run start"
echo "4. Install Expo Go on your smartphone"
echo "5. Scan QR code to run the app"
echo ""
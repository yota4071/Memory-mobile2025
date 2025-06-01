@echo off
echo ========================================
echo Memory Mobile 2025 - Windows Setup
echo ========================================

echo.
echo 📋 Step 1: Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

echo.
echo 🐳 Step 2: Starting PostgreSQL container...
cd apps\api
docker-compose up -d
if errorlevel 1 (
    echo ❌ Failed to start Docker container
    pause
    exit /b 1
)
echo ✅ PostgreSQL container started

echo.
echo 📊 Step 3: Setting up database schema...
cd ..\..
docker cp database\schema\complete_schema.sql api-postgres-1:/tmp/complete_schema.sql
docker exec -it api-postgres-1 psql -U devuser -d memorydb -f /tmp/complete_schema.sql
echo ✅ Database schema applied

echo.
echo 📦 Step 4: Installing API dependencies...
cd apps\api
call npm install
if errorlevel 1 (
    echo ❌ Failed to install API dependencies
    pause
    exit /b 1
)
echo ✅ API dependencies installed

echo.
echo 📱 Step 5: Installing Mobile dependencies...
cd ..\mobile
call npm install
if errorlevel 1 (
    echo ❌ Failed to install Mobile dependencies
    pause
    exit /b 1
)
echo ✅ Mobile dependencies installed

echo.
echo 🔧 Step 6: Checking IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    echo Your IP address: !ip!
    echo.
    echo ⚠️  Important: Update the IP address in:
    echo    apps\mobile\src\contexts\AuthContext.tsx
    echo    Change line 6 to: return 'http://!ip!:3001/dev';
    goto :found
)
:found

echo.
echo ========================================
echo ✅ Setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Update IP address in AuthContext.tsx
echo 2. Start API server: cd apps\api ^&^& npx serverless offline
echo 3. Start mobile app: cd apps\mobile ^&^& npm run start
echo 4. Install Expo Go on your smartphone
echo 5. Scan QR code to run the app
echo.
pause
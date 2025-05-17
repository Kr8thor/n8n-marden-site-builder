@echo off
:: Setup script for Marden Site Builder in n8n

echo Setting up Marden Site Builder workflow in n8n
echo ==============================================

:: Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker is not installed. Please install Docker first.
    exit /b 1
)

:: Create a directory for n8n data
mkdir %USERPROFILE%\.n8n 2>nul

:: Start n8n container
echo Starting n8n container...
docker run -d ^
  --name n8n ^
  -p 5678:5678 ^
  -v %USERPROFILE%\.n8n:/home/node/.n8n ^
  n8nio/n8n:latest

echo Waiting for n8n to start...
timeout /t 10 /nobreak >nul

:: Copy workflow file to container
echo Copying workflow file to container...
docker cp marden-site-builder-workflow.json n8n:/tmp/

:: Import workflow
echo Importing workflow...
docker exec n8n n8n import:workflow --input=/tmp/marden-site-builder-workflow.json

echo.
echo Setup complete! You can access n8n at http://localhost:5678
echo.
echo Next steps:
echo 1. Go to n8n and activate the workflow
echo 2. Configure WordPress credentials
echo 3. Update shared secret
echo.
echo See USAGE.md and WORDPRESS_SETUP.md for more details.

pause
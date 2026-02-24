# Food Delivery App - Automated Setup Script for Windows
# Run this script in PowerShell to set up the entire project

Write-Host "🍔 Food Delivery App - Automated Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running (optional check)
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
Write-Host "⚠️  Make sure MongoDB is running on localhost:27017" -ForegroundColor Yellow
Write-Host ""

# Setup Backend
Write-Host "📦 Setting up Backend..." -ForegroundColor Cyan
Set-Location "server"

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Create uploads directory
if (-not (Test-Path "uploads")) {
    New-Item -ItemType Directory -Force -Path "uploads" | Out-Null
    Write-Host "✅ Created uploads directory" -ForegroundColor Green
} else {
    Write-Host "✅ Uploads directory already exists" -ForegroundColor Green
}

# Go back to root
Set-Location ".."

Write-Host ""

# Setup Frontend
Write-Host "📦 Setting up Frontend..." -ForegroundColor Cyan
Set-Location "client"

# Install frontend dependencies
Write-Host "Installing frontend dependencies (this may take a few minutes)..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

# Go back to root
Set-Location ".."

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host ""
Write-Host "2. Start the Backend (in a new terminal):" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start the Frontend (in another new terminal):" -ForegroundColor White
Write-Host "   cd client" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Open your browser at http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see SETUP.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 Happy Coding!" -ForegroundColor Magenta

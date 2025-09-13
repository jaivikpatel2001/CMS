# College Management System Setup Script for Windows PowerShell
Write-Host "Setting up College Management System..." -ForegroundColor Green

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
# Environment Configuration for College Management System
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/college_management

# JWT Secret Key (Generate a strong secret key)
JWT_SECRET=college_management_system_secret_key_2024

# Email Configuration (for password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=application/pdf
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file already exists" -ForegroundColor Yellow
}

# Install dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

# Create uploads directories
Write-Host "Creating upload directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "uploads" -Force | Out-Null
New-Item -ItemType Directory -Path "uploads/assignments" -Force | Out-Null
New-Item -ItemType Directory -Path "uploads/documents" -Force | Out-Null
New-Item -ItemType Directory -Path "uploads/profiles" -Force | Out-Null
New-Item -ItemType Directory -Path "uploads/misc" -Force | Out-Null

Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure MongoDB is running on your system" -ForegroundColor White
Write-Host "2. Update the .env file with your email credentials (optional)" -ForegroundColor White
Write-Host "3. Run 'npm start' to start the server" -ForegroundColor White
Write-Host "4. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "Default login credentials:" -ForegroundColor Cyan
Write-Host "Admin: admin / admin123" -ForegroundColor White
Write-Host "Faculty: faculty / faculty123" -ForegroundColor White
Write-Host "Student: student / student123" -ForegroundColor White

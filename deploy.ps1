param (
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Ec2Host,

    [Parameter(Position=1)]
    [string]$SshUser = "ubuntu",

    [Parameter(Position=2)]
    [string]$KeyPath = "C:\Users\anubh\Videos\iot.pem"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 SubSentry AWS EC2 Docker Deployment" -ForegroundColor Green
Write-Host "Target: $SshUser@$Ec2Host" -ForegroundColor Yellow
Write-Host "SSH Key: $KeyPath" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify Key File Exists
if (-not (Test-Path $KeyPath)) {
    Write-Error "SSH Key not found at $KeyPath"
    exit 1
}

# 2. Adjust Key File Permissions for Windows OpenSSH (chmod 400 equivalent)
Write-Host "`n[1/5] 🔑 Setting strict ACL permissions on private key..." -ForegroundColor Cyan
try {
    icacls.exe $KeyPath /inheritance:r | Out-Null
    icacls.exe $KeyPath /grant:r "$($env:USERNAME):(R)" | Out-Null
    Write-Host "Permissions configured successfully." -ForegroundColor Green
} catch {
    Write-Warning "Could not modify ACLs, continuing anyway: $_"
}

# 3. Test SSH Connectivity
Write-Host "`n[2/5] 📡 Testing SSH connection to $Ec2Host..." -ForegroundColor Cyan
$testSsh = ssh -i $KeyPath -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$SshUser@$Ec2Host" "echo 'SSH_CONNECTED_OK'" 2>&1

if ($LASTEXITCODE -ne 0 -or $testSsh -notmatch "SSH_CONNECTED_OK") {
    Write-Host "SSH connection failed with user '$SshUser'. Trying 'ec2-user'..." -ForegroundColor Yellow
    $SshUser = "ec2-user"
    $testSsh = ssh -i $KeyPath -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$SshUser@$Ec2Host" "echo 'SSH_CONNECTED_OK'" 2>&1
    if ($LASTEXITCODE -ne 0 -or $testSsh -notmatch "SSH_CONNECTED_OK") {
        Write-Error "Failed to connect via SSH to $Ec2Host. Error: $testSsh"
        exit 1
    }
}
Write-Host "✅ SSH connection verified as $SshUser@$Ec2Host" -ForegroundColor Green

# 4. Prepare Remote Directory & Transfer Files
Write-Host "`n[3/5] 📦 Syncing codebase to EC2..." -ForegroundColor Cyan
ssh -i $KeyPath -o StrictHostKeyChecking=no "$SshUser@$Ec2Host" "mkdir -p ~/hardware_aws/backend"

# Create a temporary clean tar archive to stream directly
$tempTar = "$env:TEMP\hardware_aws_deploy.tar"
if (Test-Path $tempTar) { Remove-Item $tempTar -Force }

Write-Host "Creating clean deployment archive..." -ForegroundColor Gray
# Use tar (built into modern Windows) to package files excluding node_modules/.git
tar -cf $tempTar --exclude="node_modules" --exclude=".git" --exclude="*.pem" --exclude="output" --exclude="dist" -C "c:\Users\anubh\Videos\iot\hardware_aws" .

Write-Host "Uploading archive to EC2..." -ForegroundColor Gray
scp -i $KeyPath -o StrictHostKeyChecking=no $tempTar "$SshUser@$Ec2Host`:~/hardware_aws/deploy.tar"
Remove-Item $tempTar -Force

Write-Host "Extracting archive on EC2..." -ForegroundColor Gray
ssh -i $KeyPath -o StrictHostKeyChecking=no "$SshUser@$Ec2Host" "tar -xf ~/hardware_aws/deploy.tar -C ~/hardware_aws/ && rm -f ~/hardware_aws/deploy.tar"
Write-Host "Codebase synchronized." -ForegroundColor Green

# 5. Remote Docker Setup & Launch
Write-Host "`n[4/5] 🐳 Verifying Docker & Launching Compose Stack on EC2..." -ForegroundColor Cyan

$remoteSetupScript = @'
set -e
# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Ensure docker service is running
sudo systemctl enable docker
sudo systemctl start docker

# Build and start services
cd ~/hardware_aws
echo "Building and launching Docker containers..."
sudo docker compose down --remove-orphans || true
sudo docker compose up --build -d

echo "Waiting for services to become healthy..."
sleep 8
sudo docker compose ps
'@

ssh -i $KeyPath -o StrictHostKeyChecking=no "$SshUser@$Ec2Host" $remoteSetupScript

# 6. Verification
Write-Host "`n[5/5] 🔍 Verifying deployment health..." -ForegroundColor Cyan
$verifyScript = @'
echo "Checking Backend Health (Port 5000)..."
curl -s http://localhost:5000/health || echo "Failed to reach /health"
echo ""

echo "Checking Database Latest Record..."
curl -s "http://localhost:5000/api/latest?device_id=ROVER_01" || echo "Failed to reach /api/latest"
echo ""

echo "Checking Web Nginx Proxy (Port 80)..."
curl -s -I http://localhost/ | head -n 5 || echo "Failed to reach Port 80"
'@

ssh -i $KeyPath -o StrictHostKeyChecking=no "$SshUser@$Ec2Host" $verifyScript

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "🌐 Web Dashboard: http://$Ec2Host/" -ForegroundColor Yellow
Write-Host "🔌 API Endpoint:  http://$Ec2Host/api/sensor-data" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green

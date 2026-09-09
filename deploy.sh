#!/usr/bin/env bash
# ==========================================================
# SubSentry AWS EC2 Docker Deployment Script (Bash)
# ==========================================================
set -e

EC2_HOST="${1}"
SSH_USER="${2:-ubuntu}"
KEY_PATH="${3:-$HOME/Videos/iot.pem}"

if [ -z "$EC2_HOST" ]; then
    echo "Usage: ./deploy.sh <EC2_PUBLIC_IP> [SSH_USER] [KEY_PATH]"
    exit 1
fi

echo "=== 🚀 SubSentry AWS EC2 Deployment ==="
echo "Target: $SSH_USER@$EC2_HOST"
echo "Key: $KEY_PATH"

chmod 400 "$KEY_PATH" 2>/dev/null || true

echo "--> [1/4] Connecting to EC2 and creating directory..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$SSH_USER@$EC2_HOST" "mkdir -p ~/hardware_aws"

echo "--> [2/4] Packaging and transferring files..."
tar --exclude="node_modules" --exclude=".git" --exclude="*.pem" --exclude="output" --exclude="dist" -czf /tmp/hardware_aws.tar.gz .
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no /tmp/hardware_aws.tar.gz "$SSH_USER@$EC2_HOST:~/hardware_aws/"
rm -f /tmp/hardware_aws.tar.gz

ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$SSH_USER@$EC2_HOST" "tar -xzf ~/hardware_aws/hardware_aws.tar.gz -C ~/hardware_aws/ && rm ~/hardware_aws/hardware_aws.tar.gz"

echo "--> [3/4] Ensuring Docker is installed and launching containers..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$SSH_USER@$EC2_HOST" << 'EOF'
set -e
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

sudo systemctl enable docker
sudo systemctl start docker

cd ~/hardware_aws
sudo docker compose down --remove-orphans || true
sudo docker compose up --build -d

sleep 6
sudo docker compose ps
EOF

echo "--> [4/4] Verifying health..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$SSH_USER@$EC2_HOST" << 'EOF'
echo "Backend Health Check:"
curl -s http://localhost:5000/health
echo ""
echo "Database Check:"
curl -s "http://localhost:5000/api/latest?device_id=ROVER_01"
echo ""
EOF

echo "=========================================================="
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "🌐 Dashboard URL: http://$EC2_HOST/"
echo "📡 Ingestion API: http://$EC2_HOST/api/sensor-data"
echo "=========================================================="

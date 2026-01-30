#!/bin/bash

# 🚀 EC2 Server Setup Script for Course Backend Microservices
# Run this script on a fresh Ubuntu 20.04/22.04 EC2 instance

set -e

echo "🔧 Starting EC2 server setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    sudo apt-get install docker-compose-plugin -y
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose already installed"
fi

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p ~/course-backend
cd ~/course-backend

# Install useful tools
echo "🛠️ Installing additional tools..."
sudo apt-get install -y \
    curl \
    wget \
    git \
    htop \
    vim \
    nano

# Configure firewall (UFW)
echo "🔥 Configuring firewall..."
sudo apt-get install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 3001/tcp  # API Gateway
# Optional: Allow if needed
# sudo ufw allow 5432/tcp  # PostgreSQL
# sudo ufw allow 6379/tcp  # Redis
sudo ufw --force enable

# Show Docker version
echo ""
echo "📊 Installation Summary:"
docker --version
docker compose version

echo ""
echo "✅ EC2 server setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Log out and log back in for Docker group to take effect"
echo "2. Configure GitHub Secrets with this EC2 server info"
echo "3. Push code to trigger deployment"
echo ""
echo "🔍 Verify installation:"
echo "   docker ps"
echo "   docker compose version"
echo ""
echo "📂 Deployment directory: ~/course-backend"

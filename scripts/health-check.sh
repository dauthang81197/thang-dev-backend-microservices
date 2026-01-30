#!/bin/bash

# 🏥 Health Check Script for Course Backend Microservices

set -e

echo "🏥 Running health checks..."
echo ""

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found!"
    echo "Please run this script from the deployment directory"
    exit 1
fi

# Container status
echo "📦 Container Status:"
echo "----------------------------------------"
docker compose ps
echo ""

# Check each service health
echo "🔍 Service Health Checks:"
echo "----------------------------------------"

# API Gateway
if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ API Gateway (Port 3001): Healthy"
else
    echo "❌ API Gateway (Port 3001): Unhealthy"
fi

# PostgreSQL
if docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL: Healthy"
else
    echo "❌ PostgreSQL: Unhealthy"
fi

# Redis
if docker compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Healthy"
else
    echo "❌ Redis: Unhealthy"
fi

echo ""

# Resource usage
echo "💻 Resource Usage:"
echo "----------------------------------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""

# Recent logs
echo "📝 Recent Logs (Last 10 lines):"
echo "----------------------------------------"
docker compose logs --tail=10 api-gateway
echo ""

# Disk usage
echo "💾 Docker Disk Usage:"
echo "----------------------------------------"
docker system df
echo ""

echo "✅ Health check completed!"

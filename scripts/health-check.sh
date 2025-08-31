#!/bin/bash

# Health check script for deployment
# Validates that services are running properly

set -e

MAX_RETRIES=10
RETRY_DELAY=3

echo "🏥 Starting health check..."

# Function to check HTTP endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local retries=0
    
    echo "Checking $name at $url..."
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -f -s -o /dev/null --max-time 10 "$url"; then
            echo "✅ $name is healthy"
            return 0
        else
            retries=$((retries + 1))
            echo "⏳ $name not ready, retry $retries/$MAX_RETRIES..."
            sleep $RETRY_DELAY
        fi
    done
    
    echo "❌ $name health check failed after $MAX_RETRIES attempts"
    return 1
}

# Function to check PM2 process
check_pm2_process() {
    local process_name=$1
    
    if pm2 list | grep -q "$process_name.*online"; then
        echo "✅ PM2 process $process_name is running"
        return 0
    else
        echo "❌ PM2 process $process_name is not running"
        pm2 list
        return 1
    fi
}

# Check PM2 processes
echo "Checking PM2 processes..."
check_pm2_process "prompt-assistant-backend"
check_pm2_process "prompt-assistant-frontend"

# Check HTTP endpoints
echo "Checking HTTP endpoints..."
check_endpoint "http://localhost:3001/health" "Backend API"
check_endpoint "http://localhost:3000" "Frontend"

# Check database connection (if backend has health endpoint)
if curl -f -s "http://localhost:3001/health" | grep -q "database.*ok"; then
    echo "✅ Database connection is healthy"
else
    echo "⚠️  Database connection check inconclusive"
fi

# Check system resources after deployment
echo "📊 System resources after deployment:"
echo "Memory usage: $(free -h | grep Mem | awk '{print $3"/"$2}')"
echo "Disk usage: $(df -h / | awk 'NR==2 {print $5}')"
echo "CPU load: $(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1)"

echo "🎉 Health check completed successfully!"

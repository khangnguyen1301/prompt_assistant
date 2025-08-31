#!/bin/bash

# Pre-deployment health check script
# This script checks system resources before deployment

set -e

echo "🔍 Checking system resources before deployment..."

# Check available memory
AVAILABLE_MEMORY=$(free -m | awk 'NR==2{printf "%.1f", $7*100/$2 }')
echo "Available memory: ${AVAILABLE_MEMORY}%"

if (( $(echo "$AVAILABLE_MEMORY < 20" | bc -l) )); then
    echo "⚠️  Warning: Low memory (${AVAILABLE_MEMORY}% available)"
    echo "Clearing cache..."
    
    # Clear system cache
    sync && echo 3 > /proc/sys/vm/drop_caches || echo "Cannot clear cache (need sudo)"
    
    # Clear PM2 logs
    pm2 flush
    
    # Clean npm cache
    npm cache clean --force
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
echo "Disk usage: ${DISK_USAGE}%"

if [ "$DISK_USAGE" -gt 85 ]; then
    echo "⚠️  Warning: High disk usage (${DISK_USAGE}%)"
    
    # Clean old logs
    find /home/deploy/logs -name "*.log" -mtime +7 -delete || true
    
    # Clean old backups
    find /home/deploy/backups -type d -mtime +3 -exec rm -rf {} + || true
    
    # Clean node_modules cache
    find /home/deploy -name "node_modules" -type d -exec du -sh {} + | head -5
fi

# Check CPU load
CPU_LOAD=$(uptime | awk -F'load average:' '{ print $2 }' | cut -d, -f1 | sed 's/^[ \t]*//')
echo "CPU load: ${CPU_LOAD}"

# Check if PM2 processes are running
PM2_PROCESSES=$(pm2 list | grep -c "online" || echo "0")
echo "PM2 processes running: ${PM2_PROCESSES}"

# Check if ports are available
if netstat -tlnp | grep -q ":3000 "; then
    echo "⚠️  Port 3000 is in use"
fi

if netstat -tlnp | grep -q ":3001 "; then
    echo "⚠️  Port 3001 is in use"
fi

echo "✅ Pre-deployment check completed"

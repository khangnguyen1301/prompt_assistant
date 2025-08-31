#!/bin/bash

# Deployment setup script for prompt-assistant.dukang.online
# Run this script on your VPS to setup the complete environment
# Can be run manually or automatically via CI/CD

set -e

echo "🚀 Setting up prompt-assistant.dukang.online deployment environment..."
echo ""

# Check if running in CI/CD environment
CI_MODE=${CI:-false}
if [ "$CI_MODE" = "true" ]; then
    echo "🤖 Running in CI/CD mode (non-interactive)"
    INTERACTIVE=false
else
    echo "👤 Running in interactive mode"
    INTERACTIVE=true
fi

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please don't run this script as root. Use a regular user with sudo privileges."
    exit 1
fi

# Variables
DOMAIN="prompt-assistant.dukang.online"
DEPLOY_USER="deploy"
DEPLOY_DIR="/home/$DEPLOY_USER/apps/prompt_assistant"
LOG_DIR="/home/$DEPLOY_USER/logs"
BACKUP_DIR="/home/$DEPLOY_USER/backups"

echo "📋 Configuration:"
echo "  Domain: $DOMAIN"
echo "  Deploy user: $DEPLOY_USER"
echo "  Deploy directory: $DEPLOY_DIR"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install package if not exists
install_if_missing() {
    local package=$1
    if ! command_exists "$package"; then
        echo "Installing $package..."
        sudo apt update && sudo apt install -y "$package"
    else
        echo "✅ $package is already installed"
    fi
}

# Step 1: Create deploy user if not exists
echo "👤 Setting up deploy user..."
if ! id "$DEPLOY_USER" &>/dev/null; then
    sudo adduser --disabled-password --gecos "" $DEPLOY_USER
    sudo usermod -aG sudo $DEPLOY_USER
    echo "✅ Created deploy user"
else
    echo "✅ Deploy user already exists"
fi

# Step 2: Create directories
echo "📁 Creating directories..."
sudo mkdir -p $DEPLOY_DIR $LOG_DIR $BACKUP_DIR
sudo chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER
echo "✅ Directories created"

# Step 3: Install required packages
echo "📦 Installing required packages..."
install_if_missing "curl"
install_if_missing "git"
install_if_missing "nginx"
install_if_missing "certbot"
install_if_missing "python3-certbot-nginx"

# Step 4: Install Node.js 18
echo "🟢 Installing Node.js 18..."
if ! command_exists "node" || [[ $(node --version) != v18* ]]; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js 18 installed"
else
    echo "✅ Node.js 18 is already installed"
fi

# Step 5: Install PM2 globally
echo "⚡ Installing PM2..."
if ! command_exists "pm2"; then
    sudo npm install -g pm2
    echo "✅ PM2 installed"
else
    echo "✅ PM2 is already installed"
fi

# Step 6: Setup PM2 startup
echo "🔄 Setting up PM2 startup..."
sudo su - $DEPLOY_USER -c "pm2 startup" || true

# Step 7: Copy Nginx configuration
echo "🌐 Setting up Nginx configuration..."
if [ -f "./nginx-config/prompt-assistant-dukang.conf" ]; then
    sudo cp ./nginx-config/prompt-assistant-dukang.conf /etc/nginx/sites-available/prompt-assistant-dukang
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/prompt-assistant-dukang /etc/nginx/sites-enabled/
    
    # Remove default site if exists
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    echo "✅ Nginx configuration setup completed"
else
    echo "⚠️  Nginx config file not found. You'll need to manually configure Nginx."
fi

# Step 8: Setup SSL certificate
echo "🔐 Setting up SSL certificate..."
if command_exists "certbot" && [ "$INTERACTIVE" = "true" ]; then
    echo "Run the following command to get SSL certificate:"
    echo "sudo certbot --nginx -d $DOMAIN"
    echo ""
    read -p "Do you want to run this now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo certbot --nginx -d $DOMAIN
        echo "✅ SSL certificate installed"
    fi
elif command_exists "certbot" && [ "$INTERACTIVE" = "false" ]; then
    # In CI/CD mode, try to setup SSL automatically
    echo "🤖 Attempting automatic SSL setup..."
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || {
        echo "⚠️  SSL setup failed in CI/CD mode. May need manual intervention."
        echo "Run manually: sudo certbot --nginx -d $DOMAIN"
    }
else
    echo "⚠️  Certbot not available. Install SSL certificate manually."
fi

# Step 9: Setup firewall
echo "🛡️  Setting up firewall..."
if command_exists "ufw"; then
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw status
    echo "✅ Firewall configured"
fi

# Step 10: Copy ecosystem files
echo "📝 Setting up PM2 ecosystem files..."
if [ -f "./ecosystem.config.js" ] && [ -f "./ecosystem.frontend.config.js" ]; then
    sudo -u $DEPLOY_USER cp ./ecosystem.config.js $DEPLOY_DIR/
    sudo -u $DEPLOY_USER cp ./ecosystem.frontend.config.js $DEPLOY_DIR/
    echo "✅ PM2 ecosystem files copied"
else
    echo "⚠️  Ecosystem files not found in current directory"
fi

# Step 11: Setup environment file
echo "🔧 Setting up environment file..."
if [ -f "./.env" ]; then
    sudo -u $DEPLOY_USER cp ./.env $DEPLOY_DIR/
    sudo chmod 600 $DEPLOY_DIR/.env
    echo "✅ Environment file copied"
else
    echo "⚠️  .env file not found. You'll need to create it manually."
fi

# Step 12: Clone repository (if not exists)
echo "📥 Setting up repository..."
if [ ! -d "$DEPLOY_DIR/.git" ] && [ "$INTERACTIVE" = "true" ]; then
    echo "Enter your GitHub repository URL:"
    read -p "Repository URL: " repo_url
    if [ ! -z "$repo_url" ]; then
        sudo -u $DEPLOY_USER git clone "$repo_url" $DEPLOY_DIR
        echo "✅ Repository cloned"
    fi
elif [ ! -d "$DEPLOY_DIR/.git" ] && [ "$INTERACTIVE" = "false" ]; then
    echo "🤖 Repository will be handled by CI/CD deployment"
else
    echo "✅ Repository already exists"
fi

# Final instructions
echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Ensure your domain $DOMAIN points to this server's IP"
echo "2. If SSL wasn't installed, run: sudo certbot --nginx -d $DOMAIN"
echo "3. Configure your GitHub Actions secrets with:"
echo "   - FRONTEND_URL=https://$DOMAIN"
echo "   - BACKEND_URL=https://$DOMAIN/api"
echo "   - All other secrets from your .env file"
echo ""
echo "4. Deploy your application:"
echo "   cd $DEPLOY_DIR"
echo "   npm run install:all"
echo "   npm run build"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 start ecosystem.frontend.config.js"
echo "   pm2 save"
echo ""
echo "5. Test your deployment:"
echo "   curl -I https://$DOMAIN"
echo "   curl -I https://$DOMAIN/api/health"
echo ""
echo "✅ Your prompt assistant is ready for deployment at https://$DOMAIN"

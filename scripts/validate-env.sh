#!/bin/bash

# Environment validation script
# Checks if all required environment variables are properly configured

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${PROJECT_ROOT}/.env"

echo "🔍 Validating environment configuration..."

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file not found: $ENV_FILE"
    echo "Run: bash scripts/setup-env.sh development"
    exit 1
fi

# Source the environment file
set -a
source "$ENV_FILE"
set +a

# Validation functions
validate_required_var() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -z "$var_value" ] || [[ "$var_value" =~ ^your_ ]] || [[ "$var_value" =~ ^replace_ ]]; then
        echo "❌ Required variable not set: $var_name"
        return 1
    fi
    
    echo "✅ $var_name: configured"
    return 0
}

validate_url() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -z "$var_value" ]; then
        echo "⚠️  Optional URL not set: $var_name"
        return 0
    fi
    
    if [[ ! "$var_value" =~ ^https?:// ]]; then
        echo "❌ Invalid URL format: $var_name = $var_value"
        return 1
    fi
    
    echo "✅ $var_name: $var_value"
    return 0
}

validate_database_connection() {
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ DATABASE_URL not configured"
        return 1
    fi
    
    echo "✅ DATABASE_URL: configured"
    
    # Test database connection if psql is available
    if command -v psql >/dev/null 2>&1; then
        echo "🔗 Testing database connection..."
        if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
            echo "✅ Database connection: successful"
        else
            echo "⚠️  Database connection: failed (check credentials)"
        fi
    else
        echo "ℹ️  Skipping database connection test (psql not available)"
    fi
    
    return 0
}

validate_redis_connection() {
    if [ -z "$REDIS_URL" ] && [ -z "$REDIS_HOST" ]; then
        echo "⚠️  Redis configuration not found (optional)"
        return 0
    fi
    
    echo "✅ Redis configuration: found"
    
    # Test Redis connection if redis-cli is available
    if command -v redis-cli >/dev/null 2>&1; then
        echo "🔗 Testing Redis connection..."
        if redis-cli -u "${REDIS_URL:-redis://${REDIS_HOST}:${REDIS_PORT}}" ping >/dev/null 2>&1; then
            echo "✅ Redis connection: successful"
        else
            echo "⚠️  Redis connection: failed"
        fi
    else
        echo "ℹ️  Skipping Redis connection test (redis-cli not available)"
    fi
    
    return 0
}

validate_api_keys() {
    local has_ai_key=false
    
    # Check for at least one AI API key
    if [ -n "$GEMINI_API_KEY" ] && [[ ! "$GEMINI_API_KEY" =~ ^your_ ]]; then
        echo "✅ Gemini API key: configured"
        has_ai_key=true
    fi
    
    if [ -n "$OPENAI_API_KEY" ] && [[ ! "$OPENAI_API_KEY" =~ ^your_ ]]; then
        echo "✅ OpenAI API key: configured"
        has_ai_key=true
    fi
    
    if [ -n "$ANTHROPIC_API_KEY" ] && [[ ! "$ANTHROPIC_API_KEY" =~ ^your_ ]]; then
        echo "✅ Anthropic API key: configured"
        has_ai_key=true
    fi
    
    if [ "$has_ai_key" = false ]; then
        echo "⚠️  No AI API keys configured"
        echo "   Configure at least one: GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY"
    fi
    
    return 0
}

# Main validation
main() {
    local error_count=0
    
    echo "📋 Checking required variables..."
    
    # Required variables
    validate_required_var "NODE_ENV" || ((error_count++))
    validate_required_var "JWT_SECRET" || ((error_count++))
    validate_required_var "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" || ((error_count++))
    validate_required_var "CLERK_SECRET_KEY" || ((error_count++))
    
    echo ""
    echo "🌐 Checking URLs..."
    validate_url "FRONTEND_URL" || ((error_count++))
    validate_url "BACKEND_URL" || ((error_count++))
    validate_url "API_BASE_URL" || ((error_count++))
    
    echo ""
    echo "🗄️  Checking database configuration..."
    validate_database_connection || ((error_count++))
    
    echo ""
    echo "📦 Checking Redis configuration..."
    validate_redis_connection
    
    echo ""
    echo "🤖 Checking AI API keys..."
    validate_api_keys
    
    echo ""
    echo "🔐 Security check..."
    
    # Check JWT secret strength
    if [ ${#JWT_SECRET} -lt 32 ]; then
        echo "⚠️  JWT_SECRET should be at least 32 characters long"
        ((error_count++))
    else
        echo "✅ JWT_SECRET: adequate length"
    fi
    
    # Check environment
    if [ "$NODE_ENV" = "production" ]; then
        echo "✅ Production environment detected"
        
        # Additional production checks
        if [[ "$FRONTEND_URL" =~ localhost ]] || [[ "$BACKEND_URL" =~ localhost ]]; then
            echo "⚠️  Production environment with localhost URLs"
        fi
    else
        echo "ℹ️  Development environment detected"
    fi
    
    echo ""
    echo "📊 Validation Summary:"
    
    if [ $error_count -eq 0 ]; then
        echo "🎉 All validations passed!"
        echo "Your environment is properly configured."
        exit 0
    else
        echo "❌ Found $error_count configuration issues"
        echo "Please fix the issues above before proceeding."
        exit 1
    fi
}

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Environment Validation Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help, -h    Show this help message"
    echo ""
    echo "This script validates your .env configuration file."
    echo "Run after setting up your environment variables."
    echo ""
    exit 0
fi

main "$@"

#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate required environment variables
if [ -z "$DEPLOY_ENV" ]; then
    print_error "DEPLOY_ENV is not set"
    exit 1
fi

if [ -z "$HETZNER_PROJECT_PATH" ]; then
    print_error "HETZNER_PROJECT_PATH is not set"
    exit 1
fi

# Set port based on environment
if [ "$DEPLOY_ENV" = "staging" ]; then
    WORKER_PORT=3002
    CONTAINER_NAME="inngest-worker-staging"
elif [ "$DEPLOY_ENV" = "production" ]; then
    WORKER_PORT=3003
    CONTAINER_NAME="inngest-worker-production"
else
    print_error "Invalid DEPLOY_ENV: $DEPLOY_ENV. Must be 'staging' or 'production'"
    exit 1
fi

print_status "Starting deployment for $DEPLOY_ENV environment on port $WORKER_PORT..."

# Navigate to project directory
print_status "Navigating to project directory: $HETZNER_PROJECT_PATH"
cd "$HETZNER_PROJECT_PATH" || {
    print_error "Failed to navigate to project directory"
    exit 1
}

# Pull latest changes
print_status "Pulling latest changes from git..."
git pull origin "$GITHUB_REF_NAME" || {
    print_error "Failed to pull latest changes"
    exit 1
}

# Install dependencies
print_status "Installing dependencies..."
npm ci --only=production || {
    print_error "Failed to install dependencies"
    exit 1
}

# Build worker
print_status "Building worker..."
npm run worker:build || {
    print_error "Failed to build worker"
    exit 1
}

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.hetzner.yml down || {
    print_warning "Failed to stop existing containers (might not exist)"
}

# Start new containers based on environment
if [ "$DEPLOY_ENV" = "staging" ]; then
    print_status "Starting staging worker container..."
    docker-compose -f docker-compose.hetzner.yml up -d inngest-worker-staging || {
        print_error "Failed to start staging worker container"
        exit 1
    }
elif [ "$DEPLOY_ENV" = "production" ]; then
    print_status "Starting production worker container..."
    docker-compose -f docker-compose.hetzner.yml up -d inngest-worker-production || {
        print_error "Failed to start production worker container"
        exit 1
    }
fi

# Wait for container to start
print_status "Waiting for container to start..."
sleep 15

# Check if worker is healthy
print_status "Checking worker health on port $WORKER_PORT..."
max_attempts=10
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f -s "http://localhost:$WORKER_PORT/health" > /dev/null 2>&1; then
        print_status "✅ Worker is healthy and responding on port $WORKER_PORT!"
        
        # Get worker info
        health_response=$(curl -s "http://localhost:$WORKER_PORT/health")
        print_status "Worker health response: $health_response"
        
        exit 0
    else
        print_warning "Health check attempt $attempt/$max_attempts failed on port $WORKER_PORT"
        if [ $attempt -eq $max_attempts ]; then
            print_error "❌ Worker health check failed after $max_attempts attempts!"
            
            # Show container logs for debugging
            print_status "Container logs for $CONTAINER_NAME:"
            docker-compose -f docker-compose.hetzner.yml logs "$CONTAINER_NAME"
            
            exit 1
        fi
        sleep 5
        attempt=$((attempt + 1))
    fi
done

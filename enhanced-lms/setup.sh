#!/bin/bash

# GAIL Enhanced LMS Setup Script
# This script sets up the development environment for the AI-Enhanced LMS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        REQUIRED_VERSION="18.0.0"
        
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
        else
            print_error "Node.js version $NODE_VERSION is not compatible. Required: $REQUIRED_VERSION or higher"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
}

# Function to check Docker
check_docker() {
    if command_exists docker; then
        if docker info >/dev/null 2>&1; then
            print_success "Docker is running"
        else
            print_error "Docker is installed but not running. Please start Docker and try again."
            exit 1
        fi
    else
        print_warning "Docker is not installed. Some features may not work without Docker."
    fi
}

# Function to check Docker Compose
check_docker_compose() {
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose is available"
    else
        print_warning "Docker Compose is not available. Some features may not work."
    fi
}

# Function to create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Root .env file
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
    else
        print_warning ".env file already exists, skipping..."
    fi
    
    # Frontend .env.local
    if [ ! -f frontend/.env.local ]; then
        cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=GAIL Enhanced LMS
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF
        print_success "Created frontend/.env.local"
    else
        print_warning "frontend/.env.local already exists, skipping..."
    fi
    
    # Backend .env
    if [ ! -f backend/.env ]; then
        cat > backend/.env << EOF
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://admin:password123@localhost:27017/gail_lms?authSource=admin
REDIS_URL=redis://:redis123@localhost:6379
JWT_SECRET=gail-lms-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info
EOF
        print_success "Created backend/.env"
    else
        print_warning "backend/.env already exists, skipping..."
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Shared dependencies
    if [ -d "shared" ]; then
        print_status "Installing shared dependencies..."
        cd shared
        npm install
        cd ..
    fi
    
    print_success "All dependencies installed successfully"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    directories=(
        "backend/uploads"
        "backend/logs"
        "backend/temp"
        "ai-services/models"
        "ai-services/logs"
        "docs/api"
        "tests/reports"
        "monitoring/logs"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Created directory: $dir"
        fi
    done
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    if command_exists docker && docker info >/dev/null 2>&1; then
        print_status "Starting MongoDB and Redis with Docker..."
        docker-compose up -d mongodb redis
        
        # Wait for MongoDB to be ready
        print_status "Waiting for MongoDB to be ready..."
        sleep 10
        
        # Check if MongoDB is accessible
        if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            print_success "MongoDB is ready"
        else
            print_warning "MongoDB may not be fully ready. You may need to wait a bit longer."
        fi
        
        print_success "Database services started"
    else
        print_warning "Docker not available. Please ensure MongoDB and Redis are running manually."
        print_warning "MongoDB: mongodb://localhost:27017/gail_lms"
        print_warning "Redis: redis://localhost:6379"
    fi
}

# Function to run initial database seeding
seed_database() {
    print_status "Seeding database with initial data..."
    
    if [ -f "backend/scripts/seed.js" ]; then
        cd backend
        npm run seed
        cd ..
        print_success "Database seeded successfully"
    else
        print_warning "Seed script not found. Skipping database seeding."
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests to verify setup..."
    
    # Backend tests
    print_status "Running backend tests..."
    cd backend
    if npm run test >/dev/null 2>&1; then
        print_success "Backend tests passed"
    else
        print_warning "Backend tests failed or not configured"
    fi
    cd ..
    
    # Frontend tests
    print_status "Running frontend tests..."
    cd frontend
    if npm run test -- --watchAll=false >/dev/null 2>&1; then
        print_success "Frontend tests passed"
    else
        print_warning "Frontend tests failed or not configured"
    fi
    cd ..
}

# Function to display final instructions
display_instructions() {
    print_success "Setup completed successfully!"
    echo ""
    echo -e "${BLUE}=== GAIL Enhanced LMS Development Environment ===${NC}"
    echo ""
    echo -e "${GREEN}To start the development environment:${NC}"
    echo "  npm run dev                    # Start both frontend and backend"
    echo "  npm run dev:frontend          # Start only frontend (port 3000)"
    echo "  npm run dev:backend           # Start only backend (port 3001)"
    echo ""
    echo -e "${GREEN}With Docker:${NC}"
    echo "  docker-compose up             # Start all services"
    echo "  docker-compose up -d          # Start all services in background"
    echo ""
    echo -e "${GREEN}URLs:${NC}"
    echo "  Frontend:  http://localhost:3000"
    echo "  Backend:   http://localhost:3001"
    echo "  API Docs:  http://localhost:3001/api-docs"
    echo ""
    echo -e "${GREEN}Database Access:${NC}"
    echo "  MongoDB:   mongodb://localhost:27017/gail_lms"
    echo "  Redis:     redis://localhost:6379"
    echo ""
    echo -e "${GREEN}Demo Credentials:${NC}"
    echo "  Admin:     admin@gail.com / admin123"
    echo "  Instructor: instructor@gail.com / instructor123"
    echo "  Learner:   learner@gail.com / learner123"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Update .env files with your actual configuration"
    echo "  2. Configure AWS credentials for file storage"
    echo "  3. Set up OpenAI API key for AI features"
    echo "  4. Review and customize the application settings"
    echo ""
    echo -e "${BLUE}For more information, see README.md${NC}"
}

# Main setup function
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    GAIL Enhanced LMS Setup                   ║"
    echo "║              AI-Powered Learning Management System           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    print_status "Starting setup process..."
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_node_version
    check_docker
    check_docker_compose
    
    # Setup steps
    create_env_files
    create_directories
    install_dependencies
    setup_database
    
    # Optional steps
    if [ "$1" = "--with-seed" ]; then
        seed_database
    fi
    
    if [ "$1" = "--with-tests" ]; then
        run_tests
    fi
    
    display_instructions
}

# Handle command line arguments
case "$1" in
    --help|-h)
        echo "GAIL Enhanced LMS Setup Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h        Show this help message"
        echo "  --with-seed       Include database seeding"
        echo "  --with-tests      Run tests after setup"
        echo ""
        exit 0
        ;;
    *)
        main "$1"
        ;;
esac

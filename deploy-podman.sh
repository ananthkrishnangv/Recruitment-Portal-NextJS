#!/bin/bash

#############################################################################
# CSIR-SERC Recruitment Portal - Podman Deployment Script
# Version: 2.0.0
# Date: 14 January 2026
#############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/ananth/Documents/Recruitment-Portal-NextJS"
CONTAINER_NAME="csir-serc-portal"
IMAGE_NAME="csir-serc-recruitment-portal"
IMAGE_VERSION="2.0.0"
CONTAINER_IP="10.30.0.14"
NETWORK_NAME="mcvlan1"
PODMAN_HOST="10.10.200.53"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v podman &> /dev/null; then
        log_error "Podman is not installed"
        exit 1
    fi
    
    log_success "Podman is installed"
    
    if ! podman network ls | grep -q "$NETWORK_NAME"; then
        log_warning "Network $NETWORK_NAME does not exist. Creating..."
        podman network create -d macvlan \
            --subnet=10.30.0.0/24 \
            --gateway=10.30.0.1 \
            -o parent=eth0 \
            "$NETWORK_NAME" || log_error "Failed to create network"
    else
        log_success "Network $NETWORK_NAME exists"
    fi
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    
    cd "$PROJECT_DIR"
    
    if podman build -t "$IMAGE_NAME:$IMAGE_VERSION" .; then
        log_success "Image built successfully: $IMAGE_NAME:$IMAGE_VERSION"
    else
        log_error "Failed to build image"
        exit 1
    fi
}

# Stop existing container
stop_container() {
    log_info "Stopping existing container..."
    
    if podman ps -a | grep -q "$CONTAINER_NAME"; then
        podman stop "$CONTAINER_NAME" 2>/dev/null || true
        podman rm "$CONTAINER_NAME" 2>/dev/null || true
        log_success "Container stopped and removed"
    else
        log_info "No existing container found"
    fi
}

# Run container
run_container() {
    log_info "Starting container with name: $CONTAINER_NAME"
    
    podman run -d \
        --name "$CONTAINER_NAME" \
        --network "$NETWORK_NAME" \
        --ip "$CONTAINER_IP" \
        -p 3000:3000 \
        -e NODE_ENV=production \
        -e NEXT_PUBLIC_APP_NAME="CSIR-SERC Recruitment Portal" \
        -e NEXT_PUBLIC_APP_VERSION="$IMAGE_VERSION" \
        --restart unless-stopped \
        --health-cmd="wget --quiet --tries=1 --spider http://localhost:3000 || exit 1" \
        --health-interval=30s \
        --health-timeout=10s \
        --health-retries=3 \
        --health-start-period=40s \
        --cap-drop=ALL \
        --cap-add=NET_BIND_SERVICE \
        --read-only \
        --tmpfs=/tmp \
        --tmpfs=/var/tmp \
        -m 512m \
        --cpus 2 \
        "$IMAGE_NAME:$IMAGE_VERSION"
    
    log_success "Container started successfully"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    sleep 3
    
    # Check container status
    if ! podman ps | grep -q "$CONTAINER_NAME"; then
        log_error "Container is not running"
        podman logs "$CONTAINER_NAME"
        exit 1
    fi
    
    log_success "Container is running"
    
    # Check health
    HEALTH_STATUS=$(podman inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
    log_info "Container health status: $HEALTH_STATUS"
    
    # Test HTTP access
    sleep 5
    if curl -sf "http://$CONTAINER_IP:3000" > /dev/null; then
        log_success "HTTP endpoint is accessible at http://$CONTAINER_IP:3000"
    else
        log_warning "HTTP endpoint might not be ready yet (give it a few more seconds)"
    fi
    
    # Display container info
    log_info "Container Information:"
    podman inspect "$CONTAINER_NAME" | grep -A 5 "\"Id\":" | head -6
}

# Display summary
display_summary() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}Deployment Complete!${NC}"
    echo "=========================================="
    echo ""
    echo -e "${BLUE}Container Details:${NC}"
    echo "  Name: $CONTAINER_NAME"
    echo "  Image: $IMAGE_NAME:$IMAGE_VERSION"
    echo "  Network: $NETWORK_NAME"
    echo "  IP Address: $CONTAINER_IP"
    echo "  Port: 3000"
    echo ""
    echo -e "${BLUE}Access URLs:${NC}"
    echo "  Local: http://localhost:3000"
    echo "  Network: http://$CONTAINER_IP:3000"
    echo "  From Host (10.10.200.53): http://$CONTAINER_IP:3000"
    echo ""
    echo -e "${BLUE}Useful Commands:${NC}"
    echo "  View logs: podman logs -f $CONTAINER_NAME"
    echo "  Check status: podman ps | grep $CONTAINER_NAME"
    echo "  Stop container: podman stop $CONTAINER_NAME"
    echo "  Start container: podman start $CONTAINER_NAME"
    echo "  View container stats: podman stats $CONTAINER_NAME"
    echo ""
    echo "=========================================="
    echo ""
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ CSIR-SERC Recruitment Portal v2.0.0   ║${NC}"
    echo -e "${BLUE}║ Podman Deployment Script              ║${NC}"
    echo -e "${BLUE}║ Date: $(date '+%d %B %Y')         ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    check_prerequisites
    build_image
    stop_container
    run_container
    verify_deployment
    display_summary
}

# Run main function
main "$@"

exit 0

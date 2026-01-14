#!/bin/bash

################################################################################
# CSIR-SERC Recruitment Portal - Remote RockyLinux Deployment
# Deploys to Podman host (10.10.200.53) and removes old container
# Targets: 10.30.0.14 (Macvlan IP)
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_DIR="/home/ananth/Documents/Recruitment-Portal-NextJS"
CONTAINER_NAME="csir-serc-portal"
IMAGE_NAME="csir-serc-recruitment-portal"
IMAGE_TAG="3.0.0-rocky"
CONTAINER_IP="10.30.0.14"
NETWORK_NAME="mcvlan1"
PODMAN_HOST="10.10.200.53"
PODMAN_USER="root"

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

# Header
echo ""
echo -e "${BLUE}================================================================================${NC}"
echo -e "${BLUE}   CSIR-SERC Recruitment Portal - RockyLinux 10 Deployment${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

# Step 1: Verify build
log_info "Step 1: Verifying Next.js build..."
if [ ! -d "$PROJECT_DIR/.next" ]; then
    log_warning "Build directory not found. Running build..."
    cd "$PROJECT_DIR"
    npm run build
fi

if [ -d "$PROJECT_DIR/.next" ]; then
    log_success "Build directory verified"
else
    log_error "Build failed or build directory not found"
    exit 1
fi

# Step 2: Verify Docker/Podman
log_info "Step 2: Checking local Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_CMD="docker"
    log_success "Docker found"
elif command -v podman &> /dev/null; then
    DOCKER_CMD="podman"
    log_success "Podman found"
else
    log_error "Neither Docker nor Podman found. Install one and try again."
    exit 1
fi

# Step 3: Build container image
log_info "Step 3: Building RockyLinux 10 container image..."
echo -e "${YELLOW}Image: $IMAGE_NAME:$IMAGE_TAG${NC}"
cd "$PROJECT_DIR"

if $DOCKER_CMD build -t "$IMAGE_NAME:$IMAGE_TAG" . > /tmp/docker_build.log 2>&1; then
    log_success "Container image built successfully"
else
    log_error "Image build failed. Check logs:"
    tail -30 /tmp/docker_build.log
    exit 1
fi

# Step 4: Save image for transfer
log_info "Step 4: Preparing image for transfer..."
IMAGE_TARBALL="/tmp/${IMAGE_NAME}-${IMAGE_TAG}.tar"
echo -e "${YELLOW}Saving image to: $IMAGE_TARBALL${NC}"

if $DOCKER_CMD save "$IMAGE_NAME:$IMAGE_TAG" -o "$IMAGE_TARBALL" 2> /tmp/docker_save.log; then
    SIZE=$(du -h "$IMAGE_TARBALL" | cut -f1)
    log_success "Image saved ($SIZE)"
else
    log_error "Failed to save image"
    tail -10 /tmp/docker_save.log
    exit 1
fi

# Step 5: Transfer to Podman host
log_info "Step 5: Transferring image to Podman host ($PODMAN_HOST)..."
if scp "$IMAGE_TARBALL" "$PODMAN_USER@$PODMAN_HOST:/tmp/" > /tmp/scp.log 2>&1; then
    log_success "Image transferred successfully"
else
    log_error "SCP transfer failed"
    cat /tmp/scp.log
    exit 1
fi

# Step 6: Deploy on remote host
log_info "Step 6: Deploying on Podman host..."
echo ""

ssh "$PODMAN_USER@$PODMAN_HOST" << 'REMOTE_SCRIPT'
set -e

CONTAINER_NAME="csir-serc-portal"
IMAGE_NAME="csir-serc-recruitment-portal"
IMAGE_TAG="3.0.0-rocky"
CONTAINER_IP="10.30.0.14"
NETWORK_NAME="mcvlan1"
IMAGE_TARBALL="/tmp/${IMAGE_NAME}-${IMAGE_TAG}.tar"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[REMOTE] Performing remote deployment...${NC}"

# Step 6.1: Stop and remove old container
echo -e "${YELLOW}[REMOTE] Stopping old container...${NC}"
if podman ps -a | grep -q "$CONTAINER_NAME"; then
    podman stop "$CONTAINER_NAME" 2>/dev/null || true
    echo -e "${GREEN}[REMOTE] Container stopped${NC}"
else
    echo -e "${YELLOW}[REMOTE] No running container found${NC}"
fi

sleep 1

echo -e "${YELLOW}[REMOTE] Removing old container...${NC}"
if podman ps -a | grep -q "$CONTAINER_NAME"; then
    podman rm "$CONTAINER_NAME" 2>/dev/null || true
    echo -e "${GREEN}[REMOTE] Container removed${NC}"
else
    echo -e "${YELLOW}[REMOTE] No container to remove${NC}"
fi

# Step 6.2: Load image
echo -e "${YELLOW}[REMOTE] Loading image from tarball...${NC}"
if podman load -i "$IMAGE_TARBALL"; then
    echo -e "${GREEN}[REMOTE] Image loaded successfully${NC}"
else
    echo -e "${RED}[REMOTE] Failed to load image${NC}"
    exit 1
fi

# Step 6.3: Deploy new container
echo -e "${YELLOW}[REMOTE] Deploying new container to $CONTAINER_IP...${NC}"
if podman run -d \
    --name "$CONTAINER_NAME" \
    --network "$NETWORK_NAME" \
    --ip "$CONTAINER_IP" \
    -p 3000:3000 \
    -e NODE_ENV=production \
    "$IMAGE_NAME:$IMAGE_TAG" > /tmp/container_id.log 2>&1; then
    
    CONTAINER_ID=$(cat /tmp/container_id.log)
    echo -e "${GREEN}[REMOTE] Container deployed successfully${NC}"
    echo -e "${GREEN}[REMOTE] Container ID: ${CONTAINER_ID:0:12}${NC}"
else
    echo -e "${RED}[REMOTE] Container deployment failed${NC}"
    cat /tmp/container_id.log
    exit 1
fi

# Step 6.4: Wait for startup
echo -e "${YELLOW}[REMOTE] Waiting for container to start...${NC}"
sleep 3

# Step 6.5: Verify container
echo -e "${YELLOW}[REMOTE] Verifying container status...${NC}"
if podman ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${GREEN}[REMOTE] Container is running${NC}"
    podman ps | grep "$CONTAINER_NAME"
else
    echo -e "${RED}[REMOTE] Container is not running${NC}"
    echo -e "${YELLOW}[REMOTE] Container logs:${NC}"
    podman logs "$CONTAINER_NAME" | tail -20
    exit 1
fi

# Step 6.6: Test health check
echo -e "${YELLOW}[REMOTE] Testing health check...${NC}"
sleep 2
if podman healthcheck run "$CONTAINER_NAME" > /dev/null 2>&1; then
    echo -e "${GREEN}[REMOTE] Health check passed${NC}"
else
    echo -e "${YELLOW}[REMOTE] Health check pending (may need a few seconds)${NC}"
fi

# Step 6.7: Cleanup
echo -e "${YELLOW}[REMOTE] Cleaning up...${NC}"
rm -f "$IMAGE_TARBALL"
echo -e "${GREEN}[REMOTE] Cleanup complete${NC}"

echo ""
echo -e "${GREEN}[REMOTE] Remote deployment complete!${NC}"

REMOTE_SCRIPT

if [ $? -eq 0 ]; then
    log_success "Remote deployment completed successfully"
else
    log_error "Remote deployment failed"
    exit 1
fi

# Step 7: Verification
log_info "Step 7: Post-deployment verification..."
echo ""
echo -e "${YELLOW}Testing connectivity to $CONTAINER_IP:3000${NC}"

# Give container time to fully start
sleep 3

# Test HTTP response
if timeout 5 curl -s -o /dev/null -w "%{http_code}" http://$CONTAINER_IP:3000 | grep -q "200"; then
    log_success "HTTP 200 response received"
else
    log_warning "Could not verify HTTP response (network may be isolated)"
fi

# Step 8: Summary
echo ""
echo -e "${GREEN}================================================================================${NC}"
echo -e "${GREEN}                         DEPLOYMENT COMPLETE${NC}"
echo -e "${GREEN}================================================================================${NC}"
echo ""
echo -e "${BLUE}Container Information:${NC}"
echo "  Name:          $CONTAINER_NAME"
echo "  Image:         $IMAGE_NAME:$IMAGE_TAG"
echo "  Base OS:       RockyLinux 10"
echo "  Node.js:       20 LTS"
echo "  IP Address:    $CONTAINER_IP"
echo "  Port:          3000"
echo "  Environment:   production"
echo ""
echo -e "${BLUE}Access Information:${NC}"
echo "  URL:           http://$CONTAINER_IP:3000"
echo "  Podman Host:   $PODMAN_HOST"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  Status:        ssh $PODMAN_USER@$PODMAN_HOST \"podman ps | grep $CONTAINER_NAME\""
echo "  Logs:          ssh $PODMAN_USER@$PODMAN_HOST \"podman logs $CONTAINER_NAME\""
echo "  Stop:          ssh $PODMAN_USER@$PODMAN_HOST \"podman stop $CONTAINER_NAME\""
echo "  Restart:       ssh $PODMAN_USER@$PODMAN_HOST \"podman restart $CONTAINER_NAME\""
echo ""

# Cleanup local tarball
rm -f "$IMAGE_TARBALL"
log_success "Local cleanup complete"

echo ""
log_success "All done! The application is now deployed with RockyLinux 10"
echo ""

#!/bin/bash

################################################################################
# CSIR-SERC Recruitment Portal - Direct Remote Deployment
# Deploys by copying source code and building on Podman host
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
REMOTE_BUILD_DIR="/tmp/csir-serc-build"

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
echo -e "${BLUE}   CSIR-SERC Recruitment Portal - RockyLinux 10 Direct Deployment${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

# Step 1: Verify build
log_info "Step 1: Verifying Next.js build..."
if [ ! -d "$PROJECT_DIR/.next" ]; then
    log_error "Build directory not found"
    exit 1
fi
log_success "Build directory verified"

# Step 2: Test SSH connection
log_info "Step 2: Testing SSH connection to Podman host..."
if ! ssh -o ConnectTimeout=5 "$PODMAN_USER@$PODMAN_HOST" "echo 'Connected'" > /dev/null 2>&1; then
    log_error "Cannot connect to $PODMAN_HOST"
    log_warning "Make sure you have SSH access and the host is reachable"
    exit 1
fi
log_success "SSH connection verified"

# Step 3: Copy project to remote host
log_info "Step 3: Copying project to Podman host..."
log_warning "Creating remote build directory: $REMOTE_BUILD_DIR"

ssh "$PODMAN_USER@$PODMAN_HOST" "rm -rf $REMOTE_BUILD_DIR && mkdir -p $REMOTE_BUILD_DIR"

log_warning "Uploading project files (this may take a minute)..."
scp -r "$PROJECT_DIR/src" "$PODMAN_USER@$PODMAN_HOST:$REMOTE_BUILD_DIR/" > /dev/null 2>&1
scp -r "$PROJECT_DIR/public" "$PODMAN_USER@$PODMAN_HOST:$REMOTE_BUILD_DIR/" > /dev/null 2>&1
scp "$PROJECT_DIR/package.json" "$PODMAN_USER@$PODMAN_HOST:$REMOTE_BUILD_DIR/" > /dev/null 2>&1
scp "$PROJECT_DIR/package-lock.json" "$PODMAN_USER@$PODMAN_HOST:$REMOTE_BUILD_DIR/" > /dev/null 2>&1
scp "$PROJECT_DIR/tsconfig.json" "$PODMAN_USER@$PODMAN_HOST:$REMOTE_BUILD_DIR/" > /dev/null 2>&1
scp "$PROJECT_DIR/next.config.js" "$PODMAN_USER@$PODMAN_HOST:$REMOTE_BUILD_DIR/" > /dev/null 2>&1
scp "$PROJECT_DIR/tailwind.config.ts" "$PODMAN_USER@$PODMAN_HOST:$REMOTE_BUILD_DIR/" > /dev/null 2>&1
scp "$PROJECT_DIR/Dockerfile" "$PODMAN_USER@$PODMAN_HOST:$REMOTE_BUILD_DIR/" > /dev/null 2>&1

log_success "Project files uploaded"

# Step 4: Remote build and deployment
log_info "Step 4: Building and deploying on Podman host..."
echo ""

ssh "$PODMAN_USER@$PODMAN_HOST" << 'REMOTE_SCRIPT'
set -e

CONTAINER_NAME="csir-serc-portal"
IMAGE_NAME="csir-serc-recruitment-portal"
IMAGE_TAG="3.0.0-rocky"
CONTAINER_IP="10.30.0.14"
NETWORK_NAME="mcvlan1"
REMOTE_BUILD_DIR="/tmp/csir-serc-build"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[REMOTE] Building on Podman host...${NC}"

# Step 4.1: Build image
echo -e "${YELLOW}[REMOTE] Building RockyLinux 10 image...${NC}"
cd "$REMOTE_BUILD_DIR"

if podman build -t "$IMAGE_NAME:$IMAGE_TAG" . > /tmp/podman_build.log 2>&1; then
    echo -e "${GREEN}[REMOTE] Image built successfully${NC}"
else
    echo -e "${RED}[REMOTE] Build failed${NC}"
    tail -20 /tmp/podman_build.log
    exit 1
fi

# Step 4.2: Stop and remove old container
echo -e "${YELLOW}[REMOTE] Stopping old container...${NC}"
if podman ps -a | grep -q "$CONTAINER_NAME"; then
    podman stop "$CONTAINER_NAME" 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}[REMOTE] Container stopped${NC}"
else
    echo -e "${YELLOW}[REMOTE] No running container found${NC}"
fi

echo -e "${YELLOW}[REMOTE] Removing old container...${NC}"
if podman ps -a | grep -q "$CONTAINER_NAME"; then
    podman rm "$CONTAINER_NAME" 2>/dev/null || true
    echo -e "${GREEN}[REMOTE] Container removed${NC}"
else
    echo -e "${YELLOW}[REMOTE] No container to remove${NC}"
fi

# Step 4.3: Deploy new container
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

# Step 4.4: Wait for startup
echo -e "${YELLOW}[REMOTE] Waiting for container to start...${NC}"
sleep 4

# Step 4.5: Verify container
echo -e "${YELLOW}[REMOTE] Verifying container status...${NC}"
if podman ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${GREEN}[REMOTE] Container is running${NC}"
    podman ps | grep "$CONTAINER_NAME"
else
    echo -e "${RED}[REMOTE] Container is not running${NC}"
    echo -e "${YELLOW}[REMOTE] Container logs:${NC}"
    podman logs "$CONTAINER_NAME" | tail -30
    exit 1
fi

# Step 4.6: Test health
echo -e "${YELLOW}[REMOTE] Testing container health...${NC}"
sleep 2
if timeout 5 curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200"; then
    echo -e "${GREEN}[REMOTE] Health check passed (HTTP 200)${NC}"
else
    echo -e "${YELLOW}[REMOTE] Health check pending (check logs)${NC}"
fi

# Step 4.7: Cleanup
echo -e "${YELLOW}[REMOTE] Cleaning up build directory...${NC}"
cd /tmp && rm -rf "$REMOTE_BUILD_DIR"
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

# Step 5: Final verification
echo ""
log_info "Step 5: Final verification..."
sleep 2

# Test from local machine if possible
if timeout 5 curl -s -I "http://$CONTAINER_IP:3000" > /tmp/curl_result.log 2>&1; then
    if grep -q "200 OK" /tmp/curl_result.log; then
        log_success "HTTP 200 response received from $CONTAINER_IP:3000"
    else
        log_warning "Could not verify HTTP response (network isolation)"
    fi
else
    log_warning "Could not test from local machine (network isolation or container still starting)"
fi

# Summary
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
echo "  Live logs:     ssh $PODMAN_USER@$PODMAN_HOST \"podman logs -f $CONTAINER_NAME\""
echo ""
echo -e "${GREEN}The application is now deployed with RockyLinux 10 at $CONTAINER_IP:3000${NC}"
echo ""

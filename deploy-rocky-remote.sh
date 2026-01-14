#!/bin/bash

################################################################################
# CSIR-SERC Recruitment Portal - Remote RockyLinux Deployment
# STRATEGY: Source Transfer & Remote Build (since local environment lacks build tools)
# Deploys to Podman host (10.10.200.53) -> Containers target 10.30.0.14
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_DIR="/home/ananth/Documents/Recruitment-Portal-NextJS.git"
CONTAINER_NAME="csir-serc-portal"
IMAGE_NAME="csir-serc-recruitment-portal"
IMAGE_TAG="3.0.0-rocky"
CONTAINER_IP="10.30.0.14"
NETWORK_NAME="mcvlan1"
PODMAN_HOST="10.10.200.53"
PODMAN_USER="root"
SSH_KEY="$HOME/.ssh/lmde7deskvmamd"
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no"

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
echo -e "${BLUE}   CSIR-SERC Recruitment Portal - Remote Build & Deploy${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

# Step 1: Prepare Source
log_info "Step 1: Preparing source archive..."
SOURCE_ARCHIVE="/tmp/portal-source.tar.gz"
cd "$PROJECT_DIR"
# Archive current directory, excluding git and heavy build artifacts
tar --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='template_reference' -czf "$SOURCE_ARCHIVE" .
SIZE=$(du -h "$SOURCE_ARCHIVE" | cut -f1)
log_success "Source archived ($SIZE)"

# Step 2: Transfer to Host
log_info "Step 2: Transferring source to Podman host ($PODMAN_HOST)..."
if scp $SSH_OPTS "$SOURCE_ARCHIVE" "$PODMAN_USER@$PODMAN_HOST:/tmp/portal-source.tar.gz"; then
    log_success "Source transferred successfully"
else
    log_error "SCP transfer failed. Check SSH key permissions/paths."
    exit 1
fi

# Step 3: Remote Build & Deploy
log_info "Step 3: Executing remote build and deployment..."
echo ""

ssh $SSH_OPTS "$PODMAN_USER@$PODMAN_HOST" << 'REMOTE_SCRIPT'
set -e

# Variables (must match local)
CONTAINER_NAME="csir-serc-portal"
IMAGE_NAME="csir-serc-recruitment-portal"
IMAGE_TAG="3.0.0-rocky"
CONTAINER_IP="10.30.0.14"
NETWORK_NAME="mcvlan1"
SOURCE_ARCHIVE="/tmp/portal-source.tar.gz"
BUILD_DIR="/tmp/portal-build"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[REMOTE] Starting remote operations...${NC}"

# 3.1 Unpack
echo -e "${YELLOW}[REMOTE] Unpacking source...${NC}"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
tar -xzf "$SOURCE_ARCHIVE" -C "$BUILD_DIR"
echo -e "${GREEN}[REMOTE] Source unpacked${NC}"

# 3.2 Build Image
echo -e "${YELLOW}[REMOTE] Building container image (Node 24 Alpine)...${NC}"
cd "$BUILD_DIR"
if podman build -t "$IMAGE_NAME:$IMAGE_TAG" . > /tmp/podman_build.log 2>&1; then
    echo -e "${GREEN}[REMOTE] Image built successfully${NC}"
else
    echo -e "${RED}[REMOTE] Image build failed${NC}"
    tail -30 /tmp/podman_build.log
    exit 1
fi

# 3.3 Stop Old Container
echo -e "${YELLOW}[REMOTE] Stopping old container...${NC}"
if podman ps -a | grep -q "$CONTAINER_NAME"; then
    podman stop "$CONTAINER_NAME" 2>/dev/null || true
    echo -e "${GREEN}[REMOTE] Container stopped${NC}"
else
    echo -e "${YELLOW}[REMOTE] No running container found${NC}"
fi

sleep 1

# 3.4 Remove Old Container
echo -e "${YELLOW}[REMOTE] Removing old container...${NC}"
if podman ps -a | grep -q "$CONTAINER_NAME"; then
    podman rm "$CONTAINER_NAME" 2>/dev/null || true
    echo -e "${GREEN}[REMOTE] Container removed${NC}"
else
    echo -e "${YELLOW}[REMOTE] No container to remove${NC}"
fi

# 3.5 Deploy New Container
echo -e "${YELLOW}[REMOTE] Deploying new container to $CONTAINER_IP...${NC}"
# Note: Using --init or dumb-init from image? Image has dumb-init entrypoint.
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

# 3.6 Wait & Verify
echo -e "${YELLOW}[REMOTE] Waiting for container startup...${NC}"
sleep 5
if podman ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${GREEN}[REMOTE] Container is running${NC}"
else
    echo -e "${RED}[REMOTE] Container is not running${NC}"
    podman logs "$CONTAINER_NAME" | tail -20
    exit 1
fi

# 3.7 Cleanup
rm -rf "$BUILD_DIR" "$SOURCE_ARCHIVE"
echo -e "${GREEN}[REMOTE] Remote cleanup complete${NC}"

REMOTE_SCRIPT

if [ $? -eq 0 ]; then
    log_success "Remote build and deployment completed successfully"
else
    log_error "Remote operations failed"
    exit 1
fi

# Step 4: Verification (Local check of remote)
# We can't curl the container IP from here likely (unless VPN), but we can confirm via SSH
log_info "Step 4: Final verification..."
ssh $SSH_OPTS "$PODMAN_USER@$PODMAN_HOST" "podman ps | grep $CONTAINER_NAME"

echo ""
echo -e "${GREEN}DEPLOYMENT COMPLETE${NC}"

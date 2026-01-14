#!/bin/bash

# CSIR-SERC Recruitment Portal v3.0.0 - Quick Deploy Script
# This script handles building and deploying to 10.30.0.14
# Run this from: /home/ananth/Documents/Recruitment-Portal-NextJS

set -e

echo "======================================"
echo "CSIR-SERC Portal v3.0.0 Deployment"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/home/ananth/Documents/Recruitment-Portal-NextJS"
IMAGE_NAME="csir-serc-recruitment-portal"
IMAGE_VERSION="3.0.0"
CONTAINER_NAME="csir-serc-portal"
CONTAINER_IP="10.30.0.14"
PODMAN_HOST="10.10.200.53"

# Step 1: Verify build is successful
echo -e "\n${YELLOW}Step 1: Verifying Next.js build...${NC}"
if [ ! -d "$PROJECT_DIR/.next" ]; then
    echo -e "${YELLOW}Building application...${NC}"
    cd "$PROJECT_DIR"
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Build successful${NC}"
    else
        echo -e "${RED}✗ Build failed${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Build directory found${NC}"
fi

# Step 2: Check Docker/Podman
echo -e "\n${YELLOW}Step 2: Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    CONTAINER_CMD="docker"
    echo -e "${GREEN}✓ Docker found${NC}"
elif command -v podman &> /dev/null; then
    CONTAINER_CMD="podman"
    echo -e "${GREEN}✓ Podman found${NC}"
else
    echo -e "${RED}✗ Neither Docker nor Podman found${NC}"
    exit 1
fi

# Step 3: Build container image
echo -e "\n${YELLOW}Step 3: Building container image...${NC}"
echo "Running: $CONTAINER_CMD build -t $IMAGE_NAME:$IMAGE_VERSION ."
cd "$PROJECT_DIR"
if $CONTAINER_CMD build -t "$IMAGE_NAME:$IMAGE_VERSION" . > /tmp/docker_build.log 2>&1; then
    echo -e "${GREEN}✓ Image built successfully${NC}"
    echo "   Image: $IMAGE_NAME:$IMAGE_VERSION"
else
    echo -e "${RED}✗ Image build failed${NC}"
    tail -20 /tmp/docker_build.log
    exit 1
fi

# Step 4: Information about manual deployment
echo -e "\n${YELLOW}Step 4: Deployment Information${NC}"
echo ""
echo "The Docker image has been built and is ready for deployment."
echo ""
echo "To deploy to 10.30.0.14, execute on the Podman host (10.10.200.53):"
echo ""
echo -e "${YELLOW}--- OPTION A: Manual Deployment (Recommended) ---${NC}"
echo "ssh root@$PODMAN_HOST << 'EOF'"
echo "  # Remove old container if exists"
echo "  podman stop $CONTAINER_NAME 2>/dev/null || true"
echo "  podman rm $CONTAINER_NAME 2>/dev/null || true"
echo ""
echo "  # Deploy fresh container"
echo "  podman run -d \\"
echo "    --name $CONTAINER_NAME \\"
echo "    --network mcvlan1 \\"
echo "    --ip $CONTAINER_IP \\"
echo "    -p 3000:3000 \\"
echo "    -e NODE_ENV=production \\"
echo "    $IMAGE_NAME:$IMAGE_VERSION"
echo ""
echo "  # Verify"
echo "  podman ps | grep $CONTAINER_NAME"
echo "EOF"
echo ""
echo -e "${YELLOW}--- OPTION B: Using docker-compose ---${NC}"
echo "cd $PROJECT_DIR"
echo "docker-compose up -d --build"
echo ""

# Step 5: Testing commands
echo -e "${YELLOW}--- Testing Commands ---${NC}"
echo ""
echo "Test 1: Check container status"
echo "  ssh root@$PODMAN_HOST \"podman ps | grep $CONTAINER_NAME\""
echo ""
echo "Test 2: Check HTTP response"
echo "  curl -I http://$CONTAINER_IP:3000"
echo ""
echo "Test 3: Check for content"
echo "  curl http://$CONTAINER_IP:3000 | head -50"
echo ""
echo "Test 4: View container logs"
echo "  ssh root@$PODMAN_HOST \"podman logs $CONTAINER_NAME\""
echo ""

# Step 6: Success message
echo -e "\n${GREEN}======================================"
echo "Build Complete - Ready for Deployment"
echo "======================================${NC}"
echo ""
echo "Image Name:    $IMAGE_NAME:$IMAGE_VERSION"
echo "Container:     $CONTAINER_NAME"
echo "Target IP:     $CONTAINER_IP"
echo "Target Port:   3000"
echo "Podman Host:   $PODMAN_HOST"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Follow OPTION A or B above to deploy to 10.30.0.14"
echo "2. Run testing commands to verify deployment"
echo "3. Access http://$CONTAINER_IP:3000 in your browser"
echo ""
echo -e "${GREEN}Deployment documentation:${NC}"
echo "  - See: DEPLOYMENT_INSTRUCTIONS_V3.md"
echo "  - See: TECHNICAL_SUMMARY_V3.md"
echo "  - See: CHANGELOG_V3.md"
echo ""

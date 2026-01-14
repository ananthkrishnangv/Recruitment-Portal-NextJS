# CSIR-SERC Recruitment Portal - Deployment Guide (Next.js Edition v2.0.0)

## Overview

This is a completely redesigned and modernized version of the CSIR-SERC Recruitment Portal built with:
- **Framework**: Next.js 15 (React 18.3)
- **Styling**: Tailwind CSS 3.4
- **Runtime**: Node.js 20 LTS
- **Container**: Podman/Docker
- **Network**: Macvlan (mcvlan1)

---

## Pre-Deployment Checklist

### System Requirements
- **Podman** or **Docker** installed
- **Podman Host**: 10.10.200.53
- **Macvlan Network**: mcvlan1
- **Target IP**: 10.30.0.14
- **Node.js 20+** (for local development)

### Environment Configuration
Ensure the following environment variables are set:

```bash
export NEXT_PUBLIC_GEMINI_API_KEY="your_gemini_api_key_here"
export NODE_ENV="production"
```

---

## Building the Docker Image

### Using Podman (Recommended)

```bash
cd /home/ananth/Documents/Recruitment-Portal-NextJS

# Build the image
podman build -t csir-serc-recruitment-portal:2.0.0 .

# Verify the build
podman images | grep csir-serc
```

### Using Docker

```bash
docker build -t csir-serc-recruitment-portal:2.0.0 .
```

---

## Deployment with docker-compose

### Prerequisites
Ensure the `mcvlan1` network exists on your Podman host:

```bash
# Check existing networks
podman network ls

# If mcvlan1 doesn't exist, create it
podman network create -d macvlan \
  --subnet=10.30.0.0/24 \
  --gateway=10.30.0.1 \
  -o parent=eth0 \
  mcvlan1
```

### Deployment Steps

1. **Navigate to the project directory**:
   ```bash
   cd /home/ananth/Documents/Recruitment-Portal-NextJS
   ```

2. **Create .env file for production secrets**:
   ```bash
   cat > .env.production.local << 'EOF'
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   NODE_ENV=production
   EOF
   ```

3. **Deploy using docker-compose**:
   ```bash
   # Using Podman Compose
   podman-compose -f docker-compose.yml up -d

   # OR using Docker Compose
   docker-compose -f docker-compose.yml up -d
   ```

4. **Verify deployment**:
   ```bash
   # Check container status
   podman ps | grep csir-serc-portal

   # Check logs
   podman logs -f csir-serc-portal

   # Test the application
   curl -I http://10.30.0.14:3000
   ```

---

## Manual Podman Deployment

If you prefer not to use docker-compose:

```bash
# Build image
podman build -t csir-serc-recruitment-portal:2.0.0 .

# Run container with macvlan network
podman run -d \
  --name csir-serc-portal \
  --network mcvlan1 \
  --ip 10.30.0.14 \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_GEMINI_API_KEY="your_api_key" \
  --restart unless-stopped \
  --health-cmd="wget --quiet --tries=1 --spider http://localhost:3000 || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  --health-start-period=40s \
  csir-serc-recruitment-portal:2.0.0
```

---

## Network Troubleshooting

### Check Connectivity
```bash
# From host
ping 10.30.0.14

# From another container
podman run --network mcvlan1 alpine ping 10.30.0.14

# Test HTTP
curl http://10.30.0.14:3000
```

### Fix Network Issues

If the container can't reach the host:
```bash
# Check macvlan parent interface
ip link show eth0

# Verify network configuration
podman network inspect mcvlan1

# If needed, recreate the network
podman network rm mcvlan1
podman network create -d macvlan \
  --subnet=10.30.0.0/24 \
  --gateway=10.30.0.1 \
  -o parent=eth0 \
  mcvlan1
```

---

## Access the Application

Once deployed successfully:

- **URL**: http://10.30.0.14:3000
- **Host Access**: http://localhost:3000 (if running locally)

---

## Container Management

### Useful Commands

```bash
# View logs
podman logs csir-serc-portal
podman logs -f csir-serc-portal  # Follow logs

# Check container status
podman ps
podman inspect csir-serc-portal

# Stop container
podman stop csir-serc-portal

# Start container
podman start csir-serc-portal

# Restart container
podman restart csir-serc-portal

# Remove container
podman rm csir-serc-portal

# Execute command in running container
podman exec -it csir-serc-portal /bin/sh

# Copy files to/from container
podman cp /local/path csir-serc-portal:/container/path
podman cp csir-serc-portal:/container/path /local/path
```

---

## Updating the Deployment

To deploy a new version:

```bash
# Pull latest code
cd /home/ananth/Documents/Recruitment-Portal-NextJS
git pull origin main

# Rebuild image
podman build -t csir-serc-recruitment-portal:2.0.1 .

# Stop old container
podman stop csir-serc-portal

# Remove old container
podman rm csir-serc-portal

# Run new container
podman-compose -f docker-compose.yml up -d
```

---

## Performance Tuning

### Optimize Memory Usage
```bash
podman run ... \
  -m 512m \
  --memory-swap 1g \
  ...
```

### Enable Resource Limits
```bash
podman run ... \
  -m 1g \
  --cpus 2 \
  ...
```

---

## Security Considerations

1. **Run as non-root**: Container runs as `nextjs` user (UID 1001)
2. **Health checks**: Automated health monitoring is enabled
3. **Security options**: Dropped all capabilities except NET_BIND_SERVICE
4. **Read-only filesystem**: Root filesystem is read-only
5. **No privilege escalation**: `no-new-privileges` security option enabled

---

## Backup & Recovery

### Backup Application Data
```bash
podman volume create recruitment-portal-backup
podman run --rm -v recruitment-portal:/data -v recruitment-portal-backup:/backup \
  alpine tar czf /backup/portal-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore from Backup
```bash
podman run --rm -v recruitment-portal:/data -v recruitment-portal-backup:/backup \
  alpine tar xzf /backup/portal-backup-latest.tar.gz -C /data
```

---

## Monitoring & Logging

### Setup Log Aggregation
```bash
# View last 100 lines of logs
podman logs --tail 100 csir-serc-portal

# View logs with timestamps
podman logs -t csir-serc-portal

# Save logs to file
podman logs csir-serc-portal > /var/log/csir-serc-portal.log
```

### Monitor Container Stats
```bash
podman stats csir-serc-portal
```

---

## Troubleshooting

### Application not accessible (HTTP 500)
1. Check logs: `podman logs csir-serc-portal`
2. Verify environment variables: `podman inspect csir-serc-portal`
3. Ensure .env.production.local exists with correct API keys

### Network issues
1. Verify macvlan network: `podman network inspect mcvlan1`
2. Check container IP: `podman inspect csir-serc-portal | grep IPAddress`
3. Test connectivity: `ping 10.30.0.14`

### Container crashes
1. Check exit code: `podman ps -a csir-serc-portal`
2. Review logs for errors: `podman logs csir-serc-portal`
3. Verify build success: `podman build -t test-image .`

---

## Reverting to Previous Version

```bash
# Tag old image as fallback
podman tag csir-serc-recruitment-portal:2.0.0 csir-serc-recruitment-portal:stable

# Switch back if needed
podman stop csir-serc-portal
podman rm csir-serc-portal
podman run -d ... csir-serc-recruitment-portal:stable
```

---

## Support & Contact

For deployment issues, contact:
- **Email**: ict.serc@csir.res.in
- **Internal Support**: Structural Engineering Research Centre, Chennai

---

## Changelog

### v2.0.0
- ✅ Migrated from React+Vite to Next.js 15
- ✅ Improved performance with Server-Side Rendering
- ✅ Better SEO with meta tags
- ✅ Enhanced security with CSP headers
- ✅ Optimized Docker image size
- ✅ Multi-stage Docker build
- ✅ Health checks built-in
- ✅ Non-root user execution
- ✅ Macvlan network support
- ✅ Production-ready docker-compose

---

**Last Updated**: 14 January 2026  
**Version**: 2.0.0  
**Status**: Production Ready

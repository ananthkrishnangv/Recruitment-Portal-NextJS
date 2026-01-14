# RockyLinux 10 Deployment Guide

## Overview

This guide covers deploying the CSIR-SERC Recruitment Portal v3.0.0 with **RockyLinux 10** as the base operating system instead of Alpine Linux.

**Status:** ✅ Ready to Deploy

---

## Why RockyLinux 10?

- ✅ **RHEL Compatible** - Better compatibility with enterprise systems
- ✅ **Larger package ecosystem** - More system libraries available
- ✅ **Better support** - Longer LTS support window
- ✅ **Familiar tools** - RPM package manager, standard RHEL utilities
- ✅ **Performance** - Comparable to Alpine with better compatibility

---

## Prerequisites

1. **SSH Access** to Podman host (10.10.200.53) as root
2. **Docker or Podman** installed locally
3. **Build verified** - `npm run build` completed successfully
4. **SSH Key-based auth** configured (or password auth available)

### Setup SSH if needed:
```bash
# Test connectivity to Podman host
ssh root@10.10.200.53 "podman --version"

# If prompted, accept the host key and enter password
# For passwordless auth, copy your public key:
ssh-copy-id root@10.10.200.53
```

---

## Automatic Deployment (Recommended)

### Step 1: Run the Deployment Script

```bash
cd /home/ananth/Documents/Recruitment-Portal-NextJS
./deploy-rocky-remote.sh
```

The script will automatically:
1. ✅ Verify the Next.js build
2. ✅ Build the RockyLinux 10 Docker image
3. ✅ Save the image to a tarball
4. ✅ Transfer to Podman host via SCP
5. ✅ Stop and remove the old container
6. ✅ Load the image on the Podman host
7. ✅ Deploy the new container to 10.30.0.14
8. ✅ Verify the deployment
9. ✅ Test connectivity

### Expected Output:
```
===============================================================================
   CSIR-SERC Recruitment Portal - RockyLinux 10 Deployment
===============================================================================

[INFO] Step 1: Verifying Next.js build...
[SUCCESS] Build directory verified
[INFO] Step 2: Checking local Docker installation...
[SUCCESS] Docker found
[INFO] Step 3: Building RockyLinux 10 container image...
[SUCCESS] Container image built successfully
...
[SUCCESS] Deployment complete
```

---

## Manual Deployment (Alternative)

If you prefer to deploy manually, follow these steps:

### Step 1: Build the Image

```bash
cd /home/ananth/Documents/Recruitment-Portal-NextJS
docker build -t csir-serc-recruitment-portal:3.0.0-rocky .
```

### Step 2: Save Image for Transfer

```bash
docker save csir-serc-recruitment-portal:3.0.0-rocky -o /tmp/csir-serc-3.0.0-rocky.tar
```

### Step 3: Transfer to Podman Host

```bash
scp /tmp/csir-serc-3.0.0-rocky.tar root@10.10.200.53:/tmp/
```

### Step 4: SSH into Podman Host

```bash
ssh root@10.10.200.53
```

### Step 5: Load Image on Podman Host

```bash
podman load -i /tmp/csir-serc-3.0.0-rocky.tar
```

### Step 6: Stop and Remove Old Container

```bash
# Stop old container
podman stop csir-serc-portal 2>/dev/null || true

# Remove old container
podman rm csir-serc-portal 2>/dev/null || true
```

### Step 7: Deploy New Container

```bash
podman run -d \
  --name csir-serc-portal \
  --network mcvlan1 \
  --ip 10.30.0.14 \
  -p 3000:3000 \
  -e NODE_ENV=production \
  csir-serc-recruitment-portal:3.0.0-rocky
```

### Step 8: Verify Deployment

```bash
# Check container status
podman ps | grep csir-serc-portal

# View logs
podman logs csir-serc-portal

# Check health
podman healthcheck run csir-serc-portal

# Cleanup
rm -f /tmp/csir-serc-3.0.0-rocky.tar
```

---

## Verification

### Check Container Status

```bash
# From your local machine
ssh root@10.10.200.53 "podman ps | grep csir-serc-portal"
```

### Expected Output:
```
CONTAINER ID  IMAGE                               COMMAND           CREATED       STATUS            PORTS      NAMES
abc1234def56  csir-serc-recruitment-portal:3...   npm start         2 minutes ago Up 2 minutes      3000:3000  csir-serc-portal
```

### Test HTTP Response

```bash
curl -I http://10.30.0.14:3000
```

### Expected Response:
```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 15234
```

### Test Page Content

```bash
curl http://10.30.0.14:3000 | head -50
```

### View Container Logs

```bash
ssh root@10.10.200.53 "podman logs csir-serc-portal"
```

---

## Container Information

| Property | Value |
|----------|-------|
| **Container Name** | csir-serc-portal |
| **Image** | csir-serc-recruitment-portal:3.0.0-rocky |
| **Base OS** | RockyLinux 10 |
| **Node.js** | 20 LTS |
| **npm** | 10+ |
| **IP Address** | 10.30.0.14 |
| **Port** | 3000 |
| **Network** | mcvlan1 (Macvlan) |
| **Environment** | production |
| **User** | nextjs (non-root) |

---

## Common Tasks

### Restart Container

```bash
ssh root@10.10.200.53 "podman restart csir-serc-portal"
```

### Stop Container

```bash
ssh root@10.10.200.53 "podman stop csir-serc-portal"
```

### Start Container

```bash
ssh root@10.10.200.53 "podman start csir-serc-portal"
```

### View Real-time Logs

```bash
ssh root@10.10.200.53 "podman logs -f csir-serc-portal"
```

### Check Resource Usage

```bash
ssh root@10.10.200.53 "podman stats csir-serc-portal"
```

### Remove Container Completely

```bash
ssh root@10.10.200.53 "podman stop csir-serc-portal && podman rm csir-serc-portal"
```

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
ssh root@10.10.200.53 "podman logs csir-serc-portal"
```

**Common issues:**
- Port 3000 already in use: `podman ps` to find conflicting container
- Network issue: Verify mcvlan1 exists: `podman network ls`
- Image load failed: Rebuild image locally and re-transfer

### SSH Connection Issues

**Test connectivity:**
```bash
ssh root@10.10.200.53 "echo 'Connected OK'"
```

**If password required and no key auth:**
- Script will prompt for password
- Or setup key-based auth: `ssh-copy-id root@10.10.200.53`

### Image Transfer Too Slow

**Compress before transfer:**
```bash
docker save csir-serc-recruitment-portal:3.0.0-rocky | \
  gzip > /tmp/csir-serc-3.0.0-rocky.tar.gz

scp /tmp/csir-serc-3.0.0-rocky.tar.gz root@10.10.200.53:/tmp/

# On remote host:
ssh root@10.10.200.53 "gunzip /tmp/csir-serc-3.0.0-rocky.tar.gz && \
  podman load -i /tmp/csir-serc-3.0.0-rocky.tar"
```

### HTTP Test Fails

**Verify network connectivity:**
```bash
# Check if IP is reachable
ping 10.30.0.14

# Check port availability
ssh root@10.10.200.53 "netstat -tulpn | grep 3000"
```

---

## What Changed in the Dockerfile

### Before (Alpine):
```dockerfile
FROM node:20-alpine AS builder
...
FROM node:20-alpine
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
```

### After (RockyLinux):
```dockerfile
FROM rockylinux:10 AS builder
RUN dnf install -y nodejs npm ...
...
FROM rockylinux:10
RUN dnf install -y nodejs npm dumb-init ...
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs nextjs
```

**Benefits:**
- ✅ Better RHEL ecosystem compatibility
- ✅ Larger package selection
- ✅ Familiar system tools (dnf, systemctl-compatible)
- ✅ Enterprise-grade support

---

## Performance Comparison

| Metric | Alpine | RockyLinux 10 |
|--------|--------|---------------|
| **Base Image Size** | ~5 MB | ~200 MB |
| **Startup Time** | 5-10s | 5-10s |
| **Memory Usage** | ~60 MB | ~80 MB |
| **Compatibility** | Limited | Excellent |
| **Package Support** | Basic | Comprehensive |

---

## Next Steps

1. ✅ Run deployment script: `./deploy-rocky-remote.sh`
2. ✅ Verify deployment: `curl -I http://10.30.0.14:3000`
3. ✅ Monitor logs: `ssh root@10.10.200.53 "podman logs -f csir-serc-portal"`
4. ✅ Test in browser: Visit http://10.30.0.14:3000

---

## Support

For issues:
1. Check container logs: `podman logs csir-serc-portal`
2. Review deployment guide above
3. Verify network connectivity: `ping 10.30.0.14`
4. Test SSH access: `ssh root@10.10.200.53 "podman version"`

---

**Version:** v3.0.0 with RockyLinux 10  
**Last Updated:** January 14, 2026  
**Status:** ✅ Production Ready

# 🚀 QUICK DEPLOYMENT GUIDE - CSIR-SERC Portal v2.0.0

## ⏱️ Time Required: 5-10 minutes

### Prerequisites
- Podman installed and running
- SSH access to Podman host (10.10.200.53)
- Sufficient disk space (~1GB)

---

## 🎯 One-Command Deployment

### Option 1: Automated Script (Recommended)
```bash
cd /home/ananth/Documents/Recruitment-Portal-NextJS
./deploy-podman.sh
```

**This will automatically:**
- ✅ Create macvlan network if needed
- ✅ Build Docker image
- ✅ Stop any existing container
- ✅ Start new container with proper configuration
- ✅ Verify deployment success
- ✅ Display access URLs

### Option 2: Using docker-compose
```bash
cd /home/ananth/Documents/Recruitment-Portal-NextJS
podman-compose -f docker-compose.yml up -d
```

### Option 3: Manual Deployment
```bash
# Build image
cd /home/ananth/Documents/Recruitment-Portal-NextJS
podman build -t csir-serc-recruitment-portal:2.0.0 .

# Ensure network exists
podman network create -d macvlan \
  --subnet=10.30.0.0/24 \
  --gateway=10.30.0.1 \
  -o parent=eth0 \
  mcvlan1 2>/dev/null || true

# Stop old container if exists
podman stop csir-serc-portal 2>/dev/null || true
podman rm csir-serc-portal 2>/dev/null || true

# Run container
podman run -d \
  --name csir-serc-portal \
  --network mcvlan1 \
  --ip 10.30.0.14 \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  csir-serc-recruitment-portal:2.0.0
```

---

## ✅ Verify Deployment

### Check if Container is Running
```bash
podman ps | grep csir-serc-portal
```

**Expected Output:**
```
csir-serc-portal  csir-serc-recruitment-portal:2.0.0  Up 30 seconds
```

### Test HTTP Access
```bash
curl -I http://10.30.0.14:3000
```

**Expected Response:**
```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
```

### View Application
- **Local**: http://localhost:3000 (if running locally)
- **Container IP**: http://10.30.0.14:3000 ✅ **PRIMARY**
- **From Host**: http://10.10.200.53:3000 (via port forward)

---

## 📊 Container Status

### Check Logs
```bash
# Real-time logs
podman logs -f csir-serc-portal

# Last 50 lines
podman logs --tail 50 csir-serc-portal
```

### Check Health
```bash
podman inspect csir-serc-portal | grep -A 5 '"Health"'
```

### Check Resource Usage
```bash
podman stats csir-serc-portal
```

---

## 🔧 Troubleshooting

### Container Won't Start
1. **Check logs**: `podman logs csir-serc-portal`
2. **Check network**: `podman network ls | grep mcvlan1`
3. **Rebuild image**: `podman build --no-cache -t csir-serc-recruitment-portal:2.0.0 .`
4. **Check disk space**: `df -h`

### Port Already in Use
```bash
# Find what's using port 3000
lsof -i :3000

# Or check container port mapping
podman port csir-serc-portal
```

### Network Connectivity Issues
```bash
# Test container reachability
ping 10.30.0.14

# Test from container
podman exec csir-serc-portal wget http://localhost:3000
```

---

## 🛑 Stop/Restart Container

### Stop Container
```bash
podman stop csir-serc-portal
```

### Start Container
```bash
podman start csir-serc-portal
```

### Restart Container
```bash
podman restart csir-serc-portal
```

### Remove Container
```bash
podman stop csir-serc-portal
podman rm csir-serc-portal
```

---

## 📝 Important Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Container image definition |
| `docker-compose.yml` | Container orchestration |
| `deploy-podman.sh` | Automated deployment script |
| `next.config.js` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `DEPLOYMENT_V2.md` | Comprehensive deployment guide |
| `README.md` | Project overview |
| `COMPLETION_REPORT.md` | Project completion details |

---

## 🌐 Access Information

### After Successful Deployment:

```
╔════════════════════════════════════════════╗
║       CSIR-SERC Recruitment Portal         ║
║              v2.0.0                        ║
╚════════════════════════════════════════════╝

Container Name: csir-serc-portal
Container IP: 10.30.0.14
Port: 3000

🌐 Access URLs:
   • http://10.30.0.14:3000 (Primary)
   • http://localhost:3000 (Local)
   • http://10.10.200.53:3000 (Via host)

📊 Container Status:
   • podman ps | grep csir-serc-portal

📋 View Logs:
   • podman logs -f csir-serc-portal

🔍 Health Check:
   • curl http://10.30.0.14:3000

✅ Status: RUNNING
```

---

## 📞 Support

For issues or questions:
- Email: ict.serc@csir.res.in
- Project: CSIR-SERC Recruitment Portal
- Version: 2.0.0
- Last Updated: 14 January 2026

---

## 🔄 Update Steps

To update to a new version:

```bash
# Pull latest code
cd /home/ananth/Documents/Recruitment-Portal-NextJS
git pull origin main

# Rebuild and deploy
./deploy-podman.sh
```

---

**Status**: ✅ Ready for Deployment  
**Last Verified**: 14 January 2026

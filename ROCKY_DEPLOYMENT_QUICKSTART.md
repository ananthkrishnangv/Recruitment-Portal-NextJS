# RockyLinux 10 Deployment - Quick Start

## 🚀 Deploy in 30 Seconds

```bash
cd /home/ananth/Documents/Recruitment-Portal-NextJS
./deploy-rocky-remote.sh
```

That's it! The script handles:
- ✅ Building the RockyLinux 10 Docker image
- ✅ Transferring to Podman host (10.10.200.53)
- ✅ Removing old container at 10.30.0.14
- ✅ Deploying new container
- ✅ Verifying deployment

---

## What Changed

### Dockerfile Updated
**From:** `node:20-alpine`  
**To:** `rockylinux:10` with Node.js 20 LTS

### Benefits
- ✅ RHEL ecosystem compatibility
- ✅ Better enterprise support
- ✅ Larger package library
- ✅ Familiar system tools

### Image Tag
- `csir-serc-recruitment-portal:3.0.0-rocky`

---

## Files Updated

1. **Dockerfile** - Now uses RockyLinux 10
2. **deploy-rocky-remote.sh** - New automated deployment script
3. **DEPLOYMENT_ROCKYLINUX.md** - Complete deployment guide

---

## After Deployment

### Test the Application
```bash
curl -I http://10.30.0.14:3000
```

### View Logs
```bash
ssh root@10.10.200.53 "podman logs csir-serc-portal"
```

### Check Status
```bash
ssh root@10.10.200.53 "podman ps | grep csir-serc-portal"
```

---

## Key Information

| Item | Value |
|------|-------|
| Container IP | 10.30.0.14 |
| Port | 3000 |
| Base OS | RockyLinux 10 |
| Node.js | 20 LTS |
| Podman Host | 10.10.200.53 |
| Container Name | csir-serc-portal |
| Image Tag | 3.0.0-rocky |

---

## Next Steps

1. Run: `./deploy-rocky-remote.sh`
2. Wait for completion (~2-3 minutes)
3. Verify: `curl -I http://10.30.0.14:3000`
4. Access in browser: http://10.30.0.14:3000

---

**Status:** ✅ Ready to Deploy  
**Base OS:** RockyLinux 10  
**Node.js:** 20 LTS  
**Environment:** Production

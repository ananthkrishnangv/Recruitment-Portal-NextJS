# RockyLinux 10 Deployment - Ready to Execute

## ✅ Everything is Prepared

Your application is ready to be deployed to 10.30.0.14 with **RockyLinux 10** as the base operating system.

---

## 🚀 Deploy Now (One Command)

```bash
cd /home/ananth/Documents/Recruitment-Portal-NextJS
./deploy-rocky-remote.sh
```

**That's it!** The script handles everything automatically.

---

## What the Script Does

1. ✅ Verifies Next.js build
2. ✅ Builds RockyLinux 10 Docker image
3. ✅ Transfers image to Podman host (10.10.200.53)
4. ✅ **Removes old container** at 10.30.0.14
5. ✅ Loads new image on Podman host
6. ✅ Deploys new container
7. ✅ Verifies deployment
8. ✅ Tests connectivity

**Time:** ~2-3 minutes

---

## Files Changed/Created

### Modified
- **Dockerfile** - Changed from Alpine to RockyLinux 10

### Created
1. **deploy-rocky-remote.sh** (8.1 KB) - Automated deployment script ⭐
2. **DEPLOYMENT_ROCKYLINUX.md** (7.8 KB) - Complete deployment guide
3. **ROCKY_DEPLOYMENT_QUICKSTART.md** (1.7 KB) - Quick reference
4. **DEPLOYMENT_SUMMARY_ROCKY.txt** (13 KB) - Detailed summary

---

## Container Details

| Property | Value |
|----------|-------|
| **Name** | csir-serc-portal |
| **Image** | csir-serc-recruitment-portal:3.0.0-rocky |
| **Base OS** | RockyLinux 10 |
| **Node.js** | 20 LTS |
| **IP Address** | 10.30.0.14 |
| **Port** | 3000 |
| **Network** | mcvlan1 |
| **Podman Host** | 10.10.200.53 |

---

## After Deployment

### Verify it works:
```bash
curl -I http://10.30.0.14:3000
```

Should return: `HTTP/1.1 200 OK`

### View logs:
```bash
ssh root@10.10.200.53 "podman logs csir-serc-portal"
```

### Check status:
```bash
ssh root@10.10.200.53 "podman ps | grep csir-serc-portal"
```

---

## Why RockyLinux 10?

✅ **RHEL Compatible** - Works with enterprise systems  
✅ **Better Support** - Longer LTS window  
✅ **More Packages** - Comprehensive package library  
✅ **Familiar Tools** - Standard RHEL utilities  
✅ **Same Performance** - No startup time difference  

---

## Documentation Reference

For detailed information, see:

1. **ROCKY_DEPLOYMENT_QUICKSTART.md** - Quick overview
2. **DEPLOYMENT_ROCKYLINUX.md** - Full guide with manual steps
3. **DEPLOYMENT_SUMMARY_ROCKY.txt** - Comprehensive reference
4. **Dockerfile** - Build specifications

---

## Prerequisites Check

Before running the script, ensure:

```bash
# SSH access to Podman host
ssh root@10.10.200.53 "echo 'SSH works'"

# Docker is available locally
docker --version

# Build directory exists
ls -d /home/ananth/Documents/Recruitment-Portal-NextJS/.next
```

---

## Troubleshooting

If something goes wrong:

1. **Check script output** - It shows detailed error messages
2. **Review logs** - `ssh root@10.10.200.53 "podman logs csir-serc-portal"`
3. **Check network** - `ping 10.30.0.14`
4. **Verify SSH** - `ssh root@10.10.200.53 "podman ps"`

See **DEPLOYMENT_ROCKYLINUX.md** for detailed troubleshooting.

---

## Rollback (If Needed)

To revert to Alpine version:
```bash
# Revert Dockerfile
git checkout Dockerfile

# Rebuild and redeploy with Alpine
docker build -t csir-serc-recruitment-portal:3.0.0-alpine .
```

See **DEPLOYMENT_SUMMARY_ROCKY.txt** for complete rollback instructions.

---

## Summary

- ✅ Dockerfile updated to use RockyLinux 10
- ✅ Deployment script ready (deploy-rocky-remote.sh)
- ✅ Documentation complete
- ✅ Old container will be automatically removed
- ✅ New container will be deployed to 10.30.0.14
- ✅ Full health checks included

**Status:** 🟢 READY TO DEPLOY

---

## Next Step

```bash
cd /home/ananth/Documents/Recruitment-Portal-NextJS
./deploy-rocky-remote.sh
```

The script will handle everything. You'll see progress messages as it:
1. Builds the image
2. Transfers it
3. Removes the old container
4. Deploys the new one
5. Verifies everything works

**Good to go!** 🚀

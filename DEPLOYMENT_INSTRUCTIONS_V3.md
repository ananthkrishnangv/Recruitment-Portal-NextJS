# CSIR-SERC Recruitment Portal - v3.0.0 Deployment Guide

## Version Updates
- **React**: 19.0.0 (upgraded from 18.3.0)
- **Tailwind CSS**: 4.0.0 (upgraded from 3.4.1)
- **Next.js**: 15.1.6 (latest stable v15, v16 not yet production-ready)
- **Node.js**: 20 LTS

## Critical Fixes Applied
✅ Fixed empty screen issue:
  - Added `'use client'` directive to page.tsx
  - Updated globals.css for Tailwind CSS 4 syntax (@import "tailwindcss")
  - Fixed layout.tsx hydration issues
  - Updated tsconfig.json for Next.js 15+ compatibility

## Build Status
```
✓ Compiled successfully
✓ Generating static pages (4/4)
Route (app)                    Size     First Load JS
┌ ○ /                          7.37 kB  113 kB
└ ○ /_not-found               979 B    106 kB
```

## Deployment Steps

### Option 1: Using Docker (Recommended)

1. **Build the Docker Image**
```bash
cd /home/ananth/Documents/Recruitment-Portal-NextJS
docker build -t csir-serc-recruitment-portal:3.0.0 .
```

2. **Stop and Remove Old Container (if exists on 10.30.0.14)**
```bash
# If using podman on remote host (10.10.200.53)
ssh root@10.10.200.53 "podman stop csir-serc-portal 2>/dev/null || true && \
                       podman rm csir-serc-portal 2>/dev/null || true"
```

3. **Deploy Fresh Container to 10.30.0.14**
```bash
# Using podman from host (10.10.200.53)
ssh root@10.10.200.53 "podman run -d \
  --name csir-serc-portal \
  --network mcvlan1 \
  --ip 10.30.0.14 \
  -p 3000:3000 \
  -e NODE_ENV=production \
  csir-serc-recruitment-portal:3.0.0"
```

4. **Verify Deployment**
```bash
# Check container status
ssh root@10.10.200.53 "podman ps | grep csir-serc-portal"

# Test connectivity
curl -I http://10.30.0.14:3000

# Check for content
curl http://10.30.0.14:3000 | grep -i "csir-serc"
```

### Option 2: Using Docker Compose

1. **Build and Deploy**
```bash
cd /home/ananth/Documents/Recruitment-Portal-NextJS
docker-compose up -d --build
```

## Expected Output on Browser

When accessing `http://10.30.0.14:3000`, you should see:
- ✅ Header with "CSIR-SERC Portal" logo and navigation
- ✅ Hero section with "Engineering The Future" text
- ✅ Statistics cards (2.4K+ Applicants, 12+ Divisions, 45+ Openings, 08 Mega Projects)
- ✅ "How to Apply?" section with 7 process steps
- ✅ Current Vacancies section with 3 job listings
- ✅ Footer with links

## Troubleshooting

### Port Already in Use
```bash
# If port 3000 is already in use
ssh root@10.10.200.53 "podman stop csir-serc-portal && podman rm csir-serc-portal"
```

### Check Container Logs
```bash
ssh root@10.10.200.53 "podman logs csir-serc-portal"
```

### Container Health Status
```bash
ssh root@10.10.200.53 "podman inspect csir-serc-portal | grep -A5 Health"
```

## Important Notes

- **All npm packages** are installed inside the Docker container (not on host)
- **Production build**: Next.js serves pre-rendered static pages for better performance
- **Node environment**: Set to `production` for optimal performance
- **Container user**: Runs as non-root `nextjs` user for security
- **Health check**: Automatic HTTP health check every 30 seconds

## Rollback to Previous Version

If needed, deploy v2.0.0:
```bash
docker pull csir-serc-recruitment-portal:2.0.0
ssh root@10.10.200.53 "podman stop csir-serc-portal && podman rm csir-serc-portal && \
podman run -d --name csir-serc-portal --network mcvlan1 --ip 10.30.0.14 \
-e NODE_ENV=production csir-serc-recruitment-portal:2.0.0"
```

## Files Modified in This Release

- `package.json` - Updated all dependencies to latest versions
- `src/app/page.tsx` - Added 'use client' directive, fixed styling
- `src/app/layout.tsx` - Fixed hydration issues
- `src/app/globals.css` - Updated for Tailwind CSS 4 syntax
- `tailwind.config.ts` - Simplified for Tailwind CSS 4
- `tsconfig.json` - Fixed for Next.js 15+ compatibility

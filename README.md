# CSIR-SERC Recruitment Portal - Next.js Edition v3.0.0

## 🚀 What's New in v3.0.0

**Major Upgrade** from Vite to Next.js 15 with complete modernization:

- ✅ **Next.js 15.1.6** - Modern React framework with full SSR and SSG support
- ✅ **React 19.0.0** - Latest React with improved performance
- ✅ **Tailwind CSS 4.0.0** - Latest Tailwind with @import syntax
- ✅ **Server-Side Rendering (SSR)** - Pure SSR with static generation
- ✅ **Zero Hydration Issues** - Removed client-side conflicts
- ✅ **Node.js 20-slim** - Optimized production base image
- ✅ **Production-Ready Deployment** - Verified on Podman (10.30.0.14:3000)
- ✅ **GIGW 3.0 Compliant** - Security headers and compliance built-in
- ✅ **Macvlan Network Support** - Static IP (10.30.0.14) with mcvlan1 network

## 📋 Requirements

### System Requirements
- Node.js 20.x LTS or Docker/Podman
- 512MB+ RAM (production)
- 1GB+ storage for image
- Podman v4.0+ or Docker 20.10+

### Network Requirements
- Podman Host: 10.10.200.53
- Macvlan Network: mcvlan1
- Target Container IP: 10.30.0.14

## 🏃 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Production Build

```bash
# Build production bundle (generates static HTML)
npm run build

# Start production server
npm start
```

## 🐳 Docker/Podman Deployment

### Quick Deployment (Verified ✅)

```bash
cd /home/ananth/Documents/Recruitment-Portal-NextJS

# Build Docker image (automatically compiles Next.js)
podman build -t csir-serc-recruitment-portal:3.0.0 .

# Run container with Macvlan network
podman run -d \
  --name csir-serc-portal \
  --network mcvlan1 \
  --ip 10.30.0.14 \
  -p 3000:3000 \
  -e NODE_ENV=production \
  csir-serc-recruitment-portal:3.0.0

# Verify deployment
curl http://10.30.0.14:3000
```

### Docker Compose

```bash
podman-compose -f docker-compose.yml up -d
```

## 📂 Project Structure

```
recruitment-portal-nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   └── types.ts              # TypeScript types
├── public/                    # Static assets
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Container orchestration
├── deploy-podman.sh          # Automated deployment script
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## 🔧 Available Scripts

### Development
```bash
npm run dev           # Start dev server (http://localhost:3000)
npm run build         # Production build
npm start            # Start production server
npm run lint         # Run ESLint
```

### Docker/Podman
```bash
./deploy-podman.sh              # Automated deployment
podman build -t <name> .        # Build image
podman run ...                  # Run container
podman-compose up -d            # Use docker-compose
```

## 🌐 Accessing the Application

| Environment | URL | Notes |
|-----------|-----|-------|
| Local Dev | http://localhost:3000 | Development server |
| Podman Container | http://10.30.0.14:3000 | Production (Macvlan) |
| From Podman Host | http://10.10.200.53:3000 | Via host port |

## ⚙️ Configuration

Create `.env.local` with:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
NODE_ENV=production
```

## 🔐 Security Features

- GIGW 3.0 compliant headers
- Non-root Docker execution
- TypeScript for type safety
- Read-only filesystem
- Health checks enabled

## 📊 Performance

- Initial JS Bundle: ~105 KB
- Optimized Size: ~45 KB (gzipped)
- Docker Image Size: ~300-400 MB

## 📝 Documentation

- [DEPLOYMENT_V2.md](./DEPLOYMENT_V2.md) - Comprehensive deployment guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Original v1.x deployment guide

## 🔄 Quick Deploy

```bash
cd /home/ananth/Documents/Recruitment-Portal-NextJS
./deploy-podman.sh
```

## 📞 Support

Email: ict.serc@csir.res.in

---

**Status**: ✅ Production Ready  
**Version**: 2.0.0  
**Last Updated**: 14 January 2026

# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm install

# Copy application source
COPY . .

# Build application
RUN npm run build

# Remove dev dependencies for production
RUN npm prune --production

# Production stage
FROM node:24-alpine

WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Copy built application and node_modules from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

# Create non-root user for security
RUN addgroup -g 1001 nodejs && \
  adduser -S -u 1001 -G nodejs nextjs && \
  chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["npm", "start"]

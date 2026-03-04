FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json .
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY apps/flower ./apps/flower
COPY libs ./libs

# Install all dependencies (including dev) for build
RUN npm ci && npm cache clean --force
RUN npm run build flower

# Production stage - install only production dependencies
FROM node:22-alpine AS production-deps
WORKDIR /app
COPY package*.json .
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

COPY --from=builder /app/dist ./dist
COPY --from=production-deps /app/node_modules ./node_modules

EXPOSE 3004

CMD ["node", "dist/apps/flower/apps/flower/src/main.js"]

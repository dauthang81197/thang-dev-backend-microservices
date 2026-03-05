FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json .
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY apps/notification ./apps/notification
COPY apps/flower/src/shareds ./apps/flower/src/shareds
COPY libs ./libs

# Install all dependencies (including dev) for build
RUN npm ci && npm cache clean --force
RUN npm run build notification

# Production stage - install only production dependencies
FROM node:22-alpine AS production-deps
WORKDIR /app
COPY package*.json .
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app/dist ./dist
COPY --from=production-deps /app/node_modules ./node_modules

EXPOSE 3005

CMD ["node", "dist/apps/notification/apps/notification/src/main.js"]

FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json .
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY apps/api-gateway ./apps/api-gateway
COPY libs ./libs

RUN npm ci --only=production && npm cache clean --force
RUN npm run build api-gateway

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/dist/apps/api-gateway ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/main.js"]
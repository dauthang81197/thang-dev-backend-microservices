FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json .
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY apps/identity ./apps/identity
COPY libs ./libs

RUN npm ci --only=production && npm cache clean --force
RUN npm run build identity

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/dist/apps/identity ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3002

CMD ["node", "dist/main.js"]
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig*.json ./
COPY apps/identity ./apps/identity
COPY libs ./libs

RUN yarn install --frozen-lockfile && yarn cache clean
RUN yarn build api-gateway

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/dist/apps/identity ./dist
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "dist/main.js"]
FROM node:22-alpine AS builder
WORKDIR /app

# Enable Corepack for Yarn 4
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

COPY package.json .
COPY yarn.lock .
COPY .yarn ./.yarn
COPY .yarnrc.yml .
COPY tsconfig*.json ./
COPY apps/course ./apps/course
COPY libs ./libs

RUN yarn install --frozen-lockfile && yarn cache clean
RUN yarn build course

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/dist/apps/course ./dist
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "dist/main.js"]

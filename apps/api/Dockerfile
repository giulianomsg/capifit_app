# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./package.json
COPY apps/api/package.json ./apps/api/package.json
RUN npm install --workspace apps/api

FROM deps AS builder
COPY . .
WORKDIR /app/apps/api
RUN npm run generate
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./package.json
EXPOSE 3001
CMD ["node", "dist/server.js"]

# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./package.json
COPY apps/web/package.json ./apps/web/package.json
RUN npm install --workspace apps/web
COPY . .
WORKDIR /app/apps/web
RUN npm run build

FROM nginx:alpine AS production
COPY --from=build /app/apps/web/build /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Production build: build static rồi serve qua nginx (SPA fallback). Dùng cho docker-compose.prod.yml.
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
# --no-package-lock: lock file sinh trên Windows -> npm bỏ qua, resolve đúng native binary Linux/musl (bug npm #4828)
RUN npm install --no-package-lock --no-audit --no-fund

COPY . .
ARG VITE_API_URL=http://localhost:5068
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine AS final
RUN rm /etc/nginx/conf.d/default.conf && printf "server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / { try_files \$uri \$uri/ /index.html; }\n}\n" > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

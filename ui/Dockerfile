# FROM node:16
# WORKDIR /app/web
# COPY package*.json ./
# RUN npm install
# COPY . /app/web
# EXPOSE 3000
# CMD ["npm", "run", "start"]

# Build stage
FROM node:16 as build
WORKDIR /app/web
COPY package*.json ./
RUN npm ci --production
COPY . /app/web
RUN npm run build

# Nginx web server
FROM nginx:1.21 as prod
COPY --from=build /app/web/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
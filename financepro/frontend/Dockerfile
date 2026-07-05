# Stage 1: Build React/Vite Application
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies, forcing installation to bypass platform constraints (e.g. win32 bindings on linux)
RUN npm install --force

# Copy application source
COPY . .

# Run build script to generate static files in /app/dist
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to Nginx document root
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

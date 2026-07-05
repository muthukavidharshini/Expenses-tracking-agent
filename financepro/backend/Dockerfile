FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Expose port
EXPOSE 5000

# Environment variables
ENV PORT=5000
ENV NODE_ENV=production

# Start backend application (waiting for MongoDB first)
CMD ["sh", "-c", "node wait-for-mongo.js && node server.js"]

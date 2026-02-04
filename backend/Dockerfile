# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install deps first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# If you use uploads folder at src/uploads, make sure it exists
RUN mkdir -p src/uploads

EXPOSE 5001

CMD ["node", "server.js"]

# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps && npm cache clean --force
COPY . .

# Production stage
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app ./
RUN mkdir -p logs public storages

EXPOSE 9565
CMD ["node", "--require", "./src/instrumentation.js", "src/server.js"]

FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs public storages

# Expose port (default 3000, bisa diubah via environment variable)
EXPOSE 3000

# Start application
CMD ["node", "src/server.js"]


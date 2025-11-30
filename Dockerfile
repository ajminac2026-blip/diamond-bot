FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install root dependencies
RUN npm install --production

# Copy application code
COPY . .

# Install admin panel dependencies
WORKDIR /app/admin-panel
RUN npm install --production

# Go back to root
WORKDIR /app

# Create config directory if needed
RUN mkdir -p config

# Expose ports
EXPOSE 3000 3001

# Start application
CMD ["node", "start-all.js"]

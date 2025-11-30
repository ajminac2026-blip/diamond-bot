FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create config directory if needed
RUN mkdir -p config

# Expose ports
EXPOSE 3000 3001

# Start application
CMD ["node", "start-all.js"]

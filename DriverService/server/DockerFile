# Setup runtime environment by pulling Node version 20 image from Docker hub
# Use Alpine for minimum setup
FROM node:20-alpine

# Create workspace folder in mini Linux
WORKDIR /UIT-Go/driver-service/backend

# Copy the dependencies log first to take advantage of layer caching.
# If no dependencies change, the next build will not have to install again.
COPY package*.json ./
RUN npm ci

# According to .dockerignore, this will copy source code
# Build it
COPY . .
RUN npx prisma generate
RUN npm run build

# Run after image is built
CMD ["npm", "start"]
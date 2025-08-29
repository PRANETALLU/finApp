# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose default Next.js dev port
EXPOSE 3000

# Start the dev server
CMD ["npm", "run", "dev"]

# Base image
FROM node:14-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Set environment variables, if needed
# ENV VARIABLE_NAME value

# Expose any necessary ports, if needed
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]

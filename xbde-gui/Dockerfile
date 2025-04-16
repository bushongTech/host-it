# Use a slim Node.js image
FROM node:23-slim


# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port your app runs on
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]

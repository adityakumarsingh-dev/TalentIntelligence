# 1. Base image (Lightweight Node.js)
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the project files
COPY . .

# 5. Build the Next.js application for production
RUN npm run build

# 6. Expose the port the app runs on
EXPOSE 3000

# 7. Start the application
CMD ["npm", "start"]
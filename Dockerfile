# Use Node.js official Docker image
FROM node:20-alpine as deps
WORKDIR /app

# No need to install Yarn as it's pre-installed
# Copy Drizzle schema if using Drizzle
COPY drizzle ./

# Copy environment variables
COPY .env ./

# Copy package manager lockfile and install dependencies
COPY package.json ./
RUN yarn install    

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Final runtime stage
FROM node:20-alpine as runner
WORKDIR /app

# No need to install Yarn here either
# Copy built files from the builder stage
COPY --from=deps /app .

# Expose port
EXPOSE 3000
CMD ["yarn", "start"]

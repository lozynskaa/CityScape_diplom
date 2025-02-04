# Use Bun's official Docker image
FROM oven/bun:latest as deps
WORKDIR /app

# Copy Drizzle schema if using Drizzle
COPY drizzle ./

# Copy package manager lockfile and install dependencies
COPY bun.lockb package.json ./
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN bun --bun build

# Final runtime stage
FROM oven/bun:latest as runner
WORKDIR /app

# Copy built files from the builder stage
COPY --from=deps /app .

# Expose port
EXPOSE 3000
CMD ["bun", "run", "start"]

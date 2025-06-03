# Stage 1: Build
FROM node:latest AS build

# Set working directory
WORKDIR /home/arcapps/notification-service

# Copy app files
COPY . .

# Install pnpm globally
RUN npm install -g pnpm

# Enable strict peer dependencies if necessary
RUN pnpm config set strict-peer-dependencies false

# Clean the node_modules directory to avoid prompting during install
RUN rm -rf node_modules

# Install dependencies and build the app
RUN pnpm install --frozen-lockfile && pnpm run build

# Remove unnecessary files and keep only production dependencies
RUN pnpm install --prod

# Stage 2: Final Image
FROM node:slim

# Install required packages including pnpm
RUN apt-get update && \
    apt-get install -y gettext-base && \
    npm install -g pnpm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Setup docker-entrypoint
COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Add non-root user
RUN useradd -ms /bin/bash arcapps

# Set working directory and copy built files
WORKDIR /home/arcapps/notification-service
COPY --from=build --chown=arcapps:arcapps /home/arcapps/notification-service .

# Ensure proper permissions
RUN chown -R arcapps:arcapps /home/arcapps && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Set entrypoint and command
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["start"]
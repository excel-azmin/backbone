# Use Node.js 20 as base image
FROM node:20 AS base

WORKDIR /workspace

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files and install dependencies
COPY package*.json ./

RUN pnpm install

# Copy all source code
COPY . .

# Default command to start development server
CMD ["pnpm", "run", "start:dev"]
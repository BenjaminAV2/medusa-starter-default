# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable Corepack for Yarn 4
RUN corepack enable && corepack prepare yarn@4.10.3 --activate

# Copy dependency files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install --immutable

# Copy source code
COPY . .

# Build application
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Enable Corepack for Yarn 4
RUN corepack enable && corepack prepare yarn@4.10.3 --activate

# Copy dependency files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install production dependencies only
RUN yarn workspaces focus --production && yarn cache clean

# Copy built application from builder stage
COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 9000

# Start command (migrations + start)
CMD ["sh", "-c", "yarn medusa db:migrate && yarn start"]

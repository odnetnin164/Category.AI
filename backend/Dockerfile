FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies for backend
RUN npm ci --only=production

# Copy backend source code and types
COPY server/ ./server/
COPY src/types.ts ./src/types.ts
COPY tsconfig.json ./

# Install ts-node for running TypeScript
RUN npm install ts-node

# Expose backend port
EXPOSE 3001

# Start the backend server
CMD ["npx", "ts-node", "--project", "server/tsconfig.json", "server/index.ts"]
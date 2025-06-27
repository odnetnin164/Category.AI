# Development Setup Guide

This guide explains how to set up Category.AI for local development with configurable URLs and secure environment management.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Category.AI
   ```

2. **Copy environment configuration**
   ```bash
   cp .env.example .env
   ```

3. **Start with Docker (Recommended)**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - React App: http://localhost:3000
   - API Server: http://localhost:3001
   - MongoDB: localhost:27017

## Environment Configuration

### Environment Variables

All configuration is handled through environment variables to keep secrets out of the source code.

#### Required Variables

Copy `.env.example` to `.env` and customize these values:

```bash
# React App Configuration
REACT_APP_API_BASE_URL=http://localhost:3001

# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGO_HOST=mongodb                    # Use 'localhost' for local MongoDB
MONGO_PORT=27017
MONGO_USERNAME=admin
MONGO_PASSWORD=password               # Change in production!
MONGO_DATABASE=categoryai
MONGO_AUTH_SOURCE=admin

# Full MongoDB Connection URL (auto-constructed)
MONGODB_URL=mongodb://admin:password@mongodb:27017/categoryai?authSource=admin

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Development Scenarios

#### Scenario 1: Docker Development (Default)
Use the default `.env` values. Everything runs in containers.

```bash
docker-compose up --build
```

#### Scenario 2: Local Development (No Docker)
Update `.env` for local services:

```bash
# Change these values in .env
MONGO_HOST=localhost
MONGODB_URL=mongodb://admin:password@localhost:27017/categoryai?authSource=admin
```

Then run MongoDB locally and start the services:

```bash
# Start MongoDB (requires local installation)
mongod

# Install dependencies
npm install

# Start both services
npm run dev
```

#### Scenario 3: Mixed Development
Run MongoDB in Docker, but run Node.js services locally:

```bash
# Start only MongoDB
docker-compose up mongodb

# Update .env
MONGO_HOST=localhost
MONGODB_URL=mongodb://admin:password@localhost:27017/categoryai?authSource=admin

# Start the application
npm run dev
```

#### Scenario 4: Custom URLs
For different environments (staging, production), update the URLs:

```bash
# .env for staging
REACT_APP_API_BASE_URL=https://api.staging.yourapp.com
MONGODB_URL=mongodb://user:pass@staging-db.com:27017/categoryai
CORS_ORIGIN=https://staging.yourapp.com
```

## Available Scripts

```bash
# Development
npm start          # Start React app only
npm run server     # Start API server only  
npm run dev        # Start both React app and API server

# Production
npm run build      # Build React app for production

# Testing
npm test           # Run tests
npm audit          # Check for security vulnerabilities
```

## Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild without cache
docker-compose build --no-cache

# View logs
docker-compose logs category-ai-app
docker-compose logs category-ai-mongo

# Reset database (removes all data)
docker-compose down
docker volume rm categoryai_mongodb_data
docker-compose up --build
```

## Security Best Practices

1. **Never commit secrets**: The `.env` file is in `.gitignore`
2. **Change default passwords**: Update MongoDB credentials for production
3. **Use environment-specific configs**: Different `.env` files for dev/staging/prod
4. **Regular audits**: Run `npm audit` to check for vulnerabilities

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `docker-compose logs category-ai-mongo`
- Check connection string in logs: `docker-compose logs category-ai-app`
- Verify environment variables are loaded

### API Not Accessible
- Check if API server is running on correct port
- Verify CORS configuration matches your frontend URL
- Ensure `REACT_APP_API_BASE_URL` is correctly set

### React App Issues
- Clear browser cache and restart
- Check browser console for errors
- Verify `REACT_APP_*` environment variables (only these are available in React)

## Database Management

### Resetting Data
To start with fresh data:
```bash
docker-compose down
docker volume rm categoryai_mongodb_data
docker-compose up --build
```

### Adding New Decks
Edit `mongo-init.js` and rebuild containers, or add through the MongoDB connection directly.

### Backup Data
```bash
docker exec category-ai-mongo mongodump --db categoryai --out /backup
docker cp category-ai-mongo:/backup ./backup
```
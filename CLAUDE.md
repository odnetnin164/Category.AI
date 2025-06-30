# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**IMPORTANT**: All development must be done through Docker Compose due to required services (MongoDB, OpenAI API integration).

```bash
# Start all services (MongoDB + Backend + Frontend)
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop all containers
docker-compose down

# Rebuild images
docker-compose build --no-cache

# View logs
docker-compose logs -f

# Access individual service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Docker Setup**: 
- **Load Balancer**: Nginx reverse proxy with HTTPS at `https://localhost` (HTTP redirects to HTTPS)
- **Frontend**: React app served via nginx (internal container communication)
- **Backend**: Express/TypeScript API server (internal container communication)  
- **Database**: MongoDB at `http://localhost:27017`
- **OpenAI Integration**: Requires `OPENAI_API_KEY` and `OPENAI_URL` in `.env`
- **SSL Certificates**: Self-signed certificates for development (run `./generate-ssl.sh` to create)

### Local Development (Legacy - Not Recommended)
Only use these commands for testing individual components:

```bash
# Start development server (requires MongoDB and OpenAI setup)
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode (default)
npm test -- --watchAll

# Run specific test file
npm test ComponentName.test.tsx
```

## Security & Package Management

### Secret Management & Security Guidelines

**CRITICAL**: Never commit secrets, API keys, passwords, or sensitive configuration to the repository.

**Secret Masking Instructions for Claude Code**:
- Always mask/redact API keys, tokens, passwords, and sensitive values when displaying code or logs
- Use `[REDACTED]`, `***`, or `[API_KEY_HIDDEN]` placeholders instead of actual secret values
- When showing environment variables, mask the values: `OPENAI_API_KEY=[REDACTED]`
- Never include actual secret values in git commits, pull requests, or documentation
- If secrets are accidentally exposed, treat as security incident and rotate immediately

**Environment Variables & Secrets**:
```bash
# Required environment variables (add actual values to .env file)
OPENAI_API_KEY=[REDACTED]
OPENAI_URL=[REDACTED]
MONGODB_URI=[REDACTED]
JWT_SECRET=[REDACTED]
```

**Security Checklist**:
- ✅ All secrets are in `.env` files (never committed)
- ✅ Comprehensive `.gitignore` patterns for secrets
- ✅ Environment-based configuration for all sensitive data
- ✅ No hardcoded credentials in source code
- ✅ SSL/TLS enabled for production communications

### Package Security

```bash
# Audit packages for security vulnerabilities (run after adding new packages)
npm audit

# View detailed audit report
npm audit --audit-level moderate

# Attempt to automatically fix vulnerabilities (use with caution)
npm audit fix

# Force fix breaking changes (only use if necessary and test thoroughly)
npm audit fix --force
```

**Important**: Always run `npm audit` after adding new packages to check for known security vulnerabilities. Current audit status shows 9 vulnerabilities (3 moderate, 6 high) primarily in development dependencies through react-scripts. These are mainly in build tools and don't affect production runtime security.

## Architecture Overview

This is a React TypeScript guessing game (Category.AI) with AI-powered deck generation, optimized for mobile devices with device orientation controls and real-time WebSocket communication.

### Microservices Architecture

**Containerized Services**:
- **Nginx Load Balancer**: HTTPS reverse proxy routing traffic to frontend/backend
- **Frontend**: React TypeScript SPA served via nginx
- **Backend**: Express/TypeScript API with Socket.IO WebSocket server
- **Database**: MongoDB with predefined and AI-generated decks

### Core Game Flow
1. **Home Page** (`HomePage.tsx`) → **Create Deck** (`CreateDeck.tsx`) or **Deck Details** (`DeckDetails.tsx`) → **Game** (`GamePage.tsx`) → **Score** (`ScorePage.tsx`)
2. Routing handled by React Router with parameterized routes: `/deck/:deckId`, `/game/:deckId`, `/score/:deckId`

### Key Components & Responsibilities

- **CreateDeck.tsx**: AI-powered deck generation with real-time WebSocket progress
  - Event-driven deck creation using OpenAI API
  - WebSocket connection for live progress updates (starting → generating → saving → complete)
  - Visual progress bars and status messages
  - Form validation and error handling

- **GamePage.tsx**: Core game logic with device orientation detection
  - Uses `DeviceOrientationEvent` to detect phone tilting (beta > 45° = correct, beta < -20° = pass)
  - 60-second countdown timer with automatic navigation to score page
  - Card shuffling and state management for current game session
  - Falls back to keyboard controls (Arrow Down/Up) for testing

- **ScorePage.tsx**: Results display with navigation options
  - Receives game results via React Router `location.state`
  - Calculates accuracy, displays correct/passed breakdown
  - Provides navigation back to game, deck, or home

### Real-Time Communication Architecture

**WebSocket Integration (Socket.IO)**:
- **Server**: Express server with integrated Socket.IO for bi-directional communication
- **Client**: `socketService.ts` singleton managing WebSocket connections
- **Event Flow**: Deck generation triggers progress events: `deck-generation-progress`, `deck-generation-complete`, `deck-generation-error`
- **Transport**: Falls back from WebSocket to polling for compatibility

### Data Flow & Storage

**Data Sources**:
- **Static Decks**: Predefined categories in `src/data/decks.ts`
- **AI-Generated Decks**: Created via OpenAI API and stored in MongoDB
- **Game State**: Managed locally in React components, passed via Router state

**Database Schema**:
- **Decks Collection**: `{ _id, emoji, name, description, cards: [{ id, text, info }] }`
- **MongoDB Connection**: Authenticated connection with environment-based configuration

### AI Integration Details

**OpenAI Service** (`server/services/openai.ts`):
- **Model**: Configurable (default: gpt-3.5-turbo)
- **Prompt Engineering**: Structured prompts for consistent JSON deck format
- **Error Handling**: Robust JSON parsing with fallback for JavaScript object notation
- **Validation**: Ensures deck structure matches expected schema

### Mobile-First Design

- CSS optimized for horizontal phone orientation
- Device orientation API integration for tilt controls  
- Landscape mode styling in `App.css` with overflow hidden
- Visual feedback system for user actions during gameplay

### State Management Philosophy

- **Local State Only**: No Redux, Context API, or external state libraries
- **Router State Passing**: Game results transferred via React Router `location.state`
- **Component Isolation**: Each component manages its own state independently
- **Real-time Updates**: WebSocket events for deck generation, local state for gameplay

## Tech Stack

**Frontend**:
- **Framework**: React 19.1.0 with TypeScript 4.9.5
- **Routing**: React Router DOM 7.6.2
- **Build System**: Create React App with React Scripts 5.0.1
- **Real-time**: Socket.IO Client 4.7.2
- **Testing**: Jest with React Testing Library
- **Styling**: Pure CSS with component-specific stylesheets

**Backend**:
- **Runtime**: Node.js with Express 4.18.2
- **Language**: TypeScript 4.9.5 with ts-node
- **Database**: MongoDB 6.1.0 with native driver
- **AI**: OpenAI 5.8.2 SDK
- **Real-time**: Socket.IO 4.7.2
- **Environment**: Docker containerization

**Infrastructure**:
- **Load Balancer**: Nginx with HTTPS/SSL
- **Containerization**: Docker Compose multi-service setup
- **SSL**: Self-signed certificates for development
- **Networking**: Internal Docker networking with external HTTPS exposure

## Component Architecture

### Project Structure
```
src/
├── components/           # React components (each with .tsx + .css)
├── services/            # API and WebSocket services
│   ├── api.ts          # REST API service layer
│   └── socketService.ts # WebSocket connection management
├── data/               # Static data (decks.ts)
├── types.ts           # TypeScript interfaces
├── App.tsx            # Main router component
└── index.tsx          # React entry point

server/
├── services/          # Backend service layer
│   └── openai.ts     # AI deck generation service
├── index.ts          # Express server with Socket.IO
└── tsconfig.json     # Backend TypeScript config

Docker Architecture:
├── frontend/         # Frontend container setup
│   ├── Dockerfile   # React build and nginx serve
│   └── nginx.conf   # Frontend-specific nginx config
├── backend/         # Backend container setup
│   └── Dockerfile   # Node.js API server
├── nginx/           # Load balancer configuration
│   └── nginx.conf   # Reverse proxy with WebSocket support
└── ssl/            # SSL certificates directory
```

### Component Patterns
- **Functional Components**: All components use React hooks (useState, useEffect, useCallback)
- **CSS Co-location**: Each component has its own CSS file
- **Service Layer**: Separate services for API calls and WebSocket management
- **Event-Driven**: WebSocket events for real-time features, local state for UI
- **Mobile-First**: Designed for landscape phone orientation with device tilt controls

## Important Implementation Details

### WebSocket Communication Patterns
- **Connection Management**: Singleton `socketService` with auto-reconnection
- **Event Types**: Progress updates, completion events, error handling
- **Transport Fallback**: WebSocket → Polling for maximum compatibility
- **Error Recovery**: Graceful degradation with user feedback

### AI Integration Specifics
- **Prompt Engineering**: Structured JSON format requests with examples
- **Response Parsing**: Robust JSON parsing with JavaScript object notation fallback
- **Error Handling**: Multiple retry attempts with detailed error logging
- **Content Validation**: Schema validation for deck structure consistency

### Device Orientation Integration
- Uses `DeviceOrientationEvent` API for tilt detection
- Beta > 45° = Correct answer, Beta < -20° = Pass/Skip
- Requires HTTPS in production for security reasons
- Fallback keyboard controls (Arrow Up/Down) for development/testing

### Docker & Networking
- **Multi-stage Builds**: Optimized frontend build with nginx serving
- **Internal Networking**: Services communicate via Docker network
- **SSL Termination**: Nginx handles HTTPS with WebSocket upgrade support
- **Environment Configuration**: `.env` file for secrets and configuration

### Game Mechanics
- **Timer System**: 60-second countdown with automatic navigation to results
- **Card Shuffling**: Uses `Math.random() - 0.5` array sorting
- **Visual Feedback**: 800ms animation delays between card actions
- **State Flow**: Game results passed via React Router `location.state`

### CSS Architecture
- **Global Styles**: App.css and index.css for base styling
- **Component Styles**: Dedicated CSS file per component
- **Responsive Design**: `@media (orientation: landscape)` optimizations
- **Visual Effects**: Gradient backgrounds and glassmorphism effects

### Testing Approach
- Minimal test coverage (default CRA setup)
- Uses React Testing Library for component testing
- Significant opportunity for test expansion
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
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

## Docker Commands

```bash
# Build and run the application in Docker
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop the container
docker-compose down

# Rebuild the image
docker-compose build --no-cache
```

**Docker Setup**: The application runs in a multi-stage Docker container using Node 22 for building and nginx for serving. The app will be available at `http://localhost:3000` when running via Docker.

## Security & Package Management

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

This is a React TypeScript guessing game (Category.AI) optimized for mobile devices with device orientation controls.

### Core Game Flow
1. **Home Page** (`HomePage.tsx`) → **Deck Details** (`DeckDetails.tsx`) → **Game** (`GamePage.tsx`) → **Score** (`ScorePage.tsx`)
2. Routing handled by React Router with parameterized routes: `/deck/:deckId`, `/game/:deckId`, `/score/:deckId`

### Key Components & Responsibilities

- **GamePage.tsx**: Core game logic with device orientation detection
  - Uses `DeviceOrientationEvent` to detect phone tilting (beta > 45° = correct, beta < -20° = pass)
  - 60-second countdown timer with automatic navigation to score page
  - Card shuffling and state management for current game session
  - Falls back to keyboard controls (Arrow Down/Up) for testing

- **ScorePage.tsx**: Results display with navigation options
  - Receives game results via React Router `location.state`
  - Calculates accuracy, displays correct/passed breakdown
  - Provides navigation back to game, deck, or home

### Data Structure

- **Decks** defined in `src/data/decks.ts` with predefined cards for 4 categories
- **Types** in `src/types.ts` define the core interfaces:
  - `Card`: Individual game card with id and text
  - `Deck`: Collection of cards with metadata (emoji, description)
  - `GameResult`: Individual card result (correct/pass)
  - `GameSession`: Complete game state (not currently used for persistence)

### Mobile-First Design

- CSS optimized for horizontal phone orientation
- Device orientation API integration for tilt controls  
- Landscape mode styling in `App.css` with overflow hidden
- Visual feedback system for user actions during gameplay

### State Management Philosophy

- **Local State Only**: No Redux, Context API, or external state libraries
- **Router State Passing**: Game results transferred via React Router `location.state`
- **Component Isolation**: Each component manages its own state independently
- **Real-time Updates**: GamePage handles all active game state (timer, cards, scores)

## Tech Stack

- **Framework**: React 19.1.0 with TypeScript 4.9.5
- **Routing**: React Router DOM 7.6.2
- **Build System**: Create React App with React Scripts 5.0.1
- **Testing**: Jest with React Testing Library
- **Styling**: Pure CSS with component-specific stylesheets

## Component Architecture

### Project Structure
```
src/
├── components/           # React components (each with .tsx + .css)
├── data/                # Static data (decks.ts)
├── types.ts            # TypeScript interfaces
├── App.tsx             # Main router component
└── index.tsx           # React entry point
```

### Component Patterns
- **Functional Components**: All components use React hooks (useState, useEffect, useCallback)
- **CSS Modules Pattern**: Each component has its own CSS file
- **No External State Management**: Relies on local state and React Router state passing
- **Mobile-First**: Designed for landscape phone orientation with device tilt controls

## Important Implementation Details

### Device Orientation Integration
- Uses `DeviceOrientationEvent` API for tilt detection
- Beta > 45° = Correct answer, Beta < -20° = Pass/Skip
- Requires HTTPS in production for security reasons
- Fallback keyboard controls (Arrow Up/Down) for development/testing

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
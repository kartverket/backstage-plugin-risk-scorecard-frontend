# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Backstage plugin called "RiSc" (Risk Scorecard) developed by Kartverket for risk assessment and management. The plugin allows users to create, manage, and visualize risk scenarios with actions, risk matrices, and comprehensive reporting features.

### Key Components
- **RiSc Plugin**: The main risk scorecard functionality
- **Risk Matrix**: Visual risk assessment with probability/consequence ratings
- **Scenario Management**: Create and manage risk scenarios with actions
- **Status Tracking**: Monitor approval status and synchronization with backend
- **Migration System**: Handles schema version upgrades between RiSc versions

## Project Structure

This is a monorepo using Yarn workspaces with:
- **Root**: Contains Backstage app and backend
- **plugins/ros/**: The RiSc frontend plugin source code
- **packages/**: Additional Backstage packages (if any)

### Plugin Architecture
- **PluginRoot.tsx**: Main entry point with routing and context providers
- **contexts/**: React contexts for RiSc and Scenario state management
- **components/**: Organized by feature (riScPlugin, riskMatrix, scenarioTable, etc.)
- **utils/**: Shared utilities, types, DTOs, hooks, and constants
- **urls/**: Backend and external URL management

## Development Commands

### Core Development
```bash
# Install dependencies
yarn ci

# Start development (frontend + backend)
yarn dev

# Start only frontend
yarn start

# Start only backend
yarn start-backend

# Build everything
yarn build:all

# Build only backend
yarn build:backend
```

### Code Quality
```bash
# Run all pipeline checks (CI simulation)
yarn pipeline

# Type checking
yarn tsc
yarn tsc:full  # Full typecheck without skipLibCheck

# Linting
yarn lint        # Since origin/main
yarn lint:all    # All files

# Code formatting
yarn prettier:check
yarn prettier:format

# Fix common issues
yarn fix
```

### Testing
```bash
# Run tests
yarn test
yarn test:all    # With coverage

# E2E tests
yarn test:e2e
```

### Dependency Management
```bash
# Upgrade Backstage packages (use this for @backstage/* packages)
yarn backstage:upgrade

# Interactive upgrade for non-Backstage packages
yarn upgrade-interactive

# Clean install
yarn ci:clean
```

## Plugin-Specific Development

### Plugin Package Commands
```bash
# From plugins/ros/ directory:
yarn start       # Start plugin in development
yarn build       # Build plugin
yarn test        # Run plugin tests
yarn lint        # Lint plugin code
yarn tsc         # Type check plugin
```

### Key Technologies
- **React 18** with React Router 6
- **Material-UI v4** and **MUI v5** (mixed usage)
- **Emotion** for CSS-in-JS styling
- **React Hook Form** for form management
- **Luxon** for date handling
- **React DND** for drag and drop
- **React Markdown** for markdown rendering

## Configuration

The plugin requires configuration through Backstage app-config files:
- **app-config.yaml**: Base configuration
- **app-config.local.yaml**: Local development (create from app-config.example.yaml)
- **app-config.production.yaml**: Production settings

## Important Notes

### Backstage Dependencies
- All `@backstage/*` packages use `backstage:^` versioning and must be upgraded with `yarn backstage:upgrade`
- Never manually edit Backstage package versions in package.json

### Schema Versions
- The plugin supports multiple RiSc schema versions (v3.3, v4.0, v4.1, v4.2, v5.0)
- Schema files are located in `plugins/ros/src/` as JSON files
- Migration components handle version upgrades

### State Management
- Uses React Context for global state (RiScContext, ScenarioContext)
- Backend communication through custom hooks (useAuthenticatedFetch)
- DTOs handle data transformation between frontend and backend

### Plugin ID
- Backstage plugin ID: `risk-scorecard`
- Internal plugin ID: `riSc`

## Publishing

To publish a new plugin version:
1. Update version in `plugins/ros/package.json`
2. Create GitHub release with tag `vx.x.x`
3. GitHub Actions will automatically publish to npm registry

## Testing Framework

Uses Backstage's testing setup with Jest and React Testing Library. Test files use `.test.ts/.test.tsx` extensions.
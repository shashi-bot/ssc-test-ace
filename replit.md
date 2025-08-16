# Overview

ExamDesk is a comprehensive SSC (Staff Selection Commission) exam preparation platform built with a modern full-stack architecture. The application provides mock tests, analytics, and progress tracking for SSC CGL, CHSL, and MTS exams. It features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM for data management.

The platform supports multiple question types (MCQ single/multiple choice, numerical), sectional tests (Quantitative Aptitude, Reasoning, General Awareness, English), and provides detailed performance analytics with real-time test-taking capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: React Router for client-side navigation with protected routes
- **Authentication**: Custom JWT-based authentication with React Context

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: JWT tokens with custom middleware for route protection
- **Database Layer**: Drizzle ORM with type-safe queries and migrations
- **API Design**: RESTful endpoints with structured error handling and logging

## Database Design
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Centralized schema definitions in shared directory
- **Key Tables**: 
  - Users and profiles for authentication and user data
  - Tests, questions, and test_questions for exam content
  - Test_attempts and question_attempts for tracking user progress
  - Topics for organizing questions by subject areas
- **Data Types**: Extensive use of PostgreSQL enums for type safety (exam types, difficulty levels, question types, attempt status)

## Development Environment
- **Build System**: Vite for fast development and optimized production builds
- **Development Server**: Express with Vite middleware for HMR in development
- **Static Assets**: Served through Express with appropriate routing
- **TypeScript**: Strict configuration with path mapping for clean imports

## Authentication & Authorization
- **Strategy**: JWT-based authentication with localStorage persistence
- **Protected Routes**: React component wrapper for route-level protection
- **Session Management**: Automatic token validation and user state restoration
- **Password Security**: Basic password handling (note: production would use bcrypt)

## Data Flow Architecture
- **Client-Server Communication**: REST API with JSON payloads
- **Caching Strategy**: React Query for intelligent client-side caching
- **Real-time Features**: Test timer functionality with client-side countdown
- **Error Handling**: Centralized error boundaries and toast notifications

# External Dependencies

## Database Infrastructure
- **Neon Database**: Serverless PostgreSQL with connection pooling via @neondatabase/serverless
- **Connection Management**: WebSocket support for serverless connections

## UI/UX Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Lucide React**: Icon library with consistent styling
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Class Variance Authority**: Type-safe component variant management

## Development Tools
- **Replit Integration**: Custom Vite plugins for Replit environment support
- **TypeScript**: Full type safety across frontend, backend, and shared schemas
- **Drizzle Kit**: Database migration and schema management tools

## Authentication & Utility
- **jsonwebtoken**: JWT token creation and verification
- **uuid**: Unique identifier generation for database records
- **date-fns**: Date manipulation and formatting utilities

## Form & Validation
- **React Hook Form**: Form state management with minimal re-renders
- **Zod**: Runtime type validation with TypeScript integration via drizzle-zod

## Build & Deployment
- **esbuild**: Fast bundling for server-side code in production
- **PostCSS**: CSS processing with Tailwind and autoprefixer
- **Environment Configuration**: Development vs production build targets
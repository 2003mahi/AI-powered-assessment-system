# Overview

This is an AI-Powered Role-Based Assessment & Evaluation System - a comprehensive full-stack application that creates customized technical assessments using AI-powered question generation and intelligent evaluation. The system follows a three-phase workflow: requirements gathering, dynamic test generation, and test taking with AI evaluation. It's designed to assess candidates across different roles, tech stacks, and experience levels with personalized recommendations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend uses React with TypeScript in a single-page application architecture:
- **React + TypeScript**: Provides type safety and modern component patterns
- **Wouter**: Lightweight client-side routing for navigation between phases
- **TanStack Query**: Centralized state management and server synchronization
- **React Hook Form + Zod**: Form handling with schema validation
- **Shadcn/ui + TailwindCSS**: Component library with utility-first styling
- **Vite**: Build tool optimized for React development

## Backend Architecture
The backend follows a REST API pattern with modular service architecture:
- **Express.js + TypeScript**: RESTful API server with type safety
- **Layered Architecture**: Separation between routes, services, and storage layers
- **Storage Abstraction**: Interface-based storage allowing in-memory or PostgreSQL backends
- **Service Layer**: Dedicated AI service for Hugging Face integration
- **Middleware Pipeline**: Request logging, error handling, and JSON parsing

## Data Storage Solutions
Flexible storage architecture supporting multiple backends:
- **In-Memory Storage**: Default implementation using JavaScript Maps for development
- **PostgreSQL Ready**: Drizzle ORM configuration with schema definitions
- **Schema Design**: Normalized tables for users, test blueprints, generated tests, and test attempts
- **Data Models**: Strongly typed with Zod validation schemas

## AI Integration Strategy
AI capabilities are centralized through a dedicated service layer:
- **Hugging Face Inference API**: Free-tier NLP for question generation and evaluation
- **Natural Language Processing**: Converts user requirements into structured constraints
- **Dynamic Content Generation**: Creates role-specific questions with difficulty adjustment
- **Intelligent Evaluation**: AI-powered scoring and feedback generation
- **Fallback Mechanisms**: Error handling for AI service unavailability

## Component Architecture
The system is organized into reusable, feature-specific components:
- **Phase Navigation**: Manages workflow progression between assessment phases
- **Requirements Form**: Complex form handling with validation and multi-select inputs
- **Test Generation**: AI integration with loading states and error handling
- **Test Interface**: Timer-based test taking with progress tracking
- **Assessment Report**: Comprehensive results display with skill breakdowns

## API Design Patterns
RESTful endpoints following conventional HTTP methods:
- **Blueprint Management**: CRUD operations for test templates
- **Test Generation**: Stateful AI-powered test creation
- **Test Attempts**: Session management for test taking
- **Evaluation Pipeline**: AI-powered assessment with structured feedback

# External Dependencies

## AI Services
- **Hugging Face Inference API**: Core AI functionality for NLP tasks, question generation, and answer evaluation
- **Environment Configuration**: Requires HF_API_KEY or HUGGING_FACE_API_KEY

## Database Services
- **Neon Serverless**: PostgreSQL hosting service configured via DATABASE_URL
- **Drizzle ORM**: Database migrations and schema management
- **Connection Pooling**: Built-in with @neondatabase/serverless package

## UI Component Libraries
- **Radix UI Primitives**: Accessible component foundations (@radix-ui/react-*)
- **Shadcn/ui**: Pre-built component library built on Radix
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Frontend build tool with HMR and optimization
- **ESBuild**: Backend bundling for production builds
- **TypeScript**: Type checking and compilation across the stack
- **Replit Integration**: Development environment with runtime error overlay

## Form and Validation
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: Integration between React Hook Form and Zod

## Styling and Animation
- **TailwindCSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with Autoprefixer
- **Class Variance Authority**: Dynamic className generation
- **Embla Carousel**: Touch-friendly carousel components
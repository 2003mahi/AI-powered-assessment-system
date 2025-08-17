# AI-Powered Role-Based Assessment & Evaluation System

A comprehensive full-stack application that creates customized technical assessments using AI-powered question generation and intelligent evaluation.

## Features

### 🎯 **Phase 1: Role & Requirements Gathering**
- Interactive form for specifying job roles, tech stack, and experience levels
- Natural language refinement for custom requirements
- Support for multiple question types and test durations
- Blueprint creation and storage

### 🔧 **Phase 2: Dynamic Test Generation**
- AI-powered question generation using Hugging Face models
- Difficulty-adjusted questions based on experience level
- Multiple question formats: MCQ, coding problems, theory, and scenario-based
- Real-time test preview and metadata

### 📊 **Phase 3: Test Taking & AI Evaluation**
- Timer-based test interface with progress tracking
- Multi-format question support with intuitive UI
- AI-powered answer evaluation and scoring
- Comprehensive assessment reports with skill breakdown
- Personalized recommendations for improvement

## Tech Stack

### Frontend
- **React** with TypeScript
- **TailwindCSS** for styling
- **Wouter** for routing
- **TanStack Query** for state management
- **React Hook Form** with Zod validation
- **Shadcn/ui** components

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** with schema validation
- **Hugging Face Inference API** for AI capabilities
- **In-memory storage** (configurable for PostgreSQL)

### AI Integration
- **Hugging Face Inference API** for:
  - Natural language processing and parsing
  - Dynamic question generation
  - Intelligent answer evaluation
  - Performance analysis and recommendations

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Hugging Face API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-assessment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Add your Hugging Face API key:
   ```env
   HUGGING_FACE_API_KEY=your_api_key_here
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## API Endpoints

### Blueprints
- `POST /api/blueprint` - Create test blueprint
- `GET /api/blueprint/:id` - Get blueprint details

### Test Generation
- `POST /api/generate` - Generate test from blueprint
- `GET /api/test/:id` - Get generated test

### Test Attempts
- `POST /api/attempt/start` - Start test attempt
- `POST /api/evaluate` - Submit answers for evaluation
- `GET /api/attempt/:id` - Get attempt results

### User Data
- `GET /api/user/tests` - Get user's test history

## Project Structure


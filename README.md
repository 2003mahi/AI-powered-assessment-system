# AI-powered-assessment-system
Trial Assignment – AI-Powered Role-Based Assessment &amp; Evaluation System

# AI-Powered Role-Based Assessment & Evaluation System

> A dynamic, customizable assessment platform that generates and evaluates technical tests based on user-defined roles, tech stacks, and experience levels using AI.

---

##  Table of Contents

- [Overview](#overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Setup on Replit](#setup-on-replit)  
- [Usage](#usage)  
- [Integration Demo](#integration-demo)  
- [Project Structure](#project-structure)  
- [How It Works](#how-it-works)  
- [Contributing](#contributing)  
- [License](#license)

---

##  Overview

This project offers a mini version of an AI-powered assessment system structured in three key phases:

1. **Role & Requirements Gathering** – Collects both structured details and NLP-refined inputs to define test constraints.  
2. **Dynamic Test Generation** – Uses an LLM (via Hugging Face Inference API) to generate varied questions with metadata.  
3. **Test Taking & AI Evaluation** – Enables users to take the test, auto-check coding answers, and get AI-evaluated reports with scores, skills breakdown, strengths & weaknesses, and improvement suggestions.

Optional bonus features: proctoring (timer & tab-change detection) and multi-role template reuse.

---

##  Features

- Adaptive question generation based on role (e.g., Frontend Developer, Data Scientist), tech stack, and experience level  
- Natural language refinement for customized test blueprints  
- Mixed question formats (MCQ, coding problems, scenario-based, etc.) with metadata (tags, difficulty, time estimates)  
- AI-powered scoring and feedback (overall score, skills breakdown, strengths & weaknesses, improvement tips)  
- Clean, responsive UI built in React (Tailwind CSS / Material UI)  
- Full-stack backend using Node.js + Express, with MongoDB (or PostgreSQL)  
- Deployed live on **Replit** for instant access

---

##  Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Frontend   | React (Next.js or CRA) + Tailwind or MUI |
| Backend    | Node.js + Express                        |
| Database   | MongoDB (default) or PostgreSQL          |
| AI         | Hugging Face Inference API (free-tier)   |
| Deployment | Replit (full-stack hosting)              |

---

##  Getting Started

### Prerequisites

- A Hugging Face account (for API key)  
- A Replit account

### Setup on Replit

1. **Fork or create** a new Replit containing both frontend and backend code.  
2. Set an environment variable:  
3. Add your DB connection string:
- MongoDB: `MONGODB_URI="your_mongo_uri"`
- PostgreSQL: `DATABASE_URL="your_postgres_uri"`
4. Replit should auto-detect the necessary start scripts (`npm start` or `next dev`), or configure your monorepo as needed.

---

##  Usage

1. Open the live Replit project.
2. Fill in the role-specific test requirements, including custom natural language prompts.
3. Generate the test—AI crafts questions and stores the blueprint.
4. Take the test in-app—coding answers auto-checked; open-ended ones evaluated by AI.
5. Receive a detailed AI-generated report with scores, breakdowns, strengths, and suggested resources.

---

##  Integration Demo

Want a step-by-step walkthrough? Click the image below to watch:

[![Watch the integration demo](assets/thumbnail.png)](https://drive.google.com/file/d/16TluUzm2pJimVVxg0usDtUt5KFWZxx8j/view?usp=sharing)

---

##  Project Structure


---

##  How It Works

### Phase 1: Blueprinting

- Frontend captures role, skills, experience, preferences, and optional NLP text.
- Backend merges the inputs and uses an LLM to refine the test blueprint.
- Blueprint is saved in the database.

### Phase 2: Test Generation

- Backend sends the blueprint to an LLM via Hugging Face.
- Generates questions in multiple formats with metadata.
- Saves the test to DB and serves it to the frontend.

### Phase 3: Evaluation & Reporting

- Coding questions auto-validated via simple test runners.
- Open-ended responses sent to LLM for evaluation.
- Backend calculates scores, breakdowns, strengths/weaknesses, and improvement suggestions.
- Frontend presents a neat report/dashboard.

---

##  Contributing

Love the project? Here’s how to help:

- Fork the repo  
- Add enhancements or fix bugs  
- Submit a Pull Request with:
  - Description of changes  
  - How to test or try your contribution  
- See `CONTRIBUTING.md` for guidance (if added)

Let’s collaborate and improve this together!

---

##  License

Open source love! Choose a license like **MIT** or **Apache-2.0** based on your preference.

---


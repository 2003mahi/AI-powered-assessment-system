export interface PhaseState {
  current: 'requirements' | 'generation' | 'evaluation';
  completed: {
    requirements: boolean;
    generation: boolean;
    evaluation: boolean;
  };
}

export interface RequirementsFormData {
  role: string;
  experienceLevel: 'junior' | 'mid' | 'senior';
  techStack: string[];
  questionTypes: string[];
  duration: number;
  naturalLanguageRefinement: string;
}

export interface TestSession {
  attemptId: string;
  testId: string;
  startTime: Date;
  duration: number; // in minutes
  currentQuestionIndex: number;
  answers: Record<string, string>;
  timeSpent: Record<string, number>; // time spent per question in seconds
}

export const AVAILABLE_ROLES = [
  'Frontend Developer',
  'Backend Developer', 
  'Full-Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Mobile Developer'
] as const;

export const AVAILABLE_TECH_STACK = [
  'React',
  'Node.js',
  'MongoDB', 
  'Python',
  'TypeScript',
  'AWS',
  'Docker',
  'SQL',
  'Vue.js',
  'Angular',
  'Express.js',
  'PostgreSQL',
  'GraphQL',
  'Redis',
  'Kubernetes'
] as const;

export const QUESTION_TYPES = [
  { id: 'mcq', label: 'Multiple Choice Questions' },
  { id: 'coding', label: 'Coding Problems' },
  { id: 'theory', label: 'Theory Questions' },
  { id: 'scenario', label: 'Scenario-based Questions' }
] as const;

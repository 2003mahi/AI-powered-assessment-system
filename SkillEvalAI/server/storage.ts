import { 
  type User, 
  type InsertUser, 
  type TestBlueprint,
  type InsertTestBlueprint,
  type GeneratedTest,
  type InsertGeneratedTest,
  type TestAttempt,
  type InsertTestAttempt
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Test Blueprint methods
  createTestBlueprint(blueprint: InsertTestBlueprint): Promise<TestBlueprint>;
  getTestBlueprint(id: string): Promise<TestBlueprint | undefined>;
  getUserTestBlueprints(userId: string): Promise<TestBlueprint[]>;

  // Generated Test methods
  createGeneratedTest(test: InsertGeneratedTest): Promise<GeneratedTest>;
  getGeneratedTest(id: string): Promise<GeneratedTest | undefined>;
  getTestByBlueprintId(blueprintId: string): Promise<GeneratedTest | undefined>;

  // Test Attempt methods
  createTestAttempt(attempt: InsertTestAttempt): Promise<TestAttempt>;
  getTestAttempt(id: string): Promise<TestAttempt | undefined>;
  updateTestAttempt(id: string, update: Partial<TestAttempt>): Promise<TestAttempt | undefined>;
  getUserTestAttempts(userId: string): Promise<TestAttempt[]>;
  
  // Analytics methods
  getAllBlueprints(): Promise<TestBlueprint[]>;
  getAllAttempts(): Promise<TestAttempt[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private testBlueprints: Map<string, TestBlueprint>;
  private generatedTests: Map<string, GeneratedTest>;
  private testAttempts: Map<string, TestAttempt>;

  constructor() {
    this.users = new Map();
    this.testBlueprints = new Map();
    this.generatedTests = new Map();
    this.testAttempts = new Map();
    
    // Add sample data for testing
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Create sample blueprints
    const sampleBlueprints = [
      {
        id: "blueprint-1",
        userId: "demo-user-1",
        role: "Full-Stack Developer",
        techStack: ["React", "Node.js", "TypeScript", "PostgreSQL"],
        experienceLevel: "mid" as const,
        duration: 60,
        questionTypes: ["mcq", "coding", "theory"] as const,
        naturalLanguageRefinement: "Focus on practical React hooks and async programming patterns",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        id: "blueprint-2", 
        userId: "demo-user-1",
        role: "Frontend Developer",
        techStack: ["React", "JavaScript", "CSS", "HTML"],
        experienceLevel: "junior" as const,
        duration: 45,
        questionTypes: ["mcq", "theory"] as const,
        naturalLanguageRefinement: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        id: "blueprint-3",
        userId: "demo-user-1", 
        role: "Backend Developer",
        techStack: ["Node.js", "Express", "MongoDB", "Python"],
        experienceLevel: "senior" as const,
        duration: 90,
        questionTypes: ["coding", "scenario", "theory"] as const,
        naturalLanguageRefinement: "Include system design questions for microservices architecture",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    sampleBlueprints.forEach(blueprint => {
      this.testBlueprints.set(blueprint.id, blueprint as TestBlueprint);
    });

    // Create sample attempts
    const sampleAttempts = [
      {
        id: "attempt-1",
        testId: "test-1",
        userId: "demo-user-1",
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        answers: [],
        score: 85,
        isCompleted: true,
        evaluation: {
          overallScore: 85,
          feedback: "Excellent understanding of React concepts and good problem-solving skills.",
          skillBreakdown: {
            "React": { score: 90, feedback: "Strong grasp of hooks and component lifecycle" },
            "JavaScript": { score: 80, feedback: "Good ES6+ knowledge, practice async/await patterns" },
            "Problem Solving": { score: 85, feedback: "Logical approach to coding challenges" }
          },
          recommendations: [
            { title: "Advanced React Patterns", description: "Study render props and compound components" }
          ]
        }
      },
      {
        id: "attempt-2",
        testId: "test-2", 
        userId: "demo-user-1",
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        answers: [],
        score: 78,
        isCompleted: true,
        evaluation: {
          overallScore: 78,
          feedback: "Good foundation with room for improvement in advanced topics.",
          skillBreakdown: {
            "Node.js": { score: 75, feedback: "Understand basics, need more experience with streams" },
            "Database Design": { score: 80, feedback: "Good understanding of SQL and indexing" },
            "API Design": { score: 80, feedback: "RESTful principles are well understood" }
          },
          recommendations: [
            { title: "Node.js Streams", description: "Learn about readable and writable streams" }
          ]
        }
      }
    ];

    sampleAttempts.forEach(attempt => {
      this.testAttempts.set(attempt.id, attempt as TestAttempt);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTestBlueprint(insertBlueprint: InsertTestBlueprint): Promise<TestBlueprint> {
    const id = randomUUID();
    const blueprint: TestBlueprint = { 
      ...insertBlueprint, 
      id,
      createdAt: new Date(),
      naturalLanguageRefinement: insertBlueprint.naturalLanguageRefinement || null
    };
    this.testBlueprints.set(id, blueprint);
    return blueprint;
  }

  async getTestBlueprint(id: string): Promise<TestBlueprint | undefined> {
    return this.testBlueprints.get(id);
  }

  async getUserTestBlueprints(userId: string): Promise<TestBlueprint[]> {
    return Array.from(this.testBlueprints.values()).filter(
      (blueprint) => blueprint.userId === userId
    );
  }

  async createGeneratedTest(insertTest: InsertGeneratedTest): Promise<GeneratedTest> {
    const id = randomUUID();
    const test: GeneratedTest = {
      ...insertTest,
      id,
      createdAt: new Date(),
      metadata: insertTest.metadata || null
    };
    this.generatedTests.set(id, test);
    return test;
  }

  async getGeneratedTest(id: string): Promise<GeneratedTest | undefined> {
    return this.generatedTests.get(id);
  }

  async getTestByBlueprintId(blueprintId: string): Promise<GeneratedTest | undefined> {
    return Array.from(this.generatedTests.values()).find(
      (test) => test.blueprintId === blueprintId
    );
  }

  async createTestAttempt(insertAttempt: InsertTestAttempt): Promise<TestAttempt> {
    const id = randomUUID();
    const attempt: TestAttempt = {
      ...insertAttempt,
      id,
      score: null,
      evaluation: null,
      isCompleted: false,
      endTime: insertAttempt.endTime || null
    };
    this.testAttempts.set(id, attempt);
    return attempt;
  }

  async getTestAttempt(id: string): Promise<TestAttempt | undefined> {
    return this.testAttempts.get(id);
  }

  async updateTestAttempt(id: string, update: Partial<TestAttempt>): Promise<TestAttempt | undefined> {
    const existing = this.testAttempts.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...update };
    this.testAttempts.set(id, updated);
    return updated;
  }

  async getUserTestAttempts(userId: string): Promise<TestAttempt[]> {
    return Array.from(this.testAttempts.values()).filter(
      (attempt) => attempt.userId === userId
    );
  }

  async getAllBlueprints(): Promise<TestBlueprint[]> {
    return Array.from(this.testBlueprints.values());
  }

  async getAllAttempts(): Promise<TestAttempt[]> {
    return Array.from(this.testAttempts.values());
  }
}

export const storage = new MemStorage();

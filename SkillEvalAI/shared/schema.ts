import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const testBlueprints = pgTable("test_blueprints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull(),
  experienceLevel: text("experience_level").notNull(),
  techStack: jsonb("tech_stack").$type<string[]>().notNull(),
  questionTypes: jsonb("question_types").$type<string[]>().notNull(),
  duration: integer("duration").notNull(), // in minutes
  naturalLanguageRefinement: text("natural_language_refinement"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generatedTests = pgTable("generated_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blueprintId: varchar("blueprint_id").notNull(),
  questions: jsonb("questions").$type<Question[]>().notNull(),
  metadata: jsonb("metadata").$type<TestMetadata>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testAttempts = pgTable("test_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testId: varchar("test_id").notNull(),
  userId: varchar("user_id").notNull(),
  answers: jsonb("answers").$type<TestAnswer[]>().notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  score: integer("score"),
  evaluation: jsonb("evaluation").$type<EvaluationResult>(),
  isCompleted: boolean("is_completed").default(false).notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true });

export const insertTestBlueprintSchema = createInsertSchema(testBlueprints).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  role: z.string().min(1, "Role is required"),
  experienceLevel: z.enum(["junior", "mid", "senior"]),
  techStack: z.array(z.string()).min(1, "At least one technology must be selected"),
  questionTypes: z.array(z.string()).min(1, "At least one question type must be selected"),
  duration: z.number().min(15).max(180, "Duration must be between 15 and 180 minutes"),
});

export const insertGeneratedTestSchema = createInsertSchema(generatedTests).omit({ 
  id: true, 
  createdAt: true 
});

export const insertTestAttemptSchema = createInsertSchema(testAttempts).omit({ 
  id: true,
  score: true,
  evaluation: true,
  isCompleted: true
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TestBlueprint = typeof testBlueprints.$inferSelect;
export type InsertTestBlueprint = z.infer<typeof insertTestBlueprintSchema>;

export type GeneratedTest = typeof generatedTests.$inferSelect;
export type InsertGeneratedTest = z.infer<typeof insertGeneratedTestSchema>;

export type TestAttempt = typeof testAttempts.$inferSelect;
export type InsertTestAttempt = z.infer<typeof insertTestAttemptSchema>;

// Additional types for question structure
export interface Question {
  id: string;
  type: 'mcq' | 'coding' | 'theory' | 'scenario';
  title: string;
  content: string;
  options?: string[]; // for MCQ questions
  expectedAnswer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
  timeEstimate: number; // in minutes
  points: number;
}

export interface TestAnswer {
  questionId: string;
  answer: string;
  timeSpent: number; // in seconds
}

export interface TestMetadata {
  totalQuestions: number;
  totalTime: number;
  difficultyDistribution: Record<string, number>;
  skillDistribution: Record<string, number>;
}

export interface EvaluationResult {
  overallScore: number;
  skillBreakdown: Record<string, {
    score: number;
    rating: string;
    feedback: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{
    title: string;
    description: string;
    resources?: string[];
  }>;
  detailedFeedback: string;
}

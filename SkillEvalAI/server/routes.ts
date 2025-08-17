import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { huggingFaceService } from "./services/huggingface";
import { 
  insertTestBlueprintSchema, 
  insertTestAttemptSchema,
  TestAnswer 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create test blueprint endpoint
  app.post("/api/blueprint", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTestBlueprintSchema.parse(req.body);
      
      // For demo purposes, use a default user ID
      // In production, this would come from authentication
      const userId = "demo-user-1";
      
      const blueprint = await storage.createTestBlueprint({
        ...validatedData,
        userId
      });

      res.json(blueprint);
    } catch (error) {
      console.error("Error creating blueprint:", error);
      res.status(400).json({ 
        error: "Failed to create test blueprint",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get test blueprint endpoint
  app.get("/api/blueprint/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const blueprint = await storage.getTestBlueprint(id);
      
      if (!blueprint) {
        return res.status(404).json({ error: "Blueprint not found" });
      }
      
      res.json(blueprint);
    } catch (error) {
      console.error("Error fetching blueprint:", error);
      res.status(500).json({ error: "Failed to fetch blueprint" });
    }
  });

  // Generate test from blueprint
  app.post("/api/generate", async (req: Request, res: Response) => {
    try {
      const { blueprintId } = req.body;
      
      if (!blueprintId) {
        return res.status(400).json({ error: "Blueprint ID is required" });
      }

      const blueprint = await storage.getTestBlueprint(blueprintId);
      if (!blueprint) {
        return res.status(404).json({ error: "Blueprint not found" });
      }

      // Check if test already exists
      let existingTest = await storage.getTestByBlueprintId(blueprintId);
      if (existingTest) {
        return res.json(existingTest);
      }

      let refinedRequirements;
      if (blueprint.naturalLanguageRefinement) {
        try {
          refinedRequirements = await huggingFaceService.parseNaturalLanguageRequirements(
            blueprint.naturalLanguageRefinement, 
            blueprint
          );
        } catch (error) {
          console.warn("Failed to parse natural language requirements:", error);
          // Continue without refined requirements
        }
      }

      const questions = await huggingFaceService.generateQuestions(blueprint, refinedRequirements);

      if (questions.length === 0) {
        return res.status(500).json({ error: "Failed to generate questions" });
      }

      const totalTime = questions.reduce((sum, q) => sum + q.timeEstimate, 0);
      const skillCounts = questions.reduce((acc, q) => {
        q.skills.forEach(skill => {
          acc[skill] = (acc[skill] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      const difficultyCount = questions.reduce((acc, q) => {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const generatedTest = await storage.createGeneratedTest({
        blueprintId,
        questions,
        metadata: {
          totalQuestions: questions.length,
          totalTime,
          skillDistribution: skillCounts,
          difficultyDistribution: difficultyCount
        }
      });

      res.json(generatedTest);
    } catch (error) {
      console.error("Error generating test:", error);
      res.status(500).json({ 
        error: "Failed to generate test",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get generated test
  app.get("/api/test/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const test = await storage.getGeneratedTest(id);
      
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      
      res.json(test);
    } catch (error) {
      console.error("Error fetching test:", error);
      res.status(500).json({ error: "Failed to fetch test" });
    }
  });

  // Start test attempt
  app.post("/api/attempt/start", async (req: Request, res: Response) => {
    try {
      const { testId } = req.body;
      
      if (!testId) {
        return res.status(400).json({ error: "Test ID is required" });
      }

      const test = await storage.getGeneratedTest(testId);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }

      // For demo purposes, use a default user ID
      const userId = "demo-user-1";

      const attempt = await storage.createTestAttempt({
        testId,
        userId,
        answers: [],
        startTime: new Date(),
        endTime: null
      });

      res.json(attempt);
    } catch (error) {
      console.error("Error starting test attempt:", error);
      res.status(500).json({ error: "Failed to start test attempt" });
    }
  });

  // Submit test answers for evaluation
  app.post("/api/evaluate", async (req: Request, res: Response) => {
    try {
      const { attemptId, answers } = req.body;
      
      if (!attemptId || !answers) {
        return res.status(400).json({ error: "Attempt ID and answers are required" });
      }

      const attempt = await storage.getTestAttempt(attemptId);
      if (!attempt) {
        return res.status(404).json({ error: "Test attempt not found" });
      }

      const test = await storage.getGeneratedTest(attempt.testId);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }

      // Evaluate answers using AI
      const evaluation = await huggingFaceService.evaluateAnswers(test.questions, answers);

      // Update the attempt with results
      const updatedAttempt = await storage.updateTestAttempt(attemptId, {
        answers: answers as TestAnswer[],
        endTime: new Date(),
        score: evaluation.overallScore,
        evaluation,
        isCompleted: true
      });

      res.json({
        attempt: updatedAttempt,
        evaluation
      });
    } catch (error) {
      console.error("Error evaluating test:", error);
      res.status(500).json({ 
        error: "Failed to evaluate test",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get test attempt results
  app.get("/api/attempt/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const attempt = await storage.getTestAttempt(id);
      
      if (!attempt) {
        return res.status(404).json({ error: "Test attempt not found" });
      }
      
      res.json(attempt);
    } catch (error) {
      console.error("Error fetching test attempt:", error);
      res.status(500).json({ error: "Failed to fetch test attempt" });
    }
  });

  // Get user's test history
  app.get("/api/user/tests", async (req: Request, res: Response) => {
    try {
      const attempts = await storage.getAllAttempts();
      const blueprints = await storage.getAllBlueprints();
      
      res.json({
        attempts,
        blueprints
      });
    } catch (error) {
      console.error("Error fetching user tests:", error);
      res.status(500).json({ error: "Failed to fetch user tests" });
    }
  });

  // Get analytics data
  app.get("/api/analytics", async (req: Request, res: Response) => {
    try {
      const attempts = await storage.getAllAttempts();
      const completedAttempts = attempts.filter((a: TestAttempt) => a.isCompleted);
      
      // Calculate analytics
      const totalAssessments = attempts.length;
      const completedAssessments = completedAttempts.length;
      const averageScore = completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((sum: number, a: TestAttempt) => sum + (a.score || 0), 0) / completedAttempts.length)
        : 0;
      const bestScore = Math.max(...completedAttempts.map((a: TestAttempt) => a.score || 0), 0);
      
      // Skill analytics
      const skillData: Record<string, number[]> = {};
      completedAttempts.forEach((attempt: TestAttempt) => {
        const skillBreakdown = attempt.evaluation?.skillBreakdown || {};
        Object.entries(skillBreakdown).forEach(([skill, data]) => {
          if (!skillData[skill]) skillData[skill] = [];
          skillData[skill].push((data as any).score);
        });
      });

      const skillAnalytics = Object.entries(skillData).map(([skill, scores]) => ({
        skill,
        average: Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length),
        assessments: scores.length,
        trend: scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0
      }));

      res.json({
        totalAssessments,
        completedAssessments,
        averageScore,
        bestScore,
        skillAnalytics
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Export assessment data
  app.get("/api/export", async (req: Request, res: Response) => {
    try {
      const blueprints = await storage.getAllBlueprints();
      const attempts = await storage.getAllAttempts();
      
      const exportData = {
        blueprints,
        attempts,
        exportDate: new Date().toISOString(),
        version: "1.0"
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=assessment-data.json");
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { apiRequest } from "./queryClient";
import { TestBlueprint, GeneratedTest, TestAttempt, InsertTestBlueprint, TestAnswer } from "@shared/schema";

export const assessmentApi = {
  // Blueprint operations
  createBlueprint: async (data: InsertTestBlueprint): Promise<TestBlueprint> => {
    const response = await apiRequest("POST", "/api/blueprint", data);
    return response.json();
  },

  getBlueprint: async (id: string): Promise<TestBlueprint> => {
    const response = await apiRequest("GET", `/api/blueprint/${id}`);
    return response.json();
  },

  // Test generation
  generateTest: async (blueprintId: string): Promise<GeneratedTest> => {
    const response = await apiRequest("POST", "/api/generate", { blueprintId });
    return response.json();
  },

  getTest: async (id: string): Promise<GeneratedTest> => {
    const response = await apiRequest("GET", `/api/test/${id}`);
    return response.json();
  },

  // Test attempts
  startAttempt: async (testId: string): Promise<TestAttempt> => {
    const response = await apiRequest("POST", "/api/attempt/start", { testId });
    return response.json();
  },

  evaluateTest: async (attemptId: string, answers: TestAnswer[]): Promise<{
    attempt: TestAttempt;
    evaluation: any;
  }> => {
    const response = await apiRequest("POST", "/api/evaluate", { attemptId, answers });
    return response.json();
  },

  getAttempt: async (id: string): Promise<TestAttempt> => {
    const response = await apiRequest("GET", `/api/attempt/${id}`);
    return response.json();
  },

  // User data
  getUserTests: async (): Promise<{
    attempts: TestAttempt[];
    blueprints: TestBlueprint[];
  }> => {
    const response = await apiRequest("GET", "/api/user/tests");
    return response.json();
  }
};

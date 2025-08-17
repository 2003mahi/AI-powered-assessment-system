import { Question, TestBlueprint } from "@shared/schema";

const HF_API_URL = "https://api-inference.huggingface.co/models";
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY || process.env.HF_API_KEY || "";

if (!HF_API_KEY) {
  console.warn("Warning: Hugging Face API key not found in environment variables");
}

interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

class HuggingFaceService {
  private async callAPI(modelId: string, inputs: any): Promise<string> {
    try {
      const response = await fetch(`${HF_API_URL}/${modelId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs, parameters: { max_length: 1000, temperature: 0.7 } }),
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json() as HuggingFaceResponse | HuggingFaceResponse[];
      
      // Handle both single response and array response
      const data = Array.isArray(result) ? result[0] : result;
      
      if (data.error) {
        throw new Error(`Hugging Face API error: ${data.error}`);
      }

      return data.generated_text || "";
    } catch (error) {
      console.error("Hugging Face API call failed:", error);
      throw new Error(`Failed to call Hugging Face API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async parseNaturalLanguageRequirements(naturalLanguage: string, blueprint: TestBlueprint): Promise<string> {
    const prompt = `
You are an AI assessment designer. Analyze the following natural language requirements and convert them into structured assessment guidelines.

Role: ${blueprint.role}
Experience Level: ${blueprint.experienceLevel}
Tech Stack: ${blueprint.techStack.join(", ")}
Duration: ${blueprint.duration} minutes
Natural Language Requirements: "${naturalLanguage}"

Based on these requirements, provide structured guidelines for:
1. Question difficulty distribution
2. Specific topics to focus on
3. Question format preferences
4. Assessment priorities

Respond with clear, actionable guidelines:`;

    const response = await this.callAPI("microsoft/DialoGPT-large", prompt);
    return response.replace(prompt, "").trim();
  }

  async generateQuestions(blueprint: TestBlueprint, refinedRequirements?: string): Promise<Question[]> {
    const questions: Question[] = [];
    const totalQuestions = Math.ceil(blueprint.duration / 10); // Roughly 10 minutes per question
    
    for (let i = 0; i < totalQuestions; i++) {
      const questionType = blueprint.questionTypes[i % blueprint.questionTypes.length] as Question['type'];
      const skill = blueprint.techStack[i % blueprint.techStack.length];
      
      const question = await this.generateSingleQuestion(
        questionType, 
        skill, 
        blueprint.role, 
        blueprint.experienceLevel,
        refinedRequirements
      );
      
      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }

  private async generateSingleQuestion(
    type: Question['type'], 
    skill: string, 
    role: string, 
    level: string,
    requirements?: string
  ): Promise<Question | null> {
    try {
      let prompt = "";
      
      switch (type) {
        case "mcq":
          prompt = `Generate a multiple choice question for a ${level} level ${role} about ${skill}.
          
Requirements: ${requirements || "Standard technical assessment"}

Format your response as:
QUESTION: [question text]
A) [option A]
B) [option B] 
C) [option C]
D) [option D]
CORRECT: [A/B/C/D]
DIFFICULTY: [easy/medium/hard]
EXPLANATION: [brief explanation]`;
          break;
          
        case "coding":
          prompt = `Generate a coding problem for a ${level} level ${role} focusing on ${skill}.
          
Requirements: ${requirements || "Standard coding challenge"}

Format your response as:
PROBLEM: [problem description]
INPUT: [input format]
OUTPUT: [expected output format]
EXAMPLE: [sample input/output]
DIFFICULTY: [easy/medium/hard]
HINTS: [helpful hints]`;
          break;
          
        case "theory":
          prompt = `Generate a theory question for a ${level} level ${role} about ${skill}.
          
Requirements: ${requirements || "Standard theoretical knowledge assessment"}

Format your response as:
QUESTION: [open-ended question]
EXPECTED_POINTS: [key points that should be covered]
DIFFICULTY: [easy/medium/hard]
EVALUATION_CRITERIA: [how to evaluate the answer]`;
          break;
          
        case "scenario":
          prompt = `Generate a scenario-based question for a ${level} level ${role} involving ${skill}.
          
Requirements: ${requirements || "Real-world scenario assessment"}

Format your response as:
SCENARIO: [detailed scenario description]
QUESTION: [what needs to be solved/designed]
DIFFICULTY: [easy/medium/hard]
EVALUATION_POINTS: [key aspects to evaluate]`;
          break;
      }

      const response = await this.callAPI("microsoft/DialoGPT-large", prompt);
      return this.parseQuestionResponse(response, type, skill);
      
    } catch (error) {
      console.error(`Failed to generate ${type} question for ${skill}:`, error);
      return null;
    }
  }

  private parseQuestionResponse(response: string, type: Question['type'], skill: string): Question | null {
    try {
      const question: Question = {
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        title: "",
        content: response,
        difficulty: "medium",
        skills: [skill],
        timeEstimate: this.getTimeEstimate(type),
        points: this.getPointsForDifficulty("medium")
      };

      // Extract structured data from response
      const lines = response.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('QUESTION:')) {
          question.title = line.replace('QUESTION:', '').trim();
        } else if (line.startsWith('DIFFICULTY:')) {
          const difficulty = line.replace('DIFFICULTY:', '').trim().toLowerCase();
          if (['easy', 'medium', 'hard'].includes(difficulty)) {
            question.difficulty = difficulty as Question['difficulty'];
            question.points = this.getPointsForDifficulty(difficulty);
          }
        }
      }

      // For MCQ questions, extract options
      if (type === 'mcq') {
        const options: string[] = [];
        for (const line of lines) {
          if (line.match(/^[A-D]\)/)) {
            options.push(line.trim());
          }
        }
        question.options = options;
      }

      return question;
    } catch (error) {
      console.error("Failed to parse question response:", error);
      return null;
    }
  }

  private getTimeEstimate(type: Question['type']): number {
    switch (type) {
      case 'mcq': return 3;
      case 'coding': return 15;
      case 'theory': return 8;
      case 'scenario': return 12;
      default: return 5;
    }
  }

  private getPointsForDifficulty(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
      default: return 20;
    }
  }

  async evaluateAnswers(questions: Question[], answers: any[]): Promise<any> {
    const evaluations = [];
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const answer = answers[i];
      
      if (!answer) {
        evaluations.push({
          questionId: question.id,
          score: 0,
          feedback: "No answer provided",
          maxScore: question.points
        });
        continue;
      }

      try {
        const evaluation = await this.evaluateSingleAnswer(question, answer.answer);
        evaluations.push({
          questionId: question.id,
          ...evaluation,
          maxScore: question.points
        });
      } catch (error) {
        console.error(`Failed to evaluate answer for question ${question.id}:`, error);
        evaluations.push({
          questionId: question.id,
          score: 0,
          feedback: "Evaluation failed",
          maxScore: question.points
        });
      }
    }

    return this.generateOverallEvaluation(evaluations, questions);
  }

  private async evaluateSingleAnswer(question: Question, answer: string): Promise<any> {
    const prompt = `
Evaluate this answer for a ${question.type} question about ${question.skills.join(", ")}:

QUESTION: ${question.title}
QUESTION_CONTENT: ${question.content}
STUDENT_ANSWER: ${answer}
MAX_POINTS: ${question.points}

Please evaluate and provide:
1. Score (0-${question.points})
2. Feedback on what was done well
3. Areas for improvement
4. Specific technical accuracy

Format as:
SCORE: [0-${question.points}]
FEEDBACK: [detailed feedback]
STRENGTHS: [what was done well]
IMPROVEMENTS: [areas to improve]`;

    const response = await this.callAPI("microsoft/DialoGPT-large", prompt);
    
    // Parse the evaluation response
    const lines = response.split('\n');
    let score = Math.floor(question.points * 0.5); // Default to 50%
    let feedback = "Answer evaluated";
    
    for (const line of lines) {
      if (line.startsWith('SCORE:')) {
        const scoreMatch = line.match(/\d+/);
        if (scoreMatch) {
          score = Math.min(parseInt(scoreMatch[0]), question.points);
        }
      } else if (line.startsWith('FEEDBACK:')) {
        feedback = line.replace('FEEDBACK:', '').trim();
      }
    }

    return { score, feedback };
  }

  private generateOverallEvaluation(evaluations: any[], questions: Question[]): any {
    const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    const maxScore = evaluations.reduce((sum, evaluation) => sum + evaluation.maxScore, 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Group by skills
    const skillBreakdown: Record<string, any> = {};
    
    questions.forEach((question, index) => {
      question.skills.forEach(skill => {
        if (!skillBreakdown[skill]) {
          skillBreakdown[skill] = {
            totalScore: 0,
            maxScore: 0,
            questions: 0
          };
        }
        
        skillBreakdown[skill].totalScore += evaluations[index].score;
        skillBreakdown[skill].maxScore += evaluations[index].maxScore;
        skillBreakdown[skill].questions += 1;
      });
    });

    // Calculate skill percentages and ratings
    Object.keys(skillBreakdown).forEach(skill => {
      const data = skillBreakdown[skill];
      const skillPercentage = Math.round((data.totalScore / data.maxScore) * 100);
      skillBreakdown[skill].score = skillPercentage;
      skillBreakdown[skill].rating = this.getPerformanceRating(skillPercentage);
      skillBreakdown[skill].feedback = this.generateSkillFeedback(skill, skillPercentage);
    });

    return {
      overallScore: percentage,
      skillBreakdown,
      strengths: this.generateStrengths(skillBreakdown),
      weaknesses: this.generateWeaknesses(skillBreakdown),
      recommendations: this.generateRecommendations(skillBreakdown),
      detailedFeedback: `Overall performance: ${this.getPerformanceRating(percentage)}. ${this.generateDetailedFeedback(percentage, skillBreakdown)}`
    };
  }

  private getPerformanceRating(percentage: number): string {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 80) return "Very Good";
    if (percentage >= 70) return "Good";
    if (percentage >= 60) return "Average";
    return "Needs Improvement";
  }

  private generateSkillFeedback(skill: string, percentage: number): string {
    const rating = this.getPerformanceRating(percentage);
    return `${rating} understanding of ${skill} concepts and practical application.`;
  }

  private generateStrengths(skillBreakdown: Record<string, any>): string[] {
    const strengths: string[] = [];
    Object.entries(skillBreakdown).forEach(([skill, data]) => {
      if (data.score >= 80) {
        strengths.push(`Strong proficiency in ${skill} with ${data.score}% accuracy`);
      }
    });
    
    if (strengths.length === 0) {
      strengths.push("Shows dedication to completing the assessment thoroughly");
    }
    
    return strengths;
  }

  private generateWeaknesses(skillBreakdown: Record<string, any>): string[] {
    const weaknesses: string[] = [];
    Object.entries(skillBreakdown).forEach(([skill, data]) => {
      if (data.score < 70) {
        weaknesses.push(`${skill} concepts need more practice and understanding`);
      }
    });
    return weaknesses;
  }

  private generateRecommendations(skillBreakdown: Record<string, any>): Array<{title: string, description: string, resources?: string[]}> {
    const recommendations: Array<{title: string, description: string, resources?: string[]}> = [];
    
    Object.entries(skillBreakdown).forEach(([skill, data]) => {
      if (data.score < 80) {
        recommendations.push({
          title: `Improve ${skill} Skills`,
          description: `Focus on strengthening ${skill} fundamentals and practical application`,
          resources: [
            `${skill} official documentation`,
            `Online courses and tutorials for ${skill}`,
            `Practice projects using ${skill}`
          ]
        });
      }
    });

    if (recommendations.length === 0) {
      recommendations.push({
        title: "Advanced Learning Path",
        description: "Continue building expertise with advanced topics and real-world projects"
      });
    }

    return recommendations;
  }

  private generateDetailedFeedback(percentage: number, skillBreakdown: Record<string, any>): string {
    const topSkills = Object.entries(skillBreakdown)
      .sort(([,a], [,b]) => b.score - a.score)
      .slice(0, 2)
      .map(([skill]) => skill);
    
    const improvementAreas = Object.entries(skillBreakdown)
      .sort(([,a], [,b]) => a.score - b.score)
      .slice(0, 2)
      .map(([skill]) => skill);

    return `Strong performance in ${topSkills.join(" and ")}. Consider focusing improvement efforts on ${improvementAreas.join(" and ")} to achieve a more well-rounded skill set.`;
  }
}

export const huggingFaceService = new HuggingFaceService();

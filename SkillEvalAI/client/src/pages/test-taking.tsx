import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { TestInterface } from "@/components/test-interface";
import { AssessmentReport } from "@/components/assessment-report";
import { assessmentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { GeneratedTest, TestAnswer, TestAttempt, EvaluationResult } from "@shared/schema";
import { TestSession } from "@/types/assessment";

interface TestTakingPageProps {
  test: GeneratedTest;
}

export default function TestTakingPage({ test }: TestTakingPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [session, setSession] = useState<TestSession>({
    attemptId: "",
    testId: test.id,
    startTime: new Date(),
    duration: test.metadata?.totalTime || 60,
    currentQuestionIndex: 0,
    answers: {},
    timeSpent: {}
  });

  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);

  // Start test attempt when component mounts
  const startAttemptMutation = useMutation({
    mutationFn: () => assessmentApi.startAttempt(test.id),
    onSuccess: (attempt) => {
      setSession(prev => ({ ...prev, attemptId: attempt.id }));
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to start test attempt",
        variant: "destructive",
      });
    }
  });

  // Submit test for evaluation
  const evaluateTestMutation = useMutation({
    mutationFn: (answers: TestAnswer[]) => assessmentApi.evaluateTest(session.attemptId, answers),
    onSuccess: (result) => {
      setEvaluation(result.evaluation);
      setAttempt(result.attempt);
      toast({
        title: "Test Completed",
        description: "Your assessment has been submitted and evaluated!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Evaluation Failed",
        description: error.message || "Failed to evaluate your test",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    startAttemptMutation.mutate();
  }, []);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setSession(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    }));
  };

  const handleQuestionComplete = (questionId: string, timeSpent: number) => {
    setSession(prev => ({
      ...prev,
      timeSpent: { ...prev.timeSpent, [questionId]: timeSpent }
    }));
  };

  const handleTestComplete = (answers: TestAnswer[]) => {
    if (!session.attemptId) {
      toast({
        title: "Error",
        description: "Test session not properly initialized",
        variant: "destructive",
      });
      return;
    }
    
    evaluateTestMutation.mutate(answers);
  };

  const handleCreateNewTest = () => {
    setLocation("/");
  };

  if (evaluateTestMutation.isSuccess && evaluation && attempt) {
    return (
      <AssessmentReport
        attempt={attempt}
        evaluation={evaluation}
        onCreateNewTest={handleCreateNewTest}
      />
    );
  }

  if (startAttemptMutation.isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-lg text-gray-600">Preparing your assessment...</p>
        </div>
      </div>
    );
  }

  if (evaluateTestMutation.isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fas fa-brain fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-lg text-gray-600">AI is evaluating your responses...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <TestInterface
      test={test}
      session={session}
      onAnswerChange={handleAnswerChange}
      onQuestionComplete={handleQuestionComplete}
      onTestComplete={handleTestComplete}
    />
  );
}

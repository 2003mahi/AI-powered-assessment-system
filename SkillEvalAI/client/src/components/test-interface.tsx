import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GeneratedTest, Question, TestAnswer } from "@shared/schema";
import { TestSession } from "@/types/assessment";

interface TestInterfaceProps {
  test: GeneratedTest;
  session: TestSession;
  onAnswerChange: (questionId: string, answer: string) => void;
  onQuestionComplete: (questionId: string, timeSpent: number) => void;
  onTestComplete: (answers: TestAnswer[]) => void;
}

export function TestInterface({ 
  test, 
  session, 
  onAnswerChange, 
  onQuestionComplete, 
  onTestComplete 
}: TestInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(session.duration * 60); // Convert to seconds
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  const question = test.questions[currentQuestion];
  const progress = ((currentQuestion) / test.questions.length) * 100;
  const isLastQuestion = currentQuestion === test.questions.length - 1;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleTestComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Track question start time
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: string) => {
    onAnswerChange(question.id, answer);
  };

  const handleNext = () => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    onQuestionComplete(question.id, timeSpent);

    if (isLastQuestion) {
      handleTestComplete();
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      onQuestionComplete(question.id, timeSpent);
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleTestComplete = () => {
    const finalAnswers: TestAnswer[] = test.questions.map(q => ({
      questionId: q.id,
      answer: session.answers[q.id] || "",
      timeSpent: session.timeSpent[q.id] || 0
    }));
    
    onTestComplete(finalAnswers);
  };

  if (!question) {
    return null;
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium mr-3">
              3
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Taking Assessment</h2>
          </div>
          
          {/* Timer */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <i className="fas fa-clock text-orange-600 mr-2"></i>
              <span 
                className="text-orange-800 font-mono text-lg"
                data-testid="timer-display"
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span data-testid="progress-text">
              Question {currentQuestion + 1} of {test.questions.length}
            </span>
          </div>
          <Progress 
            value={progress} 
            className="w-full h-2"
            data-testid="progress-bar"
          />
        </div>

        {/* Question Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Badge className="bg-blue-600 text-white">
                Q{currentQuestion + 1}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {question.type === 'mcq' ? 'Multiple Choice' : question.type}
              </Badge>
              <Badge variant="outline">
                {question.difficulty}
              </Badge>
              {question.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              <i className="fas fa-clock mr-1"></i>
              {question.timeEstimate} min estimate
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {question.title}
          </h3>

          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-wrap mb-4">
              {question.content}
            </p>

            {/* Answer Input based on question type */}
            {question.type === 'mcq' && question.options ? (
              <RadioGroup
                value={session.answers[question.id] || ""}
                onValueChange={handleAnswerChange}
                className="space-y-2"
                data-testid="mcq-options"
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                    <RadioGroupItem 
                      value={option} 
                      id={`option-${index}`}
                      data-testid={`option-${index}`}
                    />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                value={session.answers[question.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={
                  question.type === 'coding' 
                    ? "Write your code here..."
                    : question.type === 'theory'
                    ? "Provide your detailed answer..."
                    : "Describe your approach and solution..."
                }
                className="min-h-[150px] font-mono text-sm"
                data-testid="answer-textarea"
              />
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            data-testid="button-previous"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Previous
          </Button>

          <div className="space-x-2">
            {isLastQuestion ? (
              <Button
                onClick={handleTestComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-submit-test"
              >
                <i className="fas fa-check mr-2"></i>
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-next"
              >
                Next
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

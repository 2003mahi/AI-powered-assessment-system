import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { assessmentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TestBlueprint, GeneratedTest } from "@shared/schema";

interface TestGenerationProps {
  blueprint: TestBlueprint;
  onTestGenerated: (test: GeneratedTest) => void;
}

export function TestGeneration({ blueprint, onTestGenerated }: TestGenerationProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTestMutation = useMutation({
    mutationFn: () => assessmentApi.generateTest(blueprint.id),
    onSuccess: (test) => {
      toast({
        title: "Test Generated",
        description: "Your assessment test has been successfully generated!",
      });
      onTestGenerated(test);
      setIsGenerating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate test. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  });

  // Check if test already exists
  const { data: existingTest, isLoading } = useQuery({
    queryKey: ['generated-test', blueprint.id],
    queryFn: () => assessmentApi.generateTest(blueprint.id),
    enabled: !isGenerating && !generateTestMutation.data,
    retry: false,
    meta: { suppressError: true }
  });

  useEffect(() => {
    if (existingTest && !generateTestMutation.data) {
      onTestGenerated(existingTest);
    }
  }, [existingTest, generateTestMutation.data, onTestGenerated]);

  const handleGenerate = () => {
    setIsGenerating(true);
    generateTestMutation.mutate();
  };

  const test = generateTestMutation.data || existingTest;

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium mr-3">
              2
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Dynamic Test Generation</h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge 
              variant={test ? "default" : "secondary"}
              className={test ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
              data-testid="generation-status"
            >
              {isLoading ? "Checking..." : test ? "Test Ready" : "Ready to Generate"}
            </Badge>
          </div>
        </div>

        {/* Blueprint Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Blueprint Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <i className="fas fa-user-tie text-gray-600 mr-2"></i>
              <span className="text-sm">
                <strong>Role:</strong> {blueprint.role}
              </span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-clock text-gray-600 mr-2"></i>
              <span className="text-sm">
                <strong>Duration:</strong> {blueprint.duration} minutes
              </span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-layer-group text-gray-600 mr-2"></i>
              <span className="text-sm">
                <strong>Experience:</strong> {blueprint.experienceLevel}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm font-medium text-gray-700">Tech Stack: </span>
            {blueprint.techStack.map((tech) => (
              <Badge key={tech} variant="outline" className="mr-2 mb-1 text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* Generation Controls */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Test Generation</h3>
            <p className="text-gray-600 text-sm mt-1">
              Our AI will generate customized questions based on your requirements
            </p>
          </div>
          {!test && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              data-testid="button-generate-test"
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Generate Test
                </>
              )}
            </Button>
          )}
        </div>

        {/* Generated Questions Preview */}
        {test && test.questions && (
          <div className="space-y-4" data-testid="generated-questions">
            <h4 className="text-lg font-semibold text-gray-900">Generated Questions Preview</h4>
            {test.questions.slice(0, 3).map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Badge className="bg-blue-600 text-white text-xs mr-2">
                      Q{index + 1}
                    </Badge>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {question.type === 'mcq' ? 'Multiple Choice' : question.type}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      • {question.skills.join(", ")} • {question.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-clock mr-1"></i>
                    <span>{question.timeEstimate} min</span>
                  </div>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{question.title}</h4>
                {question.type === 'mcq' && question.options && (
                  <div className="space-y-1 text-sm text-gray-700">
                    {question.options.slice(0, 4).map((option, optIndex) => (
                      <div key={optIndex}>{option}</div>
                    ))}
                  </div>
                )}
                {question.type === 'coding' && (
                  <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                    <div>// Implementation area</div>
                    <div className="text-gray-600">Write your solution here...</div>
                  </div>
                )}
              </div>
            ))}
            
            {test.questions.length > 3 && (
              <div className="text-center text-sm text-gray-600 py-2">
                ... and {test.questions.length - 3} more questions
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-800"
            data-testid="button-back-requirements"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Requirements
          </Button>
          
          {test && (
            <Button
              onClick={() => onTestGenerated(test)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
              data-testid="button-start-assessment"
            >
              <i className="fas fa-play mr-2"></i>
              Start Assessment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

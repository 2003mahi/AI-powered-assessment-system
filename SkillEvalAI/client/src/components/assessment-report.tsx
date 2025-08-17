import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TestAttempt, EvaluationResult } from "@shared/schema";

interface AssessmentReportProps {
  attempt: TestAttempt;
  evaluation: EvaluationResult;
  onCreateNewTest: () => void;
}

export function AssessmentReport({ attempt, evaluation, onCreateNewTest }: AssessmentReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium mr-3">
              3
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Assessment Results</h2>
          </div>
          
          <Badge className="bg-green-100 text-green-800" data-testid="completion-status">
            Test Completed
          </Badge>
        </div>

        {/* Overall Score and Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Overall Score Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Overall Score</h3>
              <div className="text-center">
                <div 
                  className="text-4xl font-bold mb-2"
                  data-testid="overall-score"
                >
                  {evaluation.overallScore}%
                </div>
                <div className="text-sm opacity-90 mb-4">
                  {evaluation.overallScore >= 80 ? "Excellent" : 
                   evaluation.overallScore >= 70 ? "Good" : 
                   evaluation.overallScore >= 60 ? "Average" : "Needs Improvement"}
                </div>
                <div className="bg-white bg-opacity-20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${evaluation.overallScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Breakdown</h3>
                
                <div className="space-y-4" data-testid="skill-breakdown">
                  {Object.entries(evaluation.skillBreakdown).map(([skill, data]) => (
                    <div key={skill}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <i className="fas fa-code text-blue-600"></i>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{skill}</div>
                            <div className="text-sm text-gray-600">{data.feedback}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${getScoreColor(data.score)}`}>
                            {data.score}%
                          </div>
                          <div className="text-sm text-gray-600">{data.rating}</div>
                        </div>
                      </div>
                      <Progress
                        value={data.score}
                        className={`w-full h-2 ${getProgressColor(data.score)}`}
                        data-testid={`skill-progress-${skill.toLowerCase().replace(/[.\s]/g, '-')}`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Strengths & Weaknesses */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-green-600 mb-2 flex items-center">
                  <i className="fas fa-check-circle mr-2"></i>Strengths
                </h4>
                <ul className="text-sm text-gray-700 space-y-1" data-testid="strengths-list">
                  {evaluation.strengths.map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>

              {evaluation.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-600 mb-2 flex items-center">
                    <i className="fas fa-exclamation-triangle mr-2"></i>Areas for Improvement
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1" data-testid="weaknesses-list">
                    {evaluation.weaknesses.map((weakness, index) => (
                      <li key={index}>• {weakness}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Recommendations</h3>
              
              <div className="space-y-4" data-testid="recommendations-list">
                {evaluation.recommendations.slice(0, 3).map((recommendation, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs rounded-full mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{recommendation.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{recommendation.description}</div>
                      {recommendation.resources && (
                        <div className="mt-2">
                          <Button variant="link" className="p-0 h-auto text-blue-600 text-sm">
                            View Resources →
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Feedback */}
        {evaluation.detailedFeedback && (
          <Card className="border border-gray-200 mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Detailed Feedback</h3>
              <p className="text-gray-700" data-testid="detailed-feedback">
                {evaluation.detailedFeedback}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <div className="space-x-4">
            <Button 
              variant="outline"
              data-testid="button-download-report"
            >
              <i className="fas fa-download mr-2"></i>
              Download Report
            </Button>
          </div>
          
          <Button
            onClick={onCreateNewTest}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-create-new"
          >
            <i className="fas fa-plus mr-2"></i>
            Create New Assessment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

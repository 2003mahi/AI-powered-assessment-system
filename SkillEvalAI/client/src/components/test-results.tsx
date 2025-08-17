import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TestAttempt } from "@shared/schema";

interface TestResultsProps {
  attempt: TestAttempt;
  onRetakeTest: () => void;
  onNewAssessment: () => void;
}

export function TestResults({ attempt, onRetakeTest, onNewAssessment }: TestResultsProps) {
  const evaluation = attempt.evaluation;
  
  if (!evaluation || !attempt.isCompleted) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-12 text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Results...</h3>
          <p className="text-gray-600">Please wait while we evaluate your assessment.</p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-8">
      {/* Overall Score Card */}
      <Card className="border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4">
              <span className={`text-3xl font-bold ${getScoreColor(attempt.score || 0)}`}>
                {attempt.score}%
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
            <Badge className={`${getScoreBadgeColor(attempt.score || 0)} text-lg px-4 py-2`}>
              {getPerformanceLevel(attempt.score || 0)}
            </Badge>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Performance</span>
              <span className={`text-sm font-medium ${getScoreColor(attempt.score || 0)}`}>
                {attempt.score}%
              </span>
            </div>
            <Progress value={attempt.score || 0} className="w-full h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Skill Breakdown */}
      {evaluation.skillBreakdown && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-chart-pie mr-3 text-blue-600"></i>
              Skill Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(evaluation.skillBreakdown).map(([skill, data]) => (
                <div key={skill} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 capitalize">{skill}</span>
                    <span className={`font-medium ${getScoreColor((data as any).score)}`}>
                      {(data as any).score}%
                    </span>
                  </div>
                  <Progress value={(data as any).score} className="w-full h-2" />
                  <p className="text-sm text-gray-600">{(data as any).feedback}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Feedback */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-comment-alt mr-3 text-green-600"></i>
            Performance Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2 flex items-center">
                <i className="fas fa-check-circle mr-2"></i>
                Strengths
              </h4>
              <p className="text-green-800">{evaluation.feedback || "Great job completing the assessment!"}</p>
            </div>

            {evaluation.recommendations && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <i className="fas fa-lightbulb mr-2"></i>
                  Recommendations
                </h4>
                <p className="text-blue-800">
                  {Array.isArray(evaluation.recommendations) 
                    ? evaluation.recommendations.map(rec => rec.description || rec).join('. ')
                    : evaluation.recommendations || "Continue practicing to improve your skills."
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Summary */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-info-circle mr-3 text-purple-600"></i>
            Test Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round((new Date(attempt.endTime!).getTime() - new Date(attempt.startTime).getTime()) / (1000 * 60))}
              </div>
              <p className="text-sm text-gray-600">Minutes Taken</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Object.keys(evaluation.skillBreakdown || {}).length}
              </div>
              <p className="text-sm text-gray-600">Skills Assessed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {new Date(attempt.startTime).toLocaleDateString()}
              </div>
              <p className="text-sm text-gray-600">Date Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onRetakeTest}
          variant="outline"
          size="lg"
          className="px-8"
          data-testid="retake-test-button"
        >
          <i className="fas fa-redo mr-2"></i>
          Retake Assessment
        </Button>
        <Button
          onClick={onNewAssessment}
          size="lg"
          className="px-8"
          data-testid="new-assessment-button"
        >
          <i className="fas fa-plus mr-2"></i>
          New Assessment
        </Button>
        <Button
          onClick={() => window.location.href = '/reports'}
          variant="outline"
          size="lg"
          className="px-8"
          data-testid="view-all-reports-button"
        >
          <i className="fas fa-chart-bar mr-2"></i>
          View All Reports
        </Button>
      </div>
    </div>
  );
}
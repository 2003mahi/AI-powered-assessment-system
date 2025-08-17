import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { assessmentApi } from "@/lib/api";

export function AssessmentHistory() {
  const { data: userTests, isLoading, error } = useQuery({
    queryKey: ['user-tests'],
    queryFn: assessmentApi.getUserTests
  });

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Assessment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
          <h3 className="text-lg font-semibold text-red-900 mb-1">Unable to Load History</h3>
          <p className="text-red-700 text-sm">Failed to fetch assessment history. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  const attempts = userTests?.attempts || [];
  const blueprints = userTests?.blueprints || [];
  
  const blueprintMap = blueprints.reduce((acc, blueprint) => {
    acc[blueprint.id] = blueprint;
    return acc;
  }, {} as Record<string, any>);

  const recentAttempts = attempts
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 10);

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-500";
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <i className="fas fa-history mr-3 text-blue-600"></i>
            Assessment History
          </span>
          <Badge variant="outline" className="text-xs">
            {attempts.length} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentAttempts.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assessments Yet</h3>
            <p className="text-gray-600 mb-4">Start your first assessment to track your progress here.</p>
            <Button data-testid="start-first-assessment">
              <i className="fas fa-play mr-2"></i>
              Start Assessment
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentAttempts.map((attempt) => {
              const blueprint = blueprintMap[attempt.testId] || {};
              const duration = attempt.endTime 
                ? Math.round((new Date(attempt.endTime).getTime() - new Date(attempt.startTime).getTime()) / (1000 * 60))
                : null;

              return (
                <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                      attempt.isCompleted ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <i className={`fas ${
                        attempt.isCompleted ? 'fa-check-circle text-green-600' : 'fa-clock text-yellow-600'
                      }`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {blueprint.role || "Assessment"}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{new Date(attempt.startTime).toLocaleDateString()}</span>
                        {duration && <span>• {duration} min</span>}
                        {blueprint.experienceLevel && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {blueprint.experienceLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {attempt.isCompleted ? (
                      <div className="space-y-1">
                        <p className={`font-bold text-lg ${getScoreColor(attempt.score)}`}>
                          {attempt.score}%
                        </p>
                        <div className="w-16">
                          <Progress value={attempt.score || 0} className="h-1" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-yellow-600">In Progress</p>
                        <Button size="sm" variant="outline" data-testid={`continue-${attempt.id}`}>
                          Continue
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
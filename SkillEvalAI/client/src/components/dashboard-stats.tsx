import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { assessmentApi } from "@/lib/api";

export function DashboardStats() {
  const { data: userTests, isLoading } = useQuery({
    queryKey: ['user-tests'],
    queryFn: assessmentApi.getUserTests
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const attempts = userTests?.attempts || [];
  const blueprints = userTests?.blueprints || [];
  
  const completedAttempts = attempts.filter(a => a.isCompleted);
  const averageScore = completedAttempts.length > 0 
    ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length)
    : 0;
  const bestScore = Math.max(...completedAttempts.map(a => a.score || 0), 0);

  const stats = [
    {
      title: "Total Assessments",
      value: attempts.length,
      icon: "fas fa-clipboard-check",
      color: "bg-blue-100 text-blue-600",
      change: null
    },
    {
      title: "Completed",
      value: completedAttempts.length,
      icon: "fas fa-check-circle",
      color: "bg-green-100 text-green-600",
      change: null
    },
    {
      title: "Average Score",
      value: `${averageScore}%`,
      icon: "fas fa-chart-line",
      color: "bg-yellow-100 text-yellow-600",
      change: null
    },
    {
      title: "Best Score",
      value: `${bestScore}%`,
      icon: "fas fa-trophy",
      color: "bg-purple-100 text-purple-600",
      change: null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${stat.color}`}>
                <i className={`${stat.icon} text-xl`}></i>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RecentActivity() {
  const { data: userTests, isLoading } = useQuery({
    queryKey: ['user-tests'],
    queryFn: assessmentApi.getUserTests
  });

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
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
    .slice(0, 5);

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-500";
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        
        {recentAttempts.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-history text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-600">No recent activity</p>
            <p className="text-sm text-gray-500">Start your first assessment to see activity here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentAttempts.map((attempt) => {
              const blueprint = blueprintMap[attempt.testId] || {};
              return (
                <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <i className="fas fa-clipboard-check text-blue-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {blueprint.role || "Assessment"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(attempt.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {attempt.isCompleted ? (
                      <div>
                        <p className={`font-medium ${getScoreColor(attempt.score)}`}>
                          {attempt.score}%
                        </p>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Completed
                        </Badge>
                      </div>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        In Progress
                      </Badge>
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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assessmentApi } from "@/lib/api";
import { TestAttempt } from "@shared/schema";

export default function ReportsPage() {
  const [sortBy, setSortBy] = useState<string>("recent");
  const [filterBy, setFilterBy] = useState<string>("all");

  const { data: userTests, isLoading } = useQuery({
    queryKey: ['user-tests'],
    queryFn: assessmentApi.getUserTests
  });

  const attempts = userTests?.attempts || [];
  const blueprints = userTests?.blueprints || [];

  // Create a map of blueprint details for easy lookup
  const blueprintMap = blueprints.reduce((acc, blueprint) => {
    acc[blueprint.id] = blueprint;
    return acc;
  }, {} as Record<string, any>);

  const filteredAttempts = attempts
    .filter(attempt => {
      if (filterBy === "all") return true;
      if (filterBy === "completed") return attempt.isCompleted;
      if (filterBy === "incomplete") return !attempt.isCompleted;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      }
      if (sortBy === "score") {
        return (b.score || 0) - (a.score || 0);
      }
      return 0;
    });

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-500";
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBadgeColor = (score: number | null) => {
    if (score === null) return "bg-gray-100 text-gray-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const calculateAverageScore = () => {
    const completedAttempts = attempts.filter(a => a.isCompleted && a.score !== null);
    if (completedAttempts.length === 0) return 0;
    const totalScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
    return Math.round(totalScore / completedAttempts.length);
  };

  const getTestDuration = (attempt: TestAttempt) => {
    if (!attempt.endTime) return "In Progress";
    const start = new Date(attempt.startTime);
    const end = new Date(attempt.endTime);
    const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    return `${minutes} min`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-lg text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-brain text-2xl text-slate-600 mr-3"></i>
                <span className="text-xl font-bold text-gray-900">AssessmentAI</span>
              </div>
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                <a href="/" className="text-gray-500 hover:text-gray-700">Dashboard</a>
                <a href="/templates" className="text-gray-500 hover:text-gray-700">Templates</a>
                <a href="/reports" className="text-slate-600 font-medium">Reports</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <i className="fas fa-bell text-lg"></i>
              </button>
              <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Reports</h1>
          <p className="text-gray-600">Track your progress and review past assessments</p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <i className="fas fa-clipboard-check text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="total-assessments">
                    {attempts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <i className="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="completed-assessments">
                    {attempts.filter(a => a.isCompleted).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
                  <i className="fas fa-chart-line text-yellow-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="average-score">
                    {calculateAverageScore()}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                  <i className="fas fa-trophy text-purple-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Best Score</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="best-score">
                    {Math.max(...attempts.filter(a => a.score !== null).map(a => a.score || 0), 0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40" data-testid="sort-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="score">Highest Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by</label>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40" data-testid="filter-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Attempts</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" data-testid="export-reports">
              <i className="fas fa-download mr-2"></i>
              Export Reports
            </Button>
          </div>
        </div>

        {/* Reports List */}
        {filteredAttempts.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-12 text-center">
              <i className="fas fa-chart-bar text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600 mb-6">
                {attempts.length === 0 
                  ? "You haven't completed any assessments yet. Take your first assessment to see reports here."
                  : "No assessments match your current filters. Try adjusting the filter criteria."
                }
              </p>
              <Button onClick={() => window.location.href = "/"} data-testid="take-first-assessment">
                <i className="fas fa-plus mr-2"></i>
                Take Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAttempts.map((attempt) => {
              const blueprint = blueprintMap[attempt.testId] || {};
              return (
                <Card key={attempt.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {blueprint.role || "Assessment"}
                          </h3>
                          <Badge className={getScoreBadgeColor(attempt.score)}>
                            {attempt.isCompleted ? `${attempt.score}%` : "In Progress"}
                          </Badge>
                          <Badge variant="outline">
                            {blueprint.experienceLevel || "N/A"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Date Taken</p>
                            <p className="font-medium">
                              {new Date(attempt.startTime).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-medium">{getTestDuration(attempt)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Technologies</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(blueprint.techStack || []).slice(0, 3).map((tech: string) => (
                                <Badge key={tech} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {(blueprint.techStack?.length || 0) > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{(blueprint.techStack?.length || 0) - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className={`font-medium ${attempt.isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                              {attempt.isCompleted ? "Completed" : "In Progress"}
                            </p>
                          </div>
                        </div>

                        {attempt.isCompleted && attempt.score !== null && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Performance</span>
                              <span className={`text-sm font-medium ${getScoreColor(attempt.score)}`}>
                                {attempt.score}%
                              </span>
                            </div>
                            <Progress value={attempt.score} className="w-full h-2" />
                          </div>
                        )}

                        {attempt.evaluation?.skillBreakdown && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Top Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(attempt.evaluation.skillBreakdown)
                                .sort(([,a], [,b]) => (b as any).score - (a as any).score)
                                .slice(0, 3)
                                .map(([skill, data]) => (
                                  <div key={skill} className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                    <span className={`text-xs font-medium ${getScoreColor((data as any).score)}`}>
                                      {(data as any).score}%
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {attempt.isCompleted ? (
                          <Button variant="outline" size="sm" data-testid={`view-report-${attempt.id}`}>
                            <i className="fas fa-eye mr-2"></i>
                            View Report
                          </Button>
                        ) : (
                          <Button size="sm" data-testid={`continue-test-${attempt.id}`}>
                            <i className="fas fa-play mr-2"></i>
                            Continue
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" data-testid={`retake-test-${attempt.id}`}>
                          <i className="fas fa-redo mr-2"></i>
                          Retake
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
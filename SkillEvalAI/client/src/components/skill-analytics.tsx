import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { assessmentApi } from "@/lib/api";

export function SkillAnalytics() {
  const { data: userTests, isLoading } = useQuery({
    queryKey: ['user-tests'],
    queryFn: assessmentApi.getUserTests
  });

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Skill Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const attempts = userTests?.attempts || [];
  const completedAttempts = attempts.filter(a => a.isCompleted && a.evaluation?.skillBreakdown);

  // Aggregate skill data across all assessments
  const skillData: Record<string, { scores: number[], totalAssessments: number }> = {};
  
  completedAttempts.forEach(attempt => {
    const skillBreakdown = attempt.evaluation?.skillBreakdown || {};
    Object.entries(skillBreakdown).forEach(([skill, data]) => {
      const score = (data as any).score;
      if (!skillData[skill]) {
        skillData[skill] = { scores: [], totalAssessments: 0 };
      }
      skillData[skill].scores.push(score);
      skillData[skill].totalAssessments++;
    });
  });

  // Calculate averages and trends
  const skillAnalytics = Object.entries(skillData).map(([skill, data]) => {
    const average = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
    const latest = data.scores[data.scores.length - 1];
    const earliest = data.scores[0];
    const trend = data.scores.length > 1 ? latest - earliest : 0;
    
    return {
      skill,
      average: Math.round(average),
      latest,
      trend,
      assessments: data.totalAssessments,
      improvement: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable'
    };
  }).sort((a, b) => b.average - a.average);

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return { icon: "fas fa-arrow-up", color: "text-green-600" };
    if (trend < -5) return { icon: "fas fa-arrow-down", color: "text-red-600" };
    return { icon: "fas fa-minus", color: "text-gray-500" };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-chart-line mr-3 text-purple-600"></i>
          Skill Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {skillAnalytics.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-brain text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Skill Data Yet</h3>
            <p className="text-gray-600">Complete assessments to see your skill progression here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Skills */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Top Skills</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillAnalytics.slice(0, 6).map((skill) => {
                  const trendInfo = getTrendIcon(skill.trend);
                  return (
                    <div key={skill.skill} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 capitalize">{skill.skill}</h5>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${getScoreColor(skill.average)}`}>
                            {skill.average}%
                          </span>
                          <i className={`${trendInfo.icon} ${trendInfo.color} text-sm`}></i>
                        </div>
                      </div>
                      <Progress value={skill.average} className="h-2 mb-2" />
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{skill.assessments} assessment{skill.assessments !== 1 ? 's' : ''}</span>
                        {skill.trend !== 0 && (
                          <span className={skill.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                            {skill.trend > 0 ? '+' : ''}{skill.trend}% trend
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skills to Improve */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Skills to Improve</h4>
              <div className="space-y-3">
                {skillAnalytics
                  .filter(skill => skill.average < 70)
                  .slice(0, 3)
                  .map((skill) => (
                    <div key={skill.skill} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <h5 className="font-medium text-red-900 capitalize">{skill.skill}</h5>
                        <p className="text-sm text-red-700">
                          Average: {skill.average}% • {skill.assessments} assessment{skill.assessments !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        Needs Focus
                      </Badge>
                    </div>
                  ))}
                {skillAnalytics.filter(skill => skill.average < 70).length === 0 && (
                  <div className="text-center py-4 text-gray-600">
                    <i className="fas fa-check-circle text-green-600 text-2xl mb-2"></i>
                    <p>Great job! All skills are performing well.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Improvements */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recent Improvements</h4>
              <div className="space-y-3">
                {skillAnalytics
                  .filter(skill => skill.trend > 5)
                  .slice(0, 3)
                  .map((skill) => (
                    <div key={skill.skill} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <h5 className="font-medium text-green-900 capitalize">{skill.skill}</h5>
                        <p className="text-sm text-green-700">
                          Improved by {skill.trend}% • Now at {skill.latest}%
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <i className="fas fa-arrow-up mr-1"></i>
                        Improving
                      </Badge>
                    </div>
                  ))}
                {skillAnalytics.filter(skill => skill.trend > 5).length === 0 && (
                  <div className="text-center py-4 text-gray-600">
                    <i className="fas fa-chart-line text-gray-400 text-2xl mb-2"></i>
                    <p>Take more assessments to track improvement trends.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
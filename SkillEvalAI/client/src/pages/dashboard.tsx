import { useState } from "react";
import { RequirementsForm } from "@/components/requirements-form";
import { TestGeneration } from "@/components/test-generation";
import { PhaseNavigation } from "@/components/phase-navigation";
import { WelcomeScreen } from "@/components/welcome-screen";
import { DashboardStats, RecentActivity } from "@/components/dashboard-stats";
import { SkillAnalytics } from "@/components/skill-analytics";
import { AssessmentHistory } from "@/components/assessment-history";
import TestTakingPage from "./test-taking";
import { PhaseState } from "@/types/assessment";
import { TestBlueprint, GeneratedTest } from "@shared/schema";

export default function Dashboard() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [phaseState, setPhaseState] = useState<PhaseState>({
    current: 'requirements',
    completed: {
      requirements: false,
      generation: false,
      evaluation: false
    }
  });

  const [blueprint, setBlueprint] = useState<TestBlueprint | null>(null);
  const [generatedTest, setGeneratedTest] = useState<GeneratedTest | null>(null);

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  const handlePhaseChange = (phase: PhaseState['current']) => {
    setPhaseState(prev => ({ ...prev, current: phase }));
  };

  const handleBlueprintCreated = (newBlueprint: TestBlueprint) => {
    setBlueprint(newBlueprint);
    setPhaseState({
      current: 'generation',
      completed: {
        requirements: true,
        generation: false,
        evaluation: false
      }
    });
  };

  const handleTestGenerated = (test: GeneratedTest) => {
    setGeneratedTest(test);
    setPhaseState({
      current: 'evaluation',
      completed: {
        requirements: true,
        generation: true,
        evaluation: false
      }
    });
  };

  // Show welcome screen for first-time users (only if no existing data)
  if (showWelcome && !blueprint && !generatedTest) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
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
                <a href="/" className="text-slate-600 font-medium">Dashboard</a>
                <a href="/templates" className="text-gray-500 hover:text-gray-700">Templates</a>
                <a href="/reports" className="text-gray-500 hover:text-gray-700">Reports</a>
                <a href="/profile" className="text-gray-500 hover:text-gray-700">Profile</a>
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
        {/* Show main dashboard if not in assessment flow */}
        {phaseState.current === 'requirements' && !blueprint && (
          <>
            {/* Dashboard Stats */}
            <DashboardStats />
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Recent Activity & History */}
              <div className="lg:col-span-2 space-y-8">
                <RecentActivity />
                <AssessmentHistory />
              </div>
              
              {/* Right Column - Analytics & Quick Actions */}
              <div className="lg:col-span-1 space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setBlueprint(null);
                        setGeneratedTest(null);
                        setPhaseState({
                          current: 'requirements',
                          completed: {
                            requirements: false,
                            generation: false,
                            evaluation: false
                          }
                        });
                      }}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      data-testid="create-new-assessment"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Create New Assessment
                    </button>
                    <button
                      onClick={() => window.location.href = '/templates'}
                      className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      data-testid="browse-templates"
                    >
                      <i className="fas fa-clipboard-list mr-2"></i>
                      Browse Templates
                    </button>
                    <button
                      onClick={() => window.location.href = '/reports'}
                      className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      data-testid="view-reports"
                    >
                      <i className="fas fa-chart-bar mr-2"></i>
                      View Reports
                    </button>
                  </div>
                </div>

                {/* Skill Analytics */}
                <SkillAnalytics />
              </div>
            </div>
          </>
        )}

        {/* Assessment Flow */}
        {blueprint || phaseState.current !== 'requirements' || generatedTest ? (
          <>
            {/* Phase Navigation */}
            <PhaseNavigation
              phaseState={phaseState}
              onPhaseChange={handlePhaseChange}
            />

            {/* Phase Content */}
            {phaseState.current === 'requirements' && !blueprint && (
              <RequirementsForm onBlueprintCreated={handleBlueprintCreated} />
            )}

            {phaseState.current === 'generation' && blueprint && (
              <TestGeneration
                blueprint={blueprint}
                onTestGenerated={handleTestGenerated}
              />
            )}

            {phaseState.current === 'evaluation' && generatedTest && (
              <TestTakingPage test={generatedTest} />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const features = [
    {
      icon: "fas fa-user-tie",
      title: "Role-Based Assessments",
      description: "Customized tests for different roles and experience levels"
    },
    {
      icon: "fas fa-brain",
      title: "AI-Powered Questions",
      description: "Dynamic question generation using advanced AI models"
    },
    {
      icon: "fas fa-chart-line",
      title: "Intelligent Evaluation",
      description: "AI-driven scoring with detailed performance insights"
    },
    {
      icon: "fas fa-clock",
      title: "Real-Time Testing",
      description: "Timer-based assessments with progress tracking"
    }
  ];

  const assessmentTypes = [
    { type: "Multiple Choice", icon: "fas fa-list-ul", color: "bg-blue-100 text-blue-800" },
    { type: "Coding Problems", icon: "fas fa-code", color: "bg-green-100 text-green-800" },
    { type: "Theory Questions", icon: "fas fa-book", color: "bg-purple-100 text-purple-800" },
    { type: "Scenario-Based", icon: "fas fa-lightbulb", color: "bg-orange-100 text-orange-800" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mr-4">
              <i className="fas fa-brain text-white text-2xl"></i>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">AssessmentAI</h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            AI-Powered Role-Based Assessment & Evaluation System
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            Create customized technical assessments with intelligent question generation, 
            real-time evaluation, and comprehensive performance analysis.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <i className={`${feature.icon} text-blue-600 text-xl`}></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Assessment Types */}
        <Card className="border border-gray-200 mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Multiple Assessment Formats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {assessmentTypes.map((type, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3">
                    <i className={`${type.icon} text-gray-600 text-xl`}></i>
                  </div>
                  <Badge className={`${type.color} text-sm px-3 py-1`}>
                    {type.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="border border-gray-200 mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 text-lg font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Define Requirements</h3>
                <p className="text-gray-600">
                  Specify role, tech stack, experience level, and custom requirements
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 text-lg font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Generation</h3>
                <p className="text-gray-600">
                  AI creates personalized questions tailored to your specifications
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 text-lg font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Take & Evaluate</h3>
                <p className="text-gray-600">
                  Complete the assessment and receive AI-powered evaluation and insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            data-testid="get-started-button"
          >
            <i className="fas fa-rocket mr-3"></i>
            Get Started with Your First Assessment
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Free AI-powered assessments
          </p>
        </div>
      </div>
    </div>
  );
}
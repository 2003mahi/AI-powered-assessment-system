import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { assessmentApi } from "@/lib/api";
import { TestBlueprint } from "@shared/schema";
import { AVAILABLE_ROLES } from "@/types/assessment";

export default function TemplatesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const { data: userTests, isLoading } = useQuery({
    queryKey: ['user-tests'],
    queryFn: assessmentApi.getUserTests
  });

  const generateTestMutation = useMutation({
    mutationFn: assessmentApi.generateTest,
    onSuccess: () => {
      toast({
        title: "Test Generated",
        description: "Test has been generated from template successfully!",
      });
    }
  });

  const blueprints = userTests?.blueprints || [];
  
  const filteredBlueprints = blueprints.filter(blueprint => {
    const matchesSearch = blueprint.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blueprint.techStack.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = !selectedRole || blueprint.role.toLowerCase().includes(selectedRole.toLowerCase());
    return matchesSearch && matchesRole;
  });

  const handleUseTemplate = async (blueprint: TestBlueprint) => {
    try {
      await generateTestMutation.mutateAsync(blueprint.id);
      // Navigate to dashboard to show the generated test
      toast({
        title: "Template Used",
        description: "Redirecting to take the assessment...",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error('Failed to use template:', error);
      toast({
        title: "Error",
        description: "Failed to generate test from template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'junior': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-lg text-gray-600">Loading templates...</p>
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
                <a href="/templates" className="text-slate-600 font-medium">Templates</a>
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Templates</h1>
          <p className="text-gray-600">Reuse and customize your previous assessment blueprints</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by role or technology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                data-testid="search-templates"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedRole === "" ? "default" : "outline"}
                onClick={() => setSelectedRole("")}
                size="sm"
                data-testid="filter-all"
              >
                All Roles
              </Button>
              {AVAILABLE_ROLES.slice(0, 4).map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  onClick={() => setSelectedRole(role)}
                  size="sm"
                  data-testid={`filter-${role.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredBlueprints.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-12 text-center">
              <i className="fas fa-clipboard-list text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Templates Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedRole 
                  ? "No templates match your current filters. Try adjusting your search criteria."
                  : "You haven't created any assessment templates yet. Create your first assessment to build a template library."
                }
              </p>
              <Button onClick={() => window.location.href = "/"} data-testid="create-first-assessment">
                <i className="fas fa-plus mr-2"></i>
                Create First Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlueprints.map((blueprint) => (
              <Card key={blueprint.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{blueprint.role}</CardTitle>
                    <Badge className={getExperienceColor(blueprint.experienceLevel)}>
                      {blueprint.experienceLevel}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Duration: {blueprint.duration} minutes
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Tech Stack */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Technologies</h4>
                      <div className="flex flex-wrap gap-1">
                        {blueprint.techStack.slice(0, 4).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {blueprint.techStack.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{blueprint.techStack.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Question Types */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Question Types</h4>
                      <div className="flex flex-wrap gap-1">
                        {blueprint.questionTypes.map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs capitalize">
                            {type === 'mcq' ? 'Multiple Choice' : type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Custom Requirements */}
                    {blueprint.naturalLanguageRefinement && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Custom Requirements</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {blueprint.naturalLanguageRefinement}
                        </p>
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="text-xs text-gray-500">
                      Created: {new Date(blueprint.createdAt).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleUseTemplate(blueprint)}
                        disabled={generateTestMutation.isPending}
                        className="flex-1"
                        data-testid={`use-template-${blueprint.id}`}
                      >
                        {generateTestMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Using...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-magic mr-2"></i>
                            Use Template
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="icon" data-testid={`edit-template-${blueprint.id}`}>
                        <i className="fas fa-edit"></i>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  experience: z.string().min(1, "Experience level is required"),
  skills: z.array(z.string()),
  bio: z.string().optional(),
  notifications: z.object({
    email: z.boolean(),
    assessment: z.boolean(),
    reports: z.boolean()
  })
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "John Doe",
      email: "john.doe@example.com",
      role: "Full-Stack Developer",
      experience: "mid",
      skills: ["React", "Node.js", "TypeScript", "Python"],
      bio: "Passionate full-stack developer with 4 years of experience building scalable web applications.",
      notifications: {
        email: true,
        assessment: true,
        reports: false
      }
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log("Profile updated:", data);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    setIsEditing(false);
  };

  const skillOptions = [
    "React", "Vue.js", "Angular", "Node.js", "Python", "Java", "TypeScript", 
    "JavaScript", "SQL", "MongoDB", "PostgreSQL", "AWS", "Docker", "Kubernetes",
    "GraphQL", "REST APIs", "Git", "Linux", "Machine Learning", "Data Science"
  ];

  const [selectedSkills, setSelectedSkills] = useState<string[]>(form.watch("skills"));

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      form.setValue("skills", newSkills);
    }
  };

  const removeSkill = (skill: string) => {
    const newSkills = selectedSkills.filter(s => s !== skill);
    setSelectedSkills(newSkills);
    form.setValue("skills", newSkills);
  };

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
                <a href="/reports" className="text-gray-500 hover:text-gray-700">Reports</a>
                <a href="/profile" className="text-slate-600 font-medium">Profile</a>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            data-testid="edit-profile-button"
          >
            {isEditing ? (
              <>
                <i className="fas fa-times mr-2"></i>
                Cancel
              </>
            ) : (
              <>
                <i className="fas fa-edit mr-2"></i>
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-200">
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarFallback className="text-2xl bg-blue-600 text-white">
                    {form.watch("fullName").split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{form.watch("fullName")}</CardTitle>
                <p className="text-gray-600">{form.watch("role")}</p>
                <Badge className="mt-2 capitalize">
                  {form.watch("experience")} Level
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {form.watch("bio") && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                      <p className="text-sm text-gray-600">{form.watch("bio")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing}
                                data-testid="input-full-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="email"
                                disabled={!isEditing}
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Professional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Role</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing}
                                data-testid="input-role"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience Level</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={!isEditing}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-experience">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                                <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                                <SelectItem value="senior">Senior (5+ years)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Skills */}
                    <div>
                      <FormLabel className="text-base font-medium">Skills</FormLabel>
                      <div className="mt-2 space-y-3">
                        {/* Selected Skills */}
                        <div className="flex flex-wrap gap-2">
                          {selectedSkills.map((skill) => (
                            <Badge 
                              key={skill} 
                              variant="default" 
                              className="cursor-pointer"
                              onClick={() => isEditing && removeSkill(skill)}
                              data-testid={`skill-${skill.toLowerCase().replace(/[.\s]/g, '-')}`}
                            >
                              {skill}
                              {isEditing && <i className="fas fa-times ml-2 text-xs"></i>}
                            </Badge>
                          ))}
                        </div>

                        {/* Add Skills */}
                        {isEditing && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Add skills:</p>
                            <div className="flex flex-wrap gap-2">
                              {skillOptions
                                .filter(skill => !selectedSkills.includes(skill))
                                .slice(0, 10)
                                .map((skill) => (
                                  <Badge 
                                    key={skill} 
                                    variant="outline" 
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => addSkill(skill)}
                                    data-testid={`add-skill-${skill.toLowerCase().replace(/[.\s]/g, '-')}`}
                                  >
                                    <i className="fas fa-plus mr-2 text-xs"></i>
                                    {skill}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Tell us about yourself..."
                              rows={4}
                              disabled={!isEditing}
                              data-testid="textarea-bio"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isEditing && (
                      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          data-testid="cancel-button"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" data-testid="save-button">
                          <i className="fas fa-save mr-2"></i>
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="border border-gray-200 mt-8">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <Switch 
                      checked={form.watch("notifications.email")}
                      onCheckedChange={(checked) => form.setValue("notifications.email", checked)}
                      disabled={!isEditing}
                      data-testid="switch-email-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Assessment Reminders</p>
                      <p className="text-sm text-gray-600">Get reminded about incomplete assessments</p>
                    </div>
                    <Switch 
                      checked={form.watch("notifications.assessment")}
                      onCheckedChange={(checked) => form.setValue("notifications.assessment", checked)}
                      disabled={!isEditing}
                      data-testid="switch-assessment-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Performance Reports</p>
                      <p className="text-sm text-gray-600">Weekly performance insights</p>
                    </div>
                    <Switch 
                      checked={form.watch("notifications.reports")}
                      onCheckedChange={(checked) => form.setValue("notifications.reports", checked)}
                      disabled={!isEditing}
                      data-testid="switch-reports-notifications"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
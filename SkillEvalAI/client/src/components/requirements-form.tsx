import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { assessmentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AVAILABLE_ROLES, AVAILABLE_TECH_STACK, QUESTION_TYPES, RequirementsFormData } from "@/types/assessment";
import { TestBlueprint } from "@shared/schema";

const requirementsSchema = z.object({
  role: z.string().min(1, "Role is required"),
  experienceLevel: z.enum(["junior", "mid", "senior"]),
  techStack: z.array(z.string()).min(1, "At least one technology must be selected"),
  questionTypes: z.array(z.string()).min(1, "At least one question type must be selected"),
  duration: z.coerce.number().min(15).max(180, "Duration must be between 15 and 180 minutes"),
  naturalLanguageRefinement: z.string().optional()
});

interface RequirementsFormProps {
  onBlueprintCreated: (blueprint: TestBlueprint) => void;
}

export function RequirementsForm({ onBlueprintCreated }: RequirementsFormProps) {
  const { toast } = useToast();
  
  const form = useForm<RequirementsFormData>({
    resolver: zodResolver(requirementsSchema),
    defaultValues: {
      role: "",
      experienceLevel: "mid",
      techStack: [],
      questionTypes: [],
      duration: 60,
      naturalLanguageRefinement: ""
    }
  });

  const createBlueprintMutation = useMutation({
    mutationFn: assessmentApi.createBlueprint,
    onSuccess: (blueprint) => {
      toast({
        title: "Blueprint Created",
        description: "Your test blueprint has been successfully created!",
      });
      onBlueprintCreated(blueprint);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create test blueprint",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: RequirementsFormData) => {
    createBlueprintMutation.mutate({
      ...data,
      userId: "demo-user-1" // For demo purposes, using a default user ID
    });
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium mr-3">
            1
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Role & Requirements Gathering</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Role and Experience Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Choose a role..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABLE_ROLES.map((role) => (
                          <SelectItem key={role} value={role.toLowerCase().replace(/[\s-]/g, '')}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-experience">
                          <SelectValue placeholder="Select experience..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="junior">1-3 years (Junior)</SelectItem>
                        <SelectItem value="mid">3-5 years (Mid-level)</SelectItem>
                        <SelectItem value="senior">5+ years (Senior)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tech Stack Selection */}
            <FormField
              control={form.control}
              name="techStack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Stack / Skills to Assess</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {AVAILABLE_TECH_STACK.map((tech) => (
                      <FormItem
                        key={tech}
                        className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value.includes(tech)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...field.value, tech]
                                : field.value.filter((item) => item !== tech);
                              field.onChange(newValue);
                            }}
                            data-testid={`tech-${tech.toLowerCase().replace(/[.\s]/g, '-')}`}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          {tech}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Question Types and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="questionTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Question Types</FormLabel>
                    <div className="space-y-2">
                      {QUESTION_TYPES.map((type) => (
                        <FormItem
                          key={type.id}
                          className="flex items-center space-x-2"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value.includes(type.id)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...field.value, type.id]
                                  : field.value.filter((item) => item !== type.id);
                                field.onChange(newValue);
                              }}
                              data-testid={`question-type-${type.id}`}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {type.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Duration</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger data-testid="select-duration">
                          <SelectValue placeholder="Select duration..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Natural Language Refinement */}
            <FormField
              control={form.control}
              name="naturalLanguageRefinement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Requirements (Natural Language)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="E.g., 'Make it heavy on problem-solving and include at least one system design question. Focus on practical scenarios rather than theoretical concepts.'"
                      className="resize-none"
                      rows={4}
                      {...field}
                      data-testid="textarea-requirements"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createBlueprintMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                data-testid="button-create-blueprint"
              >
                {createBlueprintMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-arrow-right mr-2"></i>
                    Create Test Blueprint
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

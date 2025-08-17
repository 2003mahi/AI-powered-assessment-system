import { cn } from "@/lib/utils";
import { PhaseState } from "@/types/assessment";

interface PhaseNavigationProps {
  phaseState: PhaseState;
  onPhaseChange: (phase: PhaseState['current']) => void;
}

export function PhaseNavigation({ phaseState, onPhaseChange }: PhaseNavigationProps) {
  const phases = [
    {
      id: 'requirements' as const,
      label: 'Phase 1: Requirements',
      icon: 'fas fa-clipboard-list'
    },
    {
      id: 'generation' as const,
      label: 'Phase 2: Generation', 
      icon: 'fas fa-cogs'
    },
    {
      id: 'evaluation' as const,
      label: 'Phase 3: Evaluation',
      icon: 'fas fa-chart-bar'
    }
  ];

  return (
    <nav className="flex space-x-8 border-b border-gray-200 mb-8">
      {phases.map((phase) => {
        const isActive = phaseState.current === phase.id;
        const isCompleted = phaseState.completed[phase.id];
        const isDisabled = !isCompleted && phaseState.current !== phase.id;
        
        return (
          <button
            key={phase.id}
            onClick={() => !isDisabled && onPhaseChange(phase.id)}
            disabled={isDisabled}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              isActive 
                ? "border-blue-600 text-blue-600" 
                : isCompleted
                ? "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
                : "border-transparent text-gray-400 cursor-not-allowed"
            )}
            data-testid={`phase-tab-${phase.id}`}
          >
            <i className={cn(phase.icon, "mr-2")}></i>
            {phase.label}
          </button>
        );
      })}
    </nav>
  );
}

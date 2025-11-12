import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  variant?: "primary" | "secondary" | "accent";
}

export const ProgressBar = ({ label, current, total, variant = "primary" }: ProgressBarProps) => {
  const percentage = Math.round((current / total) * 100);
  
  const variantClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
  };

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {current}/{total} ({percentage}%)
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

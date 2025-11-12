import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Difficulty } from "@/data/vocabulary";
import { XCircle, AlertCircle, CheckCircle, Smile } from "lucide-react";

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
}

export const DifficultySelector = ({ onSelect }: DifficultySelectorProps) => {
  const options = [
    {
      difficulty: "again" as Difficulty,
      label: "Lupa",
      description: "Review besok",
      icon: XCircle,
      color: "destructive",
    },
    {
      difficulty: "hard" as Difficulty,
      label: "Sulit",
      description: "Review 2-3 hari",
      icon: AlertCircle,
      color: "secondary",
    },
    {
      difficulty: "medium" as Difficulty,
      label: "Sedang",
      description: "Review 4-7 hari",
      icon: CheckCircle,
      color: "default",
    },
    {
      difficulty: "easy" as Difficulty,
      label: "Mudah",
      description: "Review 10+ hari",
      icon: Smile,
      color: "default",
    },
  ];

  return (
    <Card className="shadow-medium animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-lg">Seberapa mudah Anda mengingat kata ini?</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.difficulty}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5"
              onClick={() => onSelect(option.difficulty)}
            >
              <Icon className={`h-6 w-6 ${
                option.difficulty === "again" ? "text-destructive" :
                option.difficulty === "hard" ? "text-secondary" :
                option.difficulty === "easy" ? "text-success" : "text-primary"
              }`} />
              <span className="font-semibold">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

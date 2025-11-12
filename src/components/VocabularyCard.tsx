import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle } from "lucide-react";
import { Vocabulary } from "@/data/vocabulary";
import { AudioButton } from "@/components/AudioButton";

interface VocabularyCardProps {
  vocab: Vocabulary;
  onEdit: (vocab: Vocabulary) => void;
  onDelete: (id: string) => void;
  onToggleMastered: (id: string) => void;
}

export const VocabularyCard = ({ vocab, onEdit, onDelete, onToggleMastered }: VocabularyCardProps) => {
  return (
    <Card className="shadow-soft hover:shadow-medium transition-smooth animate-scale-in">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-3xl font-bold text-foreground">{vocab.hanzi}</h3>
              <AudioButton text={vocab.pinyin} variant="ghost" size="sm" />
              {vocab.mastered && (
                <CheckCircle className="h-5 w-5 text-success" />
              )}
            </div>
            <p className="text-lg text-muted-foreground mb-1">{vocab.pinyin}</p>
            <p className="text-base text-foreground">{vocab.meaning}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            HSK {vocab.hskLevel}
          </Badge>
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
            {vocab.category}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={vocab.mastered ? "secondary" : "default"}
            onClick={() => onToggleMastered(vocab.id)}
            className="flex-1"
          >
            {vocab.mastered ? "Sudah Hafal" : "Tandai Hafal"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(vocab)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(vocab.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Shuffle, CheckCircle, Home, Star } from "lucide-react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useProgress } from "@/hooks/useProgress";
import { AudioButton } from "@/components/AudioButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DifficultySelector } from "@/components/DifficultySelector";
import { Difficulty } from "@/data/vocabulary";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Flashcards = () => {
  const { vocabulary, loading, updateVocabulary } = useVocabulary();
  const { updateProgress } = useProgress();
  const navigate = useNavigate();
  
  const [selectedHSK, setSelectedHSK] = useState<string>("all");
  const [showPinyin, setShowPinyin] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedWord, setEditedWord] = useState({ hanzi: "", pinyin: "", meaning: "" });

  // Store shuffled cards in state to prevent auto-reordering
  const [shuffledCards, setShuffledCards] = useState<typeof vocabulary>([]);

  // Filter and shuffle vocabulary with prioritization
  useEffect(() => {
    let filtered = vocabulary;

    // Filter by HSK level
    if (selectedHSK !== "all") {
      const hskLevels = selectedHSK.split(",").map(Number);
      filtered = filtered.filter((v) => hskLevels.includes(v.hsk_level));
    }

    // Separate mastered and unmastered
    const unmastered = filtered.filter((v) => !v.progress?.mastered);
    const mastered = filtered.filter((v) => v.progress?.mastered);

    // Prioritize unmastered (90%), add some mastered for review (10%)
    const masteredSample = mastered
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.ceil(mastered.length * 0.1));

    // Combine and shuffle
    const combined = [...unmastered, ...masteredSample];
    setShuffledCards(combined.sort(() => Math.random() - 0.5));
  }, [vocabulary, selectedHSK]);

  const filteredVocabulary = shuffledCards;

  const currentCard = filteredVocabulary[currentIndex];
  const progress = ((currentIndex + 1) / filteredVocabulary.length) * 100;

  const handleNext = () => {
    if (currentIndex < filteredVocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedHSK(selectedHSK); // Trigger re-shuffle
  };

  const handleDifficultySelect = async (difficulty: Difficulty) => {
    if (!currentCard) return;
    await updateProgress(currentCard.id, difficulty);
    toast.success("Progress disimpan!");
    handleNext();
  };

  const handleMarkMastered = async () => {
    if (!currentCard) return;
    await updateProgress(currentCard.id, "easy", true);
    toast.success("Ditandai sudah hafal! 🎉");
    handleNext();
  };

  const handleEdit = () => {
    if (!currentCard) return;
    setEditedWord({
      hanzi: currentCard.hanzi,
      pinyin: currentCard.pinyin,
      meaning: currentCard.meaning,
    });
    setEditDialogOpen(true);
  };

  const saveEdit = async () => {
    if (!currentCard) return;
    await updateVocabulary(currentCard.id, editedWord);
    setEditDialogOpen(false);
    toast.success("Kata berhasil diupdate!");
  };

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedHSK]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (filteredVocabulary.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 pt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Flashcards</h1>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Tidak ada kosa kata untuk ditampilkan.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pt-20">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Flashcard</h1>
          <Button onClick={() => navigate("/")} variant="outline" size="sm">
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <Select value={selectedHSK} onValueChange={setSelectedHSK}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="HSK" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="1">HSK 1</SelectItem>
              <SelectItem value="2">HSK 2</SelectItem>
              <SelectItem value="3">HSK 3</SelectItem>
              <SelectItem value="4">HSK 4</SelectItem>
              <SelectItem value="5">HSK 5</SelectItem>
              <SelectItem value="6">HSK 6</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch id="pinyin-toggle" checked={showPinyin} onCheckedChange={setShowPinyin} />
            <Label htmlFor="pinyin-toggle" className="text-sm">Pinyin</Label>
          </div>

          <Button onClick={handleShuffle} variant="outline" size="sm">
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{currentIndex + 1} / {filteredVocabulary.length}</span>
          <Progress value={progress} className="flex-1 mx-4 h-2" />
        </div>

        <Card 
          className="shadow-medium cursor-pointer min-h-[280px] flex flex-col justify-center"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="pt-8 pb-8">
            {!isFlipped ? (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-5xl md:text-6xl font-bold text-foreground">{currentCard.hanzi}</h2>
                  <AudioButton text={currentCard.hanzi} />
                </div>
                {showPinyin && (
                  <p className="text-xl md:text-2xl text-muted-foreground">{currentCard.pinyin}</p>
                )}
                {currentCard.progress?.mastered && (
                  <Badge variant="outline" className="border-success text-success">
                    <Star className="h-3 w-3 mr-1 fill-success" />
                    Hafal
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mt-4">Klik untuk arti</p>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-2xl md:text-3xl font-medium text-foreground">{currentCard.meaning}</p>
                <div className="text-muted-foreground space-y-1">
                  <p className="text-lg">{currentCard.hanzi}</p>
                  <p className="text-base">{currentCard.pinyin}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Klik kembali</p>
              </div>
            )}
          </CardContent>
        </Card>

        {!currentCard.progress?.mastered && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleMarkMastered();
            }}
            variant="outline"
            className="w-full border-success text-success hover:bg-success hover:text-success-foreground"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Tandai Sudah Hafal
          </Button>
        )}

        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleNext}
            disabled={currentIndex === filteredVocabulary.length - 1}
            variant="outline"
            size="sm"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Flashcards;

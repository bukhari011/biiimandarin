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

  // Filter and shuffle vocabulary with prioritization
  const filteredVocabulary = useMemo(() => {
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
    return combined.sort(() => Math.random() - 0.5);
  }, [vocabulary, selectedHSK]);

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
    await updateProgress(currentCard.id, "easy");
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (filteredVocabulary.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate("/")} variant="ghost" size="sm">
            <Home className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Flashcards</h1>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card p-4 rounded-lg shadow-soft">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
            <Select value={selectedHSK} onValueChange={setSelectedHSK}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Pilih HSK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua HSK</SelectItem>
                <SelectItem value="1">HSK 1</SelectItem>
                <SelectItem value="2">HSK 2</SelectItem>
                <SelectItem value="3">HSK 3</SelectItem>
                <SelectItem value="4">HSK 4</SelectItem>
                <SelectItem value="5">HSK 5</SelectItem>
                <SelectItem value="6">HSK 6</SelectItem>
                <SelectItem value="1,2">HSK 1 & 2</SelectItem>
                <SelectItem value="1,2,3">HSK 1, 2 & 3</SelectItem>
                <SelectItem value="4,5,6">HSK 4, 5 & 6</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Switch id="pinyin-toggle" checked={showPinyin} onCheckedChange={setShowPinyin} />
              <Label htmlFor="pinyin-toggle" className="text-sm">Tampilkan Pinyin</Label>
            </div>
          </div>

          <Button onClick={handleShuffle} variant="outline" size="sm" className="w-full sm:w-auto">
            <Shuffle className="h-4 w-4 mr-2" />
            Acak
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{currentIndex + 1} / {filteredVocabulary.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Flashcard */}
        <Card 
          className="shadow-medium hover:shadow-strong transition-smooth cursor-pointer relative"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {currentCard.progress?.mastered && (
            <Badge className="absolute top-4 right-4 bg-success text-success-foreground">
              <Star className="h-3 w-3 mr-1" />
              Sudah Hafal
            </Badge>
          )}
          <CardContent className="pt-12 pb-12 min-h-[400px] flex flex-col items-center justify-center">
            {!isFlipped ? (
              <div className="text-center space-y-6 animate-scale-in">
                <div className="flex items-center justify-center gap-4">
                  <h2 className="text-5xl md:text-7xl font-bold text-foreground">{currentCard.hanzi}</h2>
                </div>
                {showPinyin && (
                  <div className="flex items-center justify-center gap-3">
                    <p className="text-2xl md:text-3xl text-muted-foreground">{currentCard.pinyin}</p>
                    <AudioButton text={currentCard.pinyin} />
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-8">Klik untuk melihat arti</p>
              </div>
            ) : (
              <div className="text-center space-y-6 animate-scale-in">
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">{currentCard.meaning}</h3>
                <div className="pt-4 space-y-2">
                  <p className="text-xl text-muted-foreground">{currentCard.hanzi}</p>
                  {showPinyin && <p className="text-lg text-muted-foreground">{currentCard.pinyin}</p>}
                </div>
                <p className="text-sm text-muted-foreground mt-8">Klik untuk kembali</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          {/* Quick action button */}
          {!currentCard.progress?.mastered && (
            <Button 
              onClick={handleMarkMastered}
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
              size="lg"
            >
              <Star className="h-5 w-5 mr-2" />
              Tandai Sudah Hafal
            </Button>
          )}
          
          <DifficultySelector onSelect={handleDifficultySelect} />
          
          <div className="flex gap-2 justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Sebelumnya
            </Button>
            
            <Button onClick={handleEdit} variant="outline">
              Edit
            </Button>

            <Button
              onClick={handleNext}
              disabled={currentIndex === filteredVocabulary.length - 1}
              className="flex-1"
            >
              Selanjutnya
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kata</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Hanzi</Label>
              <Input
                value={editedWord.hanzi}
                onChange={(e) => setEditedWord({ ...editedWord, hanzi: e.target.value })}
              />
            </div>
            <div>
              <Label>Pinyin</Label>
              <Input
                value={editedWord.pinyin}
                onChange={(e) => setEditedWord({ ...editedWord, pinyin: e.target.value })}
              />
            </div>
            <div>
              <Label>Arti</Label>
              <Input
                value={editedWord.meaning}
                onChange={(e) => setEditedWord({ ...editedWord, meaning: e.target.value })}
              />
            </div>
            <Button onClick={saveEdit} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Flashcards;

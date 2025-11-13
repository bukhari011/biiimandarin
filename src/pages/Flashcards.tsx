import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight, Shuffle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AudioButton } from "@/components/AudioButton";
import { DifficultySelector } from "@/components/DifficultySelector";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useProgress, Difficulty } from "@/hooks/useProgress";

const FlashcardsPage = () => {
  const navigate = useNavigate();
  const { vocabulary, loading } = useVocabulary();
  const { updateProgress, toggleMastered } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (vocabulary.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Tidak ada kosakata untuk dipelajari</p>
          <Button onClick={() => navigate("/vocabulary")}>Tambah Kata</Button>
        </div>
      </div>
    );
  }

  const currentCard = vocabulary[currentIndex];
  const masteredCount = vocabulary.filter((v) => v.progress?.mastered).length;

  const handleNext = () => {
    setIsFlipped(false);
    setShowDifficulty(false);
    setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setShowDifficulty(false);
    setCurrentIndex((prev) => (prev - 1 + vocabulary.length) % vocabulary.length);
  };

  const handleDifficultySelect = async (difficulty: Difficulty) => {
    await updateProgress(currentCard.id, difficulty);
    handleNext();
  };

  const handleShuffle = () => {
    setCurrentIndex(Math.floor(Math.random() * vocabulary.length));
    setIsFlipped(false);
    setShowDifficulty(false);
    toast.success("Kartu diacak!");
  };

  const handleToggleMastered = async () => {
    await toggleMastered(currentCard.id, !(currentCard.progress?.mastered || false));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Flashcard Mode</h1>
                <p className="text-sm text-muted-foreground">
                  Kartu {currentIndex + 1} dari {vocabulary.length}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleShuffle}>
              <Shuffle className="mr-2 h-4 w-4" />
              Acak
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-center gap-1">
            {vocabulary.slice(0, 10).map((_, idx) => (
              <div
                key={idx}
                className={`h-1 w-8 rounded-full transition-smooth ${
                  idx === currentIndex ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          <div
            className="perspective-1000"
            onClick={() => {
              if (!showDifficulty) {
                setIsFlipped(!isFlipped);
              }
            }}
          >
            <Card
              className="relative h-96 cursor-pointer shadow-strong transition-all duration-500 transform hover:scale-105"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-8">
                {!isFlipped ? (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center gap-2 mb-4">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        HSK {currentCard.hsk_level}
                      </Badge>
                      <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                        {currentCard.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <h2 className="text-7xl font-bold text-foreground">{currentCard.hanzi}</h2>
                      <AudioButton text={currentCard.pinyin} size="lg" />
                    </div>
                    <p className="text-muted-foreground text-sm">Klik untuk melihat jawaban</p>
                  </div>
                ) : (
                  <div className="text-center space-y-4" style={{ transform: "rotateY(180deg)" }}>
                    <h2 className="text-5xl font-bold text-foreground mb-2">{currentCard.hanzi}</h2>
                    <div className="flex items-center justify-center gap-3">
                      <p className="text-3xl text-primary font-semibold">{currentCard.pinyin}</p>
                      <AudioButton text={currentCard.pinyin} size="lg" />
                    </div>
                    <p className="text-2xl text-foreground">{currentCard.meaning}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {isFlipped && !showDifficulty && (
            <Button
              variant="default"
              size="lg"
              onClick={() => setShowDifficulty(true)}
              className="w-full max-w-md mx-auto animate-fade-in"
            >
              Tandai Tingkat Kesulitan
            </Button>
          )}

          {showDifficulty && <DifficultySelector onSelect={handleDifficultySelect} />}

          {!showDifficulty && (
            <div className="flex justify-between items-center">
              <Button variant="outline" size="lg" onClick={handlePrevious}>
                <ChevronLeft className="mr-2 h-5 w-5" />
                Sebelumnya
              </Button>

              <Button
                variant={currentCard.progress?.mastered ? "secondary" : "default"}
                size="lg"
                onClick={handleToggleMastered}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {currentCard.progress?.mastered ? "Sudah Hafal" : "Tandai Hafal"}
              </Button>

              <Button variant="outline" size="lg" onClick={handleNext}>
                Selanjutnya
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Anda sudah menghafal {masteredCount} dari {vocabulary.length} kata (
              {vocabulary.length > 0 ? Math.round((masteredCount / vocabulary.length) * 100) : 0}%)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlashcardsPage;

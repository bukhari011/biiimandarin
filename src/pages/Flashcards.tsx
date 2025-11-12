import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight, Shuffle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { vocabularyData, Vocabulary, Difficulty } from "@/data/vocabulary";
import { toast } from "sonner";
import { AudioButton } from "@/components/AudioButton";
import { DifficultySelector } from "@/components/DifficultySelector";
import { calculateNextReview } from "@/utils/spacedRepetition";

const FlashcardsPage = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Vocabulary[]>(vocabularyData);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(
    new Set(vocabularyData.filter((v) => v.mastered).map((v) => v.id))
  );
  const [showDifficulty, setShowDifficulty] = useState(false);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setShowDifficulty(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setShowDifficulty(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    const currentCard = cards[currentIndex];
    const { nextReviewDate, newEaseFactor } = calculateNextReview(
      difficulty,
      currentCard.easeFactor || 2.5,
      currentCard.reviewCount || 0
    );

    // Update card with spaced repetition data
    const updatedCards = cards.map((card) =>
      card.id === currentCard.id
        ? {
            ...card,
            difficulty,
            lastReviewed: new Date(),
            nextReview: nextReviewDate,
            reviewCount: (card.reviewCount || 0) + 1,
            easeFactor: newEaseFactor,
          }
        : card
    );

    setCards(updatedCards);
    
    const daysUntilReview = Math.ceil(
      (nextReviewDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    toast.success(`Review berikutnya: ${daysUntilReview} hari lagi`);
    handleNext();
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowDifficulty(false);
    toast.success("Kartu diacak!");
  };

  const handleToggleMastered = () => {
    const newMastered = new Set(masteredCards);
    if (newMastered.has(currentCard.id)) {
      newMastered.delete(currentCard.id);
      toast("Ditandai sebagai belum hafal");
    } else {
      newMastered.add(currentCard.id);
      toast.success("Ditandai sebagai sudah hafal! 🎉");
    }
    setMasteredCards(newMastered);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                  Kartu {currentIndex + 1} dari {cards.length}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShuffle}>
                <Shuffle className="mr-2 h-4 w-4" />
                Acak
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Flashcard */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-center gap-1">
            {cards.slice(0, 10).map((_, idx) => (
              <div
                key={idx}
                className={`h-1 w-8 rounded-full transition-smooth ${
                  idx === currentIndex ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          {/* Card */}
          <div 
            className="perspective-1000"
            onClick={() => {
              if (!showDifficulty) {
                setIsFlipped(!isFlipped);
              }
            }}
          >
            <Card 
              className={`relative h-96 cursor-pointer shadow-strong transition-all duration-500 transform hover:scale-105 ${
                isFlipped ? "rotate-y-180" : ""
              }`}
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-8">
                {!isFlipped ? (
                  // Front of card
                  <div className="text-center space-y-4">
                    <div className="flex justify-center gap-2 mb-4">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        HSK {currentCard.hskLevel}
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
                  // Back of card
                  <div 
                    className="text-center space-y-4"
                    style={{ transform: "rotateY(180deg)" }}
                  >
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

          {/* Difficulty Selector (shown after flipping) */}
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

          {/* Controls */}
          {!showDifficulty && (
            <div className="flex justify-between items-center">
              <Button variant="outline" size="lg" onClick={handlePrevious}>
                <ChevronLeft className="mr-2 h-5 w-5" />
                Sebelumnya
              </Button>

              <Button
                variant={masteredCards.has(currentCard.id) ? "secondary" : "default"}
                size="lg"
                onClick={handleToggleMastered}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {masteredCards.has(currentCard.id) ? "Sudah Hafal" : "Tandai Hafal"}
              </Button>

              <Button variant="outline" size="lg" onClick={handleNext}>
                Selanjutnya
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Stats */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Anda sudah menghafal {masteredCards.size} dari {cards.length} kata (
              {Math.round((masteredCards.size / cards.length) * 100)}%)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlashcardsPage;

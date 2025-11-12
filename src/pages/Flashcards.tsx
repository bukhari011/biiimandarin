import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight, Shuffle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { vocabularyData, Vocabulary } from "@/data/vocabulary";
import { toast } from "sonner";

const FlashcardsPage = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Vocabulary[]>(vocabularyData);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(
    new Set(vocabularyData.filter((v) => v.mastered).map((v) => v.id))
  );

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
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
            onClick={() => setIsFlipped(!isFlipped)}
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
                    <h2 className="text-7xl font-bold text-foreground mb-4">{currentCard.hanzi}</h2>
                    <p className="text-muted-foreground text-sm">Klik untuk melihat jawaban</p>
                  </div>
                ) : (
                  // Back of card
                  <div 
                    className="text-center space-y-4"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <h2 className="text-5xl font-bold text-foreground mb-2">{currentCard.hanzi}</h2>
                    <p className="text-3xl text-primary font-semibold mb-4">{currentCard.pinyin}</p>
                    <p className="text-2xl text-foreground">{currentCard.meaning}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
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

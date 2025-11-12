import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/StatsCard";
import { ProgressBar } from "@/components/ProgressBar";
import { BookOpen, BookMarked, Brain, Trophy, Plus, BarChart3 } from "lucide-react";
import { vocabularyData, hskLevels } from "@/data/vocabulary";

const Dashboard = () => {
  const navigate = useNavigate();

  const totalWords = vocabularyData.length;
  const masteredWords = vocabularyData.filter((v) => v.mastered).length;
  const inProgressWords = totalWords - masteredWords;

  // Calculate mastered per HSK level
  const hskProgress = hskLevels.map((level) => {
    const levelWords = vocabularyData.filter((v) => v.hskLevel === level.level);
    const masteredInLevel = levelWords.filter((v) => v.mastered).length;
    return {
      ...level,
      current: masteredInLevel,
      totalInData: levelWords.length,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Mandarin Tracker</h1>
              <p className="text-muted-foreground">Pantau progres belajar Mandarin Anda</p>
            </div>
            <Button onClick={() => navigate("/vocabulary")} size="lg" className="shadow-medium">
              <Plus className="mr-2 h-5 w-5" />
              Tambah Kata Baru
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <StatsCard title="Total Kosakata" value={totalWords} icon={BookOpen} variant="primary" />
          <StatsCard title="Sudah Hafal" value={masteredWords} icon={Trophy} variant="secondary" />
          <StatsCard title="Sedang Dipelajari" value={inProgressWords} icon={Brain} variant="accent" />
          <StatsCard title="Tingkat Kemajuan" value={`${Math.round((masteredWords / totalWords) * 100)}%`} icon={BookMarked} />
        </div>

        {/* HSK Progress Section */}
        <div className="bg-card rounded-lg border p-6 shadow-soft animate-fade-in">
          <h2 className="text-xl font-semibold text-foreground mb-6">Progress HSK Level</h2>
          <div className="space-y-4">
            {hskProgress.map((level) => (
              <ProgressBar
                key={level.level}
                label={level.name}
                current={level.current}
                total={level.totalInData}
                variant={level.level <= 2 ? "primary" : level.level <= 4 ? "secondary" : "accent"}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <Button
            variant="outline"
            size="lg"
            className="h-32 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-smooth"
            onClick={() => navigate("/flashcards")}
          >
            <BookMarked className="h-8 w-8 text-primary" />
            <span className="font-semibold">Flashcard</span>
            <span className="text-xs text-muted-foreground">Latihan dengan kartu</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-32 flex flex-col gap-2 hover:bg-secondary/5 hover:border-secondary transition-smooth"
            onClick={() => navigate("/quiz")}
          >
            <Brain className="h-8 w-8 text-secondary" />
            <span className="font-semibold">Quiz</span>
            <span className="text-xs text-muted-foreground">Uji pemahaman Anda</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-32 flex flex-col gap-2 hover:bg-accent/5 hover:border-accent transition-smooth"
            onClick={() => navigate("/vocabulary")}
          >
            <BookOpen className="h-8 w-8 text-accent" />
            <span className="font-semibold">Daftar Kata</span>
            <span className="text-xs text-muted-foreground">Lihat semua kosakata</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-32 flex flex-col gap-2 hover:bg-success/5 hover:border-success transition-smooth"
            onClick={() => navigate("/statistics")}
          >
            <BarChart3 className="h-8 w-8 text-success" />
            <span className="font-semibold">Statistik</span>
            <span className="text-xs text-muted-foreground">Lihat progress detail</span>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

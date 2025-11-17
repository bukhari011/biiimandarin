import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/StatsCard";
import { ProgressBar } from "@/components/ProgressBar";
import { NotificationSettings } from "@/components/NotificationSettings";
import { BookOpen, BookMarked, Brain, Trophy, BarChart3, Award, Pencil, CheckCircle, Type, FileDown, Volume2, VolumeX } from "lucide-react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { vocabulary, loading } = useVocabulary();
  const [audioEnabled, setAudioEnabled] = useState(() => {
    const saved = localStorage.getItem("audioEnabled");
    return saved !== null ? saved === "true" : true;
  });

  const handleAudioToggle = (enabled: boolean) => {
    setAudioEnabled(enabled);
    localStorage.setItem("audioEnabled", enabled.toString());
    toast.success(enabled ? "Audio diaktifkan" : "Audio dinonaktifkan");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalWords = vocabulary.length;
  const masteredWords = vocabulary.filter((v) => v.progress?.mastered).length;
  const inProgressWords = totalWords - masteredWords;

  const hskProgress = [1, 2, 3, 4, 5, 6].map((level) => {
    const levelWords = vocabulary.filter((v) => v.hsk_level === level);
    const masteredInLevel = levelWords.filter((v) => v.progress?.mastered).length;
    return {
      level,
      name: `HSK ${level}`,
      current: masteredInLevel,
      totalInData: levelWords.length,
    };
  });

  return (
    <div className="min-h-screen bg-background pt-6 md:pt-8">
      <main className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <div onClick={() => navigate("/vocabulary")} className="cursor-pointer">
            <StatsCard title="Total Kosakata" value={totalWords} icon={BookOpen} variant="primary" />
          </div>
          <div onClick={() => navigate("/vocabulary?filter=mastered")} className="cursor-pointer">
            <StatsCard title="Sudah Hafal" value={masteredWords} icon={Trophy} variant="secondary" />
          </div>
          <div onClick={() => navigate("/vocabulary?filter=learning")} className="cursor-pointer">
            <StatsCard title="Sedang Dipelajari" value={inProgressWords} icon={Brain} variant="accent" />
          </div>
          <div onClick={() => navigate("/statistics")} className="cursor-pointer">
            <StatsCard
              title="Tingkat Kemajuan"
              value={totalWords > 0 ? `${Math.round((masteredWords / totalWords) * 100)}%` : "0%"}
              icon={BookMarked}
            />
          </div>
        </div>

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
          <Button
            variant="outline"
            size="lg"
            className="h-32 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-smooth"
            onClick={() => navigate("/flashcards")}
          >
            <BookMarked className="h-8 w-8 text-primary" />
            <span className="font-semibold">Flashcard</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-32 flex flex-col gap-2 hover:bg-secondary/5 hover:border-secondary transition-smooth"
            onClick={() => navigate("/quiz")}
          >
            <Brain className="h-8 w-8 text-secondary" />
            <span className="font-semibold">Quiz</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-32 flex flex-col gap-2 hover:bg-accent/5 hover:border-accent transition-smooth"
            onClick={() => navigate("/hanzi-practice")}
          >
            <Pencil className="h-8 w-8 text-accent" />
            <span className="font-semibold">Tulis Hanzi</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-32 flex flex-col gap-2 hover:bg-success/5 hover:border-success transition-smooth"
            onClick={() => navigate("/statistics")}
          >
            <BarChart3 className="h-8 w-8 text-success" />
            <span className="font-semibold">Statistik</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-32 flex flex-col gap-2 hover:bg-purple-500/5 hover:border-purple-500 transition-smooth"
            onClick={() => navigate("/grammar-checker")}
          >
            <CheckCircle className="h-8 w-8 text-purple-500" />
            <span className="font-semibold">Cek Grammar</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-32 flex flex-col gap-2 hover:bg-orange-500/5 hover:border-orange-500 transition-smooth"
            onClick={() => navigate("/sentence-builder")}
          >
            <Type className="h-8 w-8 text-orange-500" />
            <span className="font-semibold">Rangkai Kalimat</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="lg"
            className="h-24 flex items-center gap-3"
            onClick={() => navigate("/achievements")}
          >
            <Award className="h-8 w-8 text-primary" />
            <span className="font-semibold text-lg">Lihat Achievements</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-24 flex items-center gap-3"
            onClick={() => navigate("/vocabulary")}
          >
            <FileDown className="h-8 w-8 text-secondary" />
            <span className="font-semibold text-lg">Export / Import Data</span>
          </Button>
        </div>

        <NotificationSettings />

        <div className="bg-card rounded-lg border p-6 shadow-soft animate-fade-in">
          <h2 className="text-xl font-semibold text-foreground mb-4">Pengaturan Audio</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {audioEnabled ? (
                <Volume2 className="h-5 w-5 text-primary" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
              <Label htmlFor="audio-toggle" className="text-base cursor-pointer">
                Aktifkan Suara
              </Label>
            </div>
            <Switch
              id="audio-toggle"
              checked={audioEnabled}
              onCheckedChange={handleAudioToggle}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Mengaktifkan atau menonaktifkan audio pronunciation pada flashcard dan quiz
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

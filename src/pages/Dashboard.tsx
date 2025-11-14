import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/StatsCard";
import { ProgressBar } from "@/components/ProgressBar";
import { BookOpen, BookMarked, Brain, Trophy, Plus, BarChart3, Award, Pencil, FileDown, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVocabulary } from "@/hooks/useVocabulary";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { vocabulary, loading } = useVocabulary();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_streaks")
      .select("current_streak")
      .eq("user_id", user.id)
      .single();

    if (data) setStreak(data.current_streak);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Berhasil logout!");
    navigate("/auth");
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Mandarin Tracker</h1>
              <p className="text-sm md:text-base text-muted-foreground">🔥 Streak: {streak} hari</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={() => navigate("/vocabulary")} size="sm" className="shadow-medium flex-1 sm:flex-initial">
                <Plus className="mr-1 md:mr-2 h-4 md:h-5 w-4 md:w-5" />
                <span className="text-xs md:text-sm">Tambah</span>
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm" className="flex-1 sm:flex-initial">
                <LogOut className="mr-1 md:mr-2 h-4 md:h-5 w-4 md:w-5" />
                <span className="text-xs md:text-sm">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
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
      </main>
    </div>
  );
};

export default Dashboard;

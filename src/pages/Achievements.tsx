import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  earned?: boolean;
  earned_at?: string;
}

const Achievements = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    fetchAchievements();
    fetchStreak();
  }, []);

  const fetchAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: allAchievements } = await supabase
      .from("achievements")
      .select("*")
      .order("condition_value", { ascending: true });

    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", user.id);

    const earnedSet = new Map(
      userAchievements?.map((ua) => [ua.achievement_id, ua.earned_at]) || []
    );

    const achievementsWithStatus = allAchievements?.map((a) => ({
      ...a,
      earned: earnedSet.has(a.id),
      earned_at: earnedSet.get(a.id),
    })) || [];

    setAchievements(achievementsWithStatus);
  };

  const fetchStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_streaks")
      .select("current_streak, longest_streak")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setStreak({ current: data.current_streak, longest: data.longest_streak });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <header className="border-b bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
              <p className="text-sm text-muted-foreground">
                🔥 Streak: {streak.current} hari | 🏅 Terpanjang: {streak.longest} hari
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`p-6 transition-all ${
                achievement.earned
                  ? "bg-gradient-to-br from-accent/20 to-primary/10 border-primary shadow-glow"
                  : "bg-muted/30 opacity-60"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{achievement.name}</h3>
                    {achievement.earned && <Badge variant="default">✓</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  {achievement.earned && achievement.earned_at && (
                    <p className="text-xs text-primary">
                      Diraih: {new Date(achievement.earned_at).toLocaleDateString("id-ID")}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Achievements;

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Flame, BookOpen, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  mastered_count: number;
  current_streak: number;
  longest_streak: number;
  total_reviews: number;
  rank: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaderboard();
    }, 100); // Slight delay to batch requests
    
    return () => clearTimeout(timer);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // Single optimized query to get all data at once
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          avatar_url
        `)
        .limit(100);

      if (error) throw error;
      if (!profileData) return;

      // Batch fetch progress and streaks for all users
      const userIds = profileData.map(p => p.id);
      
      const [progressResult, streakResult] = await Promise.all([
        supabase
          .from("user_progress")
          .select("user_id, mastered, review_count")
          .in("user_id", userIds),
        supabase
          .from("user_streaks")
          .select("user_id, current_streak, longest_streak")
          .in("user_id", userIds)
      ]);

      // Aggregate stats per user
      const userStats = new Map<string, LeaderboardEntry>();

      profileData.forEach((profile) => {
        userStats.set(profile.id, {
          user_id: profile.id,
          username: profile.username || "Anonymous",
          avatar_url: profile.avatar_url,
          mastered_count: 0,
          current_streak: 0,
          longest_streak: 0,
          total_reviews: 0,
          rank: 0,
        });
      });

      // Process progress data
      progressResult.data?.forEach((progress) => {
        const entry = userStats.get(progress.user_id);
        if (entry) {
          if (progress.mastered) entry.mastered_count++;
          entry.total_reviews += progress.review_count || 0;
        }
      });

      // Process streak data
      streakResult.data?.forEach((streak) => {
        const entry = userStats.get(streak.user_id);
        if (entry) {
          entry.current_streak = streak.current_streak || 0;
          entry.longest_streak = streak.longest_streak || 0;
        }
      });

      // Sort and rank
      const sortedLeaderboard = Array.from(userStats.values())
        .sort((a, b) => {
          if (b.mastered_count !== a.mastered_count) {
            return b.mastered_count - a.mastered_count;
          }
          return b.current_streak - a.current_streak;
        })
        .slice(0, 50) // Limit to top 50
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      setLeaderboard(sortedLeaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Gagal memuat leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-amber-600" />;
    return <Award className="h-6 w-6 text-muted-foreground" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    if (rank === 2) return "bg-gray-400/10 text-gray-600 border-gray-400/20";
    if (rank === 3) return "bg-amber-600/10 text-amber-700 border-amber-600/20";
    return "bg-muted/50 text-muted-foreground border-muted";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pt-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Leaderboard</h1>
            <p className="text-muted-foreground">Kompetisi dengan pengguna lain</p>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <Card className="mt-8 shadow-soft">
              <CardContent className="pt-6 text-center">
                <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <Avatar className="h-16 w-16 mx-auto mb-2">
                  <AvatarImage src={leaderboard[1].avatar_url || undefined} />
                  <AvatarFallback>{leaderboard[1].username[0]}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{leaderboard[1].username}</p>
                <Badge variant="outline" className="mt-2">{leaderboard[1].mastered_count} kata</Badge>
              </CardContent>
            </Card>

            {/* 1st Place */}
            <Card className="shadow-medium border-primary/50">
              <CardContent className="pt-6 text-center">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <Avatar className="h-20 w-20 mx-auto mb-2 border-4 border-primary">
                  <AvatarImage src={leaderboard[0].avatar_url || undefined} />
                  <AvatarFallback>{leaderboard[0].username[0]}</AvatarFallback>
                </Avatar>
                <p className="font-bold text-lg">{leaderboard[0].username}</p>
                <Badge variant="outline" className="mt-2 bg-primary/10 text-primary border-primary/20">
                  {leaderboard[0].mastered_count} kata
                </Badge>
              </CardContent>
            </Card>

            {/* 3rd Place */}
            <Card className="mt-8 shadow-soft">
              <CardContent className="pt-6 text-center">
                <Trophy className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <Avatar className="h-16 w-16 mx-auto mb-2">
                  <AvatarImage src={leaderboard[2].avatar_url || undefined} />
                  <AvatarFallback>{leaderboard[2].username[0]}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{leaderboard[2].username}</p>
                <Badge variant="outline" className="mt-2">{leaderboard[2].mastered_count} kata</Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Semua Peringkat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.user_id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-smooth ${
                  entry.user_id === currentUserId
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-card hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Badge variant="outline" className={`w-12 h-12 flex items-center justify-center ${getRankBadge(entry.rank)}`}>
                    {entry.rank <= 3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
                  </Badge>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback>{entry.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {entry.username}
                      {entry.user_id === currentUserId && (
                        <span className="ml-2 text-xs text-primary">(Kamu)</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-medium">{entry.mastered_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{entry.current_streak}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;

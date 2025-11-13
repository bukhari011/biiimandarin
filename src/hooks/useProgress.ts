import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateNextReview } from "@/utils/spacedRepetition";

export type Difficulty = "easy" | "medium" | "hard" | "again";

export const useProgress = () => {
  const updateProgress = async (
    vocabularyId: string,
    difficulty: Difficulty,
    mastered?: boolean
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("vocabulary_id", vocabularyId)
        .maybeSingle();

      const currentEaseFactor = existing?.ease_factor || 2.5;
      const currentReviewCount = existing?.review_count || 0;
      const { nextReviewDate, newEaseFactor } = calculateNextReview(
        difficulty,
        currentReviewCount,
        currentEaseFactor
      );

      const progressData = {
        user_id: user.id,
        vocabulary_id: vocabularyId,
        difficulty,
        last_reviewed: new Date().toISOString(),
        next_review: nextReviewDate.toISOString(),
        review_count: currentReviewCount + 1,
        ease_factor: newEaseFactor,
        mastered: mastered !== undefined ? mastered : existing?.mastered || false,
      };

      const { error } = await supabase
        .from("user_progress")
        .upsert(progressData, { onConflict: "user_id,vocabulary_id" });

      if (error) throw error;

      // Update streak
      await updateStreak();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleMastered = async (vocabularyId: string, mastered: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_progress")
        .upsert(
          {
            user_id: user.id,
            vocabulary_id: vocabularyId,
            mastered,
          },
          { onConflict: "user_id,vocabulary_id" }
        );

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: streak } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const today = new Date().toISOString().split("T")[0];
      const lastActivity = streak?.last_activity_date;

      let newStreak = 1;
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
          return; // Already updated today
        } else if (diffDays === 1) {
          newStreak = (streak.current_streak || 0) + 1;
        }
      }

      const { error } = await supabase.from("user_streaks").upsert(
        {
          user_id: user.id,
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streak?.longest_streak || 0),
          last_activity_date: today,
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      // Check achievements
      await checkAchievements();
    } catch (error: any) {
      console.error("Error updating streak:", error);
    }
  };

  const checkAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: achievements } = await supabase.from("achievements").select("*");
      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      const earnedIds = new Set(userAchievements?.map((ua) => ua.achievement_id) || []);

      for (const achievement of achievements || []) {
        if (earnedIds.has(achievement.id)) continue;

        let earned = false;

        if (achievement.condition_type === "words_mastered") {
          const { count } = await supabase
            .from("user_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("mastered", true);

          earned = (count || 0) >= achievement.condition_value;
        } else if (achievement.condition_type === "streak") {
          const { data: streak } = await supabase
            .from("user_streaks")
            .select("current_streak")
            .eq("user_id", user.id)
            .single();

          earned = (streak?.current_streak || 0) >= achievement.condition_value;
        } else if (achievement.condition_type === "reviews_count") {
          const { count } = await supabase
            .from("user_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

          earned = (count || 0) >= achievement.condition_value;
        }

        if (earned) {
          await supabase.from("user_achievements").insert({
            user_id: user.id,
            achievement_id: achievement.id,
          });

          toast.success(`🎉 Achievement unlocked: ${achievement.name}!`, {
            description: achievement.description,
          });
        }
      }
    } catch (error: any) {
      console.error("Error checking achievements:", error);
    }
  };

  return {
    updateProgress,
    toggleMastered,
    updateStreak,
    checkAchievements,
  };
};

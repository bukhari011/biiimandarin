import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VocabularyWithProgress {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  hsk_level: number;
  category: string;
  image_url?: string;
  progress?: {
    mastered: boolean;
    difficulty?: string;
    last_reviewed?: string;
    next_review?: string;
    review_count: number;
    ease_factor: number;
  };
}

export const useVocabulary = () => {
  const [vocabulary, setVocabulary] = useState<VocabularyWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVocabulary = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: vocabData, error: vocabError } = await supabase
        .from("vocabulary")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (vocabError) throw vocabError;

      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);

      const vocabWithProgress = vocabData?.map((vocab) => {
        const progress = progressData?.find((p) => p.vocabulary_id === vocab.id);
        return {
          ...vocab,
          progress: progress
            ? {
                mastered: progress.mastered,
                difficulty: progress.difficulty,
                last_reviewed: progress.last_reviewed,
                next_review: progress.next_review,
                review_count: progress.review_count,
                ease_factor: progress.ease_factor,
              }
            : undefined,
        };
      }) || [];

      setVocabulary(vocabWithProgress);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabulary();

    const channel = supabase
      .channel("vocabulary_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vocabulary" },
        () => fetchVocabulary()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_progress" },
        () => fetchVocabulary()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addVocabulary = async (vocab: Omit<VocabularyWithProgress, "id" | "progress">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("vocabulary").insert({
        user_id: user.id,
        hanzi: vocab.hanzi,
        pinyin: vocab.pinyin,
        meaning: vocab.meaning,
        hsk_level: vocab.hsk_level,
        category: vocab.category,
        image_url: vocab.image_url,
      });

      if (error) throw error;
      toast.success("Kata berhasil ditambahkan!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateVocabulary = async (id: string, vocab: Partial<VocabularyWithProgress>) => {
    try {
      const { error } = await supabase
        .from("vocabulary")
        .update({
          hanzi: vocab.hanzi,
          pinyin: vocab.pinyin,
          meaning: vocab.meaning,
          hsk_level: vocab.hsk_level,
          category: vocab.category,
          image_url: vocab.image_url,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Kata berhasil diperbarui!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteVocabulary = async (id: string) => {
    try {
      const { error } = await supabase.from("vocabulary").delete().eq("id", id);
      if (error) throw error;
      toast.success("Kata berhasil dihapus!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    vocabulary,
    loading,
    addVocabulary,
    updateVocabulary,
    deleteVocabulary,
    refreshVocabulary: fetchVocabulary,
  };
};

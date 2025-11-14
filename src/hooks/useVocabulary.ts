import { useState, useEffect, useCallback, useRef } from "react";
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
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();
  const isFetchingRef = useRef(false);

  const fetchVocabulary = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Single optimized query with join
      const { data: vocabData, error: vocabError } = await supabase
        .from("vocabulary")
        .select(`
          *,
          progress:user_progress!user_progress_vocabulary_id_fkey(
            mastered,
            difficulty,
            last_reviewed,
            next_review,
            review_count,
            ease_factor
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (vocabError) throw vocabError;

      const vocabWithProgress = vocabData?.map((vocab: any) => ({
        id: vocab.id,
        hanzi: vocab.hanzi,
        pinyin: vocab.pinyin,
        meaning: vocab.meaning,
        hsk_level: vocab.hsk_level,
        category: vocab.category,
        image_url: vocab.image_url,
        progress: vocab.progress?.[0] || undefined,
      })) || [];

      setVocabulary(vocabWithProgress);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Debounced refresh function
  const debouncedRefresh = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    fetchTimeoutRef.current = setTimeout(() => {
      fetchVocabulary();
    }, 300); // 300ms debounce
  }, [fetchVocabulary]);

  useEffect(() => {
    fetchVocabulary();

    const channel = supabase
      .channel("vocabulary_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vocabulary" },
        () => debouncedRefresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_progress" },
        () => debouncedRefresh()
      )
      .subscribe();

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [fetchVocabulary, debouncedRefresh]);

  const addVocabulary = async (vocab: Omit<VocabularyWithProgress, "id" | "progress">) => {
    try {
      setLoading(true);
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
      await fetchVocabulary();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateVocabulary = async (id: string, vocab: Partial<VocabularyWithProgress>) => {
    try {
      setLoading(true);
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
      await fetchVocabulary();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteVocabulary = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from("vocabulary").delete().eq("id", id);
      if (error) throw error;
      toast.success("Kata berhasil dihapus!");
      await fetchVocabulary();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
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

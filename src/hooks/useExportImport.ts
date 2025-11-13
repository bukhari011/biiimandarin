import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VocabularyWithProgress } from "./useVocabulary";

export const useExportImport = () => {
  const exportToJSON = (vocabulary: VocabularyWithProgress[]) => {
    try {
      const dataStr = JSON.stringify(vocabulary, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mandarin-vocabulary-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Data berhasil diexport ke JSON!");
    } catch (error) {
      toast.error("Gagal export data");
    }
  };

  const exportToCSV = (vocabulary: VocabularyWithProgress[]) => {
    try {
      const headers = ["Hanzi", "Pinyin", "Meaning", "HSK Level", "Category", "Mastered"];
      const rows = vocabulary.map((v) => [
        v.hanzi,
        v.pinyin,
        v.meaning,
        v.hsk_level.toString(),
        v.category,
        v.progress?.mastered ? "Yes" : "No",
      ]);

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const dataBlob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mandarin-vocabulary-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Data berhasil diexport ke CSV!");
    } catch (error) {
      toast.error("Gagal export data");
    }
  };

  const importFromJSON = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error("Invalid JSON format");
      }

      for (const item of data) {
        if (!item.hanzi || !item.pinyin || !item.meaning) {
          continue;
        }

        await supabase.from("vocabulary").insert({
          user_id: user.id,
          hanzi: item.hanzi,
          pinyin: item.pinyin,
          meaning: item.meaning,
          hsk_level: item.hsk_level || 1,
          category: item.category || "Umum",
          image_url: item.image_url,
        });
      }

      toast.success(`Berhasil import ${data.length} kata!`);
    } catch (error: any) {
      toast.error("Gagal import data: " + error.message);
    }
  };

  const importFromCSV = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const text = await file.text();
      const lines = text.split("\n").slice(1); // Skip header

      let imported = 0;
      for (const line of lines) {
        const [hanzi, pinyin, meaning, hskLevel, category] = line.split(",");
        if (!hanzi || !pinyin || !meaning) continue;

        await supabase.from("vocabulary").insert({
          user_id: user.id,
          hanzi: hanzi.trim(),
          pinyin: pinyin.trim(),
          meaning: meaning.trim(),
          hsk_level: parseInt(hskLevel) || 1,
          category: category?.trim() || "Umum",
        });
        imported++;
      }

      toast.success(`Berhasil import ${imported} kata!`);
    } catch (error: any) {
      toast.error("Gagal import data: " + error.message);
    }
  };

  return {
    exportToJSON,
    exportToCSV,
    importFromJSON,
    importFromCSV,
  };
};

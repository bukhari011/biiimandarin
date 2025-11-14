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

      // Prepare batch insert data
      const vocabToInsert = [];
      for (const item of data) {
        if (!item.hanzi || !item.pinyin || !item.meaning) {
          continue;
        }

        const hskLevel = item.hsk_level || item.hskLevel || "1";
        const hskString = String(hskLevel).replace(/[^0-9]/g, '');
        const parsedHskLevel = parseInt(hskString, 10);
        const finalHskLevel = (!isNaN(parsedHskLevel) && parsedHskLevel >= 1 && parsedHskLevel <= 6) 
          ? parsedHskLevel 
          : 1;

        vocabToInsert.push({
          user_id: user.id,
          hanzi: item.hanzi,
          pinyin: item.pinyin,
          meaning: item.meaning,
          hsk_level: finalHskLevel,
          category: item.category || "Umum",
          image_url: item.image_url,
        });
      }

      // Batch insert all at once (max 1000 per batch for Supabase)
      if (vocabToInsert.length > 0) {
        const batchSize = 1000;
        for (let i = 0; i < vocabToInsert.length; i += batchSize) {
          const batch = vocabToInsert.slice(i, i + batchSize);
          const { error } = await supabase.from("vocabulary").insert(batch);
          if (error) throw error;
        }
      }

      toast.success(`Berhasil import ${vocabToInsert.length} kata!`);
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

      // Prepare batch insert data
      const vocabToInsert = [];
      for (const line of lines) {
        if (!line.trim()) continue;
        const [hanzi, pinyin, meaning, hskLevel, category] = line.split(",").map(s => s.trim());
        if (!hanzi || !pinyin || !meaning) continue;

        const hskString = String(hskLevel || "1").replace(/[^0-9]/g, '');
        const parsedHskLevel = parseInt(hskString, 10);
        const finalHskLevel = (!isNaN(parsedHskLevel) && parsedHskLevel >= 1 && parsedHskLevel <= 6) 
          ? parsedHskLevel 
          : 1;

        vocabToInsert.push({
          user_id: user.id,
          hanzi,
          pinyin,
          meaning,
          hsk_level: finalHskLevel,
          category: category || "Umum",
        });
      }

      // Batch insert all at once (max 1000 per batch for Supabase)
      if (vocabToInsert.length > 0) {
        const batchSize = 1000;
        for (let i = 0; i < vocabToInsert.length; i += batchSize) {
          const batch = vocabToInsert.slice(i, i + batchSize);
          const { error } = await supabase.from("vocabulary").insert(batch);
          if (error) throw error;
        }
      }

      toast.success(`Berhasil import ${vocabToInsert.length} kata!`);
    } catch (error: any) {
      toast.error("Gagal import data: " + error.message);
    }
  };

  const previewJSON = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error("Invalid JSON format");
      }

      return data.map((item: any) => {
        const hskLevel = item.hsk_level || item.hskLevel || "1";
        const hskString = String(hskLevel).replace(/[^0-9]/g, '');
        const parsedHskLevel = parseInt(hskString, 10);
        const finalHskLevel = (!isNaN(parsedHskLevel) && parsedHskLevel >= 1 && parsedHskLevel <= 6) 
          ? parsedHskLevel 
          : 1;

        return {
          hanzi: item.hanzi || "",
          pinyin: item.pinyin || "",
          meaning: item.meaning || "",
          hsk_level: finalHskLevel,
          category: item.category || "Umum",
          isValid: !!(item.hanzi && item.pinyin && item.meaning),
        };
      });
    } catch (error: any) {
      toast.error("Gagal membaca file: " + error.message);
      return [];
    }
  };

  const previewCSV = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split("\n").slice(1); // Skip header

      return lines
        .filter((line) => line.trim())
        .map((line) => {
          const [hanzi, pinyin, meaning, hskLevel, category] = line.split(",").map(s => s.trim());
          
          const hskString = String(hskLevel || "1").replace(/[^0-9]/g, '');
          const parsedHskLevel = parseInt(hskString, 10);
          const finalHskLevel = (!isNaN(parsedHskLevel) && parsedHskLevel >= 1 && parsedHskLevel <= 6) 
            ? parsedHskLevel 
            : 1;

          return {
            hanzi: hanzi || "",
            pinyin: pinyin || "",
            meaning: meaning || "",
            hsk_level: finalHskLevel,
            category: category || "Umum",
            isValid: !!(hanzi && pinyin && meaning),
          };
        });
    } catch (error: any) {
      toast.error("Gagal membaca file: " + error.message);
      return [];
    }
  };

  const downloadTemplate = (hskLevel: number) => {
    const headers = ["Hanzi", "Pinyin", "Meaning", "HSK Level", "Category"];
    const exampleRows = [
      ["你好", "nǐ hǎo", "Hello", hskLevel.toString(), "Greetings"],
      ["谢谢", "xièxie", "Thank you", hskLevel.toString(), "Greetings"],
    ];
    
    const csv = [headers, ...exampleRows].map((row) => row.join(",")).join("\n");
    const dataBlob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `template-hsk${hskLevel}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Template HSK ${hskLevel} berhasil didownload!`);
  };

  return {
    exportToJSON,
    exportToCSV,
    importFromJSON,
    importFromCSV,
    previewJSON,
    previewCSV,
    downloadTemplate,
  };
};

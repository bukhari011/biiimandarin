import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VocabularyCard } from "@/components/VocabularyCard";
import { AddWordDialog } from "@/components/AddWordDialog";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVocabulary, VocabularyWithProgress } from "@/hooks/useVocabulary";
import { useProgress } from "@/hooks/useProgress";
import { useExportImport } from "@/hooks/useExportImport";
import { categories } from "@/data/vocabulary";

const VocabularyPage = () => {
  const navigate = useNavigate();
  const { vocabulary, loading, addVocabulary, updateVocabulary, deleteVocabulary } = useVocabulary();
  const { toggleMastered } = useProgress();
  const { exportToJSON, exportToCSV, importFromJSON, importFromCSV } = useExportImport();
  const [filterHSK, setFilterHSK] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("Semua");
  const [filterMastered, setFilterMastered] = useState<string>("all");
  const [editingVocab, setEditingVocab] = useState<VocabularyWithProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredVocab = vocabulary.filter((vocab) => {
    const hskMatch = filterHSK === "all" || vocab.hsk_level.toString() === filterHSK;
    const categoryMatch = filterCategory === "Semua" || vocab.category === filterCategory;
    const masteredMatch = 
      filterMastered === "all" ||
      (filterMastered === "mastered" && vocab.progress?.mastered) ||
      (filterMastered === "unmastered" && !vocab.progress?.mastered);
    return hskMatch && categoryMatch && masteredMatch;
  });

  const handleAdd = async (newVocab: any) => {
    if (editingVocab) {
      await updateVocabulary(editingVocab.id, newVocab);
      setEditingVocab(null);
    } else {
      await addVocabulary(newVocab);
    }
  };

  const handleEdit = (vocab: any) => {
    const fullVocab = vocabulary.find((v) => v.id === vocab.id);
    if (fullVocab) setEditingVocab(fullVocab);
  };

  const handleToggleMastered = async (id: string) => {
    const vocab = vocabulary.find((v) => v.id === id);
    if (vocab) {
      await toggleMastered(id, !(vocab.progress?.mastered || false));
    }
  };

  const handleImport = (type: "json" | "csv") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "json" ? ".json" : ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (type === "json") {
          await importFromJSON(file);
        } else {
          await importFromCSV(file);
        }
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Daftar Kosakata</h1>
                <p className="text-sm text-muted-foreground">{filteredVocab.length} kata ditemukan</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => exportToJSON(vocabulary)}>
                <Download className="mr-2 h-4 w-4" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(vocabulary)}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleImport("json")}>
                <Upload className="mr-2 h-4 w-4" />
                Import JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleImport("csv")}>
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
              <AddWordDialog 
                onAdd={handleAdd} 
                editVocab={editingVocab ? {
                  id: editingVocab.id,
                  hanzi: editingVocab.hanzi,
                  pinyin: editingVocab.pinyin,
                  meaning: editingVocab.meaning,
                  hskLevel: editingVocab.hsk_level,
                  category: editingVocab.category,
                  mastered: editingVocab.progress?.mastered || false,
                } : null} 
                onClose={() => setEditingVocab(null)} 
              />
            </div>
          </div>
        </div>
      </header>

      <div className="border-b bg-card/50 sticky top-[73px] md:top-[81px] z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">HSK:</span>
              <Select value={filterHSK} onValueChange={setFilterHSK}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      HSK {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Kategori:</span>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Status:</span>
              <Select value={filterMastered} onValueChange={setFilterMastered}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="unmastered">Belum Hafal</SelectItem>
                  <SelectItem value="mastered">Sudah Hafal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVocab.map((vocab) => (
            <VocabularyCard
              key={vocab.id}
              vocab={{
                id: vocab.id,
                hanzi: vocab.hanzi,
                pinyin: vocab.pinyin,
                meaning: vocab.meaning,
                hskLevel: vocab.hsk_level,
                category: vocab.category,
                mastered: vocab.progress?.mastered || false,
              }}
              onEdit={handleEdit}
              onDelete={deleteVocabulary}
              onToggleMastered={handleToggleMastered}
            />
          ))}
        </div>

        {filteredVocab.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Tidak ada kata. Tambahkan kata pertama Anda!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default VocabularyPage;

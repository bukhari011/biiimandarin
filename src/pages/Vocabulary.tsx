import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VocabularyCard } from "@/components/VocabularyCard";
import { AddWordDialog } from "@/components/AddWordDialog";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { vocabularyData as initialData, categories, Vocabulary } from "@/data/vocabulary";
import { toast } from "sonner";

const VocabularyPage = () => {
  const navigate = useNavigate();
  const [vocabList, setVocabList] = useState<Vocabulary[]>(initialData);
  const [filterHSK, setFilterHSK] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("Semua");
  const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);

  const filteredVocab = vocabList.filter((vocab) => {
    const hskMatch = filterHSK === "all" || vocab.hskLevel.toString() === filterHSK;
    const categoryMatch = filterCategory === "Semua" || vocab.category === filterCategory;
    return hskMatch && categoryMatch;
  });

  const handleAdd = (newVocab: Omit<Vocabulary, "id">) => {
    if (editingVocab) {
      setVocabList(vocabList.map((v) => (v.id === editingVocab.id ? { ...newVocab, id: editingVocab.id } : v)));
      setEditingVocab(null);
    } else {
      const newId = (Math.max(...vocabList.map((v) => parseInt(v.id))) + 1).toString();
      setVocabList([...vocabList, { ...newVocab, id: newId }]);
    }
  };

  const handleDelete = (id: string) => {
    setVocabList(vocabList.filter((v) => v.id !== id));
    toast.success("Kata berhasil dihapus!");
  };

  const handleToggleMastered = (id: string) => {
    setVocabList(
      vocabList.map((v) => (v.id === id ? { ...v, mastered: !v.mastered } : v))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Daftar Kosakata</h1>
                <p className="text-sm text-muted-foreground">{filteredVocab.length} kata ditemukan</p>
              </div>
            </div>
            <AddWordDialog onAdd={handleAdd} editVocab={editingVocab} onClose={() => setEditingVocab(null)} />
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">HSK Level:</span>
              <Select value={filterHSK} onValueChange={setFilterHSK}>
                <SelectTrigger className="w-32">
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
                <SelectTrigger className="w-40">
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
          </div>
        </div>
      </div>

      {/* Vocabulary Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVocab.map((vocab) => (
            <VocabularyCard
              key={vocab.id}
              vocab={vocab}
              onEdit={setEditingVocab}
              onDelete={handleDelete}
              onToggleMastered={handleToggleMastered}
            />
          ))}
        </div>

        {filteredVocab.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Tidak ada kata yang ditemukan dengan filter ini.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default VocabularyPage;

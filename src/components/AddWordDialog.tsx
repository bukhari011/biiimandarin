import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Vocabulary, categories } from "@/data/vocabulary";
import { toast } from "sonner";

interface AddWordDialogProps {
  onAdd: (vocab: Omit<Vocabulary, "id">) => void;
  editVocab?: Vocabulary | null;
  onClose?: () => void;
}

export const AddWordDialog = ({ onAdd, editVocab, onClose }: AddWordDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    hanzi: editVocab?.hanzi || "",
    pinyin: editVocab?.pinyin || "",
    meaning: editVocab?.meaning || "",
    hskLevel: editVocab?.hskLevel.toString() || "1",
    category: editVocab?.category || categories[1],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hanzi || !formData.pinyin || !formData.meaning) {
      toast.error("Semua field harus diisi!");
      return;
    }

    onAdd({
      hanzi: formData.hanzi,
      pinyin: formData.pinyin,
      meaning: formData.meaning,
      hskLevel: parseInt(formData.hskLevel),
      category: formData.category,
      mastered: editVocab?.mastered || false,
    });

    toast.success(editVocab ? "Kata berhasil diupdate!" : "Kata baru berhasil ditambahkan!");
    setFormData({ hanzi: "", pinyin: "", meaning: "", hskLevel: "1", category: categories[1] });
    setOpen(false);
    if (onClose) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-soft">
          <Plus className="mr-2 h-4 w-4" />
          {editVocab ? "Edit Kata" : "Tambah Kata Baru"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editVocab ? "Edit Kosakata" : "Tambah Kosakata Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hanzi">Hanzi (汉字)</Label>
            <Input
              id="hanzi"
              value={formData.hanzi}
              onChange={(e) => setFormData({ ...formData, hanzi: e.target.value })}
              placeholder="你好"
              className="text-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pinyin">Pinyin</Label>
            <Input
              id="pinyin"
              value={formData.pinyin}
              onChange={(e) => setFormData({ ...formData, pinyin: e.target.value })}
              placeholder="nǐ hǎo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meaning">Arti (Bahasa Indonesia)</Label>
            <Input
              id="meaning"
              value={formData.meaning}
              onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
              placeholder="halo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hskLevel">Level HSK</Label>
              <Select value={formData.hskLevel} onValueChange={(value) => setFormData({ ...formData, hskLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      HSK {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.slice(1).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            {editVocab ? "Update Kata" : "Tambah Kata"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { useRef, useEffect, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Eraser, Pencil, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVocabulary } from "@/hooks/useVocabulary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const HanziPractice = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<"draw" | "erase">("draw");
  const [selectedVocabId, setSelectedVocabId] = useState<string>("");
  const { vocabulary } = useVocabulary();

  const selectedVocab = vocabulary.find((v) => v.id === selectedVocabId);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 400,
      backgroundColor: "#ffffff",
      isDrawingMode: true,
    });

    const brush = new PencilBrush(canvas);
    brush.color = "#000000";
    brush.width = 8;
    canvas.freeDrawingBrush = brush;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    if (activeTool === "draw") {
      const brush = new PencilBrush(fabricCanvas);
      brush.color = "#000000";
      brush.width = 8;
      fabricCanvas.freeDrawingBrush = brush;
      fabricCanvas.isDrawingMode = true;
    } else if (activeTool === "erase") {
      const brush = new PencilBrush(fabricCanvas);
      brush.color = "#ffffff";
      brush.width = 20;
      fabricCanvas.freeDrawingBrush = brush;
      fabricCanvas.isDrawingMode = true;
    }
  }, [activeTool, fabricCanvas]);

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    toast("Canvas dibersihkan!");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Latihan Menulis Hanzi</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Pilih Karakter</h2>
              <Select value={selectedVocabId} onValueChange={setSelectedVocabId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kata..." />
                </SelectTrigger>
                <SelectContent>
                  {vocabulary.map((vocab) => (
                    <SelectItem key={vocab.id} value={vocab.id}>
                      {vocab.hanzi} - {vocab.pinyin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedVocab && (
                <div className="mt-6 text-center">
                  <div className="text-8xl font-bold mb-4 text-primary">
                    {selectedVocab.hanzi}
                  </div>
                  <p className="text-xl text-muted-foreground mb-2">{selectedVocab.pinyin}</p>
                  <p className="text-lg">{selectedVocab.meaning}</p>
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={activeTool === "draw" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setActiveTool("draw")}
                  title="Pensil"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeTool === "erase" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setActiveTool("erase")}
                  title="Penghapus"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleClear} title="Bersihkan">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="border-2 border-dashed border-primary/30 rounded-lg overflow-hidden bg-white">
                <canvas ref={canvasRef} />
              </div>

              <p className="text-sm text-muted-foreground mt-4 text-center">
                Tulis karakter di canvas menggunakan mouse atau touchscreen
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HanziPractice;

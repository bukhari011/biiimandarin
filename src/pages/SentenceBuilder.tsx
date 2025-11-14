import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Shuffle, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVocabulary } from "@/hooks/useVocabulary";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ValidationResult {
  isCorrect: boolean;
  correctSentence: string;
  feedback: string;
  errors: string[];
}

const SentenceBuilder = () => {
  const navigate = useNavigate();
  const { vocabulary } = useVocabulary();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [targetSentence, setTargetSentence] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const generateChallenge = () => {
    // Pick 5-8 random words
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.floor(Math.random() * 4) + 5);
    const words = picked.map((v) => v.hanzi);
    
    setAvailableWords(words.sort(() => Math.random() - 0.5));
    setSelectedWords([]);
    setValidationResult(null);
    setTargetSentence(words.join(""));
  };

  const handleWordClick = (word: string, fromAvailable: boolean) => {
    if (fromAvailable) {
      setSelectedWords([...selectedWords, word]);
      setAvailableWords(availableWords.filter((w) => w !== word));
    } else {
      setAvailableWords([...availableWords, word]);
      setSelectedWords(selectedWords.filter((w) => w !== word));
    }
  };

  const validateSentence = async () => {
    if (selectedWords.length === 0) {
      toast.error("Rangkai kata terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const builtSentence = selectedWords.join("");
      const { data, error } = await supabase.functions.invoke("validate-sentence", {
        body: { 
          sentence: builtSentence,
          availableWords: [...selectedWords, ...availableWords]
        },
      });

      if (error) throw error;
      setValidationResult(data);
      
      if (data.isCorrect) {
        toast.success("Benar! 🎉");
      } else {
        toast.error("Belum tepat, coba lagi");
      }
    } catch (error: any) {
      console.error("Validation error:", error);
      toast.error(error.message || "Gagal memvalidasi kalimat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Rangkai Kalimat</h1>
          <Button onClick={() => navigate("/")} variant="outline" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Beranda
          </Button>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Rangkai kata menjadi kalimat yang benar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {availableWords.length === 0 && selectedWords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Klik tombol di bawah untuk memulai tantangan
                </p>
                <Button onClick={generateChallenge} size="lg">
                  <Shuffle className="mr-2 h-4 w-4" />
                  Mulai Tantangan
                </Button>
              </div>
            ) : (
              <>
                {/* Selected Words Area */}
                <div>
                  <p className="text-sm font-medium mb-2">Kalimat Kamu:</p>
                  <div className="min-h-[80px] p-4 border-2 border-dashed border-border rounded-lg bg-muted/30">
                    {selectedWords.length === 0 ? (
                      <p className="text-muted-foreground text-center">Klik kata di bawah untuk merangkai</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedWords.map((word, index) => (
                          <Badge
                            key={`${word}-${index}`}
                            className="text-2xl px-4 py-2 cursor-pointer hover:bg-destructive"
                            onClick={() => handleWordClick(word, false)}
                          >
                            {word}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Available Words */}
                <div>
                  <p className="text-sm font-medium mb-2">Kata yang Tersedia:</p>
                  <div className="flex flex-wrap gap-2 min-h-[60px]">
                    {availableWords.map((word, index) => (
                      <Badge
                        key={`${word}-${index}`}
                        variant="outline"
                        className="text-2xl px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleWordClick(word, true)}
                      >
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    onClick={validateSentence} 
                    disabled={loading || selectedWords.length === 0}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validasi...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Cek Kalimat
                      </>
                    )}
                  </Button>
                  <Button onClick={generateChallenge} variant="outline">
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Validation Result */}
        {validationResult && (
          <Card className={`shadow-medium ${validationResult.isCorrect ? 'border-success' : 'border-destructive'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validationResult.isCorrect ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-success" />
                    Benar!
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-destructive" />
                    Belum Tepat
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!validationResult.isCorrect && (
                <div>
                  <p className="text-sm font-medium mb-2">Kalimat yang Benar:</p>
                  <p className="text-2xl font-medium text-success">{validationResult.correctSentence}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium mb-2">Penjelasan:</p>
                <p className="text-muted-foreground whitespace-pre-line">{validationResult.feedback}</p>
              </div>

              {validationResult.errors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Kesalahan:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="text-sm text-muted-foreground">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={generateChallenge} className="w-full">
                Tantangan Berikutnya
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SentenceBuilder;

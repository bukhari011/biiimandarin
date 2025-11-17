import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shuffle, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVocabulary } from "@/hooks/useVocabulary";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ValidationResult {
  isCorrect: boolean;
  correctSentence: string;
  feedback: string;
  errors: string[];
  pointsEarned?: number;
}

interface WordWithDetails {
  hanzi: string;
  pinyin: string;
  meaning: string;
}

const SentenceBuilder = () => {
  const navigate = useNavigate();
  const { vocabulary } = useVocabulary();
  const [selectedWords, setSelectedWords] = useState<WordWithDetails[]>([]);
  const [availableWords, setAvailableWords] = useState<WordWithDetails[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_points")
      .select("total_points")
      .eq("user_id", user.id)
      .single();

    if (data) setPoints(data.total_points);
  };

  const generateChallenge = () => {
    // Pick 5-8 random words
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.floor(Math.random() * 4) + 5);
    const words = picked.map((v) => ({
      hanzi: v.hanzi,
      pinyin: v.pinyin,
      meaning: v.meaning,
    }));
    
    setAvailableWords(words.sort(() => Math.random() - 0.5));
    setSelectedWords([]);
    setValidationResult(null);
  };

  const handleWordClick = (word: WordWithDetails, fromAvailable: boolean) => {
    if (fromAvailable) {
      setSelectedWords([...selectedWords, word]);
      setAvailableWords(availableWords.filter((w) => w.hanzi !== word.hanzi));
    } else {
      setAvailableWords([...availableWords, word]);
      setSelectedWords(selectedWords.filter((w) => w.hanzi !== word.hanzi));
    }
  };

  const validateSentence = async () => {
    if (selectedWords.length === 0) {
      toast.error("Rangkai kata terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const builtSentence = selectedWords.map(w => w.hanzi).join("");
      const allWords = [...selectedWords, ...availableWords].map(w => w.hanzi);
      
      const { data, error } = await supabase.functions.invoke("validate-sentence", {
        body: { 
          sentence: builtSentence,
          availableWords: allWords
        },
      });

      if (error) throw error;
      setValidationResult(data);
      
      if (data.isCorrect) {
        toast.success("Benar! 🎉");
        await fetchPoints(); // Refresh points
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
    <div className="min-h-screen bg-background p-4 pt-20">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Rangkai Kalimat</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <Switch
                id="show-pinyin"
                checked={showPinyin}
                onCheckedChange={setShowPinyin}
              />
              <Label htmlFor="show-pinyin" className="text-sm whitespace-nowrap">
                Tampilkan Pinyin
              </Label>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Poin</p>
              <p className="text-xl font-bold text-primary">{points}</p>
            </div>
          </div>
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
                            key={`${word.hanzi}-${index}`}
                            className="text-lg sm:text-xl px-3 py-2 cursor-pointer hover:bg-destructive flex flex-col items-center"
                            onClick={() => handleWordClick(word, false)}
                          >
                            <span>{word.hanzi}</span>
                            {showPinyin && (
                              <span className="text-[10px] opacity-80">{word.pinyin}</span>
                            )}
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
                        key={`${word.hanzi}-${index}`}
                        variant="outline"
                        className="text-lg sm:text-xl px-3 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground flex flex-col items-center"
                        onClick={() => handleWordClick(word, true)}
                      >
                        <span>{word.hanzi}</span>
                        {showPinyin && (
                          <span className="text-[10px] opacity-80">{word.pinyin}</span>
                        )}
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
                  <p className="text-xl sm:text-2xl font-medium text-success break-words">{validationResult.correctSentence}</p>
                </div>
              )}
              
              {validationResult.pointsEarned && (
                <div className="p-4 bg-success/10 border border-success rounded-lg">
                  <p className="text-success font-semibold text-center">
                    🎉 +{validationResult.pointsEarned} Poin!
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium mb-2">Penjelasan:</p>
                <p className="text-muted-foreground whitespace-pre-line text-sm">{validationResult.feedback}</p>
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

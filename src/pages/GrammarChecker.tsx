import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Home, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GrammarError {
  type: "error" | "warning" | "suggestion";
  position: number;
  length: number;
  message: string;
  correction?: string;
}

interface GrammarResult {
  correctedText: string;
  errors: GrammarError[];
  explanation: string;
}

const GrammarChecker = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [loading, setLoading] = useState(false);

  const checkGrammar = async () => {
    if (!inputText.trim()) {
      toast.error("Masukkan kalimat untuk dicek");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-grammar", {
        body: { text: inputText },
      });

      if (error) throw error;
      setResult(data);
    } catch (error: any) {
      console.error("Grammar check error:", error);
      toast.error(error.message || "Gagal mengecek grammar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Cek Grammar</h1>
          <Button onClick={() => navigate("/")} variant="outline" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Beranda
          </Button>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Masukkan Kalimat Bahasa Mandarin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="我昨天去了书店买书..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={6}
              className="text-lg"
            />
            <Button onClick={checkGrammar} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengecek...
                </>
              ) : (
                "Cek Grammar"
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-4">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Kalimat yang Benar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-medium text-foreground">{result.correctedText}</p>
              </CardContent>
            </Card>

            {result.errors.length > 0 && (
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Kesalahan Ditemukan ({result.errors.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.errors.map((error, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-border bg-muted/50 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        {error.type === "error" && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Kesalahan
                          </Badge>
                        )}
                        {error.type === "warning" && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Peringatan
                          </Badge>
                        )}
                        {error.type === "suggestion" && (
                          <Badge variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Saran
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{error.message}</p>
                      {error.correction && (
                        <p className="text-sm">
                          <span className="font-semibold text-foreground">Perbaikan: </span>
                          <span className="text-success">{error.correction}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Penjelasan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{result.explanation}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarChecker;

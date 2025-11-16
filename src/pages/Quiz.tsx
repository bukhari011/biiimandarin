import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AudioButton } from "@/components/AudioButton";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useProgress } from "@/hooks/useProgress";
import { CheckCircle, XCircle, ArrowRight, Home } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface QuizQuestion {
  id: string;
  hanzi: string;
  pinyin: string;
  correctAnswer: string;
  options: string[];
}

const Quiz = () => {
  const { vocabulary, loading } = useVocabulary();
  const { updateProgress } = useProgress();
  const navigate = useNavigate();

  const [selectedHSK, setSelectedHSK] = useState<string>("all");
  const [showPinyin, setShowPinyin] = useState(true);
  const [quizMode, setQuizMode] = useState<"meaning" | "hanzi">("meaning");
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizCount, setQuizCount] = useState<string>("10");

  const filteredVocabulary = useMemo(() => {
    let filtered = vocabulary;

    if (selectedHSK !== "all") {
      const hskLevels = selectedHSK.split(",").map(Number);
      filtered = filtered.filter((v) => hskLevels.includes(v.hsk_level));
    }

    return filtered;
  }, [vocabulary, selectedHSK]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const startQuiz = () => {
    // Generate shuffled questions once at quiz start
    const count = parseInt(quizCount);
    const shuffled = [...filteredVocabulary]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(count, filteredVocabulary.length));

    const generatedQuestions = shuffled.map((vocab) => {
      if (quizMode === "meaning") {
        // Mode: Tebak arti dari hanzi
        const wrongAnswers = vocabulary
          .filter((v) => v.id !== vocab.id && v.hsk_level === vocab.hsk_level)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((v) => v.meaning);

        const options = [...wrongAnswers, vocab.meaning].sort(() => Math.random() - 0.5);

        return {
          id: vocab.id,
          hanzi: vocab.hanzi,
          pinyin: vocab.pinyin,
          correctAnswer: vocab.meaning,
          options,
        };
      } else {
        // Mode: Tebak hanzi dari arti
        const wrongAnswers = vocabulary
          .filter((v) => v.id !== vocab.id && v.hsk_level === vocab.hsk_level)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((v) => v.hanzi);

        const options = [...wrongAnswers, vocab.hanzi].sort(() => Math.random() - 0.5);

        return {
          id: vocab.id,
          hanzi: vocab.meaning, // Show meaning as question
          pinyin: vocab.pinyin,
          correctAnswer: vocab.hanzi,
          options,
        };
      }
    });

    setQuestions(generatedQuestions);
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setAnsweredCorrectly(null);
    setIsAnswerLocked(false);
  };

  const handleAnswerSelect = async (answer: string) => {
    if (isAnswerLocked || !currentQuestion) return;

    setIsAnswerLocked(true);
    setSelectedAnswer(answer);

    const isCorrect = answer === currentQuestion.correctAnswer;
    setAnsweredCorrectly(isCorrect);

    if (isCorrect) {
      setScore(score + 1);
      await updateProgress(currentQuestion.id, "easy");
    } else {
      await updateProgress(currentQuestion.id, "again");
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setAnsweredCorrectly(null);
      setIsAnswerLocked(false);
    } else {
      toast.success(`Quiz selesai! Skor: ${score + 1}/${questions.length}`);
      setQuizStarted(false);
    }
  };

  useEffect(() => {
    setQuizStarted(false);
  }, [selectedHSK]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quiz</h1>
            <Button onClick={() => navigate("/")} variant="outline" size="sm">
              <Home className="h-4 w-4" />
            </Button>
          </div>

          <Card className="shadow-medium">
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Level HSK</Label>
                <Select value={selectedHSK} onValueChange={setSelectedHSK}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih HSK" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua HSK</SelectItem>
                    <SelectItem value="1">HSK 1</SelectItem>
                    <SelectItem value="2">HSK 2</SelectItem>
                    <SelectItem value="3">HSK 3</SelectItem>
                    <SelectItem value="4">HSK 4</SelectItem>
                    <SelectItem value="5">HSK 5</SelectItem>
                    <SelectItem value="6">HSK 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Mode Quiz</Label>
                <Select value={quizMode} onValueChange={(val: "meaning" | "hanzi") => setQuizMode(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meaning">Tebak Arti dari Hanzi</SelectItem>
                    <SelectItem value="hanzi">Tebak Hanzi dari Arti</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Jumlah Soal</Label>
                <Select value={quizCount} onValueChange={setQuizCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Soal</SelectItem>
                    <SelectItem value="10">10 Soal</SelectItem>
                    <SelectItem value="15">15 Soal</SelectItem>
                    <SelectItem value="20">20 Soal</SelectItem>
                    <SelectItem value="30">30 Soal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch id="quiz-pinyin" checked={showPinyin} onCheckedChange={setShowPinyin} />
                <Label htmlFor="quiz-pinyin" className="text-sm">Tampilkan Pinyin</Label>
              </div>

              <Button onClick={startQuiz} size="lg" className="w-full">
                Mulai Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Quiz</h1>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Tidak ada kosa kata untuk quiz.</p>
              <Button onClick={() => setQuizStarted(false)} className="mt-4">
                Kembali
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")} variant="ghost" size="sm">
              <Home className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quiz</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Skor</p>
            <p className="text-2xl font-bold text-primary">{score}/{questions.length}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Pertanyaan {currentQuestionIndex + 1} dari {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="shadow-medium">
          <CardContent className="pt-8 pb-8 space-y-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-4xl md:text-6xl font-bold text-foreground">
                  {currentQuestion.hanzi}
                </h2>
                <AudioButton text={currentQuestion.pinyin} />
              </div>
              {showPinyin && quizMode === "meaning" && (
                <p className="text-xl md:text-2xl text-muted-foreground">{currentQuestion.pinyin}</p>
              )}
              <p className="text-lg text-muted-foreground pt-4">
                {quizMode === "meaning" ? "Pilih arti yang benar:" : "Pilih hanzi yang benar:"}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showResult = answeredCorrectly !== null;

                let buttonVariant: "outline" | "default" | "destructive" = "outline";
                let buttonClass = "";

                if (showResult) {
                  if (isCorrect) {
                    buttonVariant = "default";
                    buttonClass = "bg-success hover:bg-success border-success";
                  } else if (isSelected && !isCorrect) {
                    buttonVariant = "destructive";
                  }
                }

                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswerLocked}
                    variant={buttonVariant}
                    className={`h-auto py-4 text-lg justify-start text-left ${buttonClass}`}
                  >
                    <span className="flex items-center gap-3 w-full">
                      <span className="font-bold">{String.fromCharCode(65 + index)}.</span>
                      <span className="flex-1">{option}</span>
                      {showResult && isCorrect && <CheckCircle className="h-5 w-5" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5" />}
                    </span>
                  </Button>
                );
              })}
            </div>

            {/* Next Button */}
            {answeredCorrectly !== null && (
              <div className="flex justify-center pt-4">
                <Button onClick={handleNext} size="lg">
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>
                      Lanjut
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    "Lihat Hasil"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;

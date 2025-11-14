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
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

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

  const [selectedHSK, setSelectedHSK] = useState<string>("all");
  const [showPinyin, setShowPinyin] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

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
    const shuffled = [...filteredVocabulary]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    const generatedQuestions = shuffled.map((vocab) => {
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
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Quiz</h1>

          <Card className="shadow-medium">
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">Pilih Level HSK</Label>
                  <Select value={selectedHSK} onValueChange={setSelectedHSK}>
                    <SelectTrigger className="w-full">
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
                      <SelectItem value="1,2">HSK 1 & 2</SelectItem>
                      <SelectItem value="1,2,3">HSK 1, 2 & 3</SelectItem>
                      <SelectItem value="4,5,6">HSK 4, 5 & 6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="quiz-pinyin" checked={showPinyin} onCheckedChange={setShowPinyin} />
                  <Label htmlFor="quiz-pinyin">Tampilkan Pinyin</Label>
                </div>
              </div>

              <div className="text-center space-y-4 pt-4">
                <p className="text-muted-foreground">
                  Quiz terdiri dari 10 pertanyaan pilihan ganda acak
                </p>
                <Button onClick={startQuiz} size="lg" className="w-full sm:w-auto">
                  Mulai Quiz
                </Button>
              </div>
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quiz</h1>
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
              {showPinyin && (
                <p className="text-xl md:text-2xl text-muted-foreground">{currentQuestion.pinyin}</p>
              )}
              <p className="text-lg text-muted-foreground pt-4">Pilih arti yang benar:</p>
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

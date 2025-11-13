import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useProgress } from "@/hooks/useProgress";
import { supabase } from "@/integrations/supabase/client";

interface QuizQuestion {
  vocabularyId: string;
  hanzi: string;
  pinyin: string;
  options: string[];
  correctAnswer: string;
}

const QuizPage = () => {
  const navigate = useNavigate();
  const { vocabulary, loading } = useVocabulary();
  const { updateProgress, checkAchievements } = useProgress();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (vocabulary.length >= 4) {
      generateQuestions();
    }
  }, [vocabulary]);

  const generateQuestions = () => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    const quizQuestions = shuffled.slice(0, Math.min(10, shuffled.length)).map((vocab) => {
      const wrongOptions = vocabulary
        .filter((v) => v.id !== vocab.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((v) => v.meaning);

      const options = [...wrongOptions, vocab.meaning].sort(() => Math.random() - 0.5);

      return {
        vocabularyId: vocab.id,
        hanzi: vocab.hanzi,
        pinyin: vocab.pinyin,
        options,
        correctAnswer: vocab.meaning,
      };
    });

    setQuestions(quizQuestions);
  };

  const handleAnswer = async (answer: string) => {
    if (answered) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
      await updateProgress(questions[currentQuestionIndex].vocabularyId, "easy");
      toast.success("Benar! 🎉");
    } else {
      await updateProgress(questions[currentQuestionIndex].vocabularyId, "again");
      toast.error("Salah! Coba lagi di lain waktu.");
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setShowResult(true);
    
    if (score === questions.length) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: achievement } = await supabase
          .from("achievements")
          .select("id")
          .eq("condition_type", "perfect_quiz")
          .single();

        if (achievement) {
          const { error } = await supabase
            .from("user_achievements")
            .insert({ user_id: user.id, achievement_id: achievement.id })
            .select()
            .single();

          if (!error) {
            toast.success("🎉 Achievement unlocked: Perfeksionis!");
          }
        }
      }
    }

    await checkAchievements();
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswered(false);
    generateQuestions();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (vocabulary.length < 4) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Tambahkan minimal 4 kata untuk mulai quiz</p>
          <Button onClick={() => navigate("/vocabulary")}>Tambah Kata</Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Quiz Mandarin</h1>
                <p className="text-sm text-muted-foreground">
                  {!showResult ? `Pertanyaan ${currentQuestionIndex + 1} dari ${questions.length}` : "Hasil Quiz"}
                </p>
              </div>
            </div>
            {!showResult && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Skor</p>
                <p className="text-2xl font-bold text-primary">{score}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {!showResult ? (
            <div className="space-y-6 animate-fade-in">
              <Progress value={progress} className="h-2" />

              <Card className="shadow-strong">
                <CardHeader>
                  <CardTitle className="text-center">
                    <div className="text-5xl font-bold text-foreground mb-4">{currentQuestion.hanzi}</div>
                    <div className="text-xl text-muted-foreground">{currentQuestion.pinyin}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-center text-muted-foreground mb-4">Pilih arti yang benar:</p>
                  {currentQuestion.options.map((option, index) => {
                    const isCorrect = option === currentQuestion.correctAnswer;
                    const isSelected = option === selectedAnswer;
                    const showFeedback = answered && (isSelected || isCorrect);

                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className={`w-full h-auto py-4 text-lg justify-start transition-smooth ${
                          showFeedback
                            ? isCorrect
                              ? "bg-success/10 border-success text-success hover:bg-success/20"
                              : isSelected
                              ? "bg-destructive/10 border-destructive text-destructive"
                              : ""
                            : "hover:bg-primary/5"
                        }`}
                        onClick={() => handleAnswer(option)}
                        disabled={answered}
                      >
                        <span className="flex-1 text-left">{option}</span>
                        {showFeedback && isCorrect && <CheckCircle className="h-5 w-5 ml-2" />}
                        {showFeedback && isSelected && !isCorrect && <XCircle className="h-5 w-5 ml-2" />}
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>

              {answered && (
                <Button onClick={handleNext} size="lg" className="w-full">
                  {currentQuestionIndex < questions.length - 1 ? "Pertanyaan Selanjutnya" : "Lihat Hasil"}
                </Button>
              )}
            </div>
          ) : (
            <Card className="shadow-strong animate-scale-in">
              <CardHeader>
                <CardTitle className="text-center text-3xl">Hasil Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-7xl font-bold text-primary mb-4">
                    {score}/{questions.length}
                  </div>
                  <p className="text-xl text-muted-foreground mb-2">
                    Persentase: {Math.round((score / questions.length) * 100)}%
                  </p>
                  <p className="text-lg text-foreground">
                    {score === questions.length
                      ? "Sempurna! 🎉 Anda luar biasa!"
                      : score >= questions.length * 0.7
                      ? "Bagus! 👏 Terus tingkatkan!"
                      : "Tetap semangat! 💪 Belajar lebih giat lagi!"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleRestart} className="flex-1" size="lg">
                    Coba Lagi
                  </Button>
                  <Button onClick={() => navigate("/")} variant="outline" className="flex-1" size="lg">
                    Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizPage;

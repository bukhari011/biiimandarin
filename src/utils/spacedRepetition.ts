import { Difficulty, Vocabulary } from "@/data/vocabulary";

// Spaced Repetition Algorithm based on SuperMemo SM-2
export const calculateNextReview = (
  difficulty: Difficulty,
  currentEaseFactor: number = 2.5,
  reviewCount: number = 0
): { nextReviewDate: Date; newEaseFactor: number; interval: number } => {
  const now = new Date();
  let interval = 0;
  let newEaseFactor = currentEaseFactor;

  // Calculate new ease factor based on difficulty
  switch (difficulty) {
    case "again":
      newEaseFactor = Math.max(1.3, currentEaseFactor - 0.2);
      interval = 1; // Review tomorrow
      break;
    case "hard":
      newEaseFactor = Math.max(1.3, currentEaseFactor - 0.15);
      interval = reviewCount === 0 ? 1 : Math.ceil(reviewCount * 1.2);
      break;
    case "medium":
      interval = reviewCount === 0 ? 1 : reviewCount === 1 ? 3 : Math.ceil(reviewCount * newEaseFactor);
      break;
    case "easy":
      newEaseFactor = currentEaseFactor + 0.1;
      interval = reviewCount === 0 ? 3 : Math.ceil(reviewCount * newEaseFactor * 1.3);
      break;
  }

  // Calculate next review date
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return { nextReviewDate, newEaseFactor, interval };
};

export const isDueForReview = (vocab: Vocabulary): boolean => {
  if (!vocab.nextReview) return true;
  return new Date() >= new Date(vocab.nextReview);
};

export const getReviewStats = (vocabularyList: Vocabulary[]) => {
  const now = new Date();
  const dueToday = vocabularyList.filter((v) => isDueForReview(v));
  const reviewedToday = vocabularyList.filter((v) => {
    if (!v.lastReviewed) return false;
    const lastReview = new Date(v.lastReviewed);
    return (
      lastReview.getDate() === now.getDate() &&
      lastReview.getMonth() === now.getMonth() &&
      lastReview.getFullYear() === now.getFullYear()
    );
  });

  return {
    dueToday: dueToday.length,
    reviewedToday: reviewedToday.length,
    totalReviews: vocabularyList.reduce((sum, v) => sum + (v.reviewCount || 0), 0),
  };
};

// Generate mock historical data for charts
export const generateHistoricalData = (days: number = 7) => {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

    data.push({
      date: dateStr,
      reviewed: Math.floor(Math.random() * 15) + 5,
      mastered: Math.floor(Math.random() * 8) + 2,
      newWords: Math.floor(Math.random() * 5) + 1,
    });
  }

  return data;
};

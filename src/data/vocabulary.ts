export type Difficulty = "easy" | "medium" | "hard" | "again";

export interface Vocabulary {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  hskLevel: number;
  category: string;
  mastered: boolean;
  difficulty?: Difficulty;
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount?: number;
  easeFactor?: number; // For spaced repetition algorithm
}

export const vocabularyData: Vocabulary[] = [
  { id: "1", hanzi: "你好", pinyin: "nǐ hǎo", meaning: "halo", hskLevel: 1, category: "Salam", mastered: true },
  { id: "2", hanzi: "谢谢", pinyin: "xiè xie", meaning: "terima kasih", hskLevel: 1, category: "Salam", mastered: true },
  { id: "3", hanzi: "再见", pinyin: "zài jiàn", meaning: "selamat tinggal", hskLevel: 1, category: "Salam", mastered: false },
  { id: "4", hanzi: "对不起", pinyin: "duì bu qǐ", meaning: "maaf", hskLevel: 1, category: "Salam", mastered: false },
  { id: "5", hanzi: "我", pinyin: "wǒ", meaning: "saya", hskLevel: 1, category: "Kata Ganti", mastered: true },
  { id: "6", hanzi: "你", pinyin: "nǐ", meaning: "kamu", hskLevel: 1, category: "Kata Ganti", mastered: true },
  { id: "7", hanzi: "他", pinyin: "tā", meaning: "dia (laki-laki)", hskLevel: 1, category: "Kata Ganti", mastered: false },
  { id: "8", hanzi: "水", pinyin: "shuǐ", meaning: "air", hskLevel: 1, category: "Makanan", mastered: false },
  { id: "9", hanzi: "茶", pinyin: "chá", meaning: "teh", hskLevel: 1, category: "Makanan", mastered: true },
  { id: "10", hanzi: "饭", pinyin: "fàn", meaning: "nasi", hskLevel: 1, category: "Makanan", mastered: false },
  { id: "11", hanzi: "学习", pinyin: "xué xí", meaning: "belajar", hskLevel: 2, category: "Aktivitas", mastered: false },
  { id: "12", hanzi: "工作", pinyin: "gōng zuò", meaning: "bekerja", hskLevel: 2, category: "Aktivitas", mastered: false },
  { id: "13", hanzi: "朋友", pinyin: "péng you", meaning: "teman", hskLevel: 2, category: "Hubungan", mastered: true },
  { id: "14", hanzi: "老师", pinyin: "lǎo shī", meaning: "guru", hskLevel: 2, category: "Profesi", mastered: false },
  { id: "15", hanzi: "学生", pinyin: "xué sheng", meaning: "siswa", hskLevel: 2, category: "Profesi", mastered: true },
];

export const categories = ["Semua", "Salam", "Kata Ganti", "Makanan", "Aktivitas", "Hubungan", "Profesi"];

export const hskLevels = [
  { level: 1, name: "HSK 1", total: 150, mastered: 0 },
  { level: 2, name: "HSK 2", total: 300, mastered: 0 },
  { level: 3, name: "HSK 3", total: 600, mastered: 0 },
  { level: 4, name: "HSK 4", total: 1200, mastered: 0 },
  { level: 5, name: "HSK 5", total: 2500, mastered: 0 },
  { level: 6, name: "HSK 6", total: 5000, mastered: 0 },
];

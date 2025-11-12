import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Calendar, Target } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { vocabularyData } from "@/data/vocabulary";
import { getReviewStats, generateHistoricalData } from "@/utils/spacedRepetition";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const StatisticsPage = () => {
  const navigate = useNavigate();
  const reviewStats = getReviewStats(vocabularyData);
  const historicalData = generateHistoricalData(7);

  // HSK Level distribution
  const hskData = [1, 2, 3, 4, 5, 6].map((level) => ({
    level: `HSK ${level}`,
    count: vocabularyData.filter((v) => v.hskLevel === level).length,
  }));

  // Mastery distribution
  const masteryData = [
    { name: "Sudah Hafal", value: vocabularyData.filter((v) => v.mastered).length, color: "#10b981" },
    { name: "Sedang Belajar", value: vocabularyData.filter((v) => !v.mastered).length, color: "#f59e0b" },
  ];

  // Category distribution
  const categoryData = vocabularyData.reduce((acc, vocab) => {
    const existing = acc.find((item) => item.category === vocab.category);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ category: vocab.category, count: 1 });
    }
    return acc;
  }, [] as { category: string; count: number }[]);

  const COLORS = ["#ef4444", "#06b6d4", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Statistik Belajar</h1>
              <p className="text-sm text-muted-foreground">Pantau progress dan pencapaian Anda</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <StatsCard title="Review Hari Ini" value={reviewStats.reviewedToday} icon={Calendar} variant="primary" />
          <StatsCard title="Perlu Review" value={reviewStats.dueToday} icon={Target} variant="secondary" />
          <StatsCard title="Total Reviews" value={reviewStats.totalReviews} icon={TrendingUp} variant="accent" />
        </div>

        {/* Progress Line Chart */}
        <Card className="shadow-soft animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progress 7 Hari Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="reviewed" stroke="#ef4444" strokeWidth={2} name="Kata Direview" />
                <Line type="monotone" dataKey="mastered" stroke="#10b981" strokeWidth={2} name="Kata Dihafal" />
                <Line type="monotone" dataKey="newWords" stroke="#06b6d4" strokeWidth={2} name="Kata Baru" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HSK Level Bar Chart */}
          <Card className="shadow-soft animate-fade-in">
            <CardHeader>
              <CardTitle>Distribusi HSK Level</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hskData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="level" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Mastery Pie Chart */}
          <Card className="shadow-soft animate-fade-in">
            <CardHeader>
              <CardTitle>Status Penguasaan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={masteryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {masteryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Distribution */}
        <Card className="shadow-soft animate-fade-in">
          <CardHeader>
            <CardTitle>Distribusi Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StatisticsPage;

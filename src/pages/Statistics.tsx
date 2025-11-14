import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVocabulary } from "@/hooks/useVocabulary";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  success: "hsl(var(--success))",
  muted: "hsl(var(--muted-foreground))",
};

const Statistics = () => {
  const { vocabulary, loading } = useVocabulary();

  // HSK Level Distribution
  const hskDistribution = useMemo(() => {
    const distribution = [1, 2, 3, 4, 5, 6].map((level) => ({
      level: `HSK ${level}`,
      total: vocabulary.filter((v) => v.hsk_level === level).length,
      mastered: vocabulary.filter((v) => v.hsk_level === level && v.progress?.mastered).length,
      learning: vocabulary.filter((v) => v.hsk_level === level && !v.progress?.mastered).length,
    }));
    return distribution;
  }, [vocabulary]);

  // Category Distribution
  const categoryDistribution = useMemo(() => {
    const categories = [...new Set(vocabulary.map((v) => v.category))];
    return categories.map((cat) => ({
      name: cat,
      value: vocabulary.filter((v) => v.category === cat).length,
    }));
  }, [vocabulary]);

  // Mastery Overview
  const masteryData = useMemo(() => {
    const mastered = vocabulary.filter((v) => v.progress?.mastered).length;
    const learning = vocabulary.length - mastered;
    return [
      { name: "Sudah Hafal", value: mastered },
      { name: "Sedang Belajar", value: learning },
    ];
  }, [vocabulary]);

  // Weekly Progress (Mock data - could be enhanced with actual review history)
  const weeklyProgress = useMemo(() => {
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    return days.map((day, index) => ({
      day,
      reviewed: Math.floor(Math.random() * 20) + 5,
      mastered: Math.floor(Math.random() * 10) + 2,
    }));
  }, []);

  const chartConfig = {
    total: {
      label: "Total",
      color: COLORS.primary,
    },
    mastered: {
      label: "Sudah Hafal",
      color: COLORS.success,
    },
    learning: {
      label: "Sedang Belajar",
      color: COLORS.secondary,
    },
    reviewed: {
      label: "Direview",
      color: COLORS.accent,
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Memuat statistik...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Statistik</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Kosa Kata</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{vocabulary.length}</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Sudah Hafal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">
                {vocabulary.filter((v) => v.progress?.mastered).length}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Sedang Belajar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">
                {vocabulary.filter((v) => !v.progress?.mastered).length}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Tingkat Penguasaan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {vocabulary.length > 0
                  ? Math.round((vocabulary.filter((v) => v.progress?.mastered).length / vocabulary.length) * 100)
                  : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HSK Level Distribution */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Distribusi Level HSK</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hskDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="level" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="mastered" fill={COLORS.success} name="Sudah Hafal" />
                    <Bar dataKey="learning" fill={COLORS.secondary} name="Sedang Belajar" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Mastery Pie Chart */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Status Penguasaan</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={masteryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {masteryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.success : COLORS.secondary} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Progress Mingguan</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="reviewed" 
                      stroke={COLORS.accent} 
                      strokeWidth={2}
                      name="Direview"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mastered" 
                      stroke={COLORS.success} 
                      strokeWidth={2}
                      name="Dikuasai"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Distribusi Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="hsl(var(--muted-foreground))"
                      width={100}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill={COLORS.primary} name="Jumlah" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

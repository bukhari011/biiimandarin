import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, BookOpen, BookMarked, Brain, Pencil, BarChart3, CheckCircle, Type, Award, Users, Plus, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/mandarin-zero-logo.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    if (user) {
      fetchStreak();
      fetchPoints();
    }
  };

  const fetchStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_streaks")
      .select("current_streak")
      .eq("user_id", user.id)
      .single();

    if (data) setStreak(data.current_streak);
  };

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Berhasil logout!");
    setIsAuthenticated(false);
    navigate("/auth");
  };

  const menuItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/vocabulary", label: "Kosakata", icon: BookOpen },
    { path: "/flashcards", label: "Flashcard", icon: BookMarked },
    { path: "/quiz", label: "Quiz", icon: Brain },
    { path: "/hanzi-practice", label: "Tulis Hanzi", icon: Pencil },
    { path: "/grammar-checker", label: "Cek Grammar", icon: CheckCircle },
    { path: "/sentence-builder", label: "Rangkai Kalimat", icon: Type },
    { path: "/statistics", label: "Statistik", icon: BarChart3 },
    { path: "/achievements", label: "Achievements", icon: Award },
    { path: "/leaderboard", label: "Leaderboard", icon: Users },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-card border-b shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div 
            onClick={() => handleNavigate("/")}
            className="cursor-pointer group flex items-center gap-2"
          >
            <img 
              src={logo} 
              alt="Mandarin Zero" 
              className="h-10 w-10 md:h-12 md:w-12 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" 
            />
            <span className="text-lg md:text-xl font-bold text-foreground hidden sm:inline transition-colors duration-300 group-hover:text-primary">
              Mandarin Zero
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {isAuthenticated && (
              <>
                <div className="hidden md:flex items-center gap-4 mr-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">🔥</span>
                    <span className="font-semibold text-foreground">{streak}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">⭐</span>
                    <span className="font-semibold text-foreground">{points}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleNavigate("/leaderboard")} 
                  variant="ghost" 
                  size="sm"
                  className="hidden lg:flex"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Leaderboard
                </Button>
                
                <Button 
                  onClick={() => handleNavigate("/vocabulary")} 
                  variant="default" 
                  size="sm"
                  className="hidden lg:flex"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah
                </Button>

                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  size="sm"
                  className="hidden lg:flex"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            )}

            <ThemeToggle />
            
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                {isAuthenticated && (
                  <div className="mb-6 pb-4 border-b">
                    <div className="flex items-center justify-around">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🔥</span>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Streak</span>
                          <span className="font-bold text-foreground">{streak} hari</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⭐</span>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Poin</span>
                          <span className="font-bold text-foreground">{points}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col gap-2 mt-8">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Button
                        key={item.path}
                        variant={isActive ? "default" : "ghost"}
                        className="justify-start gap-3 w-full"
                        onClick={() => handleNavigate(item.path)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Button>
                    );
                  })}
                  
                  {isAuthenticated && (
                    <>
                      <div className="my-2 border-t" />
                      <Button
                        variant="ghost"
                        className="justify-start gap-3 w-full lg:hidden"
                        onClick={() => {
                          handleNavigate("/vocabulary");
                          setOpen(false);
                        }}
                      >
                        <Plus className="h-5 w-5" />
                        <span>Tambah Kosakata</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start gap-3 w-full"
                        onClick={() => {
                          handleLogout();
                          setOpen(false);
                        }}
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

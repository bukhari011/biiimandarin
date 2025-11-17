import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, BookOpen, BookMarked, Brain, Pencil, BarChart3, CheckCircle, Type, Award, Users } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/mandarin-zero-logo.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

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
        <div className="flex items-center justify-between h-14">
          <div 
            onClick={() => handleNavigate("/")}
            className="cursor-pointer hover:opacity-80 transition-smooth flex items-center gap-2"
          >
            <img src={logo} alt="Mandarin Zero" className="h-10 w-10" />
            <span className="text-lg md:text-xl font-bold text-foreground hidden sm:inline">
              Mandarin Zero
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

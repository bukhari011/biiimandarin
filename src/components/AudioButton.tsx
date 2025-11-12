import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

interface AudioButtonProps {
  text: string;
  lang?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const AudioButton = ({ 
  text, 
  lang = "zh-CN", 
  variant = "ghost", 
  size = "icon",
  className = "" 
}: AudioButtonProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Browser Anda tidak mendukung text-to-speech");
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8; // Slower for better pronunciation
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      console.error("Speech error:", event);
      toast.error("Gagal memutar audio");
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={isSpeaking ? stopSpeaking : speak}
      className={className}
      title={isSpeaking ? "Stop audio" : "Putar audio"}
    >
      {isSpeaking ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
};

import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationSettings = () => {
  const { enabled, toggleNotifications, sendTestNotification } = useNotifications();

  return (
    <div className="bg-card p-6 rounded-lg shadow-soft border space-y-4">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Bell className="h-5 w-5" />
        Pengaturan Notifikasi
      </h2>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="notifications" className="text-base font-medium">Reminder Harian</Label>
          <p className="text-sm text-muted-foreground">Terima notifikasi reminder setiap hari jam 9 pagi</p>
        </div>
        <Switch
          id="notifications"
          checked={enabled}
          onCheckedChange={toggleNotifications}
        />
      </div>
      {enabled && (
        <Button onClick={sendTestNotification} variant="outline" size="sm">
          Test Notifikasi
        </Button>
      )}
    </div>
  );
};

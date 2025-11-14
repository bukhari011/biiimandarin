import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      const savedEnabled = localStorage.getItem("notifications-enabled") === "true";
      setEnabled(savedEnabled && Notification.permission === "granted");
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Browser tidak mendukung notifikasi");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        setEnabled(true);
        localStorage.setItem("notifications-enabled", "true");
        toast.success("Notifikasi diaktifkan!");
        scheduleNotification();
        return true;
      } else {
        toast.error("Izin notifikasi ditolak");
        return false;
      }
    } catch (error) {
      toast.error("Gagal meminta izin notifikasi");
      return false;
    }
  };

  const toggleNotifications = async () => {
    if (!enabled) {
      await requestPermission();
    } else {
      setEnabled(false);
      localStorage.setItem("notifications-enabled", "false");
      toast.success("Notifikasi dinonaktifkan");
    }
  };

  const scheduleNotification = () => {
    const lastNotification = localStorage.getItem("last-notification");
    const now = new Date();
    
    if (lastNotification) {
      const lastDate = new Date(lastNotification);
      const hoursSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSince < 24) {
        return; // Already notified today
      }
    }

    // Schedule for 9 AM tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const timeUntil = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      sendNotification();
      // Reschedule for next day
      scheduleNotification();
    }, timeUntil);
  };

  const sendNotification = () => {
    if (enabled && permission === "granted") {
      new Notification("Mandarin Learning Reminder 📚", {
        body: "Jangan lupa review kosa kata hari ini! 加油!",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
      localStorage.setItem("last-notification", new Date().toISOString());
    }
  };

  const sendTestNotification = () => {
    if (permission === "granted") {
      new Notification("Test Notification ✅", {
        body: "Notifikasi berhasil! Kamu akan menerima reminder setiap hari jam 9 pagi.",
        icon: "/favicon.ico",
      });
    }
  };

  useEffect(() => {
    if (enabled && permission === "granted") {
      scheduleNotification();
    }
  }, [enabled, permission]);

  return {
    permission,
    enabled,
    toggleNotifications,
    sendTestNotification,
  };
};

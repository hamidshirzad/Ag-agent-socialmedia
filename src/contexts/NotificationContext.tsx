import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { collection, query, where, onSnapshot, orderBy, addDoc, updateDoc, doc, getDocs, writeBatch, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import { AppNotification, Toast, Lead } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Sparkles, Check, X, CreditCard, Star, Flame, AlertCircle, Info } from "lucide-react";
import { cn } from "../lib/utils";

interface NotificationContextProps {
  notifications: AppNotification[];
  toasts: Toast[];
  unreadCount: number;
  addToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  addNotification: (title: string, message: string, type: "lead" | "billing" | "system", meta?: any) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  simulateHighQualityLead: () => Promise<void>;
  simulateBillingUpdate: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const existingLeadIds = useRef<Set<string>>(new Set());
  const isFirstLeadsSnapshot = useRef(true);
  const previousPlan = useRef<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Transient Toast Generator
  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration || 5000);
    }
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Persistent Notification Generator (Firestore-backed)
  const addNotification = async (
    title: string,
    message: string,
    type: "lead" | "billing" | "system",
    meta?: any
  ) => {
    if (!user) return;

    try {
      const userNotificationsRef = collection(db, "users", user.uid, "notifications");
      await addDoc(userNotificationsRef, {
        userId: user.uid,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString(),
        meta: meta || null,
      });

      // Also trigger a local toast for instant high-visibility feedback
      let toastType: "success" | "info" | "warning" | "error" = "info";
      if (type === "lead") toastType = "success";
      if (type === "billing") toastType = "info";

      addToast({
        title,
        message,
        type: toastType,
      });
    } catch (error) {
      console.error("Error creating notification in Firestore:", error);
      // Fallback transient toast in case of write permission issues or offline state
      addToast({
        title,
        message,
        type: "warning",
      });
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
      const notificationRef = doc(db, "users", user.uid, "notifications", id);
      await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((notif) => {
        if (!notif.isRead) {
          const notifRef = doc(db, "users", user.uid, "notifications", notif.id);
          batch.update(notifRef, { isRead: true });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const clearAllNotifications = async () => {
    if (!user || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((notif) => {
        const notifRef = doc(db, "users", user.uid, "notifications", notif.id);
        batch.delete(notifRef);
      });
      await batch.commit();
      addToast({
        title: "Notifications Cleared",
        message: "Successfully deleted all historic telemetry notifications.",
        type: "info",
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // 1. Sync Persistent Notifications from Firestore
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AppNotification[];
        setNotifications(data);
      },
      (error) => {
        console.error("Error syncing notifications from Firestore:", error);
      }
    );

    return unsubscribe;
  }, [user]);

  // 2. Listen to Leads Collection for Real-Time High-Quality Lead Generation
  useEffect(() => {
    if (!user) {
      existingLeadIds.current.clear();
      isFirstLeadsSnapshot.current = true;
      return;
    }

    const q = query(collection(db, "leads"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newLeadsToAlert: Lead[] = [];

        snapshot.docChanges().forEach((change) => {
          const lead = { id: change.doc.id, ...change.doc.data() } as Lead;

          if (change.type === "added") {
            // Check if it exists in our session set of leads
            if (!existingLeadIds.current.has(lead.id)) {
              if (!isFirstLeadsSnapshot.current && lead.score >= 80) {
                newLeadsToAlert.push(lead);
              }
              existingLeadIds.current.add(lead.id);
            }
          }
        });

        // Mark initialization phase complete
        isFirstLeadsSnapshot.current = false;

        // Dispatch alert notifications
        newLeadsToAlert.forEach((lead) => {
          addNotification(
            "High-Quality Lead Identified!",
            `Neural Scoring matched criteria: ${lead.name} via ${lead.source || "organic channels"} scored ${lead.score}/100.`,
            "lead",
            { leadId: lead.id, leadName: lead.name, score: lead.score }
          );
        });
      },
      (error) => {
        console.error("Error listening to leads collection:", error);
      }
    );

    return unsubscribe;
  }, [user]);

  // 3. Monitor Plan & Subscription Upgrades
  useEffect(() => {
    if (!profile) {
      previousPlan.current = null;
      return;
    }

    const currentPlan = profile.plan || "free";
    if (previousPlan.current !== null && previousPlan.current !== currentPlan) {
      addNotification(
        "Billing Configuration Updated",
        `Your business workspace has been upgraded to the ${currentPlan.toUpperCase()} Neural Node.`,
        "billing",
        { plan: currentPlan }
      );
    }

    previousPlan.current = currentPlan;
  }, [profile?.plan]);

  // Simulation Engines
  const simulateHighQualityLead = async () => {
    if (!user) {
      addToast({
        title: "Simulation Denied",
        message: "You must be authenticated to launch lead ingestion.",
        type: "error",
      });
      return;
    }

    const firstNames = ["Aura", "Daxon", "Kaelen", "Lyra", "Vahn", "Soren", "Elysia", "Zane"];
    const lastNames = ["Sterling", "Vex", "Kincaid", "Solas", "Novak", "Drake", "Bane", "Valor"];
    const techCompanies = ["Apex Neural", "Helios Energy", "Pharos Digital", "Voltaic AI", "Omni Systems", "Aether Labs"];
    const sources = ["Inbound Webhook", "LinkedIn Outreach", "Cold Ingestion", "Webinar Relay"];

    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const randomCompany = techCompanies[Math.floor(Math.random() * techCompanies.length)];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    const randomScore = Math.floor(Math.random() * 15) + 85; // High Quality: 85 - 100

    try {
      await addDoc(collection(db, "leads"), {
        userId: user.uid,
        name: randomName,
        email: `${randomName.toLowerCase().replace(/\s+/g, ".")}@${randomCompany.toLowerCase().replace(/\s+/g, "")}.io`,
        score: randomScore,
        status: "qualified",
        source: `${randomSource} (${randomCompany})`,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Simulated lead creation failed in Firestore; generating client-side mock:", e);
      // Client-side fallback if firestore fails
      addToast({
        title: "High-Quality Lead Identified!",
        message: `[Demo Sandbox] ${randomName} via ${randomSource} (${randomCompany}) scored ${randomScore}/100!`,
        type: "success",
      });
    }
  };

  const simulateBillingUpdate = async () => {
    if (!user) {
      addToast({
        title: "Simulation Denied",
        message: "Authentication required to trigger billing updates.",
        type: "error",
      });
      return;
    }

    const plans = ["starter", "pro", "agency"];
    const currentPlan = profile?.plan || "starter";
    const nextPlan = plans.find((p) => p !== currentPlan) || "pro";

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        plan: nextPlan,
        subscriptionStatus: "active",
      });
    } catch (e) {
      console.warn("Failed updating plan in Firestore; generating client fallback toast:", e);
      addToast({
        title: "Billing Configuration Updated",
        message: `[Demo Sandbox] Workspace upgraded to ${nextPlan.toUpperCase()} Edition!`,
        type: "info",
      });
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        unreadCount,
        addToast,
        dismissToast,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAllNotifications,
        simulateHighQualityLead,
        simulateBillingUpdate,
      }}
    >
      {children}

      {/* Global Animated Toast Render Layer */}
      <div className="fixed top-8 right-8 z-[9999] flex flex-col gap-4 max-w-[42rem] w-full pointer-events-none select-none font-sans">
        <AnimatePresence>
          {toasts.map((toast) => {
            let iconElement = <Info className="text-sb-accent" size={18} />;
            let borderColorClass = "border-sb-accent/20";
            let iconBgClass = "bg-sb-accent/10";
            
            if (toast.type === "success") {
              iconElement = <Star className="text-sb-gold fill-current" size={18} />;
              borderColorClass = "border-sb-gold/30";
              iconBgClass = "bg-sb-gold/10";
            } else if (toast.type === "warning") {
              iconElement = <AlertCircle className="text-amber-500" size={18} />;
              borderColorClass = "border-amber-500/20";
              iconBgClass = "bg-amber-500/10";
            } else if (toast.type === "error") {
              iconElement = <X className="text-red-500" size={18} />;
              borderColorClass = "border-red-500/20";
              iconBgClass = "bg-red-500/10";
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                className={cn(
                  "pointer-events-auto bg-white/95 border backdrop-blur-md rounded-[12px] p-6 shadow-2xl flex items-start gap-4 transition-all relative overflow-hidden",
                  borderColorClass
                )}
              >
                {/* Visual Top Highlight bar */}
                <div 
                  className={cn(
                    "absolute top-0 left-0 right-0 h-1",
                    toast.type === "success" ? "bg-sb-gold" : toast.type === "error" ? "bg-red-500" : "bg-sb-accent"
                  )}
                />

                <div className={cn("p-3 rounded-full shrink-0", iconBgClass)}>
                  {iconElement}
                </div>

                <div className="flex-1 pr-6 pt-1 text-black">
                  <h4 className="font-bold text-[1.4rem] tracking-tight uppercase leading-snug mb-1">
                    {toast.title}
                  </h4>
                  <p className="text-[1.25rem] text-black/60 leading-normal font-medium">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => dismissToast(toast.id)}
                  className="p-1 rounded-full text-black/35 hover:text-black/80 hover:bg-black/5 transition-colors shrink-0 mt-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

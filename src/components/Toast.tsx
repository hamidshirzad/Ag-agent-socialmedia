import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface ToastItem { id: string; message: string; type: "success" | "error" }
interface ToastCtx  { success: (msg: string) => void; error: (msg: string) => void }

const ToastContext = createContext<ToastCtx>({ success: () => {}, error: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) =>
    setToasts(p => p.filter(t => t.id !== id)), []);

  const add = useCallback((message: string, type: "success" | "error") => {
    const id = crypto.randomUUID();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  return (
    <ToastContext.Provider value={{
      success: (m) => add(m, "success"),
      error:   (m) => add(m, "error"),
    }}>
      {children}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-3 items-center pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={cn(
                "flex items-center gap-4 px-8 py-5 rounded-full shadow-2xl",
                "font-black uppercase tracking-widest text-[1.3rem] text-white pointer-events-auto",
                t.type === "success" ? "bg-sb-accent" : "bg-red-500"
              )}
            >
              {t.type === "success"
                ? <CheckCircle2 size={18} aria-hidden="true" />
                : <XCircle      size={18} aria-hidden="true" />}
              {t.message}
              <button
                onClick={() => remove(t.id)}
                className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss notification"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }

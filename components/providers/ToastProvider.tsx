"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";

import Toast from "@/components/ui/atoms/Toast";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastOptions {
  description?: string;
  duration?: number;
}

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number;
  exiting: boolean;
}

interface ToastAPI {
  success: (title: string, options?: ToastOptions) => void;
  error: (title: string, options?: ToastOptions) => void;
  warning: (title: string, options?: ToastOptions) => void;
  info: (title: string, options?: ToastOptions) => void;
  dismiss: (id: string) => void;
}

interface ToastContextValue {
  toast: ToastAPI;
}

const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
  success: 4000,
  warning: 4000,
  error: 0,
  info: 4000,
};

export const ToastContext = createContext<ToastContextValue | null>(null);

let toastCounter = 0;

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastProvider: React.FC<ToastProviderProps> = (props) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const dismissToast = useCallback((id: string) => {
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }

    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 150);
  }, []);

  const addToast = useCallback(
    (variant: ToastVariant, title: string, options?: ToastOptions) => {
      toastCounter += 1;
      const id = `toast-${toastCounter}-${Date.now()}`;
      const duration = options?.duration ?? DEFAULT_DURATIONS[variant];

      const item: ToastItem = {
        id,
        variant,
        title,
        description: options?.description,
        duration,
        exiting: false,
      };

      setToasts((prev) => [...prev, item]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          timersRef.current.delete(id);
          dismissToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismissToast]
  );

  useEffect(function cleanupTimersOnUnmount() {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const toast: ToastAPI = useMemo(
    () => ({
      success: (title: string, options?: ToastOptions) =>
        addToast("success", title, options),
      error: (title: string, options?: ToastOptions) =>
        addToast("error", title, options),
      warning: (title: string, options?: ToastOptions) =>
        addToast("warning", title, options),
      info: (title: string, options?: ToastOptions) =>
        addToast("info", title, options),
      dismiss: dismissToast,
    }),
    [addToast, dismissToast]
  );

  const contextValue: ToastContextValue = useMemo(() => ({ toast }), [toast]);

  const visibleToasts = toasts.slice(-3);

  const portalContent =
    visibleToasts.length > 0 ? (
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 w-80">
        {visibleToasts.map((item) => (
          <div
            key={item.id}
            className={item.exiting ? "toast-exit" : "toast-enter"}
          >
            <Toast
              id={item.id}
              variant={item.variant}
              title={item.title}
              description={item.description}
              onDismiss={dismissToast}
            />
          </div>
        ))}
      </div>
    ) : null;

  return (
    <ToastContext.Provider value={contextValue}>
      {props.children}
      {portalContent != null && typeof document !== "undefined"
        ? ReactDOM.createPortal(portalContent, document.body)
        : null}
    </ToastContext.Provider>
  );
};

ToastProvider.displayName = "ToastProvider";
export default ToastProvider;

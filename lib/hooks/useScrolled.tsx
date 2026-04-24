import { useCallback, useSyncExternalStore } from "react";

function subscribe(callback: () => void): () => void {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function getServerSnapshot(): boolean {
  return false;
}

export function useScrolled(triggerPoint: number): boolean {
  const getSnapshot = useCallback(
    () => window.scrollY > triggerPoint,
    [triggerPoint]
  );
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

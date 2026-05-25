import { useCallback, useRef, useSyncExternalStore } from "react";

function subscribe(callback: () => void): () => void {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function getServerSnapshot(): boolean {
  return false;
}

export function useScrolled(
  triggerPoint: number,
  deactivatePoint?: number
): boolean {
  const stateRef = useRef(false);

  const getSnapshot = useCallback(() => {
    const scrollY = window.scrollY;
    const deactivate = deactivatePoint ?? triggerPoint;

    if (stateRef.current) {
      if (scrollY <= deactivate) {
        stateRef.current = false;
      }
    } else {
      if (scrollY > triggerPoint) {
        stateRef.current = true;
      }
    }

    return stateRef.current;
  }, [triggerPoint, deactivatePoint]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

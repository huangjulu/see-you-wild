/**
 * 將 instance 同步寫入 forwardedRef（支援 function ref 與 object ref）。
 */
export function updateRef<T>(
  ref: React.ForwardedRef<T>,
  instance: T | null
): void {
  if (typeof ref === "function") {
    ref(instance);
  } else if (ref != null) {
    ref.current = instance;
  }
}

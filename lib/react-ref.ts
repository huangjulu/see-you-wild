export function updateRef<T>(
  ref: React.Ref<T> | undefined,
  instance: T | null
): void {
  if (ref == null) return;
  if (typeof ref === "function") {
    ref(instance);
  } else {
    ref.current = instance;
  }
}

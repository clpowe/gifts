export type Toast = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

const toasts = ref<Toast[]>([]);
let nextId = 1;

export function useToasts() {
  function toast(
    message: string,
    type: Toast["type"] = "info",
    timeoutMs = 4000,
  ) {
    const id = nextId++;
    toasts.value.push({ id, message, type });
    setTimeout(() => dismiss(id), timeoutMs);
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return {
    toasts: readonly(toasts),
    toast,
    success: (m: string) => toast(m, "success"),
    error: (m: string) => toast(m, "error", 6000),
    dismiss,
  };
}

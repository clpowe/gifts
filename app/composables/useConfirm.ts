type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type PendingConfirm = ConfirmOptions & {
  resolve: (ok: boolean) => void;
};

const current = ref<PendingConfirm | null>(null);

export function useConfirm() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    current.value?.resolve(false);
    return new Promise<boolean>((resolve) => {
      current.value = { ...options, resolve };
    });
  }

  function settle(ok: boolean) {
    current.value?.resolve(ok);
    current.value = null;
  }

  return { current: readonly(current), confirm, settle };
}

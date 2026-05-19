import { ref } from 'vue'

type ToastType = 'success' | 'error' | 'info'

export type ToastItem = {
  id: number
  type: ToastType
  message: string
}

/** Shared toast list — import in AppToast for reliable template reactivity. */
export const toastItems = ref<ToastItem[]>([])

let counter = 0

export function useToast() {
  function push(type: ToastType, message: string, duration = 3000) {
    const id = ++counter
    toastItems.value = [...toastItems.value, { id, type, message }]
    setTimeout(() => dismiss(id), duration)
  }

  function success(message: string, duration = 4000) {
    push('success', message, duration)
  }
  function error(message: string) {
    push('error', message)
  }
  function info(message: string) {
    push('info', message)
  }

  function dismiss(id: number) {
    toastItems.value = toastItems.value.filter((t) => t.id !== id)
  }

  return {
    items: toastItems,
    success,
    error,
    info,
    dismiss,
  }
}

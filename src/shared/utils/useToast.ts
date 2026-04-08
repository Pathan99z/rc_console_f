import { computed, ref } from 'vue'

type ToastType = 'success' | 'error' | 'info'

export type ToastItem = {
  id: number
  type: ToastType
  message: string
}

const items = ref<ToastItem[]>([])
let counter = 0

export function useToast() {
  function push(type: ToastType, message: string, duration = 3000) {
    const id = ++counter
    items.value.push({ id, type, message })
    setTimeout(() => dismiss(id), duration)
  }

  function success(message: string) {
    push('success', message)
  }
  function error(message: string) {
    push('error', message)
  }
  function info(message: string) {
    push('info', message)
  }

  function dismiss(id: number) {
    items.value = items.value.filter((t) => t.id !== id)
  }

  return {
    items: computed(() => items.value),
    success,
    error,
    info,
    dismiss,
  }
}

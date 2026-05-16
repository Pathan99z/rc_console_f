<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTaskStore } from '@/modules/tasks/store/task.store'
import type { TaskItem } from '@/modules/tasks/types/task.types'
import { formatAssignableUserLabel } from '@/modules/tasks/utils/taskFormat'

const props = defineProps<{
  open: boolean
  task: TaskItem | null
  loading?: boolean
}>()

const taskStore = useTaskStore()
const assigneesLoading = ref(false)
const assigneeOptions = computed(() => taskStore.assignableUsers)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', assigneeUserId: number): void
}>()

const assigneeId = ref('')

async function loadAssignableUsers() {
  const showSpinner = !taskStore.assignableUsers.length
  if (showSpinner) assigneesLoading.value = true
  try {
    await taskStore.fetchAssignableUsers()
  } catch {
    /* keep prior list if any */
  } finally {
    if (showSpinner) assigneesLoading.value = false
  }
}

watch(
  () => props.open,
  async (v) => {
    if (!v) return
    if (props.task?.assignee_user_id) assigneeId.value = String(props.task.assignee_user_id)
    else assigneeId.value = ''
    await loadAssignableUsers()
  },
)

function submit() {
  const id = Number(assigneeId.value)
  if (!id) return
  emit('submit', id)
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[55] flex items-center justify-center bg-black/40 p-4" @click.self="emit('close')">
    <form class="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl" @submit.prevent="submit">
      <h3 class="text-lg font-semibold text-slate-900">Assign task</h3>
      <p v-if="task" class="text-sm text-slate-600">{{ task.title }}</p>
      <p v-if="task?.assignee" class="text-xs text-slate-500">Current: {{ task.assignee.name }}</p>
      <label class="block text-sm">
        <span class="text-slate-600">New assignee *</span>
        <select v-model="assigneeId" class="rc-input mt-1 w-full" required>
          <option value="">{{ assigneesLoading && !assigneeOptions.length ? 'Loading users…' : 'Select user' }}</option>
          <option v-for="u in assigneeOptions" :key="u.id" :value="String(u.id)">{{ formatAssignableUserLabel(u) }}</option>
        </select>
        <p v-if="!assigneesLoading && !assigneeOptions.length" class="mt-1 text-xs text-amber-600">No assignable users found.</p>
      </label>
      <div class="flex justify-end gap-2">
        <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="emit('close')">Cancel</button>
        <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" :disabled="loading">
          {{ loading ? 'Saving…' : 'Assign' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import TaskPriorityBadge from '@/modules/tasks/components/TaskPriorityBadge.vue'
import TaskStatusBadge from '@/modules/tasks/components/TaskStatusBadge.vue'
import { formatTaskDate } from '@/modules/tasks/utils/taskFormat'
import type { TaskItem } from '@/modules/tasks/types/task.types'

defineProps<{
  open: boolean
  task: TaskItem | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit'): void
  (e: 'assign'): void
  (e: 'start'): void
  (e: 'complete'): void
  (e: 'cancel'): void
  (e: 'reopen'): void
  (e: 'delete'): void
}>()

function relatedLabel(task: TaskItem) {
  if (task.related?.summary) return `${task.related.label || task.related.type}: ${task.related.summary}`
  if (task.related_type && task.related_id) return `${task.related_type} #${task.related_id}`
  return '—'
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex justify-end bg-black/40" @click.self="emit('close')">
      <aside class="flex h-full w-full max-w-md flex-col bg-white shadow-xl" @click.stop>
        <header class="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div class="min-w-0 flex-1 pr-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Task detail</p>
            <h2 v-if="task" class="mt-1 text-lg font-semibold text-slate-900">{{ task.title }}</h2>
          </div>
          <button type="button" class="rounded-lg border px-2 py-1 text-xs text-slate-600" @click="emit('close')">Close</button>
        </header>

        <div v-if="loading" class="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">Loading…</div>
        <div v-else-if="task" class="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div class="flex flex-wrap gap-2">
            <TaskStatusBadge :status="task.status" />
            <TaskPriorityBadge :priority="task.priority" />
            <span v-if="task.is_overdue" class="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">Overdue</span>
          </div>

          <p v-if="task.description" class="whitespace-pre-wrap text-sm text-slate-700">{{ task.description }}</p>

          <dl class="grid gap-3 text-sm">
            <div>
              <dt class="text-xs text-slate-500">Due</dt>
              <dd class="font-medium" :class="task.is_overdue ? 'text-rose-600' : ''">{{ formatTaskDate(task.due_at) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-500">Assignee</dt>
              <dd>{{ task.assignee?.name || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-500">Creator</dt>
              <dd>{{ task.creator?.name || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-500">Organization</dt>
              <dd>{{ task.scope_organization?.display_name || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-500">Related</dt>
              <dd>{{ relatedLabel(task) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-500">Created</dt>
              <dd>{{ formatTaskDate(task.created_at) }}</dd>
            </div>
            <div v-if="task.completed_at">
              <dt class="text-xs text-slate-500">Completed</dt>
              <dd>{{ formatTaskDate(task.completed_at) }}</dd>
            </div>
            <div v-if="task.cancelled_at">
              <dt class="text-xs text-slate-500">Cancelled</dt>
              <dd>{{ formatTaskDate(task.cancelled_at) }}</dd>
            </div>
          </dl>

          <section class="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-500">
            Comments and activity feed — coming soon.
          </section>
        </div>

        <footer v-if="task && !loading" class="border-t border-slate-100 px-5 py-4">
          <div class="flex flex-wrap gap-2">
            <button v-if="task.permissions?.can_edit" type="button" class="rounded-lg border px-3 py-1.5 text-xs font-semibold" @click="emit('edit')">Edit</button>
            <button v-if="task.permissions?.can_assign" type="button" class="rounded-lg border px-3 py-1.5 text-xs font-semibold" @click="emit('assign')">Assign</button>
            <button v-if="task.status === 'pending' && task.permissions?.can_edit" type="button" class="rounded-lg border px-3 py-1.5 text-xs font-semibold text-sky-700" @click="emit('start')">Start</button>
            <button v-if="task.status === 'in_progress' && task.permissions?.can_complete" type="button" class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white" @click="emit('complete')">Complete</button>
            <button v-if="(task.status === 'pending' || task.status === 'in_progress') && task.permissions?.can_cancel" type="button" class="rounded-lg border px-3 py-1.5 text-xs font-semibold text-rose-700" @click="emit('cancel')">Cancel</button>
            <button v-if="(task.status === 'completed' || task.status === 'cancelled') && task.permissions?.can_reopen" type="button" class="rounded-lg border px-3 py-1.5 text-xs font-semibold" @click="emit('reopen')">Reopen</button>
            <button v-if="task.permissions?.can_edit" type="button" class="ml-auto rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700" @click="emit('delete')">Delete</button>
          </div>
        </footer>
      </aside>
    </div>
  </Teleport>
</template>

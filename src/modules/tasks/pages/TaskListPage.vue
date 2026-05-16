<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import TaskAssignModal from '@/modules/tasks/components/TaskAssignModal.vue'
import TaskConfirmModal from '@/modules/tasks/components/TaskConfirmModal.vue'
import TaskDetailDrawer from '@/modules/tasks/components/TaskDetailDrawer.vue'
import TaskFormModal from '@/modules/tasks/components/TaskFormModal.vue'
import TaskPriorityBadge from '@/modules/tasks/components/TaskPriorityBadge.vue'
import TaskStatusBadge from '@/modules/tasks/components/TaskStatusBadge.vue'
import { useTaskAccess } from '@/modules/tasks/composables/useTaskAccess'
import { useTaskStore } from '@/modules/tasks/store/task.store'
import { formatAssignableUserLabel, formatTaskDate, TASK_PRIORITIES, TASK_RELATED_TYPES, TASK_STATUSES } from '@/modules/tasks/utils/taskFormat'
import type { CreateTaskPayload, TaskItem, TaskListParams, TaskViewMode, UpdateTaskPayload } from '@/modules/tasks/types/task.types'

const store = useTaskStore()
const toast = useToast()
const { canManageTasks, canAssignTasks, availableViews, needsScopeOrgOnCreate, defaultOrgId } = useTaskAccess()

const search = ref('')
const searchDebounced = ref('')
const view = ref<TaskViewMode>('my')
const statusFilter = ref('')
const priorityFilter = ref('')
const assigneeFilter = ref('')
const relatedTypeFilter = ref('')
const overdueOnly = ref(false)
const page = ref(1)

const showCreate = ref(false)
const showEdit = ref(false)
const showAssign = ref(false)
const showDetail = ref(false)
const saving = ref(false)
const actionLoading = ref(false)
const selectedTask = ref<TaskItem | null>(null)

const confirm = ref<{ open: boolean; title: string; message: string; action: string; danger?: boolean }>({
  open: false,
  title: '',
  message: '',
  action: '',
})

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, (v) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchDebounced.value = v.trim()
    page.value = 1
  }, 350)
})

watch([view, statusFilter, priorityFilter, assigneeFilter, relatedTypeFilter, overdueOnly, searchDebounced, page], () => {
  void loadTasks()
})

onMounted(async () => {
  if (availableViews.value.length && !availableViews.value.find((v) => v.value === view.value)) {
    view.value = availableViews.value[0].value
  }
  await loadTasks()
  try {
    await store.fetchAssignableUsers()
  } catch {
    /* filter assignee list optional */
  }
})

function buildParams(): TaskListParams {
  const params: TaskListParams = { page: page.value, per_page: 15, view: view.value }
  if (searchDebounced.value) params.search = searchDebounced.value
  if (statusFilter.value) params.status = statusFilter.value
  if (priorityFilter.value) params.priority = priorityFilter.value
  if (assigneeFilter.value) params.assignee_user_id = Number(assigneeFilter.value)
  if (relatedTypeFilter.value) params.related_type = relatedTypeFilter.value
  if (overdueOnly.value) params.overdue = true
  return params
}

async function loadTasks() {
  try {
    await store.fetchTasks(buildParams())
  } catch {
    toast.error(store.message || 'Failed to load tasks.')
  }
}

function clearFilters() {
  search.value = ''
  searchDebounced.value = ''
  statusFilter.value = ''
  priorityFilter.value = ''
  assigneeFilter.value = ''
  relatedTypeFilter.value = ''
  overdueOnly.value = false
  page.value = 1
}

function relatedSummary(task: TaskItem) {
  if (task.related?.summary) return task.related.summary
  if (task.related_type && task.related_id) return `${task.related_type} #${task.related_id}`
  return '—'
}

async function openDetail(task: TaskItem) {
  selectedTask.value = task
  showDetail.value = true
  try {
    await store.fetchTask(task.id)
    selectedTask.value = store.currentTask
  } catch {
    toast.error(store.message || 'Could not load task.')
  }
}

function openEditFromDetail() {
  if (!selectedTask.value) return
  showDetail.value = false
  showEdit.value = true
}

async function onCreate(payload: CreateTaskPayload) {
  saving.value = true
  try {
    await store.createTask(payload)
    toast.success(store.message || 'Task created.')
    showCreate.value = false
    await loadTasks()
  } catch {
    toast.error(store.message || 'Create failed.')
  } finally {
    saving.value = false
  }
}

async function onUpdate(payload: UpdateTaskPayload) {
  if (!selectedTask.value) return
  saving.value = true
  try {
    await store.updateTask(selectedTask.value.id, payload)
    toast.success(store.message || 'Task updated.')
    showEdit.value = false
    await loadTasks()
  } catch {
    toast.error(store.message || 'Update failed.')
  } finally {
    saving.value = false
  }
}

async function onAssign(assigneeUserId: number) {
  if (!selectedTask.value) return
  actionLoading.value = true
  try {
    await store.assignTask(selectedTask.value.id, assigneeUserId)
    toast.success(store.message || 'Task assigned.')
    showAssign.value = false
    selectedTask.value = store.currentTask
    await loadTasks()
  } catch {
    toast.error(store.message || 'Assign failed.')
  } finally {
    actionLoading.value = false
  }
}

function requestConfirm(action: string, task: TaskItem) {
  selectedTask.value = task
  const titles: Record<string, string> = {
    start: 'Start task',
    complete: 'Complete task',
    cancel: 'Cancel task',
    reopen: 'Reopen task',
    delete: 'Delete task',
  }
  const messages: Record<string, string> = {
    start: 'Move this task to in progress?',
    complete: 'Mark this task as completed?',
    cancel: 'Cancel this task?',
    reopen: 'Reopen this task as pending?',
    delete: 'Delete this task? This cannot be undone.',
  }
  confirm.value = {
    open: true,
    title: titles[action] || 'Confirm',
    message: messages[action] || 'Continue?',
    action,
    danger: action === 'delete' || action === 'cancel',
  }
}

async function onConfirm() {
  const task = selectedTask.value
  const action = confirm.value.action
  confirm.value.open = false
  if (!task) return
  actionLoading.value = true
  try {
    if (action === 'delete') {
      await store.deleteTask(task.id)
      toast.success(store.message || 'Task deleted.')
      showDetail.value = false
    } else {
      await store.workflow(task.id, action as 'start' | 'complete' | 'cancel' | 'reopen')
      toast.success(store.message || 'Task updated.')
      selectedTask.value = store.currentTask
    }
    await loadTasks()
  } catch {
    toast.error(store.message || 'Action failed.')
  } finally {
    actionLoading.value = false
  }
}

const assigneeOptions = computed(() => store.assignableUsers)
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Tasks</h2>
        <p class="text-sm text-slate-500">Manage and track assigned tasks</p>
      </div>
      <button
        v-if="canManageTasks"
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        @click="showCreate = true"
      >
        + New Task
      </button>
    </header>

    <div class="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <label class="min-w-[10rem] flex-1 text-sm">
        <span class="text-slate-600">Search</span>
        <input v-model="search" class="rc-input mt-1 w-full" placeholder="Title or description" />
      </label>
      <label class="text-sm">
        <span class="text-slate-600">View</span>
        <select v-model="view" class="rc-input mt-1 w-40">
          <option v-for="v in availableViews" :key="v.value" :value="v.value">{{ v.label }}</option>
        </select>
      </label>
      <label class="text-sm">
        <span class="text-slate-600">Status</span>
        <select v-model="statusFilter" class="rc-input mt-1 w-36">
          <option value="">All</option>
          <option v-for="s in TASK_STATUSES" :key="s" :value="s">{{ s.replace(/_/g, ' ') }}</option>
        </select>
      </label>
      <label class="text-sm">
        <span class="text-slate-600">Priority</span>
        <select v-model="priorityFilter" class="rc-input mt-1 w-32">
          <option value="">All</option>
          <option v-for="p in TASK_PRIORITIES" :key="p" :value="p">{{ p }}</option>
        </select>
      </label>
      <label class="text-sm">
        <span class="text-slate-600">Assignee</span>
        <select v-model="assigneeFilter" class="rc-input mt-1 w-40">
          <option value="">All</option>
          <option v-for="u in assigneeOptions" :key="u.id" :value="String(u.id)">{{ formatAssignableUserLabel(u) }}</option>
        </select>
      </label>
      <label class="text-sm">
        <span class="text-slate-600">Related</span>
        <select v-model="relatedTypeFilter" class="rc-input mt-1 w-36">
          <option value="">All</option>
          <option v-for="t in TASK_RELATED_TYPES" :key="t" :value="t">{{ t }}</option>
        </select>
      </label>
      <label class="flex items-center gap-2 pb-2 text-sm text-slate-700">
        <input v-model="overdueOnly" type="checkbox" class="rounded" />
        Overdue only
      </label>
      <button type="button" class="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700" @click="clearFilters">Clear filters</button>
    </div>

    <div class="overflow-x-auto rounded-xl border border-[var(--rc-border-soft)] bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-3 text-left">Task</th>
            <th class="px-4 py-3 text-left">Related</th>
            <th class="px-4 py-3 text-left">Priority</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Assignee</th>
            <th class="px-4 py-3 text-left">Due</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.loading">
            <td colspan="7" class="px-4 py-10 text-center text-slate-500">Loading tasks…</td>
          </tr>
          <tr v-else-if="!store.tasks.length">
            <td colspan="7" class="px-4 py-10 text-center text-slate-500">No tasks match your filters.</td>
          </tr>
          <tr v-for="row in store.tasks" v-else :key="row.id" class="border-t border-[var(--rc-border-soft)] hover:bg-slate-50/50">
            <td class="px-4 py-3">
              <button type="button" class="text-left font-medium text-slate-900 hover:text-indigo-600" @click="openDetail(row)">
                {{ row.title }}
              </button>
              <p v-if="row.is_overdue" class="text-xs font-semibold text-rose-600">Overdue</p>
            </td>
            <td class="max-w-[10rem] truncate px-4 py-3 text-slate-600" :title="relatedSummary(row)">{{ relatedSummary(row) }}</td>
            <td class="px-4 py-3"><TaskPriorityBadge :priority="row.priority" /></td>
            <td class="px-4 py-3"><TaskStatusBadge :status="row.status" /></td>
            <td class="px-4 py-3">{{ row.assignee?.name || '—' }}</td>
            <td class="px-4 py-3 text-xs" :class="row.is_overdue ? 'font-semibold text-rose-600' : 'text-slate-600'">{{ formatTaskDate(row.due_at) }}</td>
            <td class="px-4 py-3 text-right">
              <div class="flex flex-wrap justify-end gap-1">
                <button type="button" class="rounded border px-2 py-0.5 text-xs" @click="openDetail(row)">View</button>
                <button v-if="row.permissions?.can_edit" type="button" class="rounded border px-2 py-0.5 text-xs" @click="selectedTask = row; showEdit = true">Edit</button>
                <button v-if="row.permissions?.can_assign && canAssignTasks" type="button" class="rounded border px-2 py-0.5 text-xs" @click="selectedTask = row; showAssign = true">Assign</button>
                <button v-if="row.status === 'pending' && row.permissions?.can_edit" type="button" class="rounded border px-2 py-0.5 text-xs" @click="requestConfirm('start', row)">Start</button>
                <button v-if="row.status === 'in_progress' && row.permissions?.can_complete" type="button" class="rounded border px-2 py-0.5 text-xs text-emerald-700" @click="requestConfirm('complete', row)">Complete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationControls
      :current-page="store.pagination.current_page"
      :last-page="store.pagination.last_page"
      @change="(p) => { page = p }"
    />

    <TaskFormModal
      :open="showCreate"
      mode="create"
      :needs-scope-org="needsScopeOrgOnCreate"
      :default-org-id="defaultOrgId"
      :field-errors="store.fieldErrors"
      :saving="saving"
      @close="showCreate = false"
      @create="onCreate"
    />

    <TaskFormModal
      :open="showEdit"
      mode="edit"
      :task="selectedTask"
      :needs-scope-org="needsScopeOrgOnCreate"
      :field-errors="store.fieldErrors"
      :saving="saving"
      @close="showEdit = false"
      @update="onUpdate"
    />

    <TaskAssignModal
      :open="showAssign"
      :task="selectedTask"
      :loading="actionLoading"
      @close="showAssign = false"
      @submit="onAssign"
    />

    <TaskDetailDrawer
      :open="showDetail"
      :task="selectedTask"
      :loading="store.detailLoading"
      @close="showDetail = false"
      @edit="openEditFromDetail"
      @assign="showAssign = true"
      @start="selectedTask && requestConfirm('start', selectedTask)"
      @complete="selectedTask && requestConfirm('complete', selectedTask)"
      @cancel="selectedTask && requestConfirm('cancel', selectedTask)"
      @reopen="selectedTask && requestConfirm('reopen', selectedTask)"
      @delete="selectedTask && requestConfirm('delete', selectedTask)"
    />

    <TaskConfirmModal
      :open="confirm.open"
      :title="confirm.title"
      :message="confirm.message"
      :danger="confirm.danger"
      :confirm-label="confirm.action === 'delete' ? 'Delete' : 'Confirm'"
      @close="confirm.open = false"
      @confirm="onConfirm"
    />
  </section>
</template>

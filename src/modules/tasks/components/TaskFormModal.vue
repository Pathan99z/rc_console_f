<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { companiesApi } from '@/modules/companies/services/companies.api'
import { contactsApi } from '@/modules/contacts/services/contacts.api'
import { dealsApi } from '@/modules/deals/services/deals.api'
import { organizationsApi } from '@/modules/organizations/services/organization.api'
import { payoutApi } from '@/modules/payouts/services/payout.api'
import { quotesApi } from '@/modules/quotes/services/quote.api'
import { prmApi } from '@/modules/prm/services/prm.api'
import type { OrganizationItem } from '@/modules/organizations/types/organization.types'
import { useTaskStore } from '@/modules/tasks/store/task.store'
import { formatAssignableUserLabel, TASK_PRIORITIES, TASK_RELATED_TYPES } from '@/modules/tasks/utils/taskFormat'
import type { CreateTaskPayload, TaskItem, TaskRelatedType, UpdateTaskPayload } from '@/modules/tasks/types/task.types'

type RelatedOption = { id: number; label: string }

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  task?: TaskItem | null
  needsScopeOrg: boolean
  defaultOrgId?: number | null
  fieldErrors?: Record<string, string[]>
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', payload: CreateTaskPayload): void
  (e: 'update', payload: UpdateTaskPayload): void
}>()

const taskStore = useTaskStore()

const orgOptions = ref<OrganizationItem[]>([])
const relatedOptions = ref<RelatedOption[]>([])
const orgsLoading = ref(false)
const assigneesLoading = ref(false)
const assigneeOptions = computed(() => taskStore.assignableUsers)
const relatedLoading = ref(false)

const form = reactive({
  title: '',
  description: '',
  priority: 'medium' as string,
  due_at: '',
  assignee_user_id: '',
  scope_organization_id: '',
  related_type: '' as string,
  related_id: '',
})

const showAdvanced = ref(false)

const relatedRequiresId = computed(() => form.related_type && form.related_type !== 'other')
const showScopeOrg = computed(() => props.mode === 'create' || props.mode === 'edit' || props.needsScopeOrg)

function orgLabel(o: OrganizationItem) {
  const name = (o.display_name || o.legal_name || '').trim()
  return name ? `${name} (${o.type})` : `Organization #${o.id}`
}

watch(
  () => props.open,
  async (v) => {
    if (!v) return
    if (props.mode === 'edit' && props.task) {
      form.title = props.task.title
      form.description = props.task.description || ''
      form.priority = props.task.priority
      form.due_at = props.task.due_at ? props.task.due_at.slice(0, 10) : ''
      form.assignee_user_id = props.task.assignee_user_id ? String(props.task.assignee_user_id) : ''
      form.scope_organization_id = props.task.scope_organization_id ? String(props.task.scope_organization_id) : ''
      form.related_type = props.task.related_type || ''
      form.related_id = props.task.related_id ? String(props.task.related_id) : ''
    } else {
      form.title = ''
      form.description = ''
      form.priority = 'medium'
      form.due_at = ''
      form.assignee_user_id = ''
      form.scope_organization_id = props.defaultOrgId ? String(props.defaultOrgId) : ''
      form.related_type = ''
      form.related_id = ''
    }
    showAdvanced.value = Boolean(form.related_type)
    await Promise.all([loadOrgs(), loadAssignableUsers()])
    if (form.related_type) await loadRelatedOptions()
  },
)

watch(
  () => form.related_type,
  async (type, prev) => {
    if (type !== prev) {
      form.related_id = ''
      relatedOptions.value = []
    }
    if (type && type !== 'other') await loadRelatedOptions()
  },
)

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

async function loadOrgs() {
  orgsLoading.value = true
  try {
    const [partnerRes, resellerRes] = await Promise.all([
      organizationsApi.list({ page: 1, per_page: 100, type: 'partner', status: 'active' }),
      organizationsApi.list({ page: 1, per_page: 100, type: 'reseller', status: 'active' }),
    ])
    const map = new Map<number, OrganizationItem>()
    for (const o of partnerRes.data.data.items) map.set(o.id, o)
    for (const o of resellerRes.data.data.items) map.set(o.id, o)
    orgOptions.value = [...map.values()].sort((a, b) => orgLabel(a).localeCompare(orgLabel(b)))
  } catch {
    orgOptions.value = []
  } finally {
    orgsLoading.value = false
  }
}

async function loadRelatedOptions() {
  const type = form.related_type as TaskRelatedType
  if (!type || type === 'other') {
    relatedOptions.value = []
    return
  }
  relatedLoading.value = true
  try {
    let options: RelatedOption[] = []
    if (type === 'company') {
      const { data } = await companiesApi.list({ page: 1, per_page: 100, status: 1 })
      options = data.data.items.map((c) => ({
        id: c.id,
        label: (c.name || `Company #${c.id}`).trim(),
      }))
    } else if (type === 'contact') {
      const { data } = await contactsApi.list({ page: 1, per_page: 100 })
      options = data.data.items.map((c) => ({
        id: c.id,
        label: [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email || `Contact #${c.id}`,
      }))
    } else if (type === 'deal') {
      const { data } = await dealsApi.list({ page: 1, per_page: 100 })
      options = data.data.items.map((d) => ({
        id: d.id,
        label: (d.name || `Deal #${d.id}`).trim(),
      }))
    } else if (type === 'quote') {
      const { data } = await quotesApi.list({ page: 1, per_page: 100 })
      options = data.data.items.map((q) => ({
        id: q.id,
        label: (q.quote_number || `Quote #${q.id}`).trim(),
      }))
    } else if (type === 'payout') {
      const { data } = await payoutApi.list({ page: 1, per_page: 100 })
      options = data.data.items.map((p) => ({
        id: p.id,
        label: p.payout_number || `Payout #${p.id}`,
      }))
    } else if (type === 'license_entitlement') {
      const { data } = await prmApi.licenseEntitlementsList({ page: 1, per_page: 100 })
      options = data.data.items.map((l) => ({
        id: l.id,
        label: `License entitlement #${l.id}`,
      }))
    } else if (type === 'payment_record') {
      options = []
    }
    relatedOptions.value = options.sort((a, b) => a.label.localeCompare(b.label))
  } catch {
    relatedOptions.value = []
  } finally {
    relatedLoading.value = false
  }
}

function fieldErr(key: string) {
  return props.fieldErrors?.[key]?.[0]
}

function submit() {
  if (props.mode === 'edit') {
    const payload: UpdateTaskPayload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority as CreateTaskPayload['priority'],
      due_at: form.due_at || undefined,
      scope_organization_id: form.scope_organization_id ? Number(form.scope_organization_id) : undefined,
      related_type: (form.related_type || undefined) as TaskRelatedType | undefined,
      related_id: form.related_id ? Number(form.related_id) : undefined,
    }
    emit('update', payload)
    return
  }
  const payload: CreateTaskPayload = {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    priority: form.priority as CreateTaskPayload['priority'],
    due_at: form.due_at || undefined,
    assignee_user_id: form.assignee_user_id ? Number(form.assignee_user_id) : undefined,
    scope_organization_id: form.scope_organization_id ? Number(form.scope_organization_id) : undefined,
    related_type: (form.related_type || undefined) as TaskRelatedType | undefined,
    related_id: form.related_id ? Number(form.related_id) : undefined,
  }
  emit('create', payload)
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[55] flex items-center justify-center bg-black/40 p-4" @click.self="emit('close')">
    <form class="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl bg-white p-6 shadow-xl" @submit.prevent="submit">
      <h3 class="text-lg font-semibold text-slate-900">{{ mode === 'create' ? 'New task' : 'Edit task' }}</h3>

      <label class="block text-sm">
        <span class="text-slate-600">Title *</span>
        <input v-model="form.title" class="rc-input mt-1 w-full" required maxlength="255" />
        <p v-if="fieldErr('title')" class="mt-1 text-xs text-rose-600">{{ fieldErr('title') }}</p>
      </label>

      <label class="block text-sm">
        <span class="text-slate-600">Description</span>
        <textarea v-model="form.description" class="rc-input mt-1 w-full" rows="3" />
      </label>

      <div class="grid gap-3 sm:grid-cols-2">
        <label class="block text-sm">
          <span class="text-slate-600">Priority</span>
          <select v-model="form.priority" class="rc-input mt-1 w-full">
            <option v-for="p in TASK_PRIORITIES" :key="p" :value="p">{{ p }}</option>
          </select>
        </label>
        <label class="block text-sm">
          <span class="text-slate-600">Due date</span>
          <input v-model="form.due_at" type="date" class="rc-input mt-1 w-full" />
        </label>
      </div>

      <label v-if="mode === 'create'" class="block text-sm">
        <span class="text-slate-600">Assignee</span>
        <select v-model="form.assignee_user_id" class="rc-input mt-1 w-full">
          <option value="">{{ assigneesLoading && !assigneeOptions.length ? 'Loading users…' : 'Unassigned' }}</option>
          <option v-for="u in assigneeOptions" :key="u.id" :value="String(u.id)">{{ formatAssignableUserLabel(u) }}</option>
        </select>
        <p v-if="!assigneesLoading && !assigneeOptions.length" class="mt-1 text-xs text-amber-600">No assignable users found.</p>
        <p v-if="fieldErr('assignee_user_id')" class="mt-1 text-xs text-rose-600">{{ fieldErr('assignee_user_id') }}</p>
      </label>

      <label v-if="showScopeOrg" class="block text-sm">
        <span class="text-slate-600">
          Scope organization{{ needsScopeOrg ? ' *' : ' (optional)' }}
        </span>
        <select
          v-model="form.scope_organization_id"
          class="rc-input mt-1 w-full"
          :required="needsScopeOrg"
          :disabled="orgsLoading"
        >
          <option value="">{{ orgsLoading ? 'Loading organizations…' : 'Select organization' }}</option>
          <option v-for="o in orgOptions" :key="o.id" :value="String(o.id)">{{ orgLabel(o) }}</option>
        </select>
        <p v-if="!orgsLoading && !orgOptions.length" class="mt-1 text-xs text-amber-600">No partner/reseller organizations found.</p>
        <p v-if="fieldErr('scope_organization_id')" class="mt-1 text-xs text-rose-600">{{ fieldErr('scope_organization_id') }}</p>
      </label>

      <button type="button" class="text-xs font-semibold text-indigo-600" @click="showAdvanced = !showAdvanced">
        {{ showAdvanced ? 'Hide' : 'Show' }} related record
      </button>

      <div v-if="showAdvanced" class="grid gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 sm:grid-cols-2">
        <label class="block text-sm sm:col-span-2">
          <span class="text-slate-600">Related type</span>
          <select v-model="form.related_type" class="rc-input mt-1 w-full">
            <option value="">None</option>
            <option v-for="t in TASK_RELATED_TYPES" :key="t" :value="t">{{ t.replace(/_/g, ' ') }}</option>
          </select>
        </label>

        <label v-if="relatedRequiresId && relatedOptions.length" class="block text-sm sm:col-span-2">
          <span class="text-slate-600">Related record *</span>
          <select
            v-model="form.related_id"
            class="rc-input mt-1 w-full"
            required
            :disabled="relatedLoading"
          >
            <option value="">{{ relatedLoading ? 'Loading…' : 'Select record' }}</option>
            <option v-for="opt in relatedOptions" :key="opt.id" :value="String(opt.id)">{{ opt.label }}</option>
          </select>
        </label>

        <label v-else-if="relatedRequiresId" class="block text-sm sm:col-span-2">
          <span class="text-slate-600">Related ID *</span>
          <input
            v-model="form.related_id"
            type="number"
            class="rc-input mt-1 w-full"
            required
            :placeholder="relatedLoading ? 'Loading options…' : 'Entity ID'"
            :disabled="relatedLoading"
          />
          <p v-if="!relatedLoading && !relatedOptions.length" class="mt-1 text-xs text-slate-500">
            No records loaded for this type — enter ID manually.
          </p>
        </label>

        <label v-else-if="form.related_type === 'other'" class="block text-sm sm:col-span-2">
          <span class="text-slate-600">Related ID (optional)</span>
          <input v-model="form.related_id" type="number" class="rc-input mt-1 w-full" />
        </label>

        <p v-if="fieldErr('related_id')" class="text-xs text-rose-600 sm:col-span-2">{{ fieldErr('related_id') }}</p>
      </div>

      <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="emit('close')">Cancel</button>
        <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" :disabled="saving">
          {{ saving ? 'Saving…' : mode === 'create' ? 'Create task' : 'Save changes' }}
        </button>
      </div>
    </form>
  </div>
</template>

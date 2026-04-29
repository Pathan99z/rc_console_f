<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useContactsStore } from '@/modules/contacts/store/contacts.store'
import type { ContactItem } from '@/modules/contacts/services/contacts.api'
import { useToast } from '@/shared/utils/useToast'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const contactsStore = useContactsStore()
const toast = useToast()
const router = useRouter()
const authStore = useAuthStore()
const creating = ref(false)
const saving = ref(false)
const deletingId = ref<number | null>(null)
const exporting = ref(false)
const importing = ref(false)
const showImportModal = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedContact = ref<ContactItem | null>(null)
const importFile = ref<File | null>(null)

const createForm = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  lifecycle_stage: 0,
  assigned_user_id: '',
  meta_source: '',
  meta_city: '',
})

const editForm = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  lifecycle_stage: 'lead',
  company_id: '',
  assigned_user_id: '',
  meta_source: '',
  meta_city: '',
})

function firstValidationMessage(errors: Record<string, string[]>) {
  const prioritized = ['email', 'first_name', 'last_name', 'phone', 'lifecycle_stage', 'assigned_user_id']
  for (const key of prioritized) {
    const message = errors[key]?.[0]
    if (message) return message
  }
  const firstEntry = Object.values(errors)[0]
  return firstEntry?.[0] || ''
}

onMounted(async () => {
  await contactsStore.fetchContacts()
  await Promise.all([contactsStore.fetchAssignableUsers(), contactsStore.fetchCompanyOptions()])
})

async function submitCreate() {
  if (creating.value) return
  creating.value = true
  try {
    await contactsStore.createContact({
      first_name: createForm.first_name,
      last_name: createForm.last_name,
      email: createForm.email || undefined,
      phone: createForm.phone || undefined,
      lifecycle_stage: createForm.lifecycle_stage,
      assigned_user_id: Number(createForm.assigned_user_id || 0) || undefined,
      meta: {
        source: createForm.meta_source || undefined,
        city: createForm.meta_city || undefined,
      },
    })
    toast.success('Contact created successfully.')
    createForm.first_name = ''
    createForm.last_name = ''
    createForm.email = ''
    createForm.phone = ''
    createForm.lifecycle_stage = 0
    createForm.assigned_user_id = ''
    createForm.meta_source = ''
    createForm.meta_city = ''
    showCreateModal.value = false
  } catch {
    toast.error(firstValidationMessage(contactsStore.errors) || contactsStore.message || 'Create contact failed.')
  } finally {
    creating.value = false
  }
}

async function openCreateModal() {
  showCreateModal.value = true
  await Promise.all([contactsStore.fetchAssignableUsers(), contactsStore.fetchCompanyOptions()])
  const loggedInUserId = authStore.user?.id
  if (!loggedInUserId) return

  const hasLoggedInUser = contactsStore.assignableUsers.some((user) => user.id === loggedInUserId)
  if (!hasLoggedInUser && authStore.user) {
    contactsStore.assignableUsers.unshift({
      id: authStore.user.id,
      tenant_id: authStore.user.tenant_id,
      team_id: authStore.user.team_id ?? null,
      data_scope: authStore.user.data_scope,
      role: authStore.user.role,
      status: authStore.user.status ?? 'active',
      name: authStore.user.name,
      email: authStore.user.email,
      email_verified_at: authStore.user.email_verified_at,
      created_at: authStore.user.created_at,
    })
  }

  if (!createForm.assigned_user_id) {
    createForm.assigned_user_id = String(loggedInUserId)
  }
}

async function openEdit(contact: ContactItem) {
  selectedContact.value = contact
  await Promise.all([contactsStore.fetchAssignableUsers(), contactsStore.fetchCompanyOptions()])
  editForm.first_name = contact.first_name
  editForm.last_name = contact.last_name
  editForm.email = contact.email || ''
  editForm.phone = contact.phone || ''
  editForm.lifecycle_stage = contact.lifecycle_stage
  editForm.company_id = contact.company?.id ? String(contact.company.id) : ''
  editForm.assigned_user_id = contact.assigned_user?.id ? String(contact.assigned_user.id) : ''
  editForm.meta_source = String(contact.meta?.source || '')
  editForm.meta_city = String(contact.meta?.city || '')

  if (!editForm.assigned_user_id && authStore.user?.id) {
    editForm.assigned_user_id = String(authStore.user.id)
  }

  const loggedInUserId = authStore.user?.id
  if (loggedInUserId && !contactsStore.assignableUsers.some((user) => user.id === loggedInUserId) && authStore.user) {
    contactsStore.assignableUsers.unshift({
      id: authStore.user.id,
      tenant_id: authStore.user.tenant_id,
      team_id: authStore.user.team_id ?? null,
      data_scope: authStore.user.data_scope,
      role: authStore.user.role,
      status: authStore.user.status ?? 'active',
      name: authStore.user.name,
      email: authStore.user.email,
      email_verified_at: authStore.user.email_verified_at,
      created_at: authStore.user.created_at,
    })
  }

  if (contact.assigned_user && !contactsStore.assignableUsers.some((x) => x.id === contact.assigned_user?.id)) {
    contactsStore.assignableUsers.unshift({
      id: contact.assigned_user.id,
      tenant_id: contact.tenant_id,
      team_id: null,
      data_scope: 'self',
      role: 'user',
      status: 'active',
      name: contact.assigned_user.name,
      email: contact.assigned_user.email,
      email_verified_at: null,
      created_at: contact.created_at,
    })
  }

  showEditModal.value = true
}

function closeEdit() {
  showEditModal.value = false
  selectedContact.value = null
}

async function submitEdit() {
  if (!selectedContact.value || saving.value) return
  saving.value = true
  try {
    await contactsStore.updateContact(selectedContact.value.id, {
      lifecycle_stage: stageToNumber(editForm.lifecycle_stage),
      assigned_user_id: Number(editForm.assigned_user_id || 0) || undefined,
    })
    toast.success('Contact updated successfully.')
    closeEdit()
  } catch {
    toast.error(contactsStore.message || 'Update failed.')
  } finally {
    saving.value = false
  }
}

async function removeContact(contactId: number) {
  if (deletingId.value) return
  if (!window.confirm('Delete this contact?')) return
  deletingId.value = contactId
  try {
    await contactsStore.deleteContact(contactId)
    toast.success('Contact deleted.')
  } catch {
    toast.error(contactsStore.message || 'Delete failed.')
  } finally {
    deletingId.value = null
  }
}

async function onImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  importFile.value = file
  input.value = ''
}

async function exportCsv() {
  if (exporting.value) return
  exporting.value = true
  try {
    const blob = await contactsStore.exportContacts()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `contacts-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}

async function importCsv() {
  if (!importFile.value || importing.value) return
  importing.value = true
  try {
    const result = await contactsStore.importContacts(importFile.value)
    toast.success(`Import completed. Created: ${result.created}, Skipped: ${result.skipped}`)
    showImportModal.value = false
    importFile.value = null
  } catch {
    toast.error(contactsStore.message || 'Import failed.')
  } finally {
    importing.value = false
  }
}

function downloadContactSampleCsv() {
  const sample = [
    'first_name,last_name,email,phone,lifecycle_stage,company_id,assigned_user_id,source,city',
    'Ravi,Kumar,ravi@example.com,+91-9000000000,lead,10,22,website,Bangalore',
  ].join('\n')
  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'contacts-sample.csv')
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function stageToNumber(stage: string) {
  if (stage === 'lead') return 0
  if (stage === 'prospect') return 1
  if (stage === 'customer') return 2
  return 3
}

function stageClass(stage: string) {
  if (stage === 'lead') return 'bg-slate-100 text-slate-700'
  if (stage === 'prospect') return 'bg-blue-50 text-blue-700'
  if (stage === 'customer') return 'bg-emerald-50 text-emerald-700'
  return 'bg-amber-50 text-amber-700'
}

const hasContacts = computed(() => contactsStore.items.length > 0)
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Contacts</h2>
        <p class="text-sm text-slate-500">Core CRM contacts with lifecycle and activity support.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn-secondary rounded-lg px-4 py-2 text-sm font-semibold" @click="openCreateModal">Create Contact</button>
        <button class="rounded border px-3 py-1.5 text-sm" :disabled="importing" @click="showImportModal = true">
          {{ importing ? 'Importing...' : 'Import CSV' }}
        </button>
        <button class="rounded border px-3 py-1.5 text-sm" :disabled="exporting" @click="exportCsv">{{ exporting ? 'Exporting...' : 'Export CSV' }}</button>
      </div>
    </header>

    <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <div class="grid gap-3 md:grid-cols-4">
        <select v-model="contactsStore.filters.stage" class="rc-input" @change="contactsStore.fetchContacts(1, contactsStore.pagination.per_page)">
          <option value="">All stages</option>
          <option value="lead">lead</option>
          <option value="prospect">prospect</option>
          <option value="customer">customer</option>
          <option value="inactive">inactive</option>
        </select>
        <input v-model="contactsStore.filters.owner_id" type="number" class="rc-input" placeholder="Owner ID" />
        <input v-model="contactsStore.filters.company_id" type="number" class="rc-input" placeholder="Company ID" />
        <input v-model.trim="contactsStore.filters.search" class="rc-input" placeholder="Search name/email" @keyup.enter="contactsStore.fetchContacts(1, contactsStore.pagination.per_page)" />
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <button class="rounded border px-3 py-1.5 text-sm" :disabled="contactsStore.loading" @click="contactsStore.fetchContacts(1, contactsStore.pagination.per_page)">
          Apply Filters
        </button>
        <button class="rounded border px-3 py-1.5 text-sm" :disabled="contactsStore.loading" @click="contactsStore.filters = { stage: '', owner_id: '', company_id: '', search: '' }; contactsStore.fetchContacts(1, contactsStore.pagination.per_page)">
          Reset
        </button>
      </div>
    </div>

    <div v-if="contactsStore.loading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">Loading contacts...</div>
    <div v-else-if="!hasContacts" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">
      No contacts found.
    </div>
    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="contact in contactsStore.items" :key="contact.id" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-semibold text-slate-900">{{ contact.first_name }} {{ contact.last_name }}</h3>
            <p class="text-sm text-slate-500">{{ contact.email || '-' }}</p>
          </div>
          <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="stageClass(contact.lifecycle_stage)">{{ contact.lifecycle_stage }}</span>
        </div>
        <div class="mt-3 space-y-1 text-sm text-slate-600">
          <p><span class="font-medium">Phone:</span> {{ contact.phone || '-' }}</p>
          <p><span class="font-medium">Company:</span> {{ contact.company?.name || '-' }}</p>
          <p><span class="font-medium">Assigned:</span> {{ contact.assigned_user?.name || '-' }}</p>
          <p>
            <span class="font-medium">Last updated:</span>
            {{ contact.updated_by_user?.name || 'System' }} · {{ new Date(contact.updated_at).toLocaleString() }}
          </p>
        </div>
        <div class="mt-4 flex items-center justify-end gap-2">
          <button class="rounded border p-2 text-slate-700 hover:bg-slate-50" title="View" @click="router.push(`/app/contacts/${contact.id}`)">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
          </button>
          <button class="rounded border p-2 text-slate-700 hover:bg-slate-50" title="Edit" @click="openEdit(contact)">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
          </button>
          <button class="rounded border p-2 text-red-600 hover:bg-red-50 disabled:opacity-60" :disabled="deletingId === contact.id" title="Delete" @click="removeContact(contact.id)">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M8 6V4h8v2m-1 0v14H9V6"/></svg>
          </button>
        </div>
      </article>
    </div>

    <PaginationControls
      :current-page="contactsStore.pagination.current_page"
      :last-page="contactsStore.pagination.last_page"
      @change="(page) => contactsStore.fetchContacts(page, contactsStore.pagination.per_page)"
    />

    <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-xl rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">Import Contacts</h3>
          <button class="rounded border px-2 py-1 text-xs" @click="showImportModal = false">Close</button>
        </div>
        <label class="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-teal-400 bg-teal-50/30 p-5 text-center">
          <input type="file" class="hidden" accept=".csv,text/csv" :disabled="importing" @change="onImportFile" />
          <p class="text-sm font-medium text-slate-700">Click to upload CSV</p>
          <p class="mt-1 text-xs text-slate-500">Maximum file size: 10MB</p>
          <p v-if="importFile" class="mt-2 text-xs font-semibold text-slate-700">{{ importFile.name }}</p>
        </label>
        <div class="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p class="font-semibold">CSV format requirements:</p>
          <p>- Required: first_name, last_name, email</p>
          <p>- Optional: phone, lifecycle_stage, company_id or company_name, assigned_user_id, source, city</p>
          <button class="mt-2 text-xs font-semibold text-[var(--rc-accent)] underline" @click="downloadContactSampleCsv">
            Download sample CSV
          </button>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded border px-3 py-2 text-sm" @click="showImportModal = false">Cancel</button>
          <button class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="importing || !importFile" @click="importCsv">
            <span v-if="importing" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            {{ importing ? 'Importing...' : 'Import Contacts' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-3xl rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">Create Contact</h3>
          <button class="rounded border px-2 py-1 text-xs" @click="showCreateModal = false">Close</button>
        </div>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">First Name <span class="text-red-500">*</span></label>
            <input v-model.trim="createForm.first_name" class="rc-input" placeholder="e.g. Ravi" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Last Name <span class="text-red-500">*</span></label>
            <input v-model.trim="createForm.last_name" class="rc-input" placeholder="e.g. Kumar" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Email</label>
            <input v-model.trim="createForm.email" class="rc-input" placeholder="e.g. ravi@example.com" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Phone</label>
            <input v-model.trim="createForm.phone" class="rc-input" placeholder="e.g. +91-9000000000" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Lifecycle Stage <span class="text-red-500">*</span></label>
            <select v-model="createForm.lifecycle_stage" class="rc-input">
              <option :value="0">lead</option>
              <option :value="1">prospect</option>
              <option :value="2">customer</option>
              <option :value="3">inactive</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Assigned User</label>
            <select v-model="createForm.assigned_user_id" class="rc-input" @focus="contactsStore.fetchAssignableUsers()">
              <option value="">Select user</option>
              <option v-for="user in contactsStore.assignableUsers" :key="user.id" :value="String(user.id)">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Source</label>
            <input v-model.trim="createForm.meta_source" class="rc-input" placeholder="e.g. website" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">City</label>
            <input v-model.trim="createForm.meta_city" class="rc-input" placeholder="e.g. Bangalore" />
          </div>
        </div>
        <p v-if="contactsStore.errors.first_name?.[0]" class="mt-1 text-sm text-red-600">{{ contactsStore.errors.first_name[0] }}</p>
        <p v-if="contactsStore.errors.email?.[0]" class="mt-1 text-sm text-red-600">{{ contactsStore.errors.email[0] }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded border px-3 py-2 text-sm" @click="showCreateModal = false">Cancel</button>
          <button class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="creating" @click="submitCreate">
            <span v-if="creating" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            {{ creating ? 'Saving...' : 'Save Contact' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-3xl rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">Edit Contact</h3>
          <button class="rounded border px-2 py-1 text-xs" @click="closeEdit">Close</button>
        </div>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">First Name</label>
            <input v-model="editForm.first_name" class="rc-input" disabled />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Last Name</label>
            <input v-model="editForm.last_name" class="rc-input" disabled />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Email</label>
            <input v-model="editForm.email" class="rc-input" disabled />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Phone</label>
            <input v-model="editForm.phone" class="rc-input" disabled />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Lifecycle Stage</label>
            <select v-model="editForm.lifecycle_stage" class="rc-input">
              <option value="lead">lead</option>
              <option value="prospect">prospect</option>
              <option value="customer">customer</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Company</label>
            <select v-model="editForm.company_id" class="rc-input" disabled>
              <option value="">Select company</option>
              <option v-for="company in contactsStore.companyOptions" :key="company.id" :value="String(company.id)">
                {{ company.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Assigned User</label>
            <select v-model="editForm.assigned_user_id" class="rc-input" @focus="contactsStore.fetchAssignableUsers()">
              <option value="">Select user</option>
              <option v-for="user in contactsStore.assignableUsers" :key="user.id" :value="String(user.id)">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Source</label>
            <input v-model="editForm.meta_source" class="rc-input" disabled />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">City</label>
            <input v-model="editForm.meta_city" class="rc-input" disabled />
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded border px-3 py-2 text-sm" @click="closeEdit">Cancel</button>
          <button class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="saving" @click="submitEdit">
            <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

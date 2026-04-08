<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useContactsStore } from '@/modules/contacts/store/contacts.store'
import { contactsApi, type ContactItem } from '@/modules/contacts/services/contacts.api'
import { useToast } from '@/shared/utils/useToast'

const contactsStore = useContactsStore()
const toast = useToast()
const router = useRouter()
const creating = ref(false)
const saving = ref(false)
const deletingId = ref<number | null>(null)
const exporting = ref(false)
const importing = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedContact = ref<ContactItem | null>(null)

const createForm = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  lifecycle_stage: 0,
  company_id: '',
  assigned_user_id: '',
  meta_source: '',
  meta_city: '',
})

const editForm = reactive({
  lifecycle_stage: 'lead',
  assigned_user_id: '',
})

onMounted(() => contactsStore.fetchContacts())

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
      company_id: Number(createForm.company_id || 0) || undefined,
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
    createForm.company_id = ''
    createForm.assigned_user_id = ''
    createForm.meta_source = ''
    createForm.meta_city = ''
    showCreateModal.value = false
  } catch {
    toast.error(contactsStore.message || 'Create contact failed.')
  } finally {
    creating.value = false
  }
}

function openEdit(contact: ContactItem) {
  selectedContact.value = contact
  editForm.lifecycle_stage = contact.lifecycle_stage
  editForm.assigned_user_id = contact.assigned_user?.id ? String(contact.assigned_user.id) : ''
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
  if (!file || importing.value) return
  importing.value = true
  try {
    const { data } = await contactsApi.importCsv(file)
    toast.success(`${data.message} Created: ${data.data.created}, Skipped: ${data.data.skipped}`)
    await contactsStore.fetchContacts(1, contactsStore.pagination.per_page)
  } catch {
    toast.error('Import failed.')
  } finally {
    importing.value = false
    input.value = ''
  }
}

async function exportCsv() {
  if (exporting.value) return
  exporting.value = true
  try {
    const response = await contactsApi.exportCsv({
      stage: contactsStore.filters.stage || undefined,
      owner_id: contactsStore.filters.owner_id,
      company_id: contactsStore.filters.company_id,
      search: contactsStore.filters.search || undefined,
    })
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
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
        <button class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" @click="showCreateModal = true">Create Contact</button>
        <label class="rounded border px-3 py-1.5 text-sm" :class="{ 'opacity-60': importing }">
          <input type="file" class="hidden" accept=".csv,text/csv" :disabled="importing" @change="onImportFile" />
          {{ importing ? 'Importing...' : 'Import CSV' }}
        </label>
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

    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-3xl rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">Create Contact</h3>
          <button class="rounded border px-2 py-1 text-xs" @click="showCreateModal = false">Close</button>
        </div>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input v-model.trim="createForm.first_name" class="rc-input" placeholder="First name" />
          <input v-model.trim="createForm.last_name" class="rc-input" placeholder="Last name" />
          <input v-model.trim="createForm.email" class="rc-input" placeholder="Email" />
          <input v-model.trim="createForm.phone" class="rc-input" placeholder="Phone" />
          <select v-model="createForm.lifecycle_stage" class="rc-input">
            <option :value="0">lead</option>
            <option :value="1">prospect</option>
            <option :value="2">customer</option>
            <option :value="3">inactive</option>
          </select>
          <input v-model="createForm.company_id" type="number" class="rc-input" placeholder="Company ID" />
          <input v-model="createForm.assigned_user_id" type="number" class="rc-input" placeholder="Assigned user ID" />
          <input v-model.trim="createForm.meta_source" class="rc-input" placeholder="Meta source (optional)" />
          <input v-model.trim="createForm.meta_city" class="rc-input" placeholder="Meta city (optional)" />
        </div>
        <p v-if="contactsStore.errors.first_name?.[0]" class="mt-1 text-sm text-red-600">{{ contactsStore.errors.first_name[0] }}</p>
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
      <div class="w-full max-w-lg rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">Edit Contact</h3>
          <button class="rounded border px-2 py-1 text-xs" @click="closeEdit">Close</button>
        </div>
        <div class="grid gap-3">
          <select v-model="editForm.lifecycle_stage" class="rc-input">
            <option value="lead">lead</option>
            <option value="prospect">prospect</option>
            <option value="customer">customer</option>
            <option value="inactive">inactive</option>
          </select>
          <input v-model="editForm.assigned_user_id" type="number" class="rc-input" placeholder="Assigned user ID" />
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

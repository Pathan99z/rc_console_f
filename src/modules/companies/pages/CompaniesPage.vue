<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import { useCompaniesStore } from '@/modules/companies/store/companies.store'
import type { CompanyItem } from '@/modules/companies/services/companies.api'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const companiesStore = useCompaniesStore()
const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()
const editingCompanyId = ref<number | null>(null)
const submitting = ref(false)
const deletingId = ref<number | null>(null)
const showModal = ref(false)
const showImportModal = ref(false)
const importFile = ref<File | null>(null)
const importing = ref(false)
const exporting = ref(false)
const usersLoading = ref(false)
const importTenantId = ref('')

const form = reactive({
  name: '',
  industry: '',
  company_type: '',
  employees: '',
  revenue: '',
  email: '',
  phone: '',
  website: '',
  timezone: '',
  linkedin_url: '',
  assigned_user_id: '',
  address: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  description: '',
  status: 1,
})

onMounted(() => companiesStore.fetchCompanies())

function resetForm() {
  editingCompanyId.value = null
  form.name = ''
  form.industry = ''
  form.company_type = ''
  form.employees = ''
  form.revenue = ''
  form.email = ''
  form.phone = ''
  form.website = ''
  form.timezone = ''
  form.linkedin_url = ''
  form.assigned_user_id = ''
  form.address = ''
  form.city = ''
  form.state = ''
  form.postal_code = ''
  form.country = ''
  form.description = ''
  form.status = 1
  showModal.value = false
}

function openView(company: CompanyItem) {
  void router.push(`/app/companies/${company.id}`)
}

async function onEdit(item: CompanyItem) {
  await loadAssignableUsers()
  editingCompanyId.value = item.id
  form.name = item.name
  form.industry = item.industry || ''
  form.company_type = item.company_type || ''
  form.employees = item.employees ? String(item.employees) : ''
  form.revenue = item.revenue ? String(item.revenue) : ''
  form.email = item.email || ''
  form.phone = item.phone || ''
  form.website = item.website || ''
  form.timezone = item.timezone || ''
  form.linkedin_url = item.linkedin_url || ''
  form.assigned_user_id = item.assigned_user?.id ? String(item.assigned_user.id) : ''
  form.address = item.address || ''
  form.city = item.city || ''
  form.state = item.state || ''
  form.postal_code = item.postal_code || ''
  form.country = item.country || ''
  form.description = item.description || ''
  form.status = item.status === 'active' || item.status === 1 ? 1 : 0
  showModal.value = true
}

async function openCreateModal() {
  editingCompanyId.value = null
  form.name = ''
  form.industry = ''
  form.company_type = ''
  form.employees = ''
  form.revenue = ''
  form.email = ''
  form.phone = ''
  form.website = ''
  form.timezone = ''
  form.linkedin_url = ''
  form.assigned_user_id = ''
  form.address = ''
  form.city = ''
  form.state = ''
  form.postal_code = ''
  form.country = ''
  form.description = ''
  form.status = 1
  showModal.value = true
  await loadAssignableUsers()
}

async function loadAssignableUsers() {
  usersLoading.value = true
  try {
    await companiesStore.fetchAssignableUsers()
  } catch {
    toast.error(companiesStore.message || 'Unable to load users.')
  } finally {
    usersLoading.value = false
  }
  const loggedInUserId = authStore.user?.id
  if (!loggedInUserId) return

  const hasLoggedInUser = companiesStore.assignableUsers.some((user) => user.id === loggedInUserId)
  if (!hasLoggedInUser && authStore.user) {
    companiesStore.assignableUsers.unshift({
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

  if (!form.assigned_user_id) {
    form.assigned_user_id = String(loggedInUserId)
  }
}

async function submit() {
  if (submitting.value) return
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      industry: form.industry || undefined,
      company_type: form.company_type || undefined,
      employees: Number(form.employees || 0) || undefined,
      revenue: Number(form.revenue || 0) || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      website: form.website || undefined,
      timezone: form.timezone || undefined,
      linkedin_url: form.linkedin_url || undefined,
      assigned_user_id: Number(form.assigned_user_id || 0) || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      postal_code: form.postal_code || undefined,
      country: form.country || undefined,
      description: form.description || undefined,
      status: form.status,
    }
    if (editingCompanyId.value) {
      await companiesStore.updateCompany(editingCompanyId.value, payload)
      toast.success('Company updated successfully.')
    } else {
      await companiesStore.createCompany(payload)
      toast.success('Company created successfully.')
    }
    resetForm()
  } catch {
    toast.error(companiesStore.message || 'Operation failed.')
  } finally {
    submitting.value = false
  }
}

async function removeCompany(id: number) {
  if (deletingId.value) return
  if (!window.confirm('Delete this company?')) return
  deletingId.value = id
  try {
    await companiesStore.deleteCompany(id)
    toast.success('Company deleted.')
  } catch {
    toast.error(companiesStore.message || 'Delete failed.')
  } finally {
    deletingId.value = null
  }
}

const hasCompanies = computed(() => companiesStore.items.length > 0)

function onImportFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  importFile.value = file
  input.value = ''
}

async function submitImport() {
  if (!importFile.value || importing.value) return
  importing.value = true
  try {
    const result = await companiesStore.importCompanies(importFile.value, Number(importTenantId.value || 0) || undefined)
    toast.success(`Import completed. Created: ${result.created}, Skipped: ${result.skipped}`)
    showImportModal.value = false
    importFile.value = null
    importTenantId.value = ''
  } catch {
    toast.error(companiesStore.message || 'Company import failed.')
  } finally {
    importing.value = false
  }
}

async function exportCsv() {
  if (exporting.value) return
  exporting.value = true
  try {
    const blob = await companiesStore.exportCompanies(Number(importTenantId.value || 0) || undefined)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `companies-export-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}

function downloadCompanySampleCsv() {
  const sample = [
    'name,website,industry,company_type,employees,revenue,phone,email,timezone,linkedin_url,assigned_user_id,address,city,state,postal_code,country,description,status',
    'Acme Corporation,https://example.com,Technology,Private,150,5000000,+27-11-123-4567,contact@company.com,Africa/Johannesburg,https://linkedin.com/company/acme,,123 Main Street,Johannesburg,GP,2001,South Africa,Leading technology company.,1',
  ].join('\n')
  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'companies-sample.csv')
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Companies</h2>
        <p class="text-sm text-slate-500">Maintain company records for CRM operations.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn-secondary rounded-lg px-4 py-2 text-sm font-semibold" @click="openCreateModal">Create Company</button>
        <button class="rounded border px-3 py-1.5 text-sm" :disabled="importing" @click="showImportModal = true">{{ importing ? 'Importing...' : 'Import CSV' }}</button>
        <button class="rounded border px-3 py-1.5 text-sm" :disabled="exporting" @click="exportCsv">{{ exporting ? 'Exporting...' : 'Export CSV' }}</button>
      </div>
    </header>

    <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <div class="grid gap-3 md:grid-cols-2">
        <input v-model.trim="companiesStore.search" class="rc-input" placeholder="Search company..." @keyup.enter="companiesStore.fetchCompanies(1, companiesStore.pagination.per_page)" />
        <select v-model="companiesStore.status" class="rc-input" @change="companiesStore.fetchCompanies(1, companiesStore.pagination.per_page)">
          <option value="">All statuses</option>
          <option :value="1">Active</option>
          <option :value="0">Inactive</option>
        </select>
      </div>
    </div>

    <div v-if="companiesStore.loading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">Loading companies...</div>
    <div v-else-if="!hasCompanies" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">
      No companies found.
    </div>
    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="item in companiesStore.items" :key="item.id" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-semibold text-slate-900">{{ item.name }}</h3>
            <p class="text-sm text-slate-500">{{ item.email || '-' }}</p>
          </div>
          <span
            class="rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="item.status === 'active' || item.status === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
          >
            {{ item.status === 'active' || item.status === 1 ? 'active' : 'inactive' }}
          </span>
        </div>
        <div class="mt-3 space-y-1 text-sm text-slate-600">
          <p><span class="font-medium">Phone:</span> {{ item.phone || '-' }}</p>
          <p><span class="font-medium">Website:</span> {{ item.website || '-' }}</p>
          <p><span class="font-medium">Industry:</span> {{ item.industry || '-' }}</p>
          <p><span class="font-medium">Type:</span> {{ item.company_type || '-' }}</p>
          <p><span class="font-medium">Employees:</span> {{ item.employees ?? '-' }}</p>
          <p><span class="font-medium">Revenue:</span> {{ item.revenue ?? '-' }}</p>
          <p><span class="font-medium">Location:</span> {{ item.city || '-' }}, {{ item.country || '-' }}</p>
          <p><span class="font-medium">Assigned:</span> {{ item.assigned_user?.name || '-' }}</p>
        </div>
        <div class="mt-4 flex items-center justify-end gap-2">
          <button class="rounded border p-2 text-slate-700 hover:bg-slate-50" title="View" @click="openView(item)">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
          </button>
          <button class="rounded border p-2 text-slate-700 hover:bg-slate-50" title="Edit" @click="onEdit(item)">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
          </button>
          <button class="rounded border p-2 text-red-600 hover:bg-red-50 disabled:opacity-60" :disabled="deletingId === item.id" title="Delete" @click="removeCompany(item.id)">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M8 6V4h8v2m-1 0v14H9V6"/></svg>
          </button>
        </div>
      </article>
    </div>

    <PaginationControls
      :current-page="companiesStore.pagination.current_page"
      :last-page="companiesStore.pagination.last_page"
      @change="(page) => companiesStore.fetchCompanies(page, companiesStore.pagination.per_page)"
    />

    <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-xl rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">Import Companies</h3>
          <button class="rounded border px-2 py-1 text-xs" @click="showImportModal = false">Close</button>
        </div>
        <label class="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-teal-400 bg-teal-50/30 p-5 text-center">
          <input type="file" class="hidden" accept=".csv,text/csv" :disabled="importing" @change="onImportFileSelected" />
          <p class="text-sm font-medium text-slate-700">Click to upload CSV</p>
          <p class="mt-1 text-xs text-slate-500">Maximum file size: 10MB</p>
          <p v-if="importFile" class="mt-2 text-xs font-semibold text-slate-700">{{ importFile.name }}</p>
        </label>
        <div class="mt-3 grid gap-3">
          <input v-model="importTenantId" type="number" class="rc-input" placeholder="Tenant ID (optional for global admin)" />
        </div>
        <div class="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p class="font-semibold">CSV format requirements:</p>
          <p>- Required: name</p>
          <p>- Optional: all enhanced company fields from create API</p>
          <button class="mt-2 text-xs font-semibold text-[var(--rc-accent)] underline" @click="downloadCompanySampleCsv">
            Download sample CSV
          </button>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded border px-3 py-2 text-sm" @click="showImportModal = false">Cancel</button>
          <button class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="importing || !importFile" @click="submitImport">
            <span v-if="importing" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            {{ importing ? 'Importing...' : 'Import Companies' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">{{ editingCompanyId ? 'Edit company' : 'Create company' }}</h3>
          <button class="rounded border px-2 py-1 text-xs" @click="resetForm">Close</button>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Company Name <span class="text-red-500">*</span></label>
            <input v-model.trim="form.name" class="rc-input" placeholder="e.g. Acme Corporation" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Industry</label>
            <input v-model.trim="form.industry" class="rc-input" placeholder="e.g. Technology" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Company Type</label>
            <input v-model.trim="form.company_type" class="rc-input" placeholder="e.g. Private" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Employees</label>
            <input v-model="form.employees" type="number" class="rc-input" placeholder="e.g. 150" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Revenue</label>
            <input v-model="form.revenue" type="number" class="rc-input" placeholder="e.g. 5000000" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Email</label>
            <input v-model.trim="form.email" class="rc-input" placeholder="e.g. contact@company.com" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Phone</label>
            <input v-model.trim="form.phone" class="rc-input" placeholder="e.g. +27-11-123-4567" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Website</label>
            <input v-model.trim="form.website" class="rc-input" placeholder="e.g. https://example.com" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Timezone</label>
            <input v-model.trim="form.timezone" class="rc-input" placeholder="e.g. Africa/Johannesburg" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">LinkedIn URL</label>
            <input v-model.trim="form.linkedin_url" class="rc-input" placeholder="e.g. https://linkedin.com/company/acme" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Assigned User</label>
            <select
              v-model="form.assigned_user_id"
              class="rc-input"
              :disabled="submitting"
            >
              <option value="">Select user</option>
              <option v-for="user in companiesStore.assignableUsers" :key="user.id" :value="String(user.id)">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
            <p v-if="usersLoading" class="mt-1 text-xs text-slate-500">Loading users...</p>
          </div>
          <div class="md:col-span-2">
            <label class="mb-1 block text-xs font-semibold text-slate-600">Address</label>
            <input v-model.trim="form.address" class="rc-input" placeholder="e.g. 123 Main Street" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">City</label>
            <input v-model.trim="form.city" class="rc-input" placeholder="e.g. Johannesburg" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">State</label>
            <input v-model.trim="form.state" class="rc-input" placeholder="e.g. GP" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Postal Code</label>
            <input v-model.trim="form.postal_code" class="rc-input" placeholder="e.g. 2001" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Country</label>
            <input v-model.trim="form.country" class="rc-input" placeholder="e.g. South Africa" />
          </div>
          <div class="md:col-span-2">
            <label class="mb-1 block text-xs font-semibold text-slate-600">Description</label>
            <textarea v-model.trim="form.description" class="rc-input" rows="3" placeholder="e.g. Leading technology company."></textarea>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Status <span class="text-red-500">*</span></label>
            <select v-model="form.status" class="rc-input">
              <option :value="1">Active</option>
              <option :value="0">Inactive</option>
            </select>
          </div>
        </div>
        <p v-if="companiesStore.errors.name?.[0]" class="mt-1 text-sm text-red-600">{{ companiesStore.errors.name[0] }}</p>
        <p v-if="companiesStore.errors.linkedin_url?.[0]" class="mt-1 text-sm text-red-600">{{ companiesStore.errors.linkedin_url[0] }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded border px-3 py-2 text-sm" @click="resetForm">Cancel</button>
          <button class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="submitting" @click="submit">
            <span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            {{ submitting ? 'Saving...' : editingCompanyId ? 'Save Company' : 'Create Company' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import { useCompaniesStore } from '@/modules/companies/store/companies.store'
import type { CompanyItem } from '@/modules/companies/services/companies.api'

const companiesStore = useCompaniesStore()
const toast = useToast()
const editingCompanyId = ref<number | null>(null)
const submitting = ref(false)
const deletingId = ref<number | null>(null)
const showModal = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  website: '',
  status: 1,
})

onMounted(() => companiesStore.fetchCompanies())

function resetForm() {
  editingCompanyId.value = null
  form.name = ''
  form.email = ''
  form.phone = ''
  form.website = ''
  form.status = 1
  showModal.value = false
}

function onEdit(item: CompanyItem) {
  editingCompanyId.value = item.id
  form.name = item.name
  form.email = item.email || ''
  form.phone = item.phone || ''
  form.website = item.website || ''
  form.status = item.status === 'active' || item.status === 1 ? 1 : 0
  showModal.value = true
}

async function submit() {
  if (submitting.value) return
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      website: form.website || undefined,
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
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Companies</h2>
        <p class="text-sm text-slate-500">Maintain company records for CRM operations.</p>
      </div>
      <button class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" @click="showModal = true">Create Company</button>
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
        </div>
        <div class="mt-4 flex items-center justify-end gap-2">
          <button class="rounded border p-2 text-slate-700 hover:bg-slate-50" title="View">
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

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-2xl rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">{{ editingCompanyId ? 'Edit company' : 'Create company' }}</h3>
          <button class="rounded border px-2 py-1 text-xs" @click="resetForm">Close</button>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <input v-model.trim="form.name" class="rc-input" placeholder="Company name" />
          <input v-model.trim="form.email" class="rc-input" placeholder="Email" />
          <input v-model.trim="form.phone" class="rc-input" placeholder="Phone" />
          <input v-model.trim="form.website" class="rc-input" placeholder="Website" />
          <select v-model="form.status" class="rc-input">
            <option :value="1">Active</option>
            <option :value="0">Inactive</option>
          </select>
        </div>
        <p v-if="companiesStore.errors.name?.[0]" class="mt-1 text-sm text-red-600">{{ companiesStore.errors.name[0] }}</p>
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

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import { usePrmStore } from '@/modules/prm/store/prm.store'
import type { PartnerLeadItem } from '@/modules/prm/types/prm.types'

const prmStore = usePrmStore()
const toast = useToast()
const search = ref('')
const showModal = ref(false)
const editing = ref<PartnerLeadItem | null>(null)
const saving = ref(false)

const form = reactive({
  title: '',
  contact_email: '',
  company_name: '',
  status: 'new',
  approval_status: 'pending',
})

onMounted(async () => {
  try {
    await prmStore.fetchPartnerLeads(1, 15)
  } catch {
    toast.error(prmStore.message || 'Failed to load leads.')
  }
})

function openCreate() {
  editing.value = null
  form.title = ''
  form.contact_email = ''
  form.company_name = ''
  form.status = 'new'
  form.approval_status = 'pending'
  showModal.value = true
}

function openEdit(row: PartnerLeadItem) {
  editing.value = row
  form.title = row.title
  form.contact_email = row.contact_email || ''
  form.company_name = row.company_name || ''
  form.status = row.status || 'new'
  form.approval_status = row.approval_status || 'pending'
  showModal.value = true
}

async function saveLead() {
  if (saving.value) return
  saving.value = true
  try {
    if (editing.value) {
      await prmStore.updatePartnerLead(editing.value.id, { ...form })
      toast.success('Lead updated.')
    } else {
      await prmStore.createPartnerLead({ ...form })
      toast.success('Lead created.')
    }
    showModal.value = false
  } catch {
    toast.error(prmStore.message || 'Save failed.')
  } finally {
    saving.value = false
  }
}

async function applySearch() {
  try {
    await prmStore.fetchPartnerLeads(1, 15, search.value.trim() || undefined)
  } catch {
    toast.error(prmStore.message || 'Search failed.')
  }
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Lead registration</h2>
        <p class="text-sm text-slate-500">Register and track leads in your partner channel.</p>
      </div>
      <button type="button" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" @click="openCreate">New lead</button>
    </header>

    <div class="flex flex-wrap gap-2 rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <input v-model.trim="search" class="rc-input max-w-md flex-1" placeholder="Search title, email, company…" @keyup.enter="applySearch" />
      <button type="button" class="rounded border px-3 py-2 text-sm" @click="applySearch">Search</button>
    </div>

    <div class="overflow-x-auto rounded-xl border border-[var(--rc-border-soft)] bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-3 text-left">Title</th>
            <th class="px-4 py-3 text-left">Company</th>
            <th class="px-4 py-3 text-left">Email</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="prmStore.leadsLoading">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">Loading…</td>
          </tr>
          <tr v-else-if="!prmStore.leads.length">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">No leads yet.</td>
          </tr>
          <tr v-for="row in prmStore.leads" v-else :key="row.id" class="border-t border-[var(--rc-border-soft)]">
            <td class="px-4 py-3 font-medium text-slate-900">{{ row.title }}</td>
            <td class="px-4 py-3">{{ row.company_name || '—' }}</td>
            <td class="px-4 py-3">{{ row.contact_email || '—' }}</td>
            <td class="px-4 py-3 capitalize">{{ row.status }} / {{ row.approval_status }}</td>
            <td class="px-4 py-3 text-right">
              <button type="button" class="rounded border px-2 py-1 text-xs" @click="openEdit(row)">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationControls
      :current-page="prmStore.leadsPagination.current_page"
      :last-page="prmStore.leadsPagination.last_page"
      @change="(p) => prmStore.fetchPartnerLeads(p, prmStore.leadsPagination.per_page, search.trim() ? search.trim() : undefined)"
    />

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <h3 class="text-sm font-semibold">{{ editing ? 'Edit lead' : 'New lead' }}</h3>
        <div class="mt-4 grid gap-3">
          <input v-model.trim="form.title" class="rc-input" placeholder="Title" />
          <input v-model.trim="form.company_name" class="rc-input" placeholder="Company name" />
          <input v-model.trim="form.contact_email" class="rc-input" placeholder="Contact email" />
          <select v-model="form.status" class="rc-input">
            <option value="new">new</option>
            <option value="qualified">qualified</option>
            <option value="lost">lost</option>
          </select>
          <select v-model="form.approval_status" class="rc-input">
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded border px-3 py-2 text-sm" @click="showModal = false">Cancel</button>
          <button type="button" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" :disabled="saving" @click="saveLead">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useContactsStore } from '@/modules/contacts/store/contacts.store'
import { useToast } from '@/shared/utils/useToast'

const route = useRoute()
const router = useRouter()
const contactsStore = useContactsStore()
const toast = useToast()
const companyIdToAttach = ref('')
const companyActionLoading = ref(false)

onMounted(async () => {
  const id = Number(route.params.id)
  await Promise.all([contactsStore.fetchContactDetail(id), contactsStore.fetchCompanyOptions()])
})

function stageClass(stage: string) {
  if (stage === 'lead') return 'bg-slate-100 text-slate-700'
  if (stage === 'prospect') return 'bg-blue-50 text-blue-700'
  if (stage === 'customer') return 'bg-emerald-50 text-emerald-700'
  return 'bg-amber-50 text-amber-700'
}

async function attachCompany() {
  if (!contactsStore.selected || !companyIdToAttach.value || companyActionLoading.value) return
  companyActionLoading.value = true
  try {
    await contactsStore.attachCompany(contactsStore.selected.id, Number(companyIdToAttach.value))
    toast.success('Company attached to contact successfully.')
    companyIdToAttach.value = ''
  } catch {
    toast.error(contactsStore.message || 'Failed to attach company.')
  } finally {
    companyActionLoading.value = false
  }
}

async function detachCompany() {
  if (!contactsStore.selected || companyActionLoading.value) return
  companyActionLoading.value = true
  try {
    await contactsStore.detachCompany(contactsStore.selected.id)
    toast.success('Company detached from contact successfully.')
  } catch {
    toast.error(contactsStore.message || 'Failed to detach company.')
  } finally {
    companyActionLoading.value = false
  }
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Contact Detail</h2>
        <p class="text-sm text-slate-500">View contact information and quick actions.</p>
      </div>
      <div class="flex gap-2">
        <button class="rounded border px-3 py-1.5 text-sm">Edit Contact</button>
        <button class="rounded border px-3 py-1.5 text-sm text-red-600">Delete</button>
      </div>
    </header>

    <div v-if="contactsStore.loading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 text-sm text-slate-500">Loading contact...</div>
    <template v-else-if="contactsStore.selected">
      <div class="grid gap-4 lg:grid-cols-3">
        <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 lg:col-span-2">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {{ (contactsStore.selected.first_name?.[0] || '') + (contactsStore.selected.last_name?.[0] || '') }}
            </div>
            <div>
              <h3 class="text-lg font-semibold">{{ contactsStore.selected.first_name }} {{ contactsStore.selected.last_name }}</h3>
              <p class="text-sm text-slate-500">{{ contactsStore.selected.email || '-' }}</p>
              <span class="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold" :class="stageClass(contactsStore.selected.lifecycle_stage)">
                {{ contactsStore.selected.lifecycle_stage }}
              </span>
            </div>
          </div>
          <div class="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
            <p><span class="font-medium">Phone:</span> {{ contactsStore.selected.phone || '-' }}</p>
            <p><span class="font-medium">Assigned:</span> {{ contactsStore.selected.assigned_user?.name || '-' }}</p>
            <p><span class="font-medium">Company:</span> {{ contactsStore.selected.company?.name || '-' }}</p>
            <p><span class="font-medium">Source:</span> {{ String(contactsStore.selected.meta?.source || '-') }}</p>
            <p class="md:col-span-2">
              <span class="font-medium">Last updated:</span>
              {{ contactsStore.selected.updated_by_user?.name || 'System' }} · {{ new Date(contactsStore.selected.updated_at).toLocaleString() }}
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
            <h4 class="mb-3 text-sm font-semibold">Quick Actions</h4>
            <div class="space-y-2">
              <button class="w-full rounded border px-3 py-2 text-sm" @click="router.push('/app/companies')">Create Company</button>
              <button class="w-full rounded border px-3 py-2 text-sm">Create Deal</button>
              <button class="w-full rounded border px-3 py-2 text-sm">Log Activity</button>
              <button class="w-full rounded border px-3 py-2 text-sm">Send Email</button>
            </div>
          </div>

          <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
            <h4 class="mb-2 text-sm font-semibold">Contact Stats</h4>
            <p class="text-xs text-slate-500">Total Activities: {{ (contactsStore.selected.activities || []).length }}</p>
            <p class="text-xs text-slate-500">Created: {{ new Date(contactsStore.selected.created_at).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
        <h3 class="mb-3 text-sm font-semibold">Associated Company</h3>
        <div class="space-y-3">
          <button class="flex w-full items-center justify-between rounded-lg border border-[var(--rc-border-soft)] px-3 py-2 text-left text-sm hover:bg-slate-50">
            <span>{{ contactsStore.selected.company?.name || 'No company linked' }}</span>
            <span class="text-slate-400">></span>
          </button>
          <div class="grid gap-2 md:grid-cols-[1fr_auto_auto]">
            <select v-model="companyIdToAttach" class="rc-input">
              <option value="">Select company</option>
              <option v-for="company in contactsStore.companyOptions" :key="company.id" :value="String(company.id)">
                {{ company.name }}
              </option>
            </select>
            <button class="rounded border px-3 py-2 text-sm" :disabled="companyActionLoading || !companyIdToAttach" @click="attachCompany">
              Attach
            </button>
            <button class="rounded border px-3 py-2 text-sm text-red-600" :disabled="companyActionLoading || !contactsStore.selected.company" @click="detachCompany">
              Detach
            </button>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
        <h3 class="mb-3 text-sm font-semibold">Timeline</h3>
        <div v-if="!(contactsStore.selected.activities || []).length" class="text-sm text-slate-500">No activities yet.</div>
        <div v-else class="space-y-3">
          <div v-for="activity in contactsStore.selected.activities" :key="activity.id" class="rounded-lg border border-[var(--rc-border-soft)] p-3">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ activity.type }}</p>
            <p class="mt-1 text-sm text-slate-800">{{ activity.note }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ new Date(activity.occurred_at).toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

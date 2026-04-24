<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCompaniesStore } from '@/modules/companies/store/companies.store'
import { useToast } from '@/shared/utils/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const companiesStore = useCompaniesStore()

const companyId = computed(() => Number(route.params.id || 0))
const company = computed(() => companiesStore.selected)

async function loadCompany() {
  if (!companyId.value) {
    toast.error('Invalid company id.')
    void router.push('/app/companies')
    return
  }
  try {
    await companiesStore.fetchCompanyDetail(companyId.value)
  } catch {
    toast.error(companiesStore.message || 'Unable to load company details.')
    void router.push('/app/companies')
  }
}

onMounted(loadCompany)
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Company Details</h2>
        <p class="text-sm text-slate-500">Review complete company information in a dedicated view.</p>
      </div>
      <button class="rounded border px-3 py-1.5 text-sm" @click="$router.push('/app/companies')">Back to Companies</button>
    </header>

    <div v-if="companiesStore.loading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">
      Loading company...
    </div>

    <div v-else-if="!company" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">
      Company not found.
    </div>

    <div v-else class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5">
      <div class="mb-4 flex items-start justify-between">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">{{ company.name }}</h3>
          <p class="text-sm text-slate-500">{{ company.email || '-' }}</p>
        </div>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-semibold"
          :class="company.status === 'active' || company.status === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
        >
          {{ company.status === 'active' || company.status === 1 ? 'active' : 'inactive' }}
        </span>
      </div>

      <div class="grid gap-3 text-sm md:grid-cols-2">
        <p><span class="font-semibold text-slate-700">Industry:</span> {{ company.industry || '-' }}</p>
        <p><span class="font-semibold text-slate-700">Type:</span> {{ company.company_type || '-' }}</p>
        <p><span class="font-semibold text-slate-700">Employees:</span> {{ company.employees ?? '-' }}</p>
        <p><span class="font-semibold text-slate-700">Revenue:</span> {{ company.revenue ?? '-' }}</p>
        <p><span class="font-semibold text-slate-700">Phone:</span> {{ company.phone || '-' }}</p>
        <p><span class="font-semibold text-slate-700">Website:</span> {{ company.website || '-' }}</p>
        <p><span class="font-semibold text-slate-700">Timezone:</span> {{ company.timezone || '-' }}</p>
        <p><span class="font-semibold text-slate-700">LinkedIn:</span> {{ company.linkedin_url || '-' }}</p>
        <p><span class="font-semibold text-slate-700">Assigned User:</span> {{ company.assigned_user?.name || '-' }}</p>
        <p><span class="font-semibold text-slate-700">Country:</span> {{ company.country || '-' }}</p>
        <p class="md:col-span-2"><span class="font-semibold text-slate-700">Address:</span> {{ company.address || '-' }}</p>
        <p><span class="font-semibold text-slate-700">City:</span> {{ company.city || '-' }}</p>
        <p><span class="font-semibold text-slate-700">State:</span> {{ company.state || '-' }}</p>
        <p><span class="font-semibold text-slate-700">Postal Code:</span> {{ company.postal_code || '-' }}</p>
        <p class="md:col-span-2"><span class="font-semibold text-slate-700">Description:</span> {{ company.description || '-' }}</p>
      </div>
    </div>
  </section>
</template>

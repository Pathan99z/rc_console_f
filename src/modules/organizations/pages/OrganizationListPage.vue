<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useOrganizationStore } from '@/modules/organizations/store/organization.store'
import OrganizationFilters from '@/modules/organizations/components/OrganizationFilters.vue'
import OrganizationTable from '@/modules/organizations/components/OrganizationTable.vue'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const organizationStore = useOrganizationStore()

const filters = reactive({
  search: '',
  type: '',
  onboarding_status: '',
  status: '',
})

onMounted(async () => {
  Object.assign(filters, organizationStore.filters)
  await applyFilters()
})

async function applyFilters() {
  Object.assign(organizationStore.filters, filters)
  try {
    await organizationStore.fetchOrganizations(1, organizationStore.pagination.per_page)
  } catch {
    toast.error(organizationStore.message || 'Failed to load partners and resellers.')
  }
}

function clearFilters() {
  filters.search = ''
  filters.type = ''
  filters.status = ''
  filters.onboarding_status = ''
  void applyFilters()
}

function openCreate() {
  void router.push('/app/organizations/create')
}

function onView(id: number) {
  void router.push(`/app/organizations/${id}`)
}

function onEdit(id: number) {
  void router.push(`/app/organizations/${id}/edit`)
}

const canCreate = ['global_admin', 'company_admin', 'partner_admin'].includes(authStore.user?.role || '')
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Partners & resellers</h2>
        <p class="text-sm text-slate-500">
          Tenant network: company roots, partners, and resellers. Add partners or resellers when your role allows.
        </p>
      </div>
      <button v-if="canCreate" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" @click="openCreate">
        Add partner or reseller
      </button>
    </header>

    <OrganizationFilters v-model="filters" @apply="applyFilters" @clear="clearFilters" />

    <OrganizationTable
      :rows="organizationStore.items"
      :loading="organizationStore.loading"
      @view="onView($event.id)"
      @edit="onEdit($event.id)"
    />

    <PaginationControls
      :current-page="organizationStore.pagination.current_page"
      :last-page="organizationStore.pagination.last_page"
      @change="(page) => organizationStore.fetchOrganizations(page, organizationStore.pagination.per_page)"
    />
  </section>
</template>

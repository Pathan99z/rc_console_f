<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import { usePrmStore } from '@/modules/prm/store/prm.store'

const prmStore = usePrmStore()
const toast = useToast()
const category = ref('')
const downloadingId = ref<number | null>(null)

onMounted(async () => {
  try {
    await prmStore.fetchPartnerCollaterals(1, 15)
  } catch {
    toast.error(prmStore.message || 'Failed to load resources.')
  }
})

async function reload() {
  try {
    await prmStore.fetchPartnerCollaterals(1, 15, category.value || undefined)
  } catch {
    toast.error(prmStore.message || 'Failed to filter.')
  }
}

async function download(id: number) {
  if (downloadingId.value) return
  downloadingId.value = id
  try {
    await prmStore.trackCollateralDownload(id)
    toast.success('Download recorded.')
  } catch {
    toast.error(prmStore.message || 'Download tracking failed.')
  } finally {
    downloadingId.value = null
  }
}

function displayName(row: { name?: string; title?: string }) {
  return row.title || row.name || `Collateral #${row.id}`
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Resource center</h2>
      <p class="text-sm text-slate-500">Partner-visible collaterals and download tracking.</p>
    </header>

    <div class="flex flex-wrap gap-2 rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <select v-model="category" class="rc-input max-w-xs" @change="reload">
        <option value="">All categories</option>
        <option value="training">training</option>
        <option value="brochure">brochure</option>
        <option value="battle_card">battle_card</option>
        <option value="nda">nda</option>
        <option value="pricing">pricing</option>
        <option value="proposal">proposal</option>
        <option value="other">other</option>
      </select>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="row in prmStore.collaterals"
        :key="row.id"
        class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-sm"
      >
        <p class="text-xs font-semibold uppercase text-slate-500">{{ row.resource_category || 'resource' }}</p>
        <h3 class="mt-1 font-semibold text-slate-900">{{ displayName(row) }}</h3>
        <button
          type="button"
          class="btn-secondary mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold"
          :disabled="downloadingId === row.id"
          @click="download(row.id)"
        >
          {{ downloadingId === row.id ? 'Recording…' : 'Mark download' }}
        </button>
      </article>
    </div>
    <p v-if="!prmStore.collateralsLoading && !prmStore.collaterals.length" class="text-center text-sm text-slate-500">No resources found.</p>

    <PaginationControls
      :current-page="prmStore.collateralsPagination.current_page"
      :last-page="prmStore.collateralsPagination.last_page"
      @change="(p) => prmStore.fetchPartnerCollaterals(p, prmStore.collateralsPagination.per_page, category || undefined)"
    />
  </section>
</template>

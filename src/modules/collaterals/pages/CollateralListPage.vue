<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { useToast } from '@/shared/utils/useToast'
import { useCollateralsStore } from '@/modules/collaterals/store/collateral.store'
import CollateralFilters from '@/modules/collaterals/components/CollateralFilters.vue'
import CollateralTable from '@/modules/collaterals/components/CollateralTable.vue'
import CollateralUploadModal from '@/modules/collaterals/components/CollateralUploadModal.vue'
import CollateralSendModal from '@/modules/collaterals/components/CollateralSendModal.vue'
import CollateralEditModal from '@/modules/collaterals/components/CollateralEditModal.vue'
import type { CollateralItem } from '@/modules/collaterals/types/collateral.types'

const toast = useToast()
const collateralsStore = useCollateralsStore()
const { auth, isGlobalAdmin, isPrivilegedUser } = useAuth()

const showUploadModal = ref(false)
const showSendModal = ref(false)
const showEditModal = ref(false)
const sendTarget = ref<CollateralItem | null>(null)
const editTarget = ref<CollateralItem | null>(null)

const canDelete = computed(() => isPrivilegedUser.value)

async function bootstrap() {
  await Promise.all([
    collateralsStore.fetchCollaterals(),
    collateralsStore.fetchProductOptions(),
    collateralsStore.fetchContactOptions(),
  ])
}

async function applyFilters() {
  await collateralsStore.fetchCollaterals(1, collateralsStore.pagination.per_page)
}

async function resetFilters() {
  collateralsStore.filters.search = ''
  collateralsStore.filters.product_id = ''
  collateralsStore.filters.type = ''
  collateralsStore.filters.file_type = ''
  collateralsStore.filters.tenant_id = ''
  await collateralsStore.fetchCollaterals(1, collateralsStore.pagination.per_page)
}

async function submitUpload(form: { product_id: string; name: string; type: string; tenant_id: string; file: File | null }) {
  if (!form.file) {
    toast.error('Please select a file to upload.')
    return
  }
  try {
    await collateralsStore.uploadCollateral({
      product_id: Number(form.product_id),
      name: form.name.trim(),
      type: form.type,
      file: form.file,
      tenant_id: isGlobalAdmin.value ? Number(form.tenant_id || 0) || undefined : auth.user?.tenant_id,
    })
    toast.success('Collateral uploaded successfully.')
    showUploadModal.value = false
    await collateralsStore.fetchCollaterals(collateralsStore.pagination.current_page, collateralsStore.pagination.per_page)
  } catch {
    toast.error(collateralsStore.message || 'Collateral upload failed.')
  }
}

async function openPreview(item: CollateralItem) {
  try {
    const detail = await collateralsStore.getCollateralDetail(item.id)
    if (!detail?.signed_url) {
      toast.error('Unable to generate signed URL.')
      return
    }
    window.open(detail.signed_url, '_blank', 'noopener,noreferrer')
  } catch {
    toast.error(collateralsStore.message || 'Unable to open collateral.')
  }
}

function openSendModal(item: CollateralItem) {
  sendTarget.value = item
  showSendModal.value = true
}

function openEditModal(item: CollateralItem) {
  editTarget.value = item
  showEditModal.value = true
}

async function submitEdit(form: { product_id: string; name: string; type: string; file: File | null }) {
  if (!editTarget.value) return
  try {
    await collateralsStore.updateCollateral(editTarget.value.id, {
      product_id: Number(form.product_id),
      name: form.name.trim(),
      type: form.type,
      file: form.file || undefined,
    })
    toast.success('Collateral updated successfully.')
    showEditModal.value = false
    editTarget.value = null
  } catch {
    toast.error(collateralsStore.message || 'Unable to update collateral.')
  }
}

async function submitSend(form: { contact_id: string; email: string; message: string }) {
  if (!sendTarget.value) return
  if (!form.contact_id && !form.email.trim()) {
    toast.error('Please select contact or provide email.')
    return
  }
  try {
    await collateralsStore.sendCollateral(sendTarget.value.id, {
      contact_id: Number(form.contact_id || 0) || undefined,
      email: form.email.trim() || undefined,
      message: form.message.trim() || undefined,
    })
    toast.success('Collateral shared successfully.')
    showSendModal.value = false
    sendTarget.value = null
  } catch {
    toast.error(collateralsStore.message || 'Unable to send collateral.')
  }
}

async function removeCollateral(item: CollateralItem) {
  if (!window.confirm('Delete this collateral?')) return
  try {
    await collateralsStore.deleteCollateral(item.id)
    toast.success('Collateral deleted successfully.')
  } catch {
    toast.error(collateralsStore.message || 'Unable to delete collateral.')
  }
}

onMounted(() => {
  void bootstrap()
})
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Collaterals</h2>
        <p class="text-sm text-slate-500">Upload, preview with signed links, and share product collaterals securely.</p>
      </div>
      <button class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" @click="showUploadModal = true">Upload Collateral</button>
    </header>

    <CollateralFilters
      :search="collateralsStore.filters.search"
      :product-id="collateralsStore.filters.product_id"
      :type="collateralsStore.filters.type"
      :file-type="collateralsStore.filters.file_type"
      :tenant-id="collateralsStore.filters.tenant_id"
      :show-tenant-filter="isGlobalAdmin"
      :products="collateralsStore.products"
      :loading="collateralsStore.loading"
      @update:search="(value) => (collateralsStore.filters.search = value)"
      @update:product-id="(value) => (collateralsStore.filters.product_id = value)"
      @update:type="(value) => (collateralsStore.filters.type = value)"
      @update:file-type="(value) => (collateralsStore.filters.file_type = value)"
      @update:tenant-id="(value) => (collateralsStore.filters.tenant_id = value)"
      @apply="applyFilters"
      @reset="resetFilters"
    />

    <div v-if="collateralsStore.loading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">
      Loading collaterals...
    </div>
    <CollateralTable
      v-else
      :items="collateralsStore.items"
      :deleting-id="collateralsStore.deletingId"
      :can-delete="canDelete"
      @view="openPreview"
      @edit="openEditModal"
      @send="openSendModal"
      @delete="removeCollateral"
    />

    <PaginationControls
      :current-page="collateralsStore.pagination.current_page"
      :last-page="collateralsStore.pagination.last_page"
      @change="(page) => collateralsStore.fetchCollaterals(page, collateralsStore.pagination.per_page)"
    />

    <CollateralUploadModal
      :open="showUploadModal"
      :uploading="collateralsStore.uploading"
      :progress="collateralsStore.uploadProgress"
      :products="collateralsStore.products"
      :show-tenant-field="isGlobalAdmin"
      :errors="collateralsStore.errors"
      @close="showUploadModal = false"
      @submit="submitUpload"
    />

    <CollateralSendModal
      :open="showSendModal"
      :collateral="sendTarget"
      :contacts="collateralsStore.contacts"
      :sending="Boolean(collateralsStore.sendingId)"
      :errors="collateralsStore.errors"
      @close="showSendModal = false; sendTarget = null"
      @submit="submitSend"
    />

    <CollateralEditModal
      :open="showEditModal"
      :collateral="editTarget"
      :products="collateralsStore.products"
      :updating="Boolean(collateralsStore.updatingId)"
      :errors="collateralsStore.errors"
      @close="showEditModal = false; editTarget = null"
      @submit="submitEdit"
    />
  </section>
</template>

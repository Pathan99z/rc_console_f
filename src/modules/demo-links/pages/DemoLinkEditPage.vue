<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/shared/utils/useToast'
import DemoLinkForm from '@/modules/demo-links/components/DemoLinkForm.vue'
import { useDemoLinkStore } from '@/modules/demo-links/store/demoLink.store'
import type { DemoLinkUpdatePayload } from '@/modules/demo-links/types/demoLink.types'

const route = useRoute()
const router = useRouter()
const store = useDemoLinkStore()
const toast = useToast()

const loading = ref(true)
const id = Number(route.params.id)

onMounted(async () => {
  try {
    await store.fetchDemoLink(id)
  } catch {
    toast.error(store.message || 'Demo link not found.')
    router.replace('/app/demo-links')
  } finally {
    loading.value = false
  }
})

async function onSubmit(payload: DemoLinkUpdatePayload) {
  try {
    await store.updateDemoLink(id, payload)
    toast.success(store.message || 'Demo link updated.')
    router.push(`/app/demo-links/${id}`)
  } catch {
    toast.error(store.message || 'Update failed.')
  }
}

function onCancel() {
  router.push(`/app/demo-links/${id}`)
}
</script>

<template>
  <section class="mx-auto max-w-2xl space-y-4">
    <nav class="text-xs text-slate-500">
      <RouterLink to="/app/demo-links" class="hover:text-indigo-600">Demo Links</RouterLink>
      <span class="mx-1">/</span>
      <RouterLink v-if="store.currentDemoLink" :to="`/app/demo-links/${id}`" class="hover:text-indigo-600">
        {{ store.currentDemoLink.title }}
      </RouterLink>
      <span class="mx-1">/</span>
      <span class="font-medium text-slate-700">Edit</span>
    </nav>
    <header>
      <h2 class="text-xl font-bold text-slate-900">Edit demo link</h2>
    </header>
    <div v-if="loading" class="rounded-xl border bg-white px-4 py-12 text-center text-slate-500">
      Loading…
    </div>
    <div v-else-if="store.currentDemoLink?.permissions?.can_edit === false" class="rounded-xl border bg-white p-6 text-sm text-rose-600">
      You do not have permission to edit this demo link.
    </div>
    <div v-else class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 sm:p-5">
      <DemoLinkForm
        mode="edit"
        :initial="store.currentDemoLink"
        :field-errors="store.fieldErrors"
        :saving="store.saving"
        @submit="onSubmit"
        @cancel="onCancel"
      />
    </div>
  </section>
</template>

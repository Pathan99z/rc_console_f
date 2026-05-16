<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useToast } from '@/shared/utils/useToast'
import DemoLinkForm from '@/modules/demo-links/components/DemoLinkForm.vue'
import { useDemoLinkStore } from '@/modules/demo-links/store/demoLink.store'
import type { DemoLinkPayload } from '@/modules/demo-links/types/demoLink.types'

const router = useRouter()
const store = useDemoLinkStore()
const toast = useToast()

async function onSubmit(payload: DemoLinkPayload) {
  try {
    const link = await store.createDemoLink(payload)
    toast.success(store.message || 'Demo link created.')
    router.push(`/app/demo-links/${link.id}`)
  } catch {
    toast.error(store.message || 'Create failed.')
  }
}

function onCancel() {
  router.push('/app/demo-links')
}
</script>

<template>
  <section class="mx-auto max-w-2xl space-y-4">
    <nav class="text-xs text-slate-500">
      <RouterLink to="/app/demo-links" class="hover:text-indigo-600">Demo Links</RouterLink>
      <span class="mx-1">/</span>
      <span class="font-medium text-slate-700">Create</span>
    </nav>
    <header>
      <h2 class="text-xl font-bold text-slate-900">New demo link</h2>
      <p class="text-sm text-slate-500">Add a demo environment for your team or partners.</p>
    </header>
    <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 sm:p-5">
      <DemoLinkForm
        mode="create"
        :field-errors="store.fieldErrors"
        :saving="store.saving"
        @submit="onSubmit"
        @cancel="onCancel"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/shared/utils/useToast'
import DemoLinkStatusBadge from '@/modules/demo-links/components/DemoLinkStatusBadge.vue'
import TaskConfirmModal from '@/modules/tasks/components/TaskConfirmModal.vue'
import { useDemoLinkAccess } from '@/modules/demo-links/composables/useDemoLinkAccess'
import { useDemoLinkStore } from '@/modules/demo-links/store/demoLink.store'
import {
  formatCheckedAt,
  hasDemoPassword,
  orgDisplayName,
  productTags,
  screenshotSrc,
} from '@/modules/demo-links/utils/demoLinkFormat'

const route = useRoute()
const router = useRouter()
const store = useDemoLinkStore()
const toast = useToast()
const { canManageDemoLinks } = useDemoLinkAccess()

const id = Number(route.params.id)
const loading = ref(true)
const passwordRevealed = ref(false)
const showDelete = ref(false)
const checking = ref(false)

const link = computed(() => store.currentDemoLink)
const perms = computed(() => link.value?.permissions || {})
const tags = computed(() => (link.value ? productTags(link.value) : []))
const thumb = computed(() => (link.value ? screenshotSrc(link.value) : null))

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

function openDemo() {
  if (!link.value?.demo_url) return
  window.open(link.value.demo_url, '_blank', 'noopener,noreferrer')
}

async function checkStatus() {
  checking.value = true
  try {
    await store.checkDemoLinkStatus(id)
    toast.success(store.message || 'Status updated.')
  } catch {
    toast.error(store.message || 'Status check failed.')
  } finally {
    checking.value = false
  }
}

async function revealCredentials() {
  try {
    await store.fetchDemoLink(id, true)
    passwordRevealed.value = true
  } catch {
    toast.error(store.message || 'Could not reveal credentials.')
  }
}

async function confirmDelete() {
  showDelete.value = false
  try {
    await store.deleteDemoLink(id)
    toast.success(store.message || 'Demo link deleted.')
    router.push('/app/demo-links')
  } catch {
    toast.error(store.message || 'Delete failed.')
  }
}
</script>

<template>
  <section class="mx-auto max-w-4xl space-y-5">
    <nav class="text-xs text-slate-500">
      <RouterLink to="/app/demo-links" class="hover:text-indigo-600">Demo Links</RouterLink>
      <span class="mx-1">/</span>
      <span class="font-medium text-slate-700">{{ link?.title || 'Detail' }}</span>
    </nav>

    <div v-if="loading" class="rounded-xl border bg-white px-4 py-16 text-center text-slate-500">Loading…</div>

    <template v-else-if="link">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-xl font-bold text-slate-900">{{ link.title }}</h2>
            <DemoLinkStatusBadge :status="link.last_status" />
            <span
              v-if="link.is_active === false"
              class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600"
            >
              Inactive
            </span>
          </div>
          <p v-if="link.description" class="mt-1 text-sm text-slate-500">{{ link.description }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-if="perms.can_open !== false && link.demo_url"
            type="button"
            class="rounded-lg border px-3 py-2 text-sm font-semibold"
            @click="openDemo"
          >
            Open Demo
          </button>
          <button
            v-if="perms.can_check_status"
            type="button"
            class="rounded-lg border px-3 py-2 text-sm font-semibold"
            :disabled="checking"
            @click="checkStatus"
          >
            {{ checking ? 'Checking…' : 'Check Status' }}
          </button>
          <RouterLink
            v-if="perms.can_edit"
            :to="`/app/demo-links/${id}/edit`"
            class="rounded-lg border px-3 py-2 text-sm font-semibold text-indigo-700"
          >
            Edit
          </RouterLink>
          <button
            v-if="perms.can_delete"
            type="button"
            class="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700"
            @click="showDelete = true"
          >
            Delete
          </button>
        </div>
      </header>

      <div class="grid gap-5 lg:grid-cols-2">
        <div v-if="thumb" class="overflow-hidden rounded-xl border bg-white">
          <img :src="thumb" :alt="link.title" class="w-full object-cover" />
        </div>

        <div class="space-y-4 rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-6">
          <dl class="space-y-3 text-sm">
            <div>
              <dt class="text-slate-500">Demo URL</dt>
              <dd class="break-all font-medium text-indigo-700">
                <a :href="link.demo_url" target="_blank" rel="noopener noreferrer">{{ link.demo_url }}</a>
              </dd>
            </div>
            <div>
              <dt class="text-slate-500">Owner organization</dt>
              <dd>{{ orgDisplayName(link.owner_organization) }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Username</dt>
              <dd class="font-mono">{{ link.demo_username || '—' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Password</dt>
              <dd>
                <span v-if="!passwordRevealed">{{ hasDemoPassword(link) ? '••••••••' : 'Not set' }}</span>
                <span v-else class="font-mono">{{ link.demo_password || '—' }}</span>
                <button
                  v-if="perms.can_reveal_credentials && hasDemoPassword(link) && !passwordRevealed"
                  type="button"
                  class="ml-2 text-xs font-semibold text-indigo-600"
                  @click="revealCredentials"
                >
                  Reveal
                </button>
              </dd>
            </div>
            <div>
              <dt class="text-slate-500">Last checked</dt>
              <dd>{{ formatCheckedAt(link.last_checked_at) }}</dd>
            </div>
          </dl>

          <div>
            <p class="text-sm font-semibold text-slate-800">Products</p>
            <div v-if="tags.length" class="mt-2 flex flex-wrap gap-1">
              <span
                v-for="tag in tags"
                :key="tag"
                class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
              >
                {{ tag }}
              </span>
            </div>
            <p v-else class="mt-2 text-sm text-slate-500">No linked products.</p>

            <p class="mt-5 text-sm font-semibold text-slate-800">Visibility</p>
            <ul v-if="link.visibility?.length" class="mt-2 space-y-1 text-sm text-slate-600">
              <li v-for="v in link.visibility" :key="v.organization_id">
                {{ orgDisplayName(v.organization) }}
                <span v-if="v.include_child_organizations" class="text-xs text-slate-500">(includes children)</span>
              </li>
            </ul>
            <p v-else class="mt-2 text-sm text-slate-500">Not shared with other organizations.</p>
          </div>
        </div>
      </div>
    </template>

    <TaskConfirmModal
      :open="showDelete"
      title="Delete demo link"
      :message="link ? `Delete “${link.title}”?` : ''"
      confirm-label="Delete"
      danger
      @close="showDelete = false"
      @confirm="confirmDelete"
    />
  </section>
</template>

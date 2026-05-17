<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import {
  formatAccountStatus,
  formatEmailVerification,
  formatLastLogin,
  formatUserRole,
  resolveOrganizationName,
  resolveTenantName,
} from '@/modules/auth/utils/userProfileFormat'
import { useToast } from '@/shared/utils/useToast'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()
const toast = useToast()

const name = ref('')
const loadingProfile = ref(false)
const saving = ref(false)
const nameError = ref('')

async function loadProfile() {
  if (!authStore.token) return
  loadingProfile.value = true
  try {
    await authStore.fetchUser()
    name.value = authStore.user?.name || ''
  } catch {
    toast.error(authStore.apiMessage || 'Unable to load profile.')
  } finally {
    loadingProfile.value = false
  }
}

async function onSave() {
  const trimmed = name.value.trim()
  if (!trimmed) {
    nameError.value = 'Full name is required.'
    return
  }
  if (trimmed === authStore.user?.name) {
    emit('close')
    return
  }

  nameError.value = ''
  saving.value = true
  authStore.clearErrors()
  try {
    await authStore.updateProfile({ name: trimmed })
    toast.success('Profile updated successfully.')
    emit('close')
  } catch {
    const apiNameError = authStore.errors.name?.[0]
    nameError.value = apiNameError || authStore.apiMessage || 'Unable to update profile.'
    if (!apiNameError && authStore.apiMessage) toast.error(authStore.apiMessage)
  } finally {
    saving.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      name.value = authStore.user?.name || ''
      nameError.value = ''
      void loadProfile()
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex justify-end bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-drawer-title"
      @click.self="emit('close')"
    >
      <aside class="flex h-full w-full max-w-md flex-col bg-white shadow-xl" @click.stop @keydown.esc="emit('close')">
        <header class="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Account</p>
            <h2 id="profile-drawer-title" class="mt-1 text-lg font-semibold text-slate-900">My profile</h2>
          </div>
          <button type="button" class="rounded-lg border px-2 py-1 text-xs text-slate-600" @click="emit('close')">Close</button>
        </header>

        <div v-if="loadingProfile && !authStore.user" class="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
          Loading profile…
        </div>

        <div v-else class="flex flex-1 flex-col overflow-y-auto px-5 py-4">
          <section class="space-y-4">
            <h3 class="text-sm font-semibold text-slate-900">Account details</h3>
            <dl class="grid gap-3 text-sm">
              <div>
                <dt class="text-xs text-slate-500">Email</dt>
                <dd class="text-slate-800">{{ authStore.user?.email || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Role</dt>
                <dd>{{ formatUserRole(authStore.user?.role) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Tenant</dt>
                <dd>{{ resolveTenantName(authStore.user) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Organization</dt>
                <dd>{{ resolveOrganizationName(authStore.user) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Account status</dt>
                <dd>{{ formatAccountStatus(authStore.user?.status) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Email verification</dt>
                <dd>{{ authStore.user ? formatEmailVerification(authStore.user) : '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Last login</dt>
                <dd>{{ formatLastLogin(authStore.user) }}</dd>
              </div>
            </dl>
          </section>

          <section class="mt-6 space-y-3 border-t border-slate-100 pt-6">
            <h3 class="text-sm font-semibold text-slate-900">Editable</h3>
            <label class="block space-y-1">
              <span class="text-xs text-slate-500">Full name</span>
              <input
                v-model="name"
                type="text"
                class="rc-input w-full"
                autocomplete="name"
                :disabled="saving"
                @input="nameError = ''"
              />
              <p v-if="nameError" class="text-xs text-rose-600">{{ nameError }}</p>
              <p v-else-if="authStore.errors.name?.[0]" class="text-xs text-rose-600">{{ authStore.errors.name[0] }}</p>
            </label>
          </section>

          <div class="mt-auto flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" class="rounded-lg border px-4 py-2 text-sm text-slate-700" :disabled="saving" @click="emit('close')">
              Cancel
            </button>
            <button
              type="button"
              class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
              :disabled="saving || !name.trim()"
              @click="onSave"
            >
              {{ saving ? 'Saving…' : 'Save changes' }}
            </button>
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import type { OrganizationItem } from '@/modules/organizations/types/organization.types'
import TestEmailModal from '@/modules/settings/email/components/TestEmailModal.vue'
import type { EmailProviderPreset, EmailSettingsRecord } from '@/modules/settings/email/types/emailSettings.types'
import { findProvider, formatTestedAt, isValidOrgId } from '@/modules/settings/email/utils/emailSettingsFormat'
import { isValidEmail, validateEmailForm } from '@/modules/settings/email/utils/emailSettingsValidation'

const props = defineProps<{
  email: EmailSettingsRecord | null
  providers: EmailProviderPreset[]
  orgOptions: OrganizationItem[]
  showOrgPicker: boolean
  orgDisplayName?: string
  canManage: boolean
  saving?: boolean
  testing?: boolean
  fieldErrors?: Record<string, string[]>
  organizationId: number | null
}>()

const emit = defineEmits<{
  (e: 'save', payload: Record<string, unknown>): void
  (e: 'org-change', organizationId: number): void
  (e: 'test', payload: { organization_id: number; recipient_email: string }): void
}>()

const showPassword = ref(false)
const showTestModal = ref(false)
const localErrors = ref<Record<string, string>>({})
const skipProviderPreset = ref(true)

const form = reactive({
  organization_id: '',
  provider: '',
  driver: '',
  host: '',
  port: '',
  username: '',
  password: '',
  from_address: '',
  from_name: '',
  reply_to_address: '',
  encryption: '',
  is_active: true,
})

const selectedProvider = computed(() => findProvider(props.providers, form.provider))
const manualOnly = computed(() => selectedProvider.value?.manual_only === true)
const passwordConfigured = computed(() => Boolean(props.email?.password_configured))
const providersReady = computed(() => props.providers.length > 0)

function apiFieldErr(key: string) {
  return props.fieldErrors?.[key]?.[0]
}

function fieldErr(key: string) {
  return localErrors.value[key] || apiFieldErr(key)
}

function applyProviderDefaults(code: string) {
  const preset = findProvider(props.providers, code)
  if (!preset) return

  if (preset.manual_only) {
    form.host = ''
    form.port = ''
    form.encryption = ''
    if (preset.defaults?.driver) form.driver = String(preset.defaults.driver)
    return
  }

  const d = preset.defaults
  if (!d) return
  if (d.driver != null) form.driver = String(d.driver)
  else form.driver = 'smtp'
  if (d.host != null) form.host = String(d.host)
  if (d.port != null) form.port = String(d.port)
  if (d.encryption != null) form.encryption = String(d.encryption)
}

function applyFromEmail(record: EmailSettingsRecord | null) {
  if (!record) return
  const own = record.host || record.username || record.configured ? record : null
  const src = own || record.effective_mail || record

  form.organization_id = record.organization_id
    ? String(record.organization_id)
    : props.organizationId
      ? String(props.organizationId)
      : ''
  form.provider = record.provider || props.providers[0]?.code || ''
  const savedDriver = String(own?.driver ?? src.driver ?? '').trim()
  form.driver = savedDriver || String(selectedProvider.value?.defaults?.driver ?? 'smtp')
  form.host = String(own?.host ?? src.host ?? '')
  form.port = src.port != null && src.port !== '' ? String(src.port) : ''
  form.username = String(own?.username ?? src.username ?? '')
  form.password = ''
  form.from_address = String(own?.from_address ?? src.from_address ?? '')
  form.from_name = String(own?.from_name ?? src.from_name ?? '')
  form.reply_to_address = String(own?.reply_to_address ?? src.reply_to_address ?? '')
  form.encryption = String(own?.encryption ?? src.encryption ?? '')
  form.is_active = own?.is_active ?? src.is_active ?? true
}

watch(
  () => props.email,
  async (record) => {
    skipProviderPreset.value = true
    applyFromEmail(record)
    await nextTick()
    skipProviderPreset.value = false
  },
  { immediate: true },
)

watch(
  () => props.organizationId,
  (id) => {
    if (isValidOrgId(id)) form.organization_id = String(id)
  },
  { immediate: true },
)

watch(
  () => props.providers,
  (list) => {
    if (!list.length) return
    if (!form.provider) form.provider = list[0].code
  },
)

watch(
  () => form.provider,
  (code, prev) => {
    if (skipProviderPreset.value || !code || code === prev || !props.providers.length) return
    applyProviderDefaults(code)
  },
)

watch(
  () => form.username,
  (username) => {
    const value = username.trim()
    if (!value || form.from_address.trim()) return
    if (isValidEmail(value)) form.from_address = value
  },
)

watch(
  () => [props.orgDisplayName, form.from_name] as const,
  ([orgName, fromName]) => {
    if (!fromName.trim() && orgName?.trim()) form.from_name = orgName.trim()
  },
)

function onOrgChange(event: Event) {
  const id = Number((event.target as HTMLSelectElement).value)
  if (isValidOrgId(id)) emit('org-change', id)
}

function validate(): boolean {
  localErrors.value = validateEmailForm(
    {
      provider: form.provider,
      driver: form.driver,
      username: form.username,
      from_address: form.from_address,
      reply_to_address: form.reply_to_address,
      host: form.host,
      port: form.port,
      encryption: form.encryption,
    },
    props.providers,
  )
  return Object.keys(localErrors.value).length === 0
}

function submit() {
  if (!props.canManage) return
  if (!validate()) return
  const orgId = Number(form.organization_id || props.organizationId)
  if (!isValidOrgId(orgId)) return

  const payload: Record<string, unknown> = {
    organization_id: orgId,
    provider: form.provider,
    driver: form.driver.trim() || 'smtp',
    host: form.host.trim(),
    port: Number(form.port),
    username: form.username.trim(),
    from_address: form.from_address.trim(),
    from_name: form.from_name.trim() || undefined,
    reply_to_address: form.reply_to_address.trim() || undefined,
    encryption: form.encryption || undefined,
    is_active: form.is_active,
  }
  if (form.password.trim()) payload.password = form.password.trim()
  emit('save', payload)
}

function openTestModal() {
  if (!props.canManage || !isValidOrgId(props.organizationId)) return
  showTestModal.value = true
}

function onTestSend(recipientEmail: string) {
  if (!isValidOrgId(props.organizationId)) return
  emit('test', { organization_id: props.organizationId, recipient_email: recipientEmail })
}

watch(
  () => props.testing,
  (active, wasActive) => {
    if (wasActive && !active && !apiFieldErr('recipient_email')) {
      showTestModal.value = false
    }
  },
)
</script>

<template>
  <form class="space-y-5" @submit.prevent="submit">
    <!-- Card 1: Organization & provider -->
    <section class="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 class="mb-4 text-sm font-semibold text-slate-900">Organization & provider</h3>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label v-if="showOrgPicker" class="block text-sm md:col-span-2 lg:col-span-1">
          <span class="mb-1 block text-xs font-semibold text-slate-600">Organization</span>
          <select
            :value="isValidOrgId(organizationId) ? organizationId : ''"
            class="rc-input w-full"
            :disabled="!canManage || saving"
            @change="onOrgChange"
          >
            <option value="" disabled>Select organization</option>
            <option v-for="org in orgOptions" :key="org.id" :value="org.id">
              {{ org.display_name || org.legal_name }} ({{ org.type }})
            </option>
          </select>
          <p v-if="fieldErr('organization_id')" class="mt-1 text-xs text-rose-600">{{ fieldErr('organization_id') }}</p>
        </label>

        <label class="block text-sm">
          <span class="mb-1 block text-xs font-semibold text-slate-600">Email provider</span>
          <select
            v-model="form.provider"
            class="rc-input w-full"
            :disabled="!canManage || saving || !providersReady"
          >
            <option v-if="!providersReady" value="" disabled>Loading providers…</option>
            <option v-for="p in providers" :key="p.code" :value="p.code">{{ p.label }}</option>
          </select>
          <p v-if="fieldErr('provider')" class="mt-1 text-xs text-rose-600">{{ fieldErr('provider') }}</p>
          <p v-if="manualOnly" class="mt-1 text-xs text-slate-500">Manual SMTP — enter host, port, and encryption.</p>
        </label>

        <label class="flex cursor-pointer items-center gap-3 self-end pb-1">
          <button
            type="button"
            role="switch"
            :aria-checked="form.is_active"
            class="relative h-6 w-11 shrink-0 rounded-full transition"
            :class="form.is_active ? 'bg-indigo-600' : 'bg-slate-300'"
            :disabled="!canManage || saving"
            @click="form.is_active = !form.is_active"
          >
            <span
              class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition"
              :class="form.is_active ? 'translate-x-5' : ''"
            />
          </button>
          <span class="text-sm font-medium text-slate-700">Active</span>
        </label>
      </div>
    </section>

    <!-- Card 2: SMTP connection -->
    <section class="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 class="mb-4 text-sm font-semibold text-slate-900">SMTP connection</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block text-sm sm:col-span-2">
          <span class="mb-1 block text-xs font-semibold text-slate-600">Mail driver</span>
          <input
            :value="form.driver || 'smtp'"
            class="rc-input w-full bg-slate-50 text-slate-700"
            readonly
            tabindex="-1"
          />
          <p class="mt-1 text-xs text-slate-500">Set automatically from the selected provider.</p>
          <p v-if="fieldErr('driver')" class="mt-1 text-xs text-rose-600">{{ fieldErr('driver') }}</p>
        </label>
        <label class="block text-sm sm:col-span-2">
          <span class="mb-1 block text-xs font-semibold text-slate-600">Mail host</span>
          <input v-model="form.host" class="rc-input w-full" :disabled="!canManage || saving" />
          <p v-if="fieldErr('host')" class="mt-1 text-xs text-rose-600">{{ fieldErr('host') }}</p>
        </label>
        <label class="block text-sm">
          <span class="mb-1 block text-xs font-semibold text-slate-600">Mail port</span>
          <input v-model="form.port" type="number" min="1" class="rc-input w-full" :disabled="!canManage || saving" />
          <p v-if="fieldErr('port')" class="mt-1 text-xs text-rose-600">{{ fieldErr('port') }}</p>
        </label>
        <label class="block text-sm">
          <span class="mb-1 block text-xs font-semibold text-slate-600">Encryption</span>
          <select v-model="form.encryption" class="rc-input w-full" :disabled="!canManage || saving">
            <option value="">None</option>
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
          </select>
          <p v-if="fieldErr('encryption')" class="mt-1 text-xs text-rose-600">{{ fieldErr('encryption') }}</p>
        </label>
        <label class="block text-sm sm:col-span-2">
          <span class="mb-1 block text-xs font-semibold text-slate-600">Mail username</span>
          <input v-model="form.username" class="rc-input w-full" autocomplete="off" :disabled="!canManage || saving" />
          <p v-if="fieldErr('username')" class="mt-1 text-xs text-rose-600">{{ fieldErr('username') }}</p>
        </label>
        <label class="block text-sm sm:col-span-2">
          <span class="mb-1 block text-xs font-semibold text-slate-600">Mail password</span>
          <div class="relative">
            <input
              v-model="form.password"
              class="rc-input w-full pr-14"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :placeholder="passwordConfigured ? 'Leave blank to keep current password' : 'Enter SMTP password'"
              :disabled="!canManage || saving"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600"
              tabindex="-1"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="passwordConfigured" class="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
            Password configured
          </p>
          <p v-if="fieldErr('password')" class="mt-1 text-xs text-rose-600">{{ fieldErr('password') }}</p>
        </label>
      </div>
    </section>

    <!-- Card 3: Sender identity -->
    <section class="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 class="mb-4 text-sm font-semibold text-slate-900">Sender identity</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block text-sm">
          <span class="mb-1 block text-xs font-semibold text-slate-600">From address</span>
          <input v-model="form.from_address" type="email" class="rc-input w-full" :disabled="!canManage || saving" />
          <p v-if="fieldErr('from_address')" class="mt-1 text-xs text-rose-600">{{ fieldErr('from_address') }}</p>
        </label>
        <label class="block text-sm">
          <span class="mb-1 block text-xs font-semibold text-slate-600">From name</span>
          <input v-model="form.from_name" class="rc-input w-full" :disabled="!canManage || saving" />
        </label>
        <label class="block text-sm sm:col-span-2">
          <span class="mb-1 block text-xs font-semibold text-slate-600">Reply-to address</span>
          <input v-model="form.reply_to_address" type="email" class="rc-input w-full" :disabled="!canManage || saving" />
          <p v-if="fieldErr('reply_to_address')" class="mt-1 text-xs text-rose-600">{{ fieldErr('reply_to_address') }}</p>
        </label>
      </div>
    </section>

    <!-- Card 4: Actions -->
    <section class="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 class="mb-4 text-sm font-semibold text-slate-900">Actions & delivery status</h3>

      <div v-if="email" class="mb-4 grid gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-xs sm:grid-cols-2">
        <div>
          <span class="text-slate-500">Last tested</span>
          <p class="mt-0.5 font-medium text-slate-800">{{ formatTestedAt(email.last_tested_at) }}</p>
        </div>
        <div>
          <span class="text-slate-500">Verification status</span>
          <p class="mt-0.5 font-medium text-slate-800">{{ email.verification_status || '—' }}</p>
        </div>
        <div v-if="email.failure_count != null">
          <span class="text-slate-500">Failure count</span>
          <p class="mt-0.5 font-medium text-slate-800">{{ email.failure_count }}</p>
        </div>
        <div v-if="email.last_error" class="sm:col-span-2">
          <span class="text-slate-500">Last error</span>
          <p class="mt-0.5 font-medium text-rose-700">{{ email.last_error }}</p>
        </div>
      </div>

      <div v-if="canManage" class="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <p class="mr-auto max-w-md text-xs text-slate-500">
          Password is write-only. Leave blank on save to keep the existing secret.
        </p>
        <button
          type="button"
          class="inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-55"
          :disabled="testing || !isValidOrgId(organizationId)"
          @click="openTestModal"
        >
          Send test email
        </button>
        <button
          type="submit"
          class="btn-primary inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md disabled:opacity-55"
          :disabled="saving || !isValidOrgId(organizationId) || !providersReady"
        >
          <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
      </div>

      <p v-else class="text-xs text-slate-500">You have view-only access. Contact an administrator to change email settings.</p>
    </section>

    <TestEmailModal
      :open="showTestModal"
      :testing="testing"
      :field-errors="fieldErrors"
      @close="showTestModal = false"
      @send="onTestSend"
    />
  </form>
</template>

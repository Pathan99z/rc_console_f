<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { usePaymentSettingsStore } from '@/modules/payments/store/paymentSettings.store'
import { useTenantsStore } from '@/modules/tenants/store/tenants.store'
import type { PaymentSettingsSavePayload } from '@/modules/payments/types/payment.types'
import { useToast } from '@/shared/utils/useToast'

const authStore = useAuthStore()
const paymentStore = usePaymentSettingsStore()
const tenantsStore = useTenantsStore()
const toast = useToast()

const isGlobalAdmin = computed(() => authStore.user?.role === 'global_admin')

const form = reactive({
  payfast_mode: 'sandbox',
  merchant_id: '',
  merchant_key: '',
  passphrase: '',
  return_url: '',
  cancel_url: '',
  notify_url: '',
})

function applySettingsToForm() {
  const s = paymentStore.settings
  if (!s) return
  form.payfast_mode = String(s.payfast_mode || 'sandbox')
  form.merchant_id = s.merchant_id ? String(s.merchant_id) : ''
  form.merchant_key = ''
  form.passphrase = ''
  form.return_url = s.return_url || ''
  form.cancel_url = s.cancel_url || ''
  form.notify_url = s.notify_url || ''
}

async function reload() {
  try {
    const tid = isGlobalAdmin.value ? paymentStore.selectedTenantId : undefined
    if (isGlobalAdmin.value && !tid) {
      toast.error('Select a tenant to load payment settings.')
      return
    }
    await paymentStore.fetchPaymentSettings(tid ?? undefined)
    applySettingsToForm()
  } catch {
    toast.error(paymentStore.message || 'Unable to load payment settings.')
  }
}

async function onTenantChange(event: Event) {
  const id = Number((event.target as HTMLSelectElement).value) || null
  paymentStore.setSelectedTenantId(id)
  await reload()
}

async function save() {
  if (!form.merchant_id.trim()) {
    toast.error('Merchant ID is required.')
    return
  }
  try {
    const payload: PaymentSettingsSavePayload = {
      payfast_mode: form.payfast_mode,
      merchant_id: form.merchant_id.trim(),
      return_url: form.return_url.trim() || undefined,
      cancel_url: form.cancel_url.trim() || undefined,
      notify_url: form.notify_url.trim() || undefined,
    }
    if (isGlobalAdmin.value && paymentStore.selectedTenantId) {
      payload.tenant_id = paymentStore.selectedTenantId
    }
    if (form.merchant_key.trim()) {
      payload.merchant_key = form.merchant_key.trim()
    }
    if (form.passphrase.trim()) {
      payload.passphrase = form.passphrase.trim()
    }

    await paymentStore.savePaymentSettings(payload)
    form.merchant_key = ''
    form.passphrase = ''
    applySettingsToForm()
    toast.success(paymentStore.message || 'Settings saved.')
  } catch {
    toast.error(paymentStore.message || 'Unable to save settings.')
  }
}

onMounted(async () => {
  if (isGlobalAdmin.value) {
    try {
      await tenantsStore.fetchTenants(100, 1)
      if (!paymentStore.selectedTenantId) {
        const first = tenantsStore.items[0]?.id
        const fallback = authStore.user?.tenant_id
        paymentStore.setSelectedTenantId(first ?? fallback ?? null)
      }
    } catch {
      toast.error(tenantsStore.message || 'Unable to load tenants.')
    }
  } else {
    paymentStore.setSelectedTenantId(null)
  }
  await reload()
})
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
      <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-indigo-600">Billing</p>
          <h2 class="mt-0.5 text-xl font-bold tracking-tight text-slate-900">PayFast payment settings</h2>
          <p class="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
            Connect PayFast for quote checkout. Secrets are stored encrypted on the server; this screen only shows masked values after save.
          </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
        :disabled="paymentStore.loading"
        @click="reload"
      >
        <span
          v-if="paymentStore.loading"
          class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"
          aria-hidden="true"
        ></span>
        <span>{{ paymentStore.loading ? 'Refreshing…' : 'Refresh' }}</span>
      </button>
    </header>

    <div
      v-if="isGlobalAdmin"
      class="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100"
    >
      <div class="mb-3 flex items-center gap-2">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600" aria-hidden="true">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h10"/></svg>
        </span>
        <h3 class="text-sm font-semibold text-slate-900">Tenant scope</h3>
      </div>
      <label for="payment-tenant-select" class="mb-1 block text-xs font-semibold text-slate-600">Tenant <span class="text-red-500">*</span></label>
      <select
        id="payment-tenant-select"
        class="rc-input max-w-md"
        :disabled="paymentStore.loading || tenantsStore.loading"
        :value="paymentStore.selectedTenantId ?? ''"
        @change="onTenantChange"
      >
        <option value="" disabled>Select tenant</option>
        <option v-for="t in tenantsStore.items" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <p class="mt-2 text-xs leading-relaxed text-slate-500">As global admin, pick which organisation’s PayFast credentials you are editing.</p>
    </div>

    <div
      v-if="paymentStore.loading && !paymentStore.settings"
      class="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200/90 bg-white py-16 text-sm text-slate-600 shadow-sm"
    >
      <span class="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"></span>
      <span>Loading payment settings…</span>
    </div>

    <div v-else class="space-y-5">
      <div class="rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-950 ring-1 ring-indigo-100/80">
        <p class="font-medium">Hosted checkout</p>
        <p class="mt-1 text-xs leading-relaxed text-indigo-900/90">
          Quote “Pay with PayFast” uses these settings. Use sandbox while testing; switch to live only when your PayFast account is production-ready.
        </p>
      </div>

      <div class="grid gap-5 lg:grid-cols-2">
        <div class="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 class="mb-4 text-sm font-semibold text-slate-900">PayFast credentials</h3>
          <div class="space-y-4">
            <div>
              <label for="payfast-mode" class="mb-1 block text-xs font-semibold text-slate-600">Environment <span class="text-red-500">*</span></label>
              <select id="payfast-mode" v-model="form.payfast_mode" class="rc-input" :disabled="paymentStore.saving">
                <option value="sandbox">Sandbox (testing)</option>
                <option value="live">Live (production)</option>
              </select>
            </div>
            <div>
              <label for="merchant-id" class="mb-1 block text-xs font-semibold text-slate-600">Merchant ID <span class="text-red-500">*</span></label>
              <input id="merchant-id" v-model="form.merchant_id" class="rc-input" type="text" autocomplete="off" :disabled="paymentStore.saving" />
            </div>
            <div>
              <label for="merchant-key" class="mb-1 block text-xs font-semibold text-slate-600">Merchant key</label>
              <input
                id="merchant-key"
                v-model="form.merchant_key"
                class="rc-input"
                type="password"
                autocomplete="new-password"
                placeholder="Enter new key, or leave unchanged"
                :disabled="paymentStore.saving"
              />
              <p v-if="paymentStore.settings?.merchant_key_masked" class="mt-2 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                <span class="text-slate-500">Stored:</span>
                {{ paymentStore.settings.merchant_key_masked }}
              </p>
            </div>
            <div>
              <label for="passphrase" class="mb-1 block text-xs font-semibold text-slate-600">Passphrase</label>
              <input
                id="passphrase"
                v-model="form.passphrase"
                class="rc-input"
                type="password"
                autocomplete="new-password"
                placeholder="Optional — leave blank to keep current"
                :disabled="paymentStore.saving"
              />
              <p class="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <span
                  class="inline-flex h-2 w-2 rounded-full"
                  :class="paymentStore.settings?.passphrase_configured ? 'bg-emerald-500' : 'bg-slate-300'"
                  aria-hidden="true"
                ></span>
                Passphrase on file: {{ paymentStore.settings?.passphrase_configured ? 'Yes' : 'No' }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 class="mb-4 text-sm font-semibold text-slate-900">Redirect &amp; ITN URLs</h3>
          <p class="mb-4 text-xs leading-relaxed text-slate-500">Optional overrides. If empty, your API applies defaults from server configuration.</p>
          <div class="space-y-4">
            <div>
              <label for="return-url" class="mb-1 block text-xs font-semibold text-slate-600">Return URL</label>
              <input id="return-url" v-model="form.return_url" class="rc-input" type="url" placeholder="https://…" :disabled="paymentStore.saving" />
            </div>
            <div>
              <label for="cancel-url" class="mb-1 block text-xs font-semibold text-slate-600">Cancel URL</label>
              <input id="cancel-url" v-model="form.cancel_url" class="rc-input" type="url" placeholder="https://…" :disabled="paymentStore.saving" />
            </div>
            <div>
              <label for="notify-url" class="mb-1 block text-xs font-semibold text-slate-600">Notify URL (ITN)</label>
              <input id="notify-url" v-model="form.notify_url" class="rc-input" type="url" placeholder="https://…" :disabled="paymentStore.saving" />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="paymentStore.errors.tenant_id?.[0] || paymentStore.errors.payment?.[0]"
        class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        role="alert"
      >
        <p v-if="paymentStore.errors.tenant_id?.[0]" class="font-medium">{{ paymentStore.errors.tenant_id[0] }}</p>
        <p v-if="paymentStore.errors.payment?.[0]" class="mt-1">{{ paymentStore.errors.payment[0] }}</p>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200/80 pt-5">
        <p class="mr-auto max-w-md text-xs text-slate-500">
          Saving sends only non-empty secret fields. Your existing keys stay in place until you provide new values.
        </p>
        <button
          type="button"
          class="btn-primary inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition disabled:pointer-events-none disabled:opacity-55"
          :disabled="paymentStore.saving || paymentStore.loading || (isGlobalAdmin && !paymentStore.selectedTenantId)"
          @click="save"
        >
          <span v-if="paymentStore.saving" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          {{ paymentStore.saving ? 'Saving…' : 'Save settings' }}
        </button>
      </div>
    </div>
  </section>
</template>

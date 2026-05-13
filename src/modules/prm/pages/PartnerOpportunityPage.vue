<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useToast } from '@/shared/utils/useToast'
import { toApiError } from '@/core/http/apiClient'
import { usePrmStore } from '@/modules/prm/store/prm.store'

const prmStore = usePrmStore()
const toast = useToast()
const submitting = ref(false)

const form = reactive({
  opportunity_key: '',
  contact_email: '',
  company_id: '' as string,
  name: '',
  contact_id: '' as string,
  owner_user_id: '' as string,
  pipeline_id: '' as string,
  pipeline_stage_id: '' as string,
  estimated_value: '' as string,
  currency_code: 'ZAR',
})

async function submit() {
  if (submitting.value) return
  submitting.value = true
  try {
    await prmStore.registerPartnerOpportunity({
      opportunity_key: form.opportunity_key || undefined,
      contact_email: form.contact_email || undefined,
      company_id: form.company_id ? Number(form.company_id) : undefined,
      name: form.name.trim(),
      contact_id: form.contact_id ? Number(form.contact_id) : undefined,
      owner_user_id: form.owner_user_id ? Number(form.owner_user_id) : undefined,
      pipeline_id: form.pipeline_id ? Number(form.pipeline_id) : undefined,
      pipeline_stage_id: form.pipeline_stage_id ? Number(form.pipeline_stage_id) : undefined,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : undefined,
      currency_code: form.currency_code,
    })
    toast.success('Opportunity registered.')
    form.opportunity_key = ''
    form.contact_email = ''
    form.company_id = ''
    form.name = ''
    form.contact_id = ''
    form.owner_user_id = ''
    form.pipeline_id = ''
    form.pipeline_stage_id = ''
    form.estimated_value = ''
  } catch (error) {
    const n = toApiError(error)
    toast.error(n.message || 'Registration failed.')
    if (n.status === 422) {
      toast.error('Possible duplicate opportunity for this partner — adjust opportunity key or contact.')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Opportunity registration</h2>
      <p class="text-sm text-slate-500">
        Register a deal with optional dedupe key. Required fields follow your tenant deal rules; fill IDs from CRM where needed.
      </p>
    </header>

    <form class="max-w-2xl space-y-4 rounded-xl border border-[var(--rc-border-soft)] bg-white p-6" @submit.prevent="submit">
      <input v-model.trim="form.name" class="rc-input" placeholder="Deal name *" required />
      <input v-model.trim="form.opportunity_key" class="rc-input" placeholder="Opportunity key (dedupe)" />
      <input v-model.trim="form.contact_email" class="rc-input" placeholder="Contact email" />
      <div class="grid gap-3 md:grid-cols-2">
        <input v-model="form.company_id" type="number" class="rc-input" placeholder="Company ID" />
        <input v-model="form.contact_id" type="number" class="rc-input" placeholder="Contact ID" />
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <input v-model="form.owner_user_id" type="number" class="rc-input" placeholder="Owner user ID" />
        <input v-model="form.pipeline_id" type="number" class="rc-input" placeholder="Pipeline ID" />
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <input v-model="form.pipeline_stage_id" type="number" class="rc-input" placeholder="Pipeline stage ID" />
        <input v-model="form.estimated_value" type="number" class="rc-input" placeholder="Estimated value" />
      </div>
      <input v-model.trim="form.currency_code" class="rc-input" placeholder="Currency (e.g. ZAR)" />
      <button type="submit" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" :disabled="submitting">
        {{ submitting ? 'Submitting…' : 'Register opportunity' }}
      </button>
    </form>
  </section>
</template>

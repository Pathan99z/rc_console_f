<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useToast } from '@/shared/utils/useToast'
import { payoutApi } from '@/modules/payouts/services/payout.api'
import { usePayoutStore } from '@/modules/payouts/store/payout.store'

const authStore = useAuthStore()
const store = usePayoutStore()
const toast = useToast()
const form = ref({
  organization_id: authStore.user?.organization_id ?? '',
  account_holder_name: '',
  account_number: '',
  bank_name: '',
  currency_code: 'ZAR',
  is_primary: true,
})

onMounted(() => void store.fetchAccounts(authStore.user?.organization_id ?? undefined))

async function create() {
  try {
    await payoutApi.createAccount({
      organization_id: Number(form.value.organization_id),
      account_holder_name: form.value.account_holder_name,
      account_number: form.value.account_number,
      bank_name: form.value.bank_name,
      currency_code: form.value.currency_code,
      is_primary: form.value.is_primary,
    })
    toast.success('Bank account added.')
    await store.fetchAccounts(Number(form.value.organization_id))
  } catch {
    toast.error('Failed to add account.')
  }
}

async function verify(id: number) {
  try {
    await payoutApi.verifyAccount(id)
    toast.success('Verification requested.')
    await store.fetchAccounts(Number(form.value.organization_id))
  } catch {
    toast.error('Verify failed.')
  }
}
</script>

<template>
  <section class="space-y-5">
    <header><h2 class="text-xl font-bold">Payout bank accounts</h2></header>
    <form class="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2" @submit.prevent="create">
      <input v-model="form.account_holder_name" class="rc-input" placeholder="Account holder *" required />
      <input v-model="form.account_number" class="rc-input" placeholder="Account number *" required />
      <input v-model="form.bank_name" class="rc-input" placeholder="Bank name *" required />
      <input v-model="form.currency_code" class="rc-input" placeholder="Currency" />
      <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white sm:col-span-2">Add account</button>
    </form>
    <ul class="space-y-2">
      <li v-for="a in store.accounts" :key="a.id" class="flex items-center justify-between rounded-xl border bg-white p-4 text-sm">
        <div>
          <p class="font-medium">{{ a.account_holder_name }} — {{ a.bank_name }}</p>
          <p class="text-slate-500">{{ a.account_number_masked }} · {{ a.verification_status }}</p>
        </div>
        <button v-if="a.verification_status !== 'verified'" type="button" class="rounded border px-2 py-1 text-xs" @click="verify(a.id)">Verify</button>
      </li>
    </ul>
  </section>
</template>

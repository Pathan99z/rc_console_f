<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useContactsStore } from '@/modules/contacts/store/contacts.store'
import { useToast } from '@/shared/utils/useToast'

const route = useRoute()
const contactsStore = useContactsStore()
const toast = useToast()
const saving = ref(false)

const updateForm = reactive({
  lifecycle_stage: 'lead',
  assigned_user_id: '',
})

const activityForm = reactive({
  type: 'note',
  note: '',
  occurred_at: new Date().toISOString().slice(0, 16),
})

onMounted(async () => {
  const id = Number(route.params.id)
  await contactsStore.fetchContactDetail(id)
  if (contactsStore.selected) {
    updateForm.lifecycle_stage = contactsStore.selected.lifecycle_stage
    updateForm.assigned_user_id = contactsStore.selected.assigned_user?.id ? String(contactsStore.selected.assigned_user.id) : ''
  }
})

function stageToNumber(stage: string) {
  if (stage === 'lead') return 0
  if (stage === 'prospect') return 1
  if (stage === 'customer') return 2
  return 3
}

async function saveContact() {
  if (!contactsStore.selected || saving.value) return
  saving.value = true
  try {
    await contactsStore.updateContact(contactsStore.selected.id, {
      lifecycle_stage: stageToNumber(updateForm.lifecycle_stage),
      assigned_user_id: Number(updateForm.assigned_user_id || 0) || undefined,
    })
    toast.success('Contact updated.')
  } catch {
    toast.error(contactsStore.message || 'Update failed.')
  } finally {
    saving.value = false
  }
}

async function addActivity() {
  if (!contactsStore.selected || saving.value) return
  saving.value = true
  try {
    await contactsStore.addActivity(contactsStore.selected.id, {
      type: activityForm.type,
      note: activityForm.note,
      occurred_at: new Date(activityForm.occurred_at).toISOString(),
    })
    activityForm.note = ''
    toast.success('Activity added.')
  } catch {
    toast.error(contactsStore.message || 'Activity create failed.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Contact Detail</h2>
      <p class="text-sm text-slate-500">Lifecycle, assignment, and activity timeline.</p>
    </header>

    <div v-if="contactsStore.loading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 text-sm text-slate-500">Loading contact...</div>
    <template v-else-if="contactsStore.selected">
      <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
        <h3 class="text-lg font-semibold">{{ contactsStore.selected.first_name }} {{ contactsStore.selected.last_name }}</h3>
        <p class="mt-1 text-sm text-slate-500">{{ contactsStore.selected.email || '-' }} | {{ contactsStore.selected.phone || '-' }}</p>
        <p class="mt-2 text-sm text-slate-600">
          Last updated by {{ contactsStore.selected.updated_by_user?.name || 'System' }} at
          {{ new Date(contactsStore.selected.updated_at).toLocaleString() }}
        </p>
      </div>

      <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
        <h3 class="mb-3 text-sm font-semibold">Update Contact</h3>
        <div class="grid gap-3 md:grid-cols-2">
          <select v-model="updateForm.lifecycle_stage" class="rc-input">
            <option value="lead">lead</option>
            <option value="prospect">prospect</option>
            <option value="customer">customer</option>
            <option value="inactive">inactive</option>
          </select>
          <input v-model="updateForm.assigned_user_id" class="rc-input" type="number" placeholder="Assigned user ID" />
        </div>
        <button class="btn-primary mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="saving" @click="saveContact">
          <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          Save Changes
        </button>
      </div>

      <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
        <h3 class="mb-3 text-sm font-semibold">Add Activity</h3>
        <div class="grid gap-3 md:grid-cols-3">
          <select v-model="activityForm.type" class="rc-input">
            <option value="note">note</option>
            <option value="call">call</option>
            <option value="meeting">meeting</option>
            <option value="email">email</option>
          </select>
          <input v-model="activityForm.occurred_at" type="datetime-local" class="rc-input" />
          <input v-model.trim="activityForm.note" class="rc-input md:col-span-3" placeholder="Activity note..." />
        </div>
        <button class="rounded border px-3 py-1.5 text-sm" :disabled="saving || !activityForm.note" @click="addActivity">Add Activity</button>
      </div>

      <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
        <h3 class="mb-3 text-sm font-semibold">Timeline</h3>
        <div v-if="!(contactsStore.selected.activities || []).length" class="text-sm text-slate-500">No activities yet.</div>
        <div v-else class="space-y-3">
          <div v-for="activity in contactsStore.selected.activities" :key="activity.id" class="rounded-lg border border-[var(--rc-border-soft)] p-3">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ activity.type }}</p>
            <p class="mt-1 text-sm text-slate-800">{{ activity.note }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ new Date(activity.occurred_at).toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

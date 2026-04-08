<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import DataTable from '@/shared/components/DataTable.vue'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useTeamsStore } from '@/modules/teams/store/teams.store'
import { useToast } from '@/shared/utils/useToast'

const teamsStore = useTeamsStore()
const toast = useToast()
const creating = ref(false)
const saving = ref(false)
const deletingId = ref<number | null>(null)
const editingTeamId = ref<number | null>(null)

const form = reactive({
  name: '',
  status: 1,
})

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created' },
  { key: 'actions', label: 'Actions' },
]

onMounted(() => teamsStore.fetchTeams())

function startCreate() {
  editingTeamId.value = null
  form.name = ''
  form.status = 1
}

function startEdit(team: { id: number; name: string; status: number }) {
  editingTeamId.value = team.id
  form.name = team.name
  form.status = team.status
}

async function submitForm() {
  if (saving.value || creating.value) return
  try {
    if (editingTeamId.value) {
      saving.value = true
      await teamsStore.updateTeam(editingTeamId.value, { name: form.name, status: form.status })
      toast.success('Team updated successfully.')
    } else {
      creating.value = true
      await teamsStore.createTeam({ name: form.name, status: form.status })
      toast.success('Team created successfully.')
    }
    startCreate()
  } catch {
    toast.error(teamsStore.message || 'Operation failed.')
  } finally {
    saving.value = false
    creating.value = false
  }
}

async function removeTeam(id: number) {
  if (deletingId.value) return
  const approved = window.confirm('Are you sure you want to delete this team?')
  if (!approved) return
  try {
    deletingId.value = id
    await teamsStore.deleteTeam(id)
    toast.success('Team deleted.')
  } catch {
    toast.error(teamsStore.message || 'Delete failed.')
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Teams</h2>
      <p class="text-sm text-slate-500">Create and manage teams for your tenant.</p>
    </header>

    <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <div class="grid gap-3 md:grid-cols-2">
        <input v-model.trim="teamsStore.search" class="rc-input" placeholder="Search teams..." @keyup.enter="teamsStore.fetchTeams(1, teamsStore.pagination.per_page)" />
        <select v-model="teamsStore.status" class="rc-input" @change="teamsStore.fetchTeams(1, teamsStore.pagination.per_page)">
          <option value="">All statuses</option>
          <option :value="1">Active</option>
          <option :value="0">Inactive</option>
        </select>
      </div>
      <div class="mt-3">
        <button class="rounded border px-3 py-1.5 text-sm" :disabled="teamsStore.loading" @click="teamsStore.fetchTeams(1, teamsStore.pagination.per_page)">
          Apply Filters
        </button>
      </div>
    </div>

    <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <h3 class="mb-3 text-sm font-semibold">{{ editingTeamId ? 'Edit team' : 'Create team' }}</h3>
      <div class="grid gap-3 md:grid-cols-2">
        <input v-model.trim="form.name" class="rc-input" placeholder="Team name" />
        <select v-model="form.status" class="rc-input">
          <option :value="1">Active</option>
          <option :value="0">Inactive</option>
        </select>
      </div>
      <p v-if="teamsStore.errors.name?.[0]" class="mt-1 text-sm text-red-600">{{ teamsStore.errors.name[0] }}</p>
      <div class="mt-3 flex gap-2">
        <button class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="saving || creating" @click="submitForm">
          <span v-if="saving || creating" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          {{ editingTeamId ? 'Save Team' : 'Create Team' }}
        </button>
        <button v-if="editingTeamId" class="rounded border px-3 py-2 text-sm" @click="startCreate">Cancel</button>
      </div>
    </div>

    <DataTable :columns="columns" :rows="teamsStore.items" :loading="teamsStore.loading" empty-message="No teams found.">
      <template #rows>
        <tr v-for="team in teamsStore.items" :key="team.id" class="border-t">
          <td class="px-4 py-3">{{ team.name }}</td>
          <td class="px-4 py-3">
            <span :class="team.status === 1 ? 'text-emerald-600' : 'text-amber-600'">{{ team.status === 1 ? 'active' : 'inactive' }}</span>
          </td>
          <td class="px-4 py-3">{{ new Date(team.created_at).toLocaleDateString() }}</td>
          <td class="px-4 py-3">
            <div class="flex gap-2">
              <button class="rounded border px-2 py-1 text-xs" @click="startEdit(team)">Edit</button>
              <button class="rounded border px-2 py-1 text-xs text-red-600" :disabled="deletingId === team.id" @click="removeTeam(team.id)">
                <span v-if="deletingId === team.id">Deleting...</span>
                <span v-else>Delete</span>
              </button>
            </div>
          </td>
        </tr>
      </template>
    </DataTable>

    <PaginationControls
      :current-page="teamsStore.pagination.current_page"
      :last-page="teamsStore.pagination.last_page"
      @change="(page) => teamsStore.fetchTeams(page, teamsStore.pagination.per_page)"
    />
  </section>
</template>

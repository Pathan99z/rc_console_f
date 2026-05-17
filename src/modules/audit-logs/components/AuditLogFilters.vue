<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AuditLogAsyncSelect from '@/modules/audit-logs/components/AuditLogAsyncSelect.vue'
import {
  entityLookupSearch,
  entityTypeHasLookup,
  searchOrganizations,
  searchUsers,
} from '@/modules/audit-logs/composables/useAuditLogFilterLookups'
import type { AuditLogFiltersState, AuditLogModule } from '@/modules/audit-logs/types/auditLog.types'
import {
  AUDIT_ENTITY_TYPES,
  AUDIT_MODULES,
  AUDIT_SOURCES,
  eventsForModule,
} from '@/modules/audit-logs/utils/auditLogCatalog'
import { eventOptionLabel } from '@/modules/audit-logs/utils/auditLogLabels'

const model = defineModel<AuditLogFiltersState>({ required: true })

const props = defineProps<{
  showTenantFilter?: boolean
  isGlobalAdmin?: boolean
}>()

const emit = defineEmits<{
  (e: 'apply'): void
  (e: 'clear'): void
}>()

const actorLabel = ref('')
const organizationLabel = ref('')
const entityLabel = ref('')

const eventOptions = computed(() => eventsForModule(model.value.module as AuditLogModule | ''))

const entityHasLookup = computed(() => entityTypeHasLookup(model.value.entity_type))

const lookupContext = computed(() => ({
  globalAdmin: Boolean(props.isGlobalAdmin),
  tenantId: Number(model.value.tenant_id) || undefined,
}))

function onModuleChange() {
  if (model.value.event_key && !eventOptions.value.includes(model.value.event_key)) {
    model.value.event_key = ''
  }
}

function onEntityTypeChange() {
  model.value.entity_id = ''
  entityLabel.value = ''
}

function resetLookupLabels() {
  actorLabel.value = ''
  organizationLabel.value = ''
  entityLabel.value = ''
}

function onClear() {
  resetLookupLabels()
  emit('clear')
}

watch(
  () => model.value.tenant_id,
  () => {
    if (model.value.organization_id) {
      model.value.organization_id = ''
      organizationLabel.value = ''
    }
  },
)
</script>

<template>
  <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
    <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Filters</p>
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <label class="block space-y-1">
        <span class="text-xs text-slate-500">Date from</span>
        <input v-model="model.date_from" type="date" class="rc-input w-full" />
      </label>
      <label class="block space-y-1">
        <span class="text-xs text-slate-500">Date to</span>
        <input v-model="model.date_to" type="date" class="rc-input w-full" />
      </label>
      <label class="block space-y-1">
        <span class="text-xs text-slate-500">Module</span>
        <select v-model="model.module" class="rc-input w-full" @change="onModuleChange">
          <option value="">All modules</option>
          <option v-for="m in AUDIT_MODULES" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </label>
      <label class="block space-y-1">
        <span class="text-xs text-slate-500">Event type</span>
        <select v-model="model.event_key" class="rc-input w-full">
          <option value="">All events</option>
          <option v-for="key in eventOptions" :key="key" :value="key">{{ eventOptionLabel(key) }}</option>
        </select>
      </label>

      <label class="block space-y-1">
        <span class="text-xs text-slate-500">Actor</span>
        <AuditLogAsyncSelect
          v-model="model.actor_user_id"
          v-model:display-label="actorLabel"
          placeholder="Search user by name or email"
          search-placeholder="Search users…"
          :search-fn="searchUsers"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-xs text-slate-500">Organization</span>
        <AuditLogAsyncSelect
          v-model="model.organization_id"
          v-model:display-label="organizationLabel"
          placeholder="Search organization"
          search-placeholder="Search organizations…"
          :search-fn="(q) => searchOrganizations(q, lookupContext)"
        />
      </label>

      <label v-if="showTenantFilter" class="block space-y-1">
        <span class="text-xs text-slate-500">Tenant ID</span>
        <input
          v-model.trim="model.tenant_id"
          class="rc-input w-full"
          type="number"
          min="1"
          placeholder="Tenant ID (global admin)"
          @keyup.enter="emit('apply')"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-xs text-slate-500">Entity type</span>
        <select v-model="model.entity_type" class="rc-input w-full" @change="onEntityTypeChange">
          <option value="">All entity types</option>
          <option v-for="t in AUDIT_ENTITY_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </label>

      <label class="block space-y-1">
        <span class="text-xs text-slate-500">Entity</span>
        <AuditLogAsyncSelect
          v-if="entityHasLookup && model.entity_type"
          v-model="model.entity_id"
          v-model:display-label="entityLabel"
          :placeholder="`Search ${model.entity_type}`"
          :search-placeholder="`Search ${model.entity_type} records…`"
          :search-fn="(q) => entityLookupSearch(model.entity_type, q, lookupContext)"
        />
        <input
          v-else
          v-model.trim="model.entity_id"
          class="rc-input w-full"
          :disabled="!model.entity_type"
          :placeholder="model.entity_type ? 'Enter record ID' : 'Select entity type first'"
          @keyup.enter="emit('apply')"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-xs text-slate-500">Source</span>
        <select v-model="model.source" class="rc-input w-full">
          <option value="">All sources</option>
          <option v-for="s in AUDIT_SOURCES" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </label>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
      <label class="inline-flex items-center gap-2 text-sm text-slate-700">
        <input v-model="model.include_archived" type="checkbox" class="rounded border-slate-300" />
        Include archived
      </label>
      <label class="inline-flex items-center gap-2 text-sm text-slate-700">
        <input v-model="model.include_deal_histories" type="checkbox" class="rounded border-slate-300" />
        Include deal histories
      </label>
    </div>

    <div class="mt-4 flex flex-wrap justify-end gap-2">
      <button
        type="button"
        class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        @click="onClear"
      >
        Clear filters
      </button>
      <button
        type="button"
        class="btn-primary rounded-lg px-4 py-1.5 text-xs font-semibold"
        @click="emit('apply')"
      >
        Apply filters
      </button>
    </div>
  </div>
</template>

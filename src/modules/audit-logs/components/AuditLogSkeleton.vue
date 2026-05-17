<template>
  <div class="overflow-x-auto rounded-xl border border-[var(--rc-border-soft)] bg-white">
    <div class="animate-pulse space-y-0 divide-y divide-[var(--rc-border-soft)]">
      <div v-for="i in 6" :key="i" class="flex gap-4 px-4 py-4">
        <div class="h-4 w-32 rounded bg-slate-100" />
        <div class="h-4 flex-1 rounded bg-slate-100" />
        <div class="h-4 w-20 rounded bg-slate-100" />
      </div>
    </div>
  </div>
</template>

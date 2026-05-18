<template>
  <div class="space-y-5" aria-busy="true" aria-label="Loading dashboard">
    <div class="h-28 animate-pulse rounded-2xl bg-slate-100" />
    <div class="flex flex-wrap gap-2">
      <div v-for="n in 5" :key="`link-${n}`" class="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
    </div>
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="n in 8" :key="`kpi-${n}`" class="h-28 animate-pulse rounded-xl bg-slate-100" />
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="h-48 animate-pulse rounded-xl bg-slate-100" />
      <div class="h-48 animate-pulse rounded-xl bg-slate-100" />
    </div>
  </div>
</template>

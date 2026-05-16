<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Loading dashboard">
    <div v-for="n in 4" :key="n" class="h-24 animate-pulse rounded-xl bg-slate-100" />
  </div>
</template>

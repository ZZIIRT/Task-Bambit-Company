<script setup>
import { useUiStore } from '@/stores/ui'
const ui = useUiStore()
</script>

<template>
  <div class="fixed top-3 right-3 z-50 space-y-2">
    <div
      v-for="t in ui.toasts"
      :key="t.id"
      class="rounded-md border bg-white dark:bg-neutral-800 shadow px-4 py-2 flex items-start gap-3 w-72"
      :class="t.type === 'error' ? 'border-red-300' : 'border-emerald-300'"
    >
      <div class="mt-[2px]">
        <span class="text-sm">{{ t.message }}</span>
      </div>
      <button class="ml-auto text-xs opacity-70 hover:opacity-100" @click="ui.removeToast(t.id)">✕</button>
    </div>
  </div>
</template>

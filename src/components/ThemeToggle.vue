<script setup>
import { useUiStore } from '@/stores/ui'
import { Sun, Moon } from 'lucide-vue-next'
const ui = useUiStore()
</script>

<template>
  <button
    class="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
    @click="ui.toggleTheme"
    aria-label="Toggle theme"
  >
    <Sun v-if="ui.theme === 'light'" class="w-4 h-4" />
    <Moon v-else class="w-4 h-4" />
    <span class="hidden sm:inline">{{ ui.theme === 'dark' ? 'Тёмная' : 'Светлая' }}</span>
  </button>
</template>

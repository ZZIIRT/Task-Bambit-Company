<script setup>
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

const fullAddress = computed(() => {
  if (!props.user || !props.user.address) return '—'
  const { street, suite, city } = props.user.address
  return [street, suite, city].filter(Boolean).join(', ') || '—'
})

const companyName = computed(() => props.user?.company?.name || '—')

const websiteUrl = computed(() => {
  const site = props.user?.website
  if (!site) return null
  // если в данных нет протокола — добавим
  if (/^https?:\/\//i.test(site)) return site
  return `https://${site}`
})

function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <!-- Не рендерим вообще ничего, если модалка закрыта -->
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-40 flex items-center justify-center px-4 sm:px-0"
      @click.self="emit('close')"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-xs" />

      <div
        class="
          relative z-10
          w-full max-w-md
          rounded-xl
          border border-gray-200 dark:border-neutral-700
          bg-white dark:bg-neutral-900
          shadow-lg
          p-4 sm:p-6
        "
      >
        <div class="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Карточка пользователя
            </h2>
            <p class="text-xs text-gray-500 dark:text-neutral-400">
              Детальная информация о выбранном авторе
            </p>
          </div>

          <button
            type="button"
            class="
              rounded-md
              border border-gray-300 dark:border-neutral-700
              px-2 py-1
              text-xs
              hover:bg-gray-100 dark:hover:bg-neutral-800
            "
            @click="emit('close')"
          >
            Закрыть
          </button>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex gap-2">
            <span class="w-28 text-gray-500 dark:text-neutral-400">Имя:</span>
            <span class="font-medium text-gray-900 dark:text-gray-100">
              {{ user?.name || '—' }}
            </span>
          </div>

          <div class="flex gap-2">
            <span class="w-28 text-gray-500 dark:text-neutral-400">Логин:</span>
            <span>{{ user?.username || '—' }}</span>
          </div>

          <div class="flex gap-2">
            <span class="w-28 text-gray-500 dark:text-neutral-400">Эл. почта:</span>
            <span>{{ user?.email || '—' }}</span>
          </div>

          <div class="flex gap-2">
            <span class="w-28 text-gray-500 dark:text-neutral-400">Телефон:</span>
            <span>{{ user?.phone || '—' }}</span>
          </div>

          <div class="flex gap-2">
            <span class="w-28 text-gray-500 dark:text-neutral-400">Веб-сайт:</span>
            <span v-if="websiteUrl">
              <a
                :href="websiteUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {{ user.website }}
              </a>
            </span>
            <span v-else>—</span>
          </div>

          <div class="flex gap-2">
            <span class="w-28 text-gray-500 dark:text-neutral-400">Компания:</span>
            <span>{{ companyName }}</span>
          </div>

          <div class="flex gap-2">
            <span class="w-28 text-gray-500 dark:text-neutral-400">Адрес:</span>
            <span>{{ fullAddress }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

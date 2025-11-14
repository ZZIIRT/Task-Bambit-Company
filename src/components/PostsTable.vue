<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { usePostsStore } from '@/stores/posts'
import { useUsersStore } from '@/stores/users'
import { useUiStore } from '@/stores/ui'
import { PAGE_SIZE } from '@/constants'
// Если используешь lucide-vue-next — раскомментируй
// import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-vue-next'

const postsStore = usePostsStore()
const usersStore = useUsersStore()
const ui = useUiStore()

const searchText = ref('')
watch(searchText, async (value) => {
  // когда поле пустое → показываем все посты
  if (value.trim() === '') {
    try {
      await postsStore.search('')
    } catch {
      ui.toast('Сервис временно недоступен. Пожалуйста, попробуйте позже.')
    }
  }
})


const sentinel = ref(null)
let io = null

function authorEmailOf(post) {
  return usersStore.byId[post.userId]?.email || '—'
}

const sortedAll = computed(() => {
  const arr = [...postsStore.posts]
  const key = postsStore.sortKey
  const dir = postsStore.sortDir === 'asc' ? 1 : -1

  arr.sort((a, b) => {
    const va = key === 'author' ? authorEmailOf(a) : (a[key] ?? '')
    const vb = key === 'author' ? authorEmailOf(b) : (b[key] ?? '')

    const A = key === 'id' ? Number(va) : String(va).toLowerCase()
    const B = key === 'id' ? Number(vb) : String(vb).toLowerCase()

    if (A < B) return -1 * dir
    if (A > B) return  1 * dir
    return 0
  })

  return arr
})

const visibleRows = computed(() =>
  sortedAll.value.slice(0, postsStore.visibleCount)
)

async function onSort(key) {
  try {
    await postsStore.sortBy(key)
  } catch {
    ui.toast('Сервис временно недоступен. Пожалуйста, попробуйте позже.')
  }
}

async function doSearch() {
  try {
    await postsStore.search(searchText.value)
  } catch {
    ui.toast('Сервис временно недоступен. Пожалуйста, попробуйте позже.')
  }
}

function mountObserver() {
  const root = document.getElementById('scrollable-table')
  if (!root || !sentinel.value) return

  io = new IntersectionObserver(async (entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !postsStore.loading) {
        try {
          await postsStore.loadMore()
        } catch {
          ui.toast('Сервис временно недоступен. Пожалуйста, попробуйте позже.')
        }
      }
    }
  }, { root, threshold: 1 })

  io.observe(sentinel.value)
}


onMounted(() => mountObserver())
onUnmounted(() => io?.disconnect())
</script>

<template>
  <div
    class="
      w-full max-w-[600px]
      h-[70vh] max-h-[600px]
      mx-auto
      rounded-xl
      border border-gray-300 dark:border-neutral-700
      bg-white dark:bg-neutral-900 
      shadow
      flex flex-col
      text-xs sm:text-sm
      overflow-hidden
    "
  >

    <div
      class="
        p-3 sm:p-4
        border-b border-gray-300 dark:border-neutral-700
        sticky top-0
        bg-white/90 dark:bg-neutral-900/90
        backdrop-blur
        z-10
        flex flex-col sm:flex-row gap-2
        items-stretch sm:items-center
      "
    >
      <div class="relative flex-1">
        <input
          v-model="searchText"
          type="text"
          placeholder="Поиск по заголовку (title)"
          class="
            w-full
            rounded-md
            border border-gray-300 dark:border-neutral-700
            px-2
            py-1.5 sm:py-2
            bg-white dark:bg-neutral-800
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
						
          "
          @keyup.enter="doSearch"
        />
      </div>

      <button
        class="
          rounded-md
          border border-gray-300 dark:border-neutral-700
          px-3 sm:px-4
          py-1.5 sm:py-2
          hover:bg-gray-100 dark:hover:bg-neutral-800
          disabled:opacity-60
          inline-flex items-center justify-center gap-2
        "
        :disabled="postsStore.loading"
        @click="doSearch"
      >
        <span v-if="!postsStore.loading">Поиск</span>
        <span v-else class="inline-flex items-center gap-2">
          Загружаю…
        </span>
      </button>
    </div>

    <!-- TABLE -->
    <div id="scrollable-table" class="flex-1 overflow-y-auto">
      <table class="min-w-full">

        <thead
          class="
            sticky top-0
            bg-gray-100/95 dark:bg-neutral-950/95
            backdrop-blur
            z-10
          "
        >
          <tr class="border-b border-gray-300 dark:border-neutral-700">
            <th
              class="px-2 sm:px-3 py-2 text-left font-medium cursor-pointer select-none"
              @click="onSort('id')"
            >
              <div class="inline-flex items-center gap-1">
                ID
                <span class="text-[9px] sm:text-[10px] opacity-70">
                  {{ postsStore.sortKey === 'id'
                      ? (postsStore.sortDir === 'asc' ? '▲' : '▼')
                      : '↕'
                  }}
                </span>
              </div>
            </th>

            <th
              class="px-2 sm:px-3 py-2 text-left font-medium cursor-pointer select-none"
              @click="onSort('title')"
            >
              <div class="inline-flex items-center gap-1">
                Заголовок
                <span class="text-[9px] sm:text-[10px] opacity-70">
                  {{ postsStore.sortKey === 'title'
                      ? (postsStore.sortDir === 'asc' ? '▲' : '▼')
                      : '↕'
                  }}
                </span>
              </div>
            </th>

            <th
              class="px-2 sm:px-3 py-2 text-left font-medium cursor-pointer select-none"
              @click="onSort('author')"
            >
              <div class="inline-flex items-center gap-1">
                Автор
                <span class="text-[9px] sm:text-[10px] opacity-70">
                  {{ postsStore.sortKey === 'author'
                      ? (postsStore.sortDir === 'asc' ? '▲' : '▼')
                      : '↕'
                  }}
                </span>
              </div>
            </th>

            <th
              class="px-2 sm:px-3 py-2 text-left font-medium cursor-pointer select-none"
              @click="onSort('body')"
            >
              <div class="inline-flex items-center gap-1">
                Контент
                <span class="text-[9px] sm:text-[10px] opacity-70">
                  {{ postsStore.sortKey === 'body'
                      ? (postsStore.sortDir === 'asc' ? '▲' : '▼')
                      : '↕'
                  }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-if="postsStore.loading && postsStore.posts.length === 0"
            v-for="i in 8"
            :key="'sk-'+i"
            class="border-b border-gray-300 dark:border-neutral-800"
          >
            <td class="px-2 sm:px-3 py-2">
              <div class="h-4 w-8 bg-gray-200 dark:bg-neutral-800 animate-pulse rounded"></div>
            </td>
            <td class="px-2 sm:px-3 py-2">
              <div class="h-4 w-28 bg-gray-200 dark:bg-neutral-800 animate-pulse rounded"></div>
            </td>
            <td class="px-2 sm:px-3 py-2">
              <div class="h-4 w-32 bg-gray-200 dark:bg-neutral-800 animate-pulse rounded"></div>
            </td>
            <td class="px-2 sm:px-3 py-2">
              <div class="h-4 w-40 bg-gray-200 dark:bg-neutral-800 animate-pulse rounded"></div>
            </td>
          </tr>

          <tr
            v-for="p in visibleRows"
            :key="p.id"
            class="
              border-b border-gray-300 dark:border-neutral-800
              hover:bg-gray-50/80 dark:hover:bg-neutral-800/70
            "
          >
            <td class="px-2 sm:px-3 py-2" :title="p.id">{{ p.id }}</td>
            <td class="px-2 sm:px-3 py-2">
              <span class="table-cell-ellipsis" :title="p.title">{{ p.title }}</span>
            </td>
            <td class="px-2 sm:px-3 py-2">
              <button
                class="
                  table-cell-ellipsis
                  text-blue-600 dark:text-blue-400
                  hover:underline
                "
                :class="usersStore.isViewed(p.userId)
                  ? 'text-purple-600 dark:text-purple-400'
                  : ''"
                @click="$emit('show-user', p.userId)"
              >
                {{ authorEmailOf(p) }}
              </button>
            </td>
            <td class="px-2 sm:px-3 py-2">
              <span class="table-cell-ellipsis" :title="p.body">{{ p.body }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- sentinel -->
      <div ref="sentinel" class="h-6 sm:h-8"></div>

      <div
        v-if="postsStore.loading && postsStore.posts.length > 0"
        class="py-3 text-center text-[10px] sm:text-xs opacity-70"
      >
        Загружаю ещё…
      </div>

      <div
        v-if="!postsStore.loading && postsStore.posts.length === 0"
        class="py-6 sm:py-8 text-center text-xs sm:text-sm opacity-70"
      >
        Ничего не найдено.
      </div>
    </div>

    <div
      class="
        text-[10px] sm:text-[11px]
        opacity-70
        px-3 sm:px-4
        py-2
        border-t border-gray-300 dark:border-neutral-700
        bg-white/90 dark:bg-neutral-900/90
      "
    >
      Показано
      {{ Math.min(postsStore.visibleCount, postsStore.posts.length) }}
      из
      {{ postsStore.posts.length }}
      <span v-if="postsStore.loadedAll"> (все загружены)</span>
    </div>
  </div>
</template>

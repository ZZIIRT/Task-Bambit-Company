<script setup>
import { ref, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { usePostsStore } from '@/stores/posts'
import { useUiStore } from '@/stores/ui'

import PostsTable from '@/components/PostsTable.vue'
import UserModal from '@/components/UserModal.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const users = useUsersStore()
const posts = usePostsStore()
const ui = useUiStore()

const modalOpen = ref(false)
const modalUser = ref(null)

async function showUser(userId) {
  try {
    const u = users.getById(userId)
    modalUser.value = u || null
    modalOpen.value = true
    users.markViewed(userId)
  } catch {
    ui.toast('Не удалось открыть карточку пользователя.')
  }
}

function closeModal() {
  modalOpen.value = false
  modalUser.value = null
}

onMounted(async () => {
  users.initViewedFromStorage()

  try {
    await Promise.all([
      users.fetchAll(),
      posts.initLoad(),
    ])
  } catch {
    ui.toast('Сервис временно недоступен. Пожалуйста, попробуйте позже.')
  }
})
</script>

<template>
  <div
    class="
      min-h-screen
      flex items-center justify-center
      p-3 sm:p-4
      bg-gray-50 text-gray-900
      dark:bg-neutral-900 dark:text-gray-100
    "
  >
    <div class="fixed top-3 right-3">
      <ThemeToggle />
    </div>

    <div class="w-full max-w-[640px]">
      <PostsTable @show-user="showUser" />
    </div>

    <UserModal :open="modalOpen" :user="modalUser" @close="closeModal" />
    <ToastContainer />
  </div>
</template>

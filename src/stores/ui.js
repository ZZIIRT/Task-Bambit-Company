// src/stores/ui.js
import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '@/constants'

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: 'light',      // 'light' | 'dark'
    toasts: [],          // [{ id, message, type }]
  }),
  actions: {
    initTheme() {
      // Сначала читаем сохранённую тему
      const saved = localStorage.getItem(STORAGE_KEYS.THEME)

      if (saved === 'dark' || saved === 'light') {
        this.theme = saved
      } else {
        // Если в хранилище ничего нет — берём системную настройку
        const prefersDark = window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
        this.theme = prefersDark ? 'dark' : 'light'
      }

      this.applyTheme()
    },

    applyTheme() {
      const root = document.documentElement
      root.classList.toggle('dark', this.theme === 'dark')
    },

    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      this.applyTheme()
      localStorage.setItem(STORAGE_KEYS.THEME, this.theme)
    },

    toast(message, type = 'error', timeout = 3500) {
      const id = crypto.randomUUID ? crypto.randomUUID() : String(Math.random())
      this.toasts.push({ id, message, type })
      setTimeout(() => this.removeToast(id), timeout)
    },

    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    },
  },
  persist: {
    paths: ['theme'],
  },
})

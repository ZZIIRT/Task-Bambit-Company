import { defineStore } from 'pinia'
import { API, STORAGE_KEYS } from '@/constants'

export const useUsersStore = defineStore('users', {
  state: () => ({
    byId: {},          // { [id]: user }
    loading: false,
    error: null,
    viewedIds: [],     // сохраняем просмотренных (по userId)
  }),
  getters: {
    getById: (state) => (id) => state.byId[id],
    isViewed: (state) => (id) => state.viewedIds.includes(id),
  },
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(API.USERS)
        if (!res.ok) throw new Error('Users fetch failed')
        const data = await res.json()
        const map = {}
        for (const u of data) map[u.id] = u
        this.byId = map
      } catch (e) {
        this.error = e?.message || 'unknown'
        throw e
      } finally {
        this.loading = false
      }
    },
    markViewed(userId) {
      if (!this.viewedIds.includes(userId)) {
        this.viewedIds.push(userId)
        localStorage.setItem(STORAGE_KEYS.VIEWED_USERS, JSON.stringify(this.viewedIds))
      }
    },
    initViewedFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.VIEWED_USERS)
        if (raw) this.viewedIds = JSON.parse(raw)
      } catch { /* noop */ }
    },
  },
  persist: {
    paths: ['viewedIds'],
  },
})

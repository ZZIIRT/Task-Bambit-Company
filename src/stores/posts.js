import { defineStore } from 'pinia'
import { API, PAGE_SIZE } from '@/constants'

export const usePostsStore = defineStore('posts', {
  state: () => ({
    query: '',            // текущая поисковая строка
    posts: [],            // загруженные посты под текущий query
    loading: false,
    error: null,

    // пагинация
    nextStart: 0,         // _start для следующей порции
    loadedAll: false,     // все данные под текущий query загружены

    // отображение
    visibleCount: PAGE_SIZE, // сколько показываем строк на экране

    // сортировки
    sortKey: 'id',        // 'id' | 'title' | 'author' | 'body'
    sortDir: 'asc',       // 'asc' | 'desc'

    _abortController: null,
  }),
  actions: {
    _buildUrl(start = 0, limit = PAGE_SIZE) {
      // Если query пустая - без title_like
      const params = new URLSearchParams({
        _start: String(start),
        _limit: String(limit),
      })
      if (this.query?.trim()) params.append('title_like', this.query.trim())
      return `${API.POSTS}?${params.toString()}`
    },

    async _fetchPage() {
      if (this.loadedAll || this.loading) return []

      this.loading = true
      this.error = null

      // отменим предыдущий запрос, если есть
      try { this._abortController?.abort() } catch {}
      this._abortController = new AbortController()

      try {
        const res = await fetch(this._buildUrl(this.nextStart, PAGE_SIZE), {
          signal: this._abortController.signal,
        })
        if (!res.ok) throw new Error('Posts fetch failed')
        const chunk = await res.json()

        // на случай дубликатов при резких кликах — фильтруем по id
        const existing = new Set(this.posts.map(p => p.id))
        const unique = chunk.filter(p => !existing.has(p.id))

        this.posts = [...this.posts, ...unique]
        this.nextStart += PAGE_SIZE
        if (chunk.length < PAGE_SIZE) this.loadedAll = true
        return unique
      } catch (e) {
        if (e.name === 'AbortError') return []
        this.error = e?.message || 'unknown'
        throw e
      } finally {
        this.loading = false
      }
    },

    async initLoad() {
      // стартовая загрузка под пустой запрос
      await this.search(this.query)
    },

    async search(q) {
      // сброс состояния под новый запрос
      this.query = q?.trim() || ''
      this.posts = []
      this.nextStart = 0
      this.loadedAll = false
      this.visibleCount = PAGE_SIZE
      await this._fetchPage()
    },

    async loadMore() {
      // увеличиваем видимую часть; если не хватает — докачиваем
      if (this.visibleCount < this.posts.length) {
        this.visibleCount += PAGE_SIZE
        return
      }
      const got = await this._fetchPage()
      if (got.length) {
        this.visibleCount += PAGE_SIZE
      }
    },

    async ensureAllLoaded() {
      // Нужна полная сортировка "по всем данным" — докачиваем до конца.
      while (!this.loadedAll) {
        await this._fetchPage()
      }
    },

    async sortBy(key) {
      // Переключение направления по клику той же колонки
      if (this.sortKey === key) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortDir = 'asc'
      }
      // По ТЗ после сортировки снова показываем только 30
      this.visibleCount = PAGE_SIZE
      // Важно: сортировка по всем данным → дожидаемся полной загрузки
      await this.ensureAllLoaded()
    },
  },
})

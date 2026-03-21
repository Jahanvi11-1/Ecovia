import { create } from 'zustand'


const useUiStore = create((set) => ({
  profileOpen: false,
  sidebarOpen: false,
  viewMode: 'list', // 'list' | 'kanban'
  searchQuery: '',


  setProfileOpen: (open) => set({ profileOpen: open }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}))


export default useUiStore
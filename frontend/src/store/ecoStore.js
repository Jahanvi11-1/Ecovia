import { create } from 'zustand'

const useEcoStore = create((set) => ({
  ecos: [],
  stages: [],

  setEcos: (ecos) => set({ ecos }),
  setStages: (stages) => set({ stages }),
}))

export default useEcoStore

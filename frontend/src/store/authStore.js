import { create } from 'zustand'


const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,


  login: (token, user) => {
    localStorage.setItem('token', token)
    set({ token, user })
  },


  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null })
  },


  setUser: (user) => set({ user }),
}))


export default useAuthStore

import React from 'react'
import { useNavigate } from 'react-router-dom'
import useUiStore from '../../store/uiStore'
import useAuthStore from '../../store/authStore'

export default function ProfilePanel() {
  const { profileOpen, setProfileOpen } = useUiStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/login')
  }

  return (
    <>
      {/* Backdrop */}
      {profileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setProfileOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          profileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Profile</h2>
          <button
            onClick={() => setProfileOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {user.login_id?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.login_id}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Role</p>
                <p className="text-sm font-medium text-gray-800">{user.role}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Loading profile...</p>
          )}

          <button
            onClick={handleLogout}
            className="w-full mt-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded-lg text-sm transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  )
}

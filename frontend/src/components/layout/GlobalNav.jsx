import React from 'react'
import { useNavigate } from 'react-router-dom'
import useUiStore from '../../store/uiStore'


export default function GlobalNav() {
  const navigate = useNavigate()
  const { viewMode, searchQuery, setProfileOpen, setSidebarOpen, setViewMode, setSearchQuery } = useUiStore()


  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
      {/* Profile icon — slides left panel */}
      <button
        onClick={() => setProfileOpen(true)}
        className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm hover:bg-blue-700 transition flex-shrink-0"
        aria-label="Open profile"
      >
        P
      </button>


      {/* Brand */}
      <span
        className="font-bold text-gray-800 text-lg cursor-pointer select-none"
        onClick={() => navigate('/')}
      >
        Ecovia PLM
      </span>


      {/* Search bar */}
      <div className="flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search by reference, product, or state..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>


      {/* View toggles */}
      <div className="flex border border-gray-300 rounded-lg overflow-hidden text-sm">
        <button
          onClick={() => setViewMode('list')}
          className={`px-3 py-1.5 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          List
        </button>
        <button
          onClick={() => setViewMode('kanban')}
          className={`px-3 py-1.5 ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          Kanban
        </button>
      </div>


      {/* New button */}
      <button
        onClick={() => navigate('/ecos/new')}
        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
      >
        + New ECO
      </button>


      {/* Hamburger — slides right sidebar */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="flex flex-col gap-1 p-2 hover:bg-gray-100 rounded-lg"
        aria-label="Open menu"
      >
        <span className="block w-5 h-0.5 bg-gray-700" />
        <span className="block w-5 h-0.5 bg-gray-700" />
        <span className="block w-5 h-0.5 bg-gray-700" />
      </button>
    </nav>
  )
}



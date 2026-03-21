import React from 'react'
import { useNavigate } from 'react-router-dom'

const STATUS_COLORS = {
  Open: 'border-l-blue-500',
  Validated: 'border-l-yellow-500',
  Applied: 'border-l-green-500',
  Rejected: 'border-l-red-500',
}

export default function EcoKanban({ ecos, stages }) {
  const navigate = useNavigate()

  // Group ECOs by current_stage_id
  const grouped = {}
  stages.forEach((s) => { grouped[s.stage_id] = [] })
  // Also handle ECOs with no stage or terminal status
  const terminal = ecos.filter((e) => e.status === 'Applied' || e.status === 'Rejected')
  const active = ecos.filter((e) => e.status !== 'Applied' && e.status !== 'Rejected')
  active.forEach((e) => {
    if (e.current_stage_id && grouped[e.current_stage_id] !== undefined) {
      grouped[e.current_stage_id].push(e)
    }
  })

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <div key={stage.stage_id} className="flex-shrink-0 w-64">
          <div className="bg-gray-100 rounded-t-lg px-3 py-2 font-semibold text-sm text-gray-700 border border-gray-200">
            {stage.stage_name}
            <span className="ml-2 text-xs text-gray-400">({grouped[stage.stage_id]?.length || 0})</span>
          </div>
          <div className="bg-gray-50 border border-t-0 border-gray-200 rounded-b-lg min-h-32 p-2 space-y-2">
            {(grouped[stage.stage_id] || []).map((e) => (
              <div
                key={e.eco_id}
                onClick={() => navigate(`/ecos/${e.eco_id}`)}
                className={`bg-white rounded-lg border-l-4 ${STATUS_COLORS[e.status] || 'border-l-gray-300'} shadow-sm p-3 cursor-pointer hover:shadow-md transition`}
              >
                <p className="text-xs text-blue-600 font-mono mb-1">ECO-{e.eco_id}</p>
                <p className="text-sm font-medium text-gray-800 leading-tight">{e.title}</p>
                <p className="text-xs text-gray-400 mt-1">{e.eco_type}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Terminal column */}
      {terminal.length > 0 && (
        <div className="flex-shrink-0 w-64">
          <div className="bg-gray-100 rounded-t-lg px-3 py-2 font-semibold text-sm text-gray-700 border border-gray-200">
            Completed / Rejected
          </div>
          <div className="bg-gray-50 border border-t-0 border-gray-200 rounded-b-lg min-h-32 p-2 space-y-2">
            {terminal.map((e) => (
              <div
                key={e.eco_id}
                onClick={() => navigate(`/ecos/${e.eco_id}`)}
                className={`bg-white rounded-lg border-l-4 ${STATUS_COLORS[e.status] || 'border-l-gray-300'} shadow-sm p-3 cursor-pointer hover:shadow-md transition opacity-75`}
              >
                <p className="text-xs text-blue-600 font-mono mb-1">ECO-{e.eco_id}</p>
                <p className="text-sm font-medium text-gray-800 leading-tight">{e.title}</p>
                <p className="text-xs text-gray-400 mt-1">{e.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

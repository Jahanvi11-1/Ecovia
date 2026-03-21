import { useEffect, useState } from 'react'
import api from '../../api/client'
import useAuthStore from '../../store/authStore'

export default function EcoStageSettings() {
  const user = useAuthStore((s) => s.user)
  const [stages, setStages] = useState([])
  const [selected, setSelected] = useState(null) // stage being edited
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  if (user?.role !== 'Admin') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-sm">
        Access Denied — Settings are only accessible to Admins.
      </div>
    )
  }

  const fetchStages = () =>
    api.get('/settings/stages').then((res) => setStages(res.data)).finally(() => setLoading(false))

  useEffect(() => { fetchStages() }, [])

  const handleNew = () =>
    setSelected({ stage_id: null, stage_name: '', sequence_order: stages.length + 1, requires_approval: false, is_final_stage: false })

  const handleDelete = async (stageId, e) => {
    e.stopPropagation()
    if (!confirm('Delete this stage?')) return
    try {
      await api.delete(`/settings/stages/${stageId}`)
      if (selected?.stage_id === stageId) setSelected(null)
      fetchStages()
    } catch (err) {
      setError(err.response?.data?.detail || 'Delete failed')
    }
  }

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">Loading...</div>

  return (
    <div className="flex gap-4 max-w-4xl">
      {/* Left: Stage list */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
            <button
              onClick={handleNew}
              className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded transition"
            >
              New
            </button>
            <span className="flex-1 text-center text-sm font-semibold text-gray-700">ECO's Stages</span>
          </div>

          {/* Header row */}
          <div className="px-4 py-2 border-b border-gray-100 bg-white">
            <span className="text-xs font-semibold text-gray-600">Name</span>
          </div>

          {stages.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No stages yet</div>
          )}
          {stages.map((s) => (
            <div
              key={s.stage_id}
              onClick={() => setSelected(s)}
              className={`flex items-center justify-between px-4 py-2.5 border-b border-gray-100 cursor-pointer text-sm hover:bg-blue-50 ${
                selected?.stage_id === s.stage_id ? 'bg-blue-50 text-blue-700' : 'text-gray-800'
              }`}
            >
              <span>{s.stage_name}</span>
              <button
                onClick={(e) => handleDelete(s.stage_id, e)}
                className="text-red-400 hover:text-red-600 text-xs ml-2 opacity-0 group-hover:opacity-100"
                title="Delete"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Stage detail / edit */}
      {selected && (
        <StageDetail
          key={selected.stage_id ?? 'new'}
          stage={selected}
          onSaved={() => { fetchStages(); setSelected(null) }}
          onClose={() => setSelected(null)}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 text-red-700 text-sm px-4 py-2 rounded shadow">
          {error}
        </div>
      )}
    </div>
  )
}

function StageDetail({ stage, onSaved, onClose }) {
  const [name, setName] = useState(stage.stage_name)
  const [seqOrder, setSeqOrder] = useState(stage.sequence_order)
  const [isFinal, setIsFinal] = useState(stage.is_final_stage)
  const [rules, setRules] = useState([])
  const [users, setUsers] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // For adding a new approval rule
  const [newUserId, setNewUserId] = useState('')
  const [newCategory, setNewCategory] = useState('Required')

  const isNew = !stage.stage_id

  useEffect(() => {
    api.get('/settings/users').then((res) => setUsers(res.data))
    if (!isNew) {
      api.get(`/settings/stages/${stage.stage_id}/approvals`).then((res) => setRules(res.data))
    }
  }, [stage.stage_id])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        stage_name: name.trim(),
        sequence_order: parseInt(seqOrder) || 1,
        requires_approval: rules.length > 0,
        is_final_stage: isFinal,
      }
      if (isNew) {
        await api.post('/settings/stages', payload)
      } else {
        await api.put(`/settings/stages/${stage.stage_id}`, payload)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleAddRule = async () => {
    if (!newUserId) return
    try {
      const res = await api.post(`/settings/stages/${stage.stage_id}/approvals`, {
        user_id: parseInt(newUserId),
        approval_category: newCategory,
      })
      setRules((r) => [...r, res.data])
      setNewUserId('')
      setNewCategory('Required')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add approval')
    }
  }

  const handleDeleteRule = async (ruleId) => {
    try {
      await api.delete(`/settings/stages/${stage.stage_id}/approvals/${ruleId}`)
      setRules((r) => r.filter((x) => x.rule_id !== ruleId))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove approval')
    }
  }

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        <span className="flex-1 text-center text-sm font-semibold text-gray-700">
          {isNew ? 'New Stage' : stage.stage_name}
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="p-5 space-y-5">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
        )}

        {/* Name field */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. New, In Review, Done"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sequence Order</label>
            <input
              type="number"
              min="1"
              value={seqOrder}
              onChange={(e) => setSeqOrder(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFinal}
                onChange={(e) => setIsFinal(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              Final Stage
            </label>
          </div>
        </div>

        {/* Approvals sub-section — only for existing stages */}
        {!isNew && (
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-2">Approvals</div>
            <div className="border border-gray-200 rounded overflow-hidden">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_140px_32px] bg-gray-50 border-b border-gray-200 px-3 py-2">
                <span className="text-xs font-semibold text-gray-600">User</span>
                <span className="text-xs font-semibold text-gray-600">Approval Category</span>
                <span />
              </div>

              {rules.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-xs">No approvals configured</div>
              )}
              {rules.map((r) => (
                <div key={r.rule_id} className="grid grid-cols-[1fr_140px_32px] items-center px-3 py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-800">{r.user_login_id}</span>
                  <span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      r.approval_category === 'Required'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {r.approval_category}
                    </span>
                  </span>
                  <button
                    onClick={() => handleDeleteRule(r.rule_id)}
                    className="text-red-400 hover:text-red-600 text-sm font-bold"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Add row */}
              <div className="grid grid-cols-[1fr_140px_64px] items-center gap-2 px-3 py-2 bg-gray-50 border-t border-gray-200">
                <select
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 w-full"
                >
                  <option value="">Select user...</option>
                  {users.map((u) => (
                    <option key={u.user_id} value={u.user_id}>{u.login_id}</option>
                  ))}
                </select>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 w-full"
                >
                  <option value="Required">Required</option>
                  <option value="Optional">Optional</option>
                </select>
                <button
                  onClick={handleAddRule}
                  disabled={!newUserId}
                  className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded transition disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Required: approval needed to advance ECO. Optional: approval is informational only.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

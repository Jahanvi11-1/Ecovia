import { useEffect, useState } from 'react'
import api from '../../api/client'
import useAuthStore from '../../store/authStore'

// Zero-install SVG Icons
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
)
const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
)

export default function EcoStageSettings() {
  const user = useAuthStore((s) => s.user)
  const [stages, setStages] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  if (user?.role !== 'Admin') {
    return (
      <div style={{ background: 'var(--punch-red-light)', border: '1px solid var(--punch-red-border)', color: 'var(--punch-red)', borderRadius: 12, padding: '20px 24px', fontSize: 13, fontWeight: 500 }}>
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

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center', fontSize: 13 }}>Loading system stages...</div>

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', padding: '28px 32px', display: 'flex', gap: 24, maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Left: Stage list Card §5.5 */}
      <div style={{ width: 280, flexShrink: 0 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>ECO Stages</span>
            <button
              onClick={handleNew}
              style={{ background: 'var(--punch-red)', color: '#ffffff', fontSize: 11, fontWeight: 600, height: 28, padding: '0 10px', borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <PlusIcon /> New
            </button>
          </div>

          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {stages.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No stages configured</div>
            )}
            {stages.map((s) => (
              <div
                key={s.stage_id}
                onClick={() => setSelected(s)}
                className="group"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--bg-muted)', cursor: 'pointer', transition: 'all 0.15s ease',
                  background: selected?.stage_id === s.stage_id ? 'var(--cerulean-light)' : 'transparent',
                  color: selected?.stage_id === s.stage_id ? 'var(--cerulean)' : 'var(--text-primary)'
                }}
              >
                <span style={{ fontSize: 13, fontWeight: selected?.stage_id === s.stage_id ? 600 : 400 }}>{s.stage_name}</span>
                <button
                  onClick={(e) => handleDelete(s.stage_id, e)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--punch-red)', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 4 }}
                >
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Stage detail / edit */}
      <div style={{ flex: 1 }}>
        {selected ? (
          <StageDetail
            key={selected.stage_id ?? 'new'}
            stage={selected}
            onSaved={() => { fetchStages(); setSelected(null) }}
            onClose={() => setSelected(null)}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', borderRadius: 12, color: 'var(--text-muted)', fontSize: 13 }}>
            Select a stage from the left to manage attributes and approvals
          </div>
        )}
      </div>

      {error && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--punch-red-light)', border: '1px solid var(--punch-red-border)', color: 'var(--punch-red)', padding: '12px 20px', borderRadius: 8, boxShadow: '0 4px 12px rgba(230,57,70,0.15)', fontSize: 13, fontWeight: 500, zIndex: 100 }}>
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

  const inputStyle = { height: 36, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-subtle)', fontSize: 13, fontFamily: 'inherit', color: 'var(--text-primary)', width: '100%', outline: 'none' }
  const labelStyle = { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{ background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, fontWeight: 500, height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeftIcon /> Back
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{isNew ? 'New Lifecycle Stage' : stage.stage_name}</span>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ background: 'var(--punch-red)', color: '#ffffff', fontSize: 12.5, fontWeight: 600, height: 32, padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Processing...' : 'Save Configuration'}
        </button>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {error && <div style={{ fontSize: 13, color: 'var(--punch-red)', background: 'var(--punch-red-light)', border: '1px solid var(--punch-red-border)', padding: '10px 14px', borderRadius: 8 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Stage Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="e.g. Design Review" />
          </div>
          <div>
            <label style={labelStyle}>Sequence</label>
            <input type="number" value={seqOrder} onChange={(e) => setSeqOrder(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: 36, marginTop: 21 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: 'var(--text-primary)' }}>
              <input type="checkbox" checked={isFinal} onChange={(e) => setIsFinal(e.target.checked)} style={{ width: 16, height: 16 }} />
              Final Stage
            </label>
          </div>
        </div>

        {!isNew && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: 12 }}>Sign-off Requirements</div>
            
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>User</th>
                    <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '9px 16px', textAlign: 'right' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rules.length === 0 && (
                    <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No approvers defined for this stage.</td></tr>
                  )}
                  {rules.map((r) => (
                    <tr key={r.rule_id} style={{ borderBottom: '1px solid var(--bg-muted)' }}>
                      <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 500 }}>{r.user_login_id}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: r.approval_category === 'Required' ? 'var(--status-review-bg)' : 'var(--bg-muted)', color: r.approval_category === 'Required' ? 'var(--status-review-text)' : 'var(--text-secondary)' }}>
                          {r.approval_category}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                        <button onClick={() => handleDeleteRule(r.rule_id)} style={{ background: 'transparent', border: 'none', color: 'var(--punch-red)', cursor: 'pointer' }}><XIcon /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px', gap: 12, padding: '12px 16px', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)' }}>
                <select value={newUserId} onChange={(e) => setNewUserId(e.target.value)} style={{ ...inputStyle, height: 32 }}>
                  <option value="">Select User...</option>
                  {users.map((u) => <option key={u.user_id} value={u.user_id}>{u.login_id}</option>)}
                </select>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ ...inputStyle, height: 32 }}>
                  <option value="Required">Required</option>
                  <option value="Optional">Optional</option>
                </select>
                <button onClick={handleAddRule} disabled={!newUserId} style={{ background: 'var(--cerulean)', color: '#ffffff', fontSize: 12, fontWeight: 600, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', opacity: !newUserId ? 0.5 : 1 }}>Add</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
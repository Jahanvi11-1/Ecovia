import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import useAuthStore from '../../store/authStore'

export default function EcoCreateForm() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [products, setProducts] = useState([])
  const [boms, setBoms] = useState([])
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({
    title: '',
    eco_type: 'Bill of Materials',
    target_product_id: '',
    target_bom_id: '',
    user_id: '',
    version_update_toggle: false,
    effective_date: '',
  })
  const [savedEco, setSavedEco] = useState(null) // eco saved but not started
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [starting, setStarting] = useState(false)

  const canCreate = user?.role === 'Admin' || user?.role === 'Engineering User'
  const isStarted = savedEco?.is_started === true

  useEffect(() => {
    api.get('/products/').then((res) => setProducts(res.data))
    // Pre-fill user with logged-in user
    setForm((f) => ({ ...f, user_id: user?.user_id || '' }))
  }, [user])

  useEffect(() => {
    if (form.eco_type === 'Bill of Materials' && form.target_product_id) {
      api.get(`/products/${form.target_product_id}`).then((res) => {
        const av = res.data.active_version
        if (av) {
          api.get(`/boms/by-product-version/${av.version_id}`).then((r) => setBoms(r.data))
        } else {
          setBoms([])
        }
      })
    } else {
      setBoms([])
      setForm((f) => ({ ...f, target_bom_id: '' }))
    }
  }, [form.eco_type, form.target_product_id])

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: val }))
  }

  const buildPayload = () => ({
    title: form.title,
    eco_type: form.eco_type === 'Bill of Materials' ? 'BoM' : 'Product',
    target_product_id: parseInt(form.target_product_id),
    target_bom_id: form.eco_type === 'Bill of Materials' && form.target_bom_id ? parseInt(form.target_bom_id) : null,
    version_update_toggle: form.version_update_toggle,
    effective_date: form.effective_date ? new Date(form.effective_date).toISOString() : new Date().toISOString(),
    proposed_changes: {},
  })

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      if (savedEco) {
        // Update existing draft
        const res = await api.put(`/ecos/${savedEco.eco_id}`, {
          title: form.title,
          version_update_toggle: form.version_update_toggle,
          effective_date: form.effective_date ? new Date(form.effective_date).toISOString() : undefined,
        })
        setSavedEco(res.data)
      } else {
        const res = await api.post('/ecos/', buildPayload())
        setSavedEco(res.data)
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setSaving(false)
    }
  }

  const handleStart = async () => {
    setError('')
    // Save first if not saved
    let eco = savedEco
    if (!eco) {
      setSaving(true)
      try {
        const res = await api.post('/ecos/', buildPayload())
        eco = res.data
        setSavedEco(eco)
      } catch (err) {
        const detail = err.response?.data?.detail
        setError(typeof detail === 'string' ? detail : JSON.stringify(detail))
        setSaving(false)
        return
      }
      setSaving(false)
    }
    setStarting(true)
    try {
      await api.post(`/ecos/${eco.eco_id}/start`)
      navigate(`/ecos/${eco.eco_id}`)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setStarting(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
        Access Denied — only Admin and Engineering Users can create ECOs.
      </div>
    )
  }

  const ro = isStarted // readonly after start
  const inputCls = `w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${ro ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed' : 'border-gray-300'}`
  const selectCls = inputCls

  return (
    <div className="max-w-xl">
      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleStart}
          disabled={starting || saving || ro}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded transition disabled:opacity-50"
        >
          {starting ? 'Starting...' : 'Start'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving || starting || ro}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-1.5 rounded transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {savedEco && (
          <span className="ml-2 flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            New
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        {/* Title */}
        <div className="flex items-center gap-4">
          <label className="w-36 text-sm text-gray-600 flex-shrink-0">Title*</label>
          <input
            value={form.title}
            onChange={set('title')}
            disabled={ro}
            required
            className={inputCls}
          />
        </div>

        {/* ECO Type */}
        <div className="flex items-center gap-4">
          <label className="w-36 text-sm text-gray-600 flex-shrink-0">ECO Type*</label>
          <select
            value={form.eco_type}
            onChange={set('eco_type')}
            disabled={ro || !!savedEco}
            className={selectCls}
          >
            <option value="Bill of Materials">Bill of Materials</option>
            <option value="Product">Product</option>
          </select>
        </div>

        {/* Product */}
        <div className="flex items-center gap-4">
          <label className="w-36 text-sm text-gray-600 flex-shrink-0">Product*</label>
          <select
            value={form.target_product_id}
            onChange={set('target_product_id')}
            disabled={ro || !!savedEco}
            required
            className={selectCls}
          >
            <option value="">Select product...</option>
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.active_version?.product_name || p.product_code}
              </option>
            ))}
          </select>
        </div>

        {/* Bill of Materials — only if BoM type */}
        {form.eco_type === 'Bill of Materials' && (
          <div className="flex items-center gap-4">
            <label className="w-36 text-sm text-gray-600 flex-shrink-0">Bill of Materials*</label>
            <select
              value={form.target_bom_id}
              onChange={set('target_bom_id')}
              disabled={ro || !!savedEco}
              required
              className={selectCls}
            >
              <option value="">Select BoM...</option>
              {boms.map((b) => (
                <option key={b.bom_id} value={b.bom_id}>
                  {b.product_name || b.bom_version}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* User */}
        <div className="flex items-center gap-4">
          <label className="w-36 text-sm text-gray-600 flex-shrink-0">User*</label>
          <input
            value={user?.login_id || ''}
            disabled
            className={`${inputCls} bg-gray-50`}
          />
        </div>

        {/* Effective Date */}
        <div className="flex items-center gap-4">
          <label className="w-36 text-sm text-gray-600 flex-shrink-0">Effective Date</label>
          <input
            type="datetime-local"
            value={form.effective_date}
            onChange={set('effective_date')}
            disabled={ro}
            className={inputCls}
          />
        </div>

        {/* Version Update */}
        <div className="flex items-center gap-4">
          <label className="w-36 text-sm text-gray-600 flex-shrink-0">Version Update</label>
          <input
            type="checkbox"
            checked={form.version_update_toggle}
            onChange={set('version_update_toggle')}
            disabled={ro}
            className="w-4 h-4 text-blue-600 rounded"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        * Mandatory fields. Fill and save before clicking Start. Once started, all fields are readonly.
      </p>
    </div>
  )
}

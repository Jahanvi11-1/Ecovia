import { useEffect, useState } from 'react'
import api from '../../api/client'

function ProductDiff({ diff }) {
  const fields = ['sale_price', 'cost_price', 'attachments_url']
  const labels = { sale_price: 'Sales Price', cost_price: 'Cost Price', attachments_url: 'Attachments' }
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 text-center">
        Product &mdash; ECO Changes
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-2 text-gray-500 font-medium w-1/3">Field</th>
            <th className="text-left px-4 py-2 text-gray-600 font-semibold">Version 2</th>
            <th className="text-left px-4 py-2 text-gray-600 font-semibold">Version 1</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => {
            const d = diff.find((x) => x.field === f)
            const changed = d && d.change_type !== 'unchanged'
            return (
              <tr key={f} className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-600">{labels[f]}</td>
                <td className={`px-4 py-3 font-medium ${changed ? 'text-green-600' : 'text-gray-700'}`}>
                  {d?.new_value != null ? String(d.new_value) : '\u2014'}
                </td>
                <td className={`px-4 py-3 ${changed ? 'text-red-500' : 'text-gray-400'}`}>
                  {d?.old_value != null ? String(d.old_value) : '\u2014'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function BomDiff({ bomId, snapshot }) {
  const [bom, setBom] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bomId) { setLoading(false); return }
    api.get(`/boms/${bomId}`).then((res) => setBom(res.data)).finally(() => setLoading(false))
  }, [bomId])

  if (loading) return <div className="text-gray-400 text-sm py-4">Loading BoM...</div>
  if (!bom) return <div className="text-gray-400 text-sm py-4">No BoM data.</div>

  const snapComponents = snapshot?.snapshot_components || []
  const snapOperations = snapshot?.snapshot_operations || []

  // Build lookup maps for old data by component_id / operation_id
  const oldCompMap = {}
  snapComponents.forEach((c) => { oldCompMap[c.component_id] = c })
  const oldOpMap = {}
  snapOperations.forEach((op) => { oldOpMap[op.operation_id] = op })

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 text-center">
        BoM {bom.bom_version} &mdash; ECO Changes
      </div>
      <div className="px-4 pt-4 pb-2">
        <div className="text-sm font-semibold text-gray-700 mb-2">Components</div>
        <table className="w-full text-sm mb-5">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium w-1/3"></th>
              <th className="text-left py-2 text-gray-600 font-semibold text-xs">Version 2 Qty</th>
              <th className="text-left py-2 text-gray-600 font-semibold text-xs">Version 1 Qty</th>
            </tr>
          </thead>
          <tbody>
            {(!bom.components || bom.components.length === 0) && (
              <tr><td colSpan={3} className="py-4 text-center text-gray-400 text-xs">No components</td></tr>
            )}
            {(bom.components || []).map((c) => {
              const old = oldCompMap[c.component_id]
              const changed = old && parseFloat(old.quantity) !== parseFloat(c.quantity)
              return (
                <tr key={c.component_id} className="border-b border-gray-50">
                  <td className="py-2 text-green-600">Component {c.component_id}</td>
                  <td className={`py-2 ${changed ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
                    {c.quantity} {c.unit_of_measure}
                  </td>
                  <td className={`py-2 ${changed ? 'text-red-500' : 'text-gray-400'}`}>
                    {old ? `${old.quantity} ${old.unit_of_measure}` : <span className="italic text-green-500 text-xs">new</span>}
                  </td>
                </tr>
              )
            })}
            {/* Show removed components (in snapshot but not in current) */}
            {snapComponents.filter((sc) => !(bom.components || []).find((c) => c.component_id === sc.component_id)).map((sc) => (
              <tr key={`removed-${sc.component_id}`} className="border-b border-gray-50">
                <td className="py-2 text-red-400 line-through">Component {sc.component_id}</td>
                <td className="py-2 text-red-400 italic text-xs">removed</td>
                <td className="py-2 text-gray-500">{sc.quantity} {sc.unit_of_measure}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-sm font-semibold text-gray-700 mb-2">Operations</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium w-1/3"></th>
              <th className="text-left py-2 text-gray-600 font-semibold text-xs">Version 2</th>
              <th className="text-left py-2 text-gray-600 font-semibold text-xs">Version 1</th>
            </tr>
          </thead>
          <tbody>
            {(!bom.operations || bom.operations.length === 0) && (
              <tr><td colSpan={3} className="py-4 text-center text-gray-400 text-xs">No operations</td></tr>
            )}
            {(bom.operations || []).sort((a, b) => a.sequence_order - b.sequence_order).map((op) => {
              const old = oldOpMap[op.operation_id]
              const changed = old && old.operation_time_mins !== op.operation_time_mins
              return (
                <tr key={op.operation_id} className="border-b border-gray-50">
                  <td className="py-2 text-green-600">{op.work_center}</td>
                  <td className={`py-2 ${changed ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
                    {op.operation_time_mins} mins
                  </td>
                  <td className={`py-2 ${changed ? 'text-red-500' : 'text-gray-400'}`}>
                    {old ? `${old.operation_time_mins} mins` : <span className="italic text-green-500 text-xs">new</span>}
                  </td>
                </tr>
              )
            })}
            {/* Show removed operations */}
            {snapOperations.filter((so) => !(bom.operations || []).find((op) => op.operation_id === so.operation_id)).map((so) => (
              <tr key={`removed-op-${so.operation_id}`} className="border-b border-gray-50">
                <td className="py-2 text-red-400 line-through">{so.work_center}</td>
                <td className="py-2 text-red-400 italic text-xs">removed</td>
                <td className="py-2 text-gray-500">{so.operation_time_mins} mins</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EcoDiffView({ ecoId, ecoType, targetBomId, snapshot }) {
  const [diff, setDiff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/ecos/${ecoId}/diff`)
      .then((res) => setDiff(res.data))
      .catch(() => setError('Could not load diff'))
      .finally(() => setLoading(false))
  }, [ecoId])

  if (loading) return <div className="text-gray-400 text-sm py-4">Loading changes...</div>
  if (error) return <div className="text-red-500 text-sm py-4">{error}</div>

  const isBom = ecoType === 'BoM'

  return (
    <div>
      {isBom
        ? <BomDiff bomId={targetBomId} snapshot={snapshot} />
        : diff.length === 0
          ? <div className="text-gray-400 text-sm py-4">No proposed changes to display.</div>
          : <ProductDiff diff={diff} />
      }
    </div>
  )
}
export default EcoDiffView;
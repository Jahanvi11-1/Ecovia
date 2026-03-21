import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function ApprovalRuleSettings() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  if (user?.role !== 'Admin') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-sm">
        Access Denied — Settings are only accessible to Admins.
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center px-3 py-2 border-b border-gray-200 bg-gray-50">
          <span className="flex-1 text-center text-sm font-semibold text-gray-700">Approvals</span>
        </div>
        <div className="p-5 text-sm text-gray-600 space-y-3">
          <p>
            Approval rules are configured per ECO Stage. Open a stage to add users and set their approval category.
          </p>
          <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
            <li><span className="font-medium text-orange-700">Required</span> — approval from this user is mandatory before the ECO can advance to the next stage or be marked as done.</li>
            <li><span className="font-medium text-gray-600">Optional</span> — approval is informational only and does not block stage progression.</li>
          </ul>
          <button
            onClick={() => navigate('/settings/stages')}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded transition"
          >
            Go to ECO Stages →
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { getHistory, deleteHistoryEntry } from '../services/api'
import { useAuth } from '../utils/AuthContext'

function HistoryPage() {
  const { isAuthenticated } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    getHistory()
      .then((res) => setEntries(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Could not load history.'))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const handleDelete = async (id) => {
    try {
      await deleteHistoryEntry(id)
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch {
      setError('Could not delete that entry.')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    } catch {
      return ''
    }
  }

  const getScoreColor = (score) => {
    if (score == null) return 'text-gray-500'
    if (score >= 70) return 'text-emerald-400'
    if (score >= 40) return 'text-amber-400'
    return 'text-red-400'
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-300 mb-2">Sign in to view history</h2>
        <p className="text-gray-500 text-sm">Log in to see your past scans and comparisons.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold">
          Scan <span className="text-gradient">History</span>
        </h1>
        <p className="text-gray-500 text-sm mt-2">Your previous analyses and comparisons.</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <svg className="animate-spin w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card rounded-xl p-4 border-red-500/30 bg-red-500/10">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">No scans yet</p>
          <p className="text-gray-600 text-sm mt-1">Analyze a product to see it here.</p>
        </div>
      )}

      {/* Entries */}
      <div className="space-y-3">
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className="glass-card-hover rounded-xl p-5 animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                {/* Kind icon */}
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${entry.kind === 'comparison' ? 'bg-purple-500/15' : 'bg-brand-500/15'}
                `}>
                  {entry.kind === 'comparison' ? (
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-200 capitalize">{entry.kind}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {entry.ingredients?.slice(0, 4).join(', ') || '—'}
                    {entry.ingredients?.length > 4 ? '…' : ''}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {entry.explanation?.health_score != null && (
                      <span className={`text-xs font-medium ${getScoreColor(entry.explanation.health_score)}`}>
                        Score: {entry.explanation.health_score}/100
                      </span>
                    )}
                    {entry.created_at && (
                      <span className="text-xs text-gray-600">{formatDate(entry.created_at)}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(entry.id)}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                           text-gray-600 hover:text-red-400 hover:bg-red-500/10
                           transition-all duration-200"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HistoryPage

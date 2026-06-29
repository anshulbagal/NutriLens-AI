function ComparisonTable({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-gray-500 text-sm">No comparison data available.</p>
      </div>
    )
  }

  const getBetterStyle = (better, side) => {
    if (better === side) return 'text-brand-400 font-semibold'
    if (better === 'tie') return 'text-gray-300'
    return 'text-gray-400'
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.03]">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Metric</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-cyan-400/80 uppercase tracking-wider">Product A</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-purple-400/80 uppercase tracking-wider">Product B</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Winner</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`
                border-b border-white/[0.04] transition-colors duration-200 hover:bg-white/[0.04]
                ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}
              `}
            >
              <td className="py-3 px-4 text-gray-300 font-medium">{row.metric}</td>
              <td className={`py-3 px-4 text-center ${getBetterStyle(row.better, 'A')}`}>
                {row.product_a}
                {row.better === 'A' && <span className="ml-1.5 text-brand-400">✓</span>}
              </td>
              <td className={`py-3 px-4 text-center ${getBetterStyle(row.better, 'B')}`}>
                {row.product_b}
                {row.better === 'B' && <span className="ml-1.5 text-brand-400">✓</span>}
              </td>
              <td className="py-3 px-4 text-center">
                {row.better === 'tie' ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">Tie</span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-brand-500/20 text-brand-400 font-medium">
                    {row.better}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ComparisonTable

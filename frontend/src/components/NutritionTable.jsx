const FIELD_LABELS = {
  calories: 'Calories',
  protein: 'Protein',
  total_fat: 'Total Fat',
  saturated_fat: 'Saturated Fat',
  trans_fat: 'Trans Fat',
  total_carbohydrate: 'Total Carbohydrate',
  added_sugar: 'Added Sugar',
  sugar: 'Sugar',
  fiber: 'Fiber',
  sodium: 'Sodium',
  cholesterol: 'Cholesterol',
}

const FIELD_ICONS = {
  calories: '🔥',
  protein: '💪',
  total_fat: '🫧',
  saturated_fat: '🧈',
  trans_fat: '⚠️',
  total_carbohydrate: '🍞',
  added_sugar: '🍬',
  sugar: '🧁',
  fiber: '🌾',
  sodium: '🧂',
  cholesterol: '❤️',
}

function NutritionTable({ nutrition }) {
  if (!nutrition || Object.keys(nutrition).length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-gray-500 text-sm">No nutrition data detected.</p>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nutrient</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(nutrition).map(([key, data], index) => (
            <tr
              key={key}
              className={`
                border-b border-white/[0.04] transition-colors duration-200 hover:bg-white/[0.04]
                ${index % 2 === 0 ? 'bg-white/[0.01]' : ''}
              `}
            >
              <td className="py-3 px-4 text-gray-300">
                <span className="mr-2">{FIELD_ICONS[key] || '•'}</span>
                {FIELD_LABELS[key] || key}
              </td>
              <td className="py-3 px-4 text-right">
                {data?.value != null ? (
                  <span className="font-semibold text-gray-100">
                    {data.value}
                    {data.unit && (
                      <span className="ml-1 text-xs font-normal text-gray-500">{data.unit}</span>
                    )}
                  </span>
                ) : (
                  <span className="text-gray-600">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default NutritionTable

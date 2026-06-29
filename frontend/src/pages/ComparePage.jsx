import { useState } from 'react'
import ImageUploader from '../components/ImageUploader'
import ComparisonTable from '../components/ComparisonTable'
import { compareProducts } from '../services/api'

function ComparePage() {
  const [fileA, setFileA] = useState(null)
  const [fileB, setFileB] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCompare = async () => {
    if (!fileA || !fileB) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await compareProducts(fileA, fileB)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong comparing these products.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3 animate-fade-in">
        <h1 className="text-3xl font-bold">
          Compare <span className="text-gradient">Two Products</span>
        </h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Upload two food labels side-by-side and get an AI-powered nutritional comparison with a clear recommendation.
        </p>
      </div>

      {/* Upload grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
        <div>
          <p className="text-xs font-semibold text-cyan-400/80 uppercase tracking-wider mb-2 ml-1">Product A</p>
          <ImageUploader onFileSelected={setFileA} label="Upload Product A label" />
        </div>
        <div>
          <p className="text-xs font-semibold text-purple-400/80 uppercase tracking-wider mb-2 ml-1">Product B</p>
          <ImageUploader onFileSelected={setFileB} label="Upload Product B label" />
        </div>
      </div>

      {/* Compare button */}
      <button
        onClick={handleCompare}
        disabled={!fileA || !fileB || loading}
        className="btn-gradient w-full py-3.5 text-base"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Comparing…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Compare Products
          </span>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="glass-card rounded-xl p-4 border-red-500/30 bg-red-500/10 animate-slide-up">
          <p className="text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-8 animate-slide-up">
          {/* Nutrition Comparison Table */}
          <section>
            <h2 className="section-title mb-4">
              <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Nutrition Comparison
            </h2>
            <ComparisonTable rows={result.comparison?.nutrition_comparison} />
          </section>

          {/* Ingredient Notes */}
          {result.comparison?.ingredient_comparison_notes && (
            <section className="animate-slide-up animation-delay-150">
              <h2 className="section-title mb-3">
                <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Ingredient Notes
              </h2>
              <div className="glass-card rounded-xl p-5">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {result.comparison.ingredient_comparison_notes}
                </p>
              </div>
            </section>
          )}

          {/* Recommendation */}
          {result.comparison?.recommendation && (
            <section className="animate-slide-up animation-delay-300">
              <div className="glass-card rounded-2xl p-6 gradient-border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-100 mb-2">Recommendation</h2>
                    <p className="text-sm text-gray-300 leading-relaxed">{result.comparison.recommendation}</p>
                    {result.comparison.recommendation_reasoning && (
                      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                        {result.comparison.recommendation_reasoning}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default ComparePage

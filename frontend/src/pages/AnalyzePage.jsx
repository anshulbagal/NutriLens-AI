import { useState } from 'react'
import ImageUploader from '../components/ImageUploader'
import NutritionTable from '../components/NutritionTable'
import HealthScoreBadge from '../components/HealthScoreBadge'
import ChatPanel from '../components/ChatPanel'
import { analyzeProduct } from '../services/api'

function AnalyzePage() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await analyzeProduct(file)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong analyzing this image.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      {/* Hero section */}
      <div className="text-center space-y-3 animate-fade-in">
        <h1 className="text-3xl font-bold">
          Analyze a <span className="text-gradient">Food Label</span>
        </h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Upload a photo of any food label and get instant AI-powered insights on ingredients, nutrition, and health impact.
        </p>
      </div>

      {/* Upload */}
      <div className="animate-slide-up">
        <ImageUploader onFileSelected={setFile} />
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!file || loading}
        className="btn-gradient w-full py-3.5 text-base"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Analyze Label
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
        <div className="space-y-8">
          {result.warning && (
            <div className="glass-card rounded-xl p-4 border-amber-500/30 bg-amber-500/10 animate-slide-up">
              <p className="text-amber-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
                {result.warning}
              </p>
            </div>
          )}

          {/* Ingredients */}
          <section className="animate-slide-up">
            <h2 className="section-title mb-3">
              <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Ingredients
            </h2>
            {result.ingredients?.length ? (
              <div className="glass-card rounded-xl p-4">
                <div className="flex flex-wrap gap-2">
                  {result.ingredients.map((ing, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-sm text-gray-300 border border-white/[0.06]">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-xl p-4">
                <p className="text-gray-500 text-sm">No ingredients detected.</p>
              </div>
            )}
          </section>

          {/* Nutrition */}
          <section className="animate-slide-up animation-delay-150">
            <h2 className="section-title mb-3">
              <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Nutrition Facts
            </h2>
            <NutritionTable nutrition={result.nutrition} />
          </section>

          {/* Allergens */}
          {result.allergen_mentions?.length > 0 && (
            <section className="animate-slide-up animation-delay-300">
              <h2 className="section-title mb-3">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
                Allergen Mentions
              </h2>
              <div className="glass-card rounded-xl p-4 border-amber-500/20">
                <div className="flex flex-wrap gap-2">
                  {result.allergen_mentions.map((a, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-sm text-amber-400 border border-amber-500/20">
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* AI Explanation */}
          {result.explanation && !result.explanation.raw_response && (
            <>
              {/* Health Score */}
              <section className="animate-slide-up">
                <HealthScoreBadge
                  score={result.explanation.health_score}
                  reasoning={result.explanation.health_score_reasoning}
                />
              </section>

              {/* AI Summary */}
              {result.explanation.summary && (
                <section className="animate-slide-up">
                  <h2 className="section-title mb-3">
                    <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                    AI Summary
                  </h2>
                  <div className="glass-card rounded-xl p-5">
                    <p className="text-sm text-gray-300 leading-relaxed">{result.explanation.summary}</p>
                  </div>
                </section>
              )}

              {/* Ingredient Breakdown */}
              {result.explanation.ingredient_explanations?.length > 0 && (
                <section className="animate-slide-up">
                  <h2 className="section-title mb-3">
                    <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    Ingredient Breakdown
                  </h2>
                  <div className="space-y-3">
                    {result.explanation.ingredient_explanations.map((item, i) => (
                      <div key={i} className="glass-card-hover rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-200">{item.ingredient}</span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            item.concern_level === 'high'
                              ? 'badge-high'
                              : item.concern_level === 'moderate'
                              ? 'badge-moderate'
                              : 'badge-low'
                          }`}>
                            {item.concern_level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">{item.explanation}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Explanation error fallback */}
          {result.explanation_error && (
            <div className="glass-card rounded-xl p-4 border-amber-500/20 bg-amber-500/5 animate-slide-up">
              <p className="text-amber-400 text-sm">
                ⚠️ AI explanation unavailable: {result.explanation_error}
              </p>
            </div>
          )}

          {/* Chat */}
          {result.ingredients?.length > 0 && <ChatPanel productContext={result} />}
        </div>
      )}
    </div>
  )
}

export default AnalyzePage

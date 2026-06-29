import { useState, useRef, useEffect } from 'react'
import { chatWithAI } from '../services/api'

function ChatPanel({ productContext }) {
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  const handleSend = async () => {
    if (!input.trim()) return
    const userTurn = { role: 'user', content: input }
    const newHistory = [...history, userTurn]
    setHistory(newHistory)
    setInput('')
    setLoading(true)
    try {
      const res = await chatWithAI(userTurn.content, history, productContext)
      setHistory([...newHistory, { role: 'assistant', content: res.data.reply }])
    } catch (err) {
      setHistory([
        ...newHistory,
        { role: 'assistant', content: 'Sorry, something went wrong answering that.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <section className="glass-card rounded-2xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-100">Ask about this product</h2>
          <p className="text-xs text-gray-500">AI-powered nutrition assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="max-h-72 overflow-y-auto p-4 space-y-3">
        {history.length === 0 && !loading && (
          <div className="text-center py-6">
            <p className="text-gray-600 text-sm">Ask any question about this product's ingredients, nutrition, or allergens.</p>
          </div>
        )}

        {history.map((turn, i) => (
          <div
            key={i}
            className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div
              className={`
                max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${turn.role === 'user'
                  ? 'bg-brand-gradient text-white rounded-br-md'
                  : 'bg-white/[0.06] text-gray-300 rounded-bl-md border border-white/[0.06]'
                }
              `}
            >
              {turn.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white/[0.06] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-white/[0.06] bg-white/[0.02]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Is this safe for someone with a peanut allergy?"
            className="input-glass flex-1 !py-2.5 text-sm !rounded-xl"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center
                       hover:shadow-glow-sm transition-all duration-300
                       disabled:opacity-40 disabled:hover:shadow-none"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default ChatPanel

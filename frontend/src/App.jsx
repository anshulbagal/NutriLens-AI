import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './utils/AuthContext'
import AnalyzePage from './pages/AnalyzePage'
import ComparePage from './pages/ComparePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HistoryPage from './pages/HistoryPage'

function Nav() {
  const { isAuthenticated, user, logout } = useAuth()

  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
      isActive
        ? 'text-brand-400 bg-brand-500/10'
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]'
    }`

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-slate-950/70 border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 mr-4 group">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow duration-300">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gradient">NutriLens AI</span>
        </NavLink>

        {/* Navigation links */}
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Analyze
            </span>
          </NavLink>
          <NavLink to="/compare" className={linkClass}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              Compare
            </span>
          </NavLink>
          <NavLink to="/history" className={linkClass}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </span>
          </NavLink>
        </div>

        {/* Auth section */}
        <div className="ml-auto flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04]">
                <div className="w-6 h-6 rounded-full bg-brand-gradient flex items-center justify-center text-[10px] font-bold text-white">
                  {user?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-xs text-gray-400 max-w-[140px] truncate">{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors duration-300 px-2 py-1"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-sm text-gray-400 hover:text-gray-200 transition-colors duration-300 px-3 py-1.5">
                Log in
              </NavLink>
              <NavLink to="/signup" className="text-sm font-medium text-white bg-brand-gradient rounded-lg px-4 py-1.5 hover:shadow-glow-sm transition-all duration-300">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Background glow effect */}
        <div className="bg-glow" />

        <div className="relative z-10 min-h-screen">
          <Nav />
          <main className="animate-fade-in">
            <Routes>
              <Route path="/" element={<AnalyzePage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

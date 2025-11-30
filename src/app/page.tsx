'use client'

import { useStore } from '@/store'
import { EndpointManager, DebateSetup, DebateArena } from '@/components'

export default function Home() {
  const { debateStatus, _hasHydrated } = useStore()
  const showDebate = debateStatus !== 'idle'

  // 等待 hydration 完成
  if (!_hasHydrated) {
    return (
      <main className="min-h-screen relative flex items-center justify-center">
        <div className="arena-bg" />
        <div className="text-center animate-pulse">
          <div className="font-display text-2xl text-[var(--accent-gold)] mb-2">
            AI DEBATE ARENA
          </div>
          <div className="text-[var(--text-secondary)] text-sm">
            加载中...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative">
      {/* Atmospheric background */}
      <div className="arena-bg" />

      {/* Header */}
      <header className="relative pt-12 pb-8 text-center">
        <div className="inline-block animate-fade-up">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-wider text-[var(--text-primary)]">
            AI <span className="text-[var(--accent-gold)]">DEBATE</span> ARENA
          </h1>
          <div className="mt-3 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--accent-gold-dim)]" />
            <p className="text-[var(--text-secondary)] text-sm tracking-widest uppercase">
              智能对决 · 观点交锋
            </p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--accent-gold-dim)]" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {showDebate ? (
          <DebateArena />
        ) : (
          <div className="space-y-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <EndpointManager />
            <DebateSetup />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 text-center bg-gradient-to-t from-[var(--bg-primary)] to-transparent">
        <p className="text-[var(--text-secondary)] text-xs tracking-wider">
          POWERED BY ARTIFICIAL INTELLIGENCE
        </p>
      </footer>
    </main>
  )
}

export default function AgentLoading() {
  return (
    <div className="flex h-screen w-full bg-[#08080b] text-white font-sans overflow-hidden">

      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* ── TOP HEADER SKELETON ── */}
        <header className="h-12 border-b border-white/[0.06] bg-[#08080b]/90 backdrop-blur-xl px-2.5 sm:px-4 flex items-center justify-between gap-2 shrink-0">
          {/* Left */}
          <div className="flex items-center gap-2">
            <div className="w-16 h-7 rounded-lg bg-white/[0.05] animate-pulse" />
            <div className="w-20 h-4 rounded bg-white/[0.05] animate-pulse" />
            <span className="text-neutral-800 hidden sm:inline">/</span>
            <div className="w-32 sm:w-48 h-7 rounded-lg bg-white/[0.04] animate-pulse" />
          </div>
          {/* Right */}
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-7 rounded-lg bg-white/[0.04] animate-pulse" />
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] animate-pulse hidden sm:block" />
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] animate-pulse hidden sm:block" />
            <div className="w-14 h-7 rounded-lg bg-red-600/20 border border-red-500/30 animate-pulse" />
          </div>
        </header>

        {/* ── CHAT AREA SKELETON ── */}
        <div className="flex-1 overflow-hidden relative">
          <div className="max-w-4xl w-full mx-auto px-4 sm:px-8 pt-8 pb-4 space-y-10">

            {/* Turn 1 */}
            <div className="space-y-4">
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="w-[55%] sm:w-[42%] h-11 rounded-2xl rounded-tr-sm bg-[#181113] border border-red-500/20 animate-pulse" />
              </div>

              {/* Activity trace */}
              <div className="space-y-2 max-w-sm">
                <div className="h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center px-3 gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-red-500/60 animate-ping shrink-0" />
                  <div className="flex-1 h-3 rounded bg-white/[0.08] animate-pulse" />
                </div>
                <div className="h-7 rounded-lg bg-white/[0.03] border border-white/[0.04] animate-pulse ml-1" />
                <div className="h-7 rounded-lg bg-white/[0.03] border border-white/[0.04] animate-pulse ml-1 w-4/5" />
              </div>

              {/* Agent response lines */}
              <div className="space-y-2.5 pt-1">
                <div className="h-3.5 rounded bg-white/[0.06] animate-pulse w-full" />
                <div className="h-3.5 rounded bg-white/[0.06] animate-pulse w-[90%]" />
                <div className="h-3.5 rounded bg-white/[0.06] animate-pulse w-[75%]" />
                <div className="h-3.5 rounded bg-white/[0.06] animate-pulse w-[82%]" />
              </div>

              {/* Agent action icons row */}
              <div className="flex items-center gap-2 pt-1">
                <div className="w-6 h-6 rounded-lg bg-white/[0.04] animate-pulse" />
                <div className="w-6 h-6 rounded-lg bg-white/[0.04] animate-pulse" />
                <div className="w-6 h-6 rounded-lg bg-white/[0.04] animate-pulse" />
              </div>
            </div>

            {/* Turn 2 — faded out to imply more content */}
            <div className="space-y-4 opacity-40">
              <div className="flex justify-end">
                <div className="w-[40%] sm:w-[30%] h-9 rounded-2xl rounded-tr-sm bg-[#181113] border border-red-500/20 animate-pulse" />
              </div>
              <div className="space-y-2.5">
                <div className="h-3.5 rounded bg-white/[0.05] animate-pulse w-full" />
                <div className="h-3.5 rounded bg-white/[0.05] animate-pulse w-[65%]" />
              </div>
            </div>
          </div>

          {/* Bottom fade overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#08080b] via-[#08080b]/70 to-transparent pointer-events-none" />
        </div>

        {/* ── FLOATING PROMPT BAR SKELETON ── */}
        <div className="shrink-0 px-4 sm:px-8 pb-4 pt-1 max-w-4xl w-full mx-auto">
          <div className="h-[52px] rounded-2xl bg-[#0f0f15] border border-white/[0.08] flex items-center px-4 gap-3 shadow-2xl">
            <div className="w-7 h-7 rounded-lg bg-white/[0.05] animate-pulse shrink-0" />
            <div className="flex-1 h-3 rounded bg-white/[0.05] animate-pulse max-w-[180px]" />
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-7 h-7 rounded-lg bg-white/[0.05] animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 animate-pulse" />
            </div>
          </div>
          {/* Capability pills */}
          <div className="flex items-center gap-2 mt-2 px-1">
            <div className="w-16 h-5 rounded-full bg-white/[0.04] animate-pulse" />
            <div className="w-20 h-5 rounded-full bg-white/[0.04] animate-pulse" />
            <div className="w-14 h-5 rounded-full bg-white/[0.04] animate-pulse" />
          </div>
        </div>

      </div>
    </div>
  );
}

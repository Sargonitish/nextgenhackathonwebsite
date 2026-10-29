import React from 'react';
import Link from 'next/link';
import { Terminal, Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#05070F] text-slate-100 flex flex-col items-center justify-center p-4 relative selection:bg-cyan-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-[#05070F] to-[#05070F] pointer-events-none" />

      <div className="relative max-w-lg w-full bg-[#0a0f1d]/90 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
          <Terminal className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-5xl font-extrabold font-mono text-cyan-400 tracking-wider">
            404
          </div>
          <h1 className="text-xl font-bold font-mono text-white">
            PAGE_NOT_FOUND // NODE_UNREACHABLE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-mono">
            The requested route or resource does not exist on this hackathon cluster node.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 font-mono text-xs text-slate-500 text-left">
          <code>&gt; ERROR_CODE: 0x7E4_ROUTING_FAULT</code>
          <br />
          <code>&gt; STATUS: NULL_PTR_EXCEPTION</code>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Home className="w-4 h-4" /> Return Home
          </Link>
          <Link
            href="/find-registration"
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs border border-slate-800 flex items-center justify-center gap-2 transition"
          >
            <Search className="w-4 h-4" /> Find Registration
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  FileCode2,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  BookOpen,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { EARS_SPECIFICATIONS } from '../../docs/ears-spec';

export const EarsSpecViewer: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredSpecs = EARS_SPECIFICATIONS.filter(spec => {
    const matchesModule = selectedModule === 'all' || spec.module === selectedModule;
    const matchesSearch =
      spec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec.earsSyntax.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec.statement.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModule && matchesSearch;
  });

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'Ubiquitous':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Event-driven':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'State-driven':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Unwanted Behaviour':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Optional Feature':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'Complex':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100 p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              EARS Formal Requirements Specification (Spec-Driven Architecture)
            </h2>
            <p className="text-xs text-slate-400">
              Easy Approach to Requirement Syntax (EARS) for Laundry Ecosystem: Customer App, Courier App, Admin Web Dashboard, and Backend State Machine.
            </p>
          </div>
        </div>

        {/* EARS Patterns Reference Guide */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 text-[11px]">
          <div className="p-2 bg-blue-950/40 rounded-xl border border-blue-500/30">
            <div className="font-bold text-blue-300">1. Ubiquitous</div>
            <div className="text-slate-400 font-mono text-[10px]">The system shall...</div>
          </div>
          <div className="p-2 bg-amber-950/40 rounded-xl border border-amber-500/30">
            <div className="font-bold text-amber-300">2. Event-Driven</div>
            <div className="text-slate-400 font-mono text-[10px]">WHEN trigger, the system...</div>
          </div>
          <div className="p-2 bg-purple-950/40 rounded-xl border border-purple-500/30">
            <div className="font-bold text-purple-300">3. State-Driven</div>
            <div className="text-slate-400 font-mono text-[10px]">WHILE state, the system...</div>
          </div>
          <div className="p-2 bg-rose-950/40 rounded-xl border border-rose-500/30">
            <div className="font-bold text-rose-300">4. Unwanted Behaviour</div>
            <div className="text-slate-400 font-mono text-[10px]">IF error, THEN the system...</div>
          </div>
          <div className="p-2 bg-cyan-950/40 rounded-xl border border-cyan-500/30">
            <div className="font-bold text-cyan-300">5. Optional Feature</div>
            <div className="text-slate-400 font-mono text-[10px]">WHERE feature, the system...</div>
          </div>
          <div className="p-2 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
            <div className="font-bold text-emerald-300">6. Complex</div>
            <div className="text-slate-400 font-mono text-[10px]">WHILE state, WHEN trigger...</div>
          </div>
        </div>
      </div>

      {/* State Machine Architecture Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <span>Laundry Order State Machine & Event Dispatch Architecture</span>
        </h3>

        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto space-y-2">
          <div className="flex items-center gap-2 text-slate-300 whitespace-nowrap">
            <span className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded border border-amber-500/30 font-bold">1. pending</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30 font-bold">2. picked_up</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30 font-bold">3. washing</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30 font-bold">4. done</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30 font-bold">5. delivering</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="bg-teal-500/20 text-teal-300 px-2 py-1 rounded border border-teal-500/30 font-bold">6. delivered</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans pt-2">
            Setiap transisi status memicu Cloud Function event broadcaster yang secara simultan meng-update Flutter Customer App, Flutter Courier App, dan Next.js Web Admin Dashboard.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari ID spesifikasi, kata kunci EARS..."
            className="w-full bg-transparent text-xs text-slate-100 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['all', 'Customer App', 'Courier App', 'Admin Web Dashboard', 'Cloud Backend & State Machine', 'Offline POS Store'].map(mod => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedModule === mod
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {mod === 'all' ? 'Semua Modul' : mod}
            </button>
          ))}
        </div>
      </div>

      {/* Requirements Cards */}
      <div className="space-y-4">
        {filteredSpecs.map(req => (
          <div
            key={req.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-xl space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {req.id}
                </span>
                <span className="text-xs font-bold text-slate-300">[{req.module}]</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(req.type)}`}>
                  {req.type}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED
                </span>
              </div>
            </div>

            {/* EARS Formal Syntax Statement */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-200 leading-relaxed">
              <span className="text-indigo-400 font-bold">EARS Pattern: </span>
              {req.earsSyntax}
            </div>

            {/* High level statement */}
            <p className="text-xs text-slate-300">{req.statement}</p>

            {/* Acceptance criteria */}
            <div className="space-y-1 text-xs border-t border-slate-800/80 pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Kriteria Keberterimaan (Acceptance Criteria):
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-300 text-[11px]">
                {req.acceptanceCriteria.map((ac, idx) => (
                  <li key={idx}>{ac}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

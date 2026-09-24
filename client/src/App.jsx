import React, { useEffect, useState } from 'react';
import { Cpu, Activity, CheckCircle2, ShieldCheck, Database, Radio } from 'lucide-react';
import axios from 'axios';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking backend...');
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${apiUrl}/health`);
        if (res.data?.status === 'ok') {
          setBackendStatus(res.data.message);
          setIsBackendHealthy(true);
        }
      } catch (err) {
        setBackendStatus('Backend offline or not reachable');
        setIsBackendHealthy(false);
      }
    };
    checkApi();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 select-none">
      <div className="max-w-2xl w-full bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header Tag */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            <span>[SOFTWARE-SIMULATED IoT PROTOTYPE]</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Phase 1 Foundation</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
              <Cpu className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">SmartStock is running</h1>
              <p className="text-sm text-slate-400">IoT-Based Store Stock Alert System</p>
            </div>
          </div>
        </div>

        {/* Prototype Notice */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/40 text-sm text-slate-300 space-y-1">
          <p className="font-medium text-slate-200">Prototype Disclaimer:</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            This project is a web-based IoT simulation prototype and does not use physical sensors.
            All telemetry is generated via the software simulation engine.
          </p>
        </div>

        {/* Foundation Status Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="block font-semibold text-slate-200">Frontend Core</span>
              <span className="text-slate-400">React + Vite + Tailwind CSS</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800">
            <Activity className={`w-5 h-5 shrink-0 ${isBackendHealthy ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div className="text-xs">
              <span className="block font-semibold text-slate-200">API Health Status</span>
              <span className={isBackendHealthy ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                {backendStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800">
            <Database className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="text-xs">
              <span className="block font-semibold text-slate-200">Database Layer</span>
              <span className="text-slate-400">Supabase PostgreSQL (9 Tables)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="text-xs">
              <span className="block font-semibold text-slate-200">Environment Security</span>
              <span className="text-slate-400">Isolated .env & zero-leak configs</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
          <span>Ready for Phase 2 implementation</span>
          <span>Node.js v20 / Vite v6</span>
        </div>
      </div>
    </div>
  );
}

export default App;

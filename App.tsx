
import React, { useState, useRef, useCallback } from 'react';
import { analyzeOrdnance } from './services/geminiService';
import { OrdnanceAnalysis, AppState } from './types';
import { 
  CameraIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  PhotoIcon,
  ShieldExclamationIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<OrdnanceAnalysis | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState(AppState.ANALYZING);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setImage(reader.result as string);
      try {
        const analysis = await analyzeOrdnance(base64);
        setResult(analysis);
        setState(AppState.RESULT);
      } catch (err: any) {
        setError(err.message || "An error occurred during analysis.");
        setState(AppState.ERROR);
      }
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setState(AppState.IDLE);
    setResult(null);
    setImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-600 rounded">
            <ShieldCheckIcon className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase italic">Sentinel Ordnance AI</h1>
            <p className="text-xs text-zinc-500 font-mono tracking-widest">UNIT: EOD-QUANTUM-7 // VERSION 3.0-PRO</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">System Link: Stable</span>
          </div>
        </div>
      </div>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Side: Visual Input */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square bg-black border-2 border-zinc-800 rounded-lg overflow-hidden relative flex items-center justify-center group">
            {image ? (
              <img src={image} alt="Target" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <PhotoIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-sm font-mono italic">Waiting for Visual Data Input...</p>
              </div>
            )}
            
            {state === AppState.ANALYZING && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-yellow-500 font-bold uppercase tracking-widest animate-pulse">Scanning Ordnance...</p>
                <p className="text-xs text-zinc-400 mt-2">Running Neural Classifiers</p>
              </div>
            )}
            
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-zinc-600"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-zinc-600"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-zinc-600"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-zinc-600"></div>
          </div>

          {state === AppState.IDLE && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-zinc-100 text-black font-black uppercase tracking-widest hover:bg-yellow-500 transition-colors flex items-center justify-center gap-3"
            >
              <CameraIcon className="w-5 h-5" />
              Initialize Scan
            </button>
          )}

          {state !== AppState.IDLE && (
            <button 
              onClick={reset}
              className="w-full py-4 border-2 border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest hover:bg-zinc-900 transition-colors flex items-center justify-center gap-3"
            >
              <ArrowPathIcon className="w-5 h-5" />
              New Objective
            </button>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>

        {/* Right Side: Results */}
        <div className="flex flex-col gap-6">
          {state === AppState.RESULT && result && (
            <div className="space-y-6">
              <div className={`p-6 border-l-8 ${result.isExplosive ? 'bg-red-950/20 border-red-600' : 'bg-green-950/20 border-green-600'} rounded`}>
                <div className="flex items-center gap-3 mb-2">
                  {result.isExplosive ? (
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                  ) : (
                    <ShieldCheckIcon className="w-8 h-8 text-green-500" />
                  )}
                  <h2 className="text-3xl font-black uppercase tracking-tighter">
                    {result.isExplosive ? 'Target: POSITIVE' : 'Target: CLEAR'}
                  </h2>
                </div>
                <p className="text-zinc-400 font-mono text-sm leading-relaxed">
                  {result.description}
                </p>
              </div>

              {result.isExplosive && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900 p-4 border border-zinc-800 rounded">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Threat Level</p>
                      <p className={`text-xl font-bold uppercase ${
                        result.threatLevel === 'Extreme' ? 'text-red-500' : 
                        result.threatLevel === 'High' ? 'text-orange-500' : 'text-yellow-500'
                      }`}>
                        {result.threatLevel}
                      </p>
                    </div>
                    <div className="bg-zinc-900 p-4 border border-zinc-800 rounded">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Type/Model</p>
                      <p className="text-xl font-bold text-zinc-200 truncate">{result.type}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                      <ClipboardDocumentCheckIcon className="w-4 h-4" />
                      <span className="text-xs uppercase font-bold tracking-widest">Identified Components</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.componentsIdentified.map((comp, idx) => (
                        <span key={idx} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700 rounded">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <ShieldExclamationIcon className="w-4 h-4" />
                      <span className="text-xs uppercase font-bold tracking-widest">Safety Protocols</span>
                    </div>
                    <ul className="space-y-2">
                      {result.safetyProtocols.map((protocol, idx) => (
                        <li key={idx} className="text-xs text-zinc-300 font-mono flex items-start gap-2">
                          <span className="text-red-500">>></span> {protocol}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {state === AppState.IDLE && (
            <div className="p-8 border-2 border-dashed border-zinc-800 rounded-lg text-center opacity-50">
              <p className="text-zinc-500 font-mono uppercase text-sm italic">
                Awaiting imagery for neural classification...
              </p>
            </div>
          )}

          {state === AppState.ERROR && (
            <div className="p-6 bg-red-900/10 border border-red-500/50 rounded">
              <h3 className="text-red-500 font-bold mb-2 uppercase text-sm">System Error</h3>
              <p className="text-zinc-400 text-sm font-mono">{error}</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="w-full max-w-4xl fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-between text-[10px] text-zinc-600 font-mono uppercase px-4 pointer-events-none">
        <div className="flex gap-4">
          <span>LAT: 45.4215 N</span>
          <span>LON: 75.6972 W</span>
        </div>
        <div className="flex gap-4">
          <span>ENC: AES-256</span>
          <span>SIG: SECURE</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function TrackPage() {
  const params = useParams();
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch("/api/track-info", {
          method: "POST",
          body: JSON.stringify({ trackingId: params.id }),
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (data.success) {
          setInfo(data.info);
        } else {
          setError(data.message || "Info not found");
        }
      } catch (err) {
        setError("Network Error");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchInfo();
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center font-mono">
      <div className="relative w-16 h-16 mb-6">
         <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-indigo-400 text-xs tracking-[0.3em] animate-pulse">ESTABLISHING UPLINK...</p>
    </div>
  );

  return (
    <main className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center p-4 font-sans text-neutral-200 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="z-10 w-full max-w-md">
        
        {/* HEADER */}
        <div className="text-center mb-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/50 border border-white/5 backdrop-blur-md mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Live Tracking Feed</span>
           </div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Mission Status</h1>
        </div>

        {/* === MAIN DASHBOARD CARD === */}
        <div className="bg-neutral-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {error ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-2xl">📡</span>
              </div>
              <p className="text-red-400 font-bold mb-2">SIGNAL LOST</p>
              <p className="text-neutral-500 text-sm">{error}</p>
            </div>
          ) : !info ? (
            <div className="p-10 text-center text-neutral-500">No Data found.</div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* STATUS INDICATOR SECTION */}
              <div className="p-8 pb-6 text-center border-b border-white/5 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
                
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 relative z-10">Target Status</p>
                
                {info.status === "Read" ? (
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-4 border border-red-500/20 shadow-[0_0_30px_-5px_rgba(239,68,68,0.4)]">
                            <span className="text-3xl">💀</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">Destroyed</h2>
                        <p className="text-red-400 text-xs font-mono">Connection Terminated</p>
                    </div>
                ) : (
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-4 border border-green-500/20 shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)] relative">
                            <div className="absolute inset-0 rounded-full border border-green-500/30 animate-ping"></div>
                            <span className="text-3xl">📡</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">Active & Waiting</h2>
                        <p className="text-green-400 text-xs font-mono">Monitoring Link Clicks...</p>
                    </div>
                )}
              </div>

              {/* DATA GRID */}
              <div className="p-6 bg-black/20">
                
                {info.status === "Read" ? (
                  <div className="space-y-3">
                    {/* Time Card */}
                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">⏰</div>
                        <div>
                          <p className="text-neutral-500 text-[10px] uppercase font-bold">Time of Death</p>
                          <p className="text-white text-xs font-mono">{new Date(info.readAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Device Card */}
                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">📱</div>
                        <div>
                          <p className="text-neutral-500 text-[10px] uppercase font-bold">Target Device</p>
                          <p className="text-blue-300 text-xs font-mono">{info.device || "Unknown"}</p>
                        </div>
                      </div>
                    </div>

                    {/* IP Card */}
                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">🌐</div>
                        <div>
                          <p className="text-neutral-500 text-[10px] uppercase font-bold">IP Address</p>
                          <p className="text-neutral-400 text-xs font-mono">{info.ip || "Hidden"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                     <div className="bg-neutral-900/50 rounded-xl p-6 border border-dashed border-neutral-800">
                        <p className="text-neutral-400 text-sm mb-2">No activity detected yet.</p>
                        <p className="text-neutral-600 text-xs">
                           Keep this page open. Status will NOT update automatically. 
                           <br/>
                           <button onClick={() => window.location.reload()} className="mt-3 text-indigo-400 hover:text-indigo-300 underline font-medium">
                              Refresh to check
                           </button>
                        </p>
                     </div>
                  </div>
                )}

              </div>
              
              {/* FOOTER ACTION */}
              <div className="p-4 border-t border-white/5 text-center bg-neutral-900/30">
                 <a href="/" className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors font-bold uppercase tracking-wider">
                   <span>+</span> New Operation
                 </a>
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}
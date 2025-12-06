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
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
      <p className="text-blue-500 font-mono text-sm tracking-widest animate-pulse">ESTABLISHING UPLINK...</p>
    </div>
  );

  return (
    <main className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-4 font-sans text-white">
      
      <div className="w-full max-w-md">
        
        <h1 className="text-2xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 uppercase tracking-widest">
          Mission Status
        </h1>

        <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-3xl p-1 shadow-2xl overflow-hidden">
          
          {error ? (
            <div className="p-8 text-center">
              <p className="text-red-500 font-bold mb-2">SIGNAL LOST</p>
              <p className="text-neutral-500 text-sm">{error}</p>
            </div>
          ) : !info ? (
            <div className="p-8 text-center text-neutral-500">No Data found.</div>
          ) : (
            <div className="animate-in slide-in-from-bottom-10 duration-500">
              
              {/* STATUS HEADER */}
              <div className={`p-8 text-center border-b border-neutral-800 ${info.status === "Read" ? "bg-red-500/10" : "bg-green-500/10"}`}>
                <p className="text-neutral-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Current Status</p>
                <div className={`text-3xl font-black uppercase tracking-tight ${info.status === "Read" ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"}`}>
                  {info.status === "Read" ? "Destroyed" : "Active"}
                </div>
              </div>

              {/* DATA GRID */}
              <div className="p-6 grid gap-4">
                
                {info.status === "Read" ? (
                  <>
                    <div className="bg-black/40 p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">⏰</span>
                        <div>
                          <p className="text-neutral-500 text-[10px] uppercase font-bold">Time of Death</p>
                          <p className="text-neutral-200 text-xs font-mono">{new Date(info.readAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/40 p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📱</span>
                        <div>
                          <p className="text-neutral-500 text-[10px] uppercase font-bold">Target Device</p>
                          <p className="text-blue-400 text-xs font-mono">{info.device || "Unknown"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/40 p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🌐</span>
                        <div>
                          <p className="text-neutral-500 text-[10px] uppercase font-bold">IP Address</p>
                          <p className="text-neutral-400 text-xs font-mono">{info.ip || "Hidden"}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                     <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-green-500 text-xl">📡</span>
                     </div>
                     <p className="text-neutral-400 text-sm">Waiting for target to open link...</p>
                     <p className="text-neutral-600 text-xs mt-2">This page will update automatically (Manual refresh required)</p>
                  </div>
                )}

              </div>
              
              <div className="p-4 bg-neutral-900 border-t border-neutral-800 text-center">
                 <a href="/" className="text-xs text-neutral-500 hover:text-white transition-colors uppercase font-bold tracking-wider">
                   Create New Operation
                 </a>
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}
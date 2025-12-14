"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function ViewNote() {
  const params = useParams();
  
  // States
  const [note, setNote] = useState<string | null>(null);
  const [contentType, setContentType] = useState<"text" | "image" | "audio">("text");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // UI States
  const [revealed, setRevealed] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [imageRevealed, setImageRevealed] = useState(false);

  const fetchNote = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/get-note", {
        method: "POST",
        body: JSON.stringify({ 
          noteId: params.id, 
          password: inputPassword 
        }),
      });
      const data = await response.json();

      if (data.success) {
        setNote(data.note);
        setContentType(data.type || "text");
        setRevealed(true);
        setIsPasswordRequired(false);
      } else {
        if (data.isPasswordRequired) {
          setIsPasswordRequired(true);
          if (inputPassword) setError("Incorrect Password");
        } else {
          setError(data.message);
        }
      }
    } catch (err) {
      setError("Connection Failed. Check internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center p-4 font-sans text-neutral-200 relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* Organic Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[20%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px] animate-pulse" style={{animationDuration: '8s'}} />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-fuchsia-900/10 rounded-full blur-[100px] animate-pulse" style={{animationDuration: '10s'}} />
      </div>

      <div className="z-10 w-full max-w-lg">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-900/50 backdrop-blur border border-white/5 rounded-2xl shadow-2xl mb-4 animate-in zoom-in">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Secure Transmission
          </h1>
          <p className="text-neutral-500 text-sm mt-1 font-medium">
            ID: <span className="font-mono text-neutral-400">{params.id?.toString().slice(0, 6)}...</span>
          </p>
        </div>

        {/* === MAIN CARD === */}
        <div className="bg-neutral-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-1 shadow-2xl overflow-hidden transition-all duration-300 relative">
          
          <div className="p-8 relative z-10">

            {/* 1. SCENARIO: ERROR */}
            {error && !isPasswordRequired && (
              <div className="text-center animate-in zoom-in">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Unavailable</h2>
                <p className="text-neutral-400 text-sm mb-6">{error}</p>
                <a href="/" className="inline-block w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-bold rounded-xl transition-all border border-white/5">
                  Create New Note
                </a>
              </div>
            )}

            {/* 2. SCENARIO: PASSWORD LOCKED */}
            {isPasswordRequired && !revealed && (
              <div className="text-center animate-in slide-in-from-bottom-4">
                 <h2 className="text-lg font-bold text-white mb-2">Password Protected</h2>
                 <p className="text-neutral-400 text-xs mb-6 uppercase tracking-widest">Sender has locked this note</p>
                 
                 <div className="relative group">
                   <input 
                     type="password" 
                     placeholder="Enter Password"
                     autoFocus
                     className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 text-center text-white rounded-xl p-4 outline-none transition-all placeholder:text-neutral-600"
                     value={inputPassword}
                     onChange={(e) => setInputPassword(e.target.value)}
                   />
                 </div>

                 {error && <p className="text-red-400 text-xs mt-3 bg-red-900/10 py-1 px-2 rounded border border-red-500/10 inline-block">{error}</p>}

                 <button onClick={fetchNote} disabled={loading} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                   {loading ? "Decrypting..." : "Unlock Note 🔓"}
                 </button>
              </div>
            )}

            {/* 3. SCENARIO: REVEALED CONTENT */}
            {revealed && (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Decrypted</span>
                  </div>
                  <span className="text-neutral-600 text-[10px] uppercase font-bold">Ephemeral Mode</span>
                </div>
                
                <div className="bg-[#050505] p-1 rounded-2xl border border-white/5 shadow-inner min-h-[100px] relative group">
                  
                  {/* --- DISPLAY LOGIC --- */}
                  <div className="p-4">
                  {/* CASE A: IMAGE */}
                  {contentType === "image" && (
                    <div 
                      className="relative cursor-pointer w-full overflow-hidden rounded-xl" 
                      onClick={() => setImageRevealed(!imageRevealed)}
                    >
                      <img 
                        src={note || ""} 
                        alt="Secret" 
                        className={`w-full h-auto transition-all duration-700 ${imageRevealed ? 'blur-0' : 'blur-xl grayscale opacity-50'}`}
                      />
                      {!imageRevealed && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                           <span className="text-4xl mb-3 drop-shadow-lg">👁️</span>
                           <span className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold border border-white/10 hover:bg-white/20 transition-all">Tap to Reveal</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CASE B: AUDIO */}
                  {contentType === "audio" && (
                     <div className="w-full py-6 flex flex-col items-center justify-center bg-neutral-900/50 rounded-xl border border-dashed border-neutral-800">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
                          🔊
                        </div>
                        <p className="text-center text-xs text-neutral-400 mb-4">Voice Note (Plays once)</p>
                        <audio controls autoPlay={false} className="w-full max-w-[250px]" src={note || ""} />
                     </div>
                  )}

                  {/* CASE C: TEXT */}
                  {contentType === "text" && (
                    <div className="w-full text-left whitespace-pre-wrap text-base font-mono text-neutral-300 leading-relaxed max-h-[60vh] overflow-y-auto selection:bg-green-500/30">
                      {note}
                    </div>
                  )}
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                  <p className="text-neutral-600 text-xs mb-4">
                    This link is now dead. The message has been erased.
                  </p>
                  <a 
                    href="/" 
                    className="block w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] active:scale-[0.98]"
                  >
                    Send your own Secret ⚡
                  </a>
                </div>
              </div>
            )}

            {/* 4. SCENARIO: INITIAL WARNING */}
            {!error && !revealed && !isPasswordRequired && (
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                   <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-75"></div>
                   <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                     <span className="text-4xl">💣</span>
                   </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">Self-Destruct Sequence</h2>
                <p className="text-neutral-400 mb-8 leading-relaxed text-sm px-4">
                  You are about to view a secured message.<br/>
                  <span className="text-red-400 font-medium">It will be permanently deleted after viewing.</span>
                </p>

                <div className="space-y-3">
                  <button
                    onClick={fetchNote}
                    disabled={loading}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                  >
                    {loading ? "Accessing..." : "View Message"}
                  </button>
                  <p className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">No Undo &bull; No Logs</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 🚨 PANIC BUTTON (Floating) */}
        <button
          onClick={() => window.location.href = "https://google.com"}
          className="fixed bottom-6 right-6 bg-[#E11D48] hover:bg-[#BE123C] text-white w-14 h-14 rounded-full shadow-[0_0_30px_-5px_rgba(225,29,72,0.6)] z-50 flex items-center justify-center border-4 border-[#0a0a0a] transition-transform hover:scale-110 group active:scale-95"
          title="Panic Button"
        >
          <span className="text-2xl group-hover:hidden">🚨</span>
          <span className="hidden group-hover:block text-[10px] font-bold">EXIT</span>
        </button>

      </div>
    </main>
  );
}
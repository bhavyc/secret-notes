"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function ViewNote() {
  const params = useParams();
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [inputPassword, setInputPassword] = useState("");

  const fetchNote = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/get-note", {
        method: "POST",
        body: JSON.stringify({ noteId: params.id, password: inputPassword }),
      });
      const data = await response.json();

      if (data.success) {
        setNote(data.note);
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
      setError("Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-4 font-sans text-white relative">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="z-10 w-full max-w-lg">
        
        {/* LOGO */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-neutral-800 to-neutral-700 rounded-2xl flex items-center justify-center shadow-2xl border border-neutral-700">
            <span className="text-3xl">🤫</span>
          </div>
        </div>

        {/* === CARD CONTAINER === */}
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
          
          {/* Top colored bar based on state */}
          <div className={`absolute top-0 left-0 w-full h-1 ${error ? "bg-red-500" : revealed ? "bg-green-500" : "bg-blue-500"}`} />

          {/* SCENARIO 1: ERROR */}
          {error && !isPasswordRequired && (
            <div className="text-center animate-in zoom-in">
              <div className="inline-flex bg-red-900/20 p-4 rounded-full mb-4 text-red-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
              <p className="text-neutral-400 mb-6">{error}</p>
              <a href="/" className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-all inline-block">Create New Note</a>
            </div>
          )}

          {/* SCENARIO 2: PASSWORD LOCKED */}
          {isPasswordRequired && !revealed && (
            <div className="text-center animate-in slide-in-from-bottom-4">
               <div className="inline-flex bg-blue-900/20 p-4 rounded-full mb-4 text-blue-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Restricted Access</h2>
              <p className="text-neutral-400 text-sm mb-6">Enter the passphrase to decrypt this note.</p>
              
              <input 
                type="password" 
                placeholder="••••••"
                autoFocus
                className="w-full bg-black/50 border border-neutral-700 focus:border-blue-500 text-center text-2xl tracking-[0.5em] text-white rounded-xl p-4 mb-2 outline-none transition-all placeholder:tracking-normal placeholder:text-neutral-700"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
              />
              {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

              <button onClick={fetchNote} disabled={loading} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20">
                {loading ? "Decrypting..." : "Unlock Vault"}
              </button>
            </div>
          )}

          {/* SCENARIO 3: REVEALED NOTE */}
          {revealed && (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-green-500 font-mono text-xs uppercase tracking-wider">Decrypted Successfully</span>
                </div>
                <span className="text-neutral-600 text-xs">ID: {params.id}</span>
              </div>
              
              <div className="bg-black p-6 rounded-xl border border-neutral-800 text-left whitespace-pre-wrap text-lg break-all shadow-inner font-mono text-neutral-300 leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar">
                {note}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-neutral-500 text-xs mb-4">
                  ⚠️ This message has been permanently deleted from the server.
                </p>
                <a href="/" className="text-white text-sm hover:underline hover:text-blue-400">Send another secret</a>
              </div>
            </div>
          )}

          {/* SCENARIO 4: INITIAL WARNING */}
          {!error && !revealed && !isPasswordRequired && (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span className="text-4xl">🔥</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Classified Information</h2>
              <p className="text-neutral-400 mb-8 leading-relaxed">
                You are about to view a self-destructing note.<br/>
                <span className="text-red-400 font-semibold">Once viewed, it will be lost forever.</span>
              </p>
              <button
                onClick={fetchNote}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-900/30 text-lg group"
              >
                {loading ? "Accessing Server..." : <span className="group-hover:tracking-widest transition-all duration-300">VIEW MESSAGE</span>}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* PANIC BUTTON */}
      <button
        onClick={() => window.location.href = "https://google.com"}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white w-14 h-14 rounded-full shadow-2xl z-50 flex items-center justify-center border-4 border-neutral-900 transition-transform hover:scale-110 group"
        title="Panic Button"
      >
        <span className="text-2xl group-hover:hidden">🚨</span>
        <span className="hidden group-hover:block text-[10px] font-bold">EXIT</span>
      </button>

    </main>
  );
}
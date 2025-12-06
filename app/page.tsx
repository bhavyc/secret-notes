"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function Home() {
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [expiryMode, setExpiryMode] = useState("burn");
  const [loading, setLoading] = useState(false);
  const [noteLink, setNoteLink] = useState("");
  const [trackingLink, setTrackingLink] = useState("");

  const createLink = async () => {
    if (!note) return;
    setLoading(true);
    setNoteLink("");
    setTrackingLink("");

    try {
      const response = await fetch("/api/save-note", {
        method: "POST",
        body: JSON.stringify({ text: note, expiryMode, password }),
      });
      const data = await response.json();
      if (data.success) {
        const origin = window.location.origin;
        setNoteLink(`${origin}/view/${data.noteId}`);
        setTrackingLink(`${origin}/track/${data.trackingId}`);
        setNote("");
        setPassword("");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard! 📋");
  };

  return (
    <main className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-neutral-200 selection:bg-purple-500/30">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2 bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent drop-shadow-lg">
            Secret Notes
          </h1>
          <p className="text-neutral-500 text-sm font-medium tracking-wide uppercase">
            Encrypted &bull; Anonymous &bull; Ephemeral
          </p>
        </div>

        {noteLink ? (
          // === SUCCESS STATE (RESULT) ===
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col items-center gap-6">
              
              {/* QR Code */}
              <div className="p-4 bg-white rounded-2xl shadow-lg shadow-white/5">
                <QRCodeSVG value={noteLink} size={160} />
              </div>

              {/* Note Link */}
              <div className="w-full">
                <label className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 block">Secret Link</label>
                <div className="flex gap-2">
                  <input readOnly value={noteLink} className="w-full bg-black/50 border border-green-900/50 rounded-lg px-4 py-3 text-sm text-green-100 font-mono focus:outline-none" />
                  <button onClick={() => copyToClipboard(noteLink)} className="bg-green-600 hover:bg-green-500 text-black px-4 rounded-lg font-bold transition-all">Copy</button>
                </div>
              </div>

              {/* Tracking Link */}
              <div className="w-full">
                <label className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2 block">Tracking Link (Private)</label>
                <div className="flex gap-2">
                  <input readOnly value={trackingLink} className="w-full bg-black/50 border border-yellow-900/50 rounded-lg px-4 py-3 text-sm text-yellow-100 font-mono focus:outline-none" />
                  <button onClick={() => copyToClipboard(trackingLink)} className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 rounded-lg font-bold transition-all">Copy</button>
                </div>
              </div>

              <button onClick={() => {setNoteLink(""); setTrackingLink("")}} className="text-neutral-500 hover:text-white text-sm mt-2 transition-colors">
                Create Another Note
              </button>
            </div>
          </div>
        ) : (
          // === CREATE STATE (FORM) ===
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-2 shadow-2xl">
            <textarea
              placeholder="Write your secret message here..."
              className="w-full h-48 bg-transparent text-white p-6 text-lg placeholder:text-neutral-600 focus:outline-none resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            
            {/* Options Toolbar */}
            <div className="bg-black/40 rounded-2xl p-4 border-t border-neutral-800 backdrop-blur-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                
                {/* Password Field */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-neutral-500 text-lg">🔒</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Password (Optional)"
                    className="w-full bg-neutral-800/50 border border-neutral-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full pl-10 p-3 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Expiry Dropdown */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-neutral-500 text-lg">⏱️</span>
                  </div>
                  <select
                    className="w-full bg-neutral-800/50 border border-neutral-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full pl-10 p-3 appearance-none transition-all cursor-pointer"
                    value={expiryMode}
                    onChange={(e) => setExpiryMode(e.target.value)}
                  >
                    <option value="burn">Burn on read</option>
                    <option value="1hour">1 Hour Expiry</option>
                    <option value="24hours">24 Hours Expiry</option>
                  </select>
                </div>
              </div>

              <button
                onClick={createLink}
                disabled={loading || !note}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Encrypting...
                  </span>
                ) : (
                  "Create Secret Link ⚡"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState, useRef, useEffect } from "react";
>>>>>>> c0fa3ac (new features)
import { QRCodeSVG } from "qrcode.react";

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<"text" | "image" | "audio">("text");
  const [password, setPassword] = useState("");
  const [expiryMode, setExpiryMode] = useState("burn");
  
  // Advanced Features
  const [allowedCountry, setAllowedCountry] = useState("Global");
  const [decoyPass, setDecoyPass] = useState("");
  const [decoyMsg, setDecoyMsg] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // New: Settings toggle

  const [loading, setLoading] = useState(false);
  const [noteLink, setNoteLink] = useState("");
  const [trackingLink, setTrackingLink] = useState("");
  
  // Rotating Placeholders Logic
  const placeholders = [
    "e.g., Netflix Password: hunter2",
    "e.g., Office WiFi: supersecret123",
    "e.g., Crypto Wallet Seed Phrase...",
    "e.g., I ate your sandwich... sorry!",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  // Audio Ref
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // --- LOGIC: AUDIO ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
           setContent(reader.result as string);
           setContentType("audio");
        };
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { alert("Microphone access needed for voice notes."); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // --- LOGIC: IMAGE ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 1024 * 1024 * 2) return alert("Image too large (Max 2MB)");
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(reader.result as string);
        setContentType("image");
      };
      reader.readAsDataURL(file);
    }
  };

  // --- LOGIC: CREATE LINK ---
  const createLink = async () => {
    if (!content) return;
    setLoading(true);
    try {
      const res = await fetch("/api/save-note", {
        method: "POST",
        body: JSON.stringify({ 
          text: content, 
          type: contentType,
          expiryMode, password,
          decoyPassword: decoyPass, 
          decoyMessage: decoyMsg,
          allowedCountry
        }),
      });
      const data = await res.json();
      if (data.success) {
        const origin = window.location.origin;
        setNoteLink(`${origin}/view/${data.noteId}`);
        setTrackingLink(`${origin}/track/${data.trackingId}`);
        setContent("");
      } else { alert(data.message); }
    } catch (e) { alert("Something went wrong."); } 
    finally { setLoading(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
<<<<<<< HEAD
    alert("Copied! 📋");
  };

  return (
    <main className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-neutral-200">
      
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
            Secret Notes
          </h1>
          <p className="text-neutral-400 text-sm font-medium tracking-wide">
            Share passwords & secrets securely. <br/>
            <span className="text-purple-400">Read once, gone forever.</span>
          </p>
        </div>

        {noteLink ? (
          // RESULT CARD
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in">
            <div className="flex flex-col items-center gap-6">
              
              {/* QR Code */}
              <div className="p-4 bg-white rounded-2xl shadow-lg shadow-white/5">
                <QRCodeSVG value={noteLink} size={160} />
              </div>

              {/* Secret Link (Green) */}
              <div className="w-full">
                <label className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 block">Secret Link</label>
                <div className="flex gap-2">
                  <input readOnly value={noteLink} className="w-full bg-black/50 border border-green-900/50 rounded-lg px-4 py-3 text-sm text-green-100 font-mono focus:outline-none" />
                  <button onClick={() => copyToClipboard(noteLink)} className="bg-green-600 hover:bg-green-500 text-black px-4 rounded-lg font-bold transition-all">Copy</button>
                </div>
              </div>

              {/* Tracking Link (Yellow) - JO MISSING THA */}
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
          // INPUT FORM
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-2 shadow-2xl">
            <textarea
              placeholder={placeholders[placeholderIndex]} 
              className="w-full h-48 bg-transparent text-white p-6 text-lg placeholder:text-neutral-600 focus:outline-none resize-none transition-all"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            
            <div className="bg-black/40 rounded-2xl p-4 border-t border-neutral-800 backdrop-blur-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-neutral-500 text-lg">🔒</span>
                  </div>
                  <input
                    type="text" placeholder="Password (Optional)"
                    className="w-full bg-neutral-800/50 border border-neutral-700 text-white text-sm rounded-xl pl-10 p-3 outline-none focus:border-purple-500 transition-all"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-neutral-500 text-lg">⏱️</span>
                  </div>
                  <select
                    className="w-full bg-neutral-800/50 border border-neutral-700 text-white text-sm rounded-xl pl-10 p-3 outline-none focus:border-purple-500 appearance-none cursor-pointer"
                    value={expiryMode} onChange={(e) => setExpiryMode(e.target.value)}
                  >
                    <option value="burn">Burn on read</option>
                    <option value="1hour">1 Hour Expiry</option>
                    <option value="24hours">24 Hours Expiry</option>
                  </select>
=======
    // You can add a toast here
  };

  return (
    <main className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center p-4 font-sans text-neutral-200 relative selection:bg-indigo-500/30">
      
      {/* Human Touch 1: Organic Background Glows (Softer) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px] animate-pulse" style={{animationDuration: '8s'}} />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-fuchsia-900/10 rounded-full blur-[100px] animate-pulse" style={{animationDuration: '10s'}} />
      </div>

      <div className="z-10 w-full max-w-lg">
        
        {/* Header - Cleaner Typography */}
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 mb-3 rounded-full bg-neutral-900/50 border border-neutral-800 text-[10px] uppercase tracking-widest font-bold text-neutral-500 backdrop-blur-md">
            Encrypted &bull; Anonymous &bull; Free
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Secret Notes
          </h1>
        </div>

        {noteLink ? (
           // === SUCCESS CARD ===
           <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
             <div className="flex flex-col items-center gap-6">
                <div className="p-3 bg-white rounded-2xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                   <QRCodeSVG value={noteLink} size={140} />
                </div>
                
                <div className="w-full space-y-4">
                  <div className="group">
                    <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider ml-1 mb-1 block">Secret Link</label>
                    <div className="flex gap-2 p-1.5 bg-black/40 border border-white/5 rounded-xl group-hover:border-indigo-500/50 transition-colors">
                      <input readOnly value={noteLink} className="w-full bg-transparent px-3 text-sm text-indigo-300 font-mono outline-none truncate"/>
                      <button onClick={() => copyToClipboard(noteLink)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">Copy</button>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider ml-1 mb-1 block">Tracking Link (Save this)</label>
                    <div className="flex gap-2 p-1.5 bg-black/40 border border-white/5 rounded-xl group-hover:border-amber-500/50 transition-colors">
                      <input readOnly value={trackingLink} className="w-full bg-transparent px-3 text-sm text-amber-200/80 font-mono outline-none truncate"/>
                      <button onClick={() => copyToClipboard(trackingLink)} className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">Copy</button>
                    </div>
                  </div>
                </div>

                <button onClick={() => window.location.reload()} className="text-neutral-500 hover:text-white text-sm transition-colors mt-2">
                  Send another secret
                </button>
             </div>
           </div>
        ) : (
          // === CREATE CARD ===
          <div className="bg-neutral-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all">
            
            {/* Human Touch 2: Stylish Tabs */}
            <div className="p-2 border-b border-white/5">
              <div className="flex bg-black/40 p-1 rounded-xl">
                 <button 
                    onClick={() => {setContentType("text"); setContent("")}} 
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${contentType==="text" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}
                 >
                   📝 Text
                 </button>
                 <label 
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all text-center cursor-pointer ${contentType==="image" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}
                 >
                   📸 Image
                   <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/>
                 </label>
                 <button 
                    onClick={isRecording ? stopRecording : startRecording} 
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${contentType==="audio" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}
                 >
                   {isRecording ? <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/> : "🎙"} Voice
                 </button>
              </div>
            </div>

            {/* CONTENT INPUT AREA */}
            <div className="p-1">
               {contentType === "text" && (
                 <textarea 
                    placeholder="What's the secret?" 
                    className="w-full h-40 bg-transparent text-white p-5 text-lg placeholder:text-neutral-600 outline-none resize-none" 
                    value={content} 
                    onChange={e=>setContent(e.target.value)} 
                    autoFocus
                 />
               )}
               {contentType === "image" && content && (
                 <div className="h-40 flex flex-col items-center justify-center bg-black/20 m-2 rounded-xl border border-white/5 border-dashed">
                    <img src={content} className="h-28 object-contain rounded-md shadow-lg"/>
                    <p className="text-xs text-neutral-500 mt-2">Image uploaded</p>
                 </div>
               )}
               {contentType === "audio" && (
                 <div className="h-40 flex flex-col items-center justify-center m-2 rounded-xl bg-gradient-to-br from-neutral-900 to-black border border-white/5 relative overflow-hidden">
                    {isRecording ? (
                        <>
                          <div className="absolute inset-0 bg-red-500/10 animate-pulse"/>
                          <div className="text-red-500 font-mono text-xl z-10">Recording...</div>
                          <div className="text-neutral-500 text-xs mt-2 z-10">Tap Voice tab to stop</div>
                        </>
                    ) : content ? (
                        <div className="text-green-400 font-medium flex items-center gap-2">
                           <span>Audio Ready</span>
                           <span className="w-2 h-2 bg-green-500 rounded-full"/>
                        </div>
                    ) : (
                        <div className="text-neutral-600 text-sm">Tap Voice tab to start</div>
                    )}
                 </div>
               )}
            </div>

            {/* Human Touch 3: Collapsible Settings (Clean UI) */}
            <div className="bg-[#0f0f0f] border-t border-white/5 p-4">
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                   <select 
                      className="bg-neutral-800 text-neutral-300 text-xs rounded-lg px-3 py-2 border border-white/5 outline-none focus:border-indigo-500/50"
                      value={expiryMode} 
                      onChange={(e) => setExpiryMode(e.target.value)}
                   >
                     <option value="burn"> Burn on read</option>
                     <option value="1hour"> 1 Hour</option>
                     <option value="24hours"> 1 Day</option>
                   </select>
>>>>>>> c0fa3ac (new features)
                </div>
                
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`text-xs flex items-center gap-1 transition-colors ${showSettings ? "text-indigo-400" : "text-neutral-500 hover:text-neutral-300"}`}
                >
                    {showSettings ? "Hide Options" : "More Options"}
                </button>
              </div>

<<<<<<< HEAD
              <button
                onClick={createLink} disabled={loading || !note}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/30 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Encrypting..." : "Create Secret Link ⚡"}
              </button>

              {/* TRUST BADGES */}
              <div className="flex justify-center gap-6 mt-6 text-xs text-neutral-500 font-medium">
                <span className="flex items-center gap-1">🛡️ No Logs</span>
                <span className="flex items-center gap-1">⚡ Free Forever</span>
              </div>

=======
              {/* Advanced Settings Drawer */}
              {showSettings && (
                 <div className="grid grid-cols-1 gap-3 mb-4 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="grid grid-cols-2 gap-3">
                       <input 
                          type="text" 
                          placeholder="Set Password" 
                          className="bg-black/30 text-white text-xs rounded-lg p-2.5 border border-white/5 outline-none focus:border-indigo-500/50" 
                          value={password} onChange={e=>setPassword(e.target.value)}
                       />
                       <select 
                          className="bg-black/30 text-white text-xs rounded-lg p-2.5 border border-white/5 outline-none focus:border-indigo-500/50"
                          value={allowedCountry} onChange={e=>setAllowedCountry(e.target.value)}
                       >
                         <option value="Global"> Global Access</option>
                         <option value="IN">🇮🇳 India Only</option>
                         <option value="US">🇺🇸 USA Only</option>
                       </select>
                    </div>
                    
                    <div className="p-3 bg-neutral-900/50 rounded-lg border border-white/5">
                       <p className="text-[10px] uppercase font-bold text-neutral-600 mb-2"> Decoy Mode (Fake Note)</p>
                       <div className="grid gap-2">
                          <input type="text" placeholder="Fake Password (e.g. 1234)" className="bg-black/30 text-white text-xs rounded p-2 border border-white/5 outline-none" value={decoyPass} onChange={e=>setDecoyPass(e.target.value)}/>
                          <input type="text" placeholder="Fake Message (e.g. Grocery List)" className="bg-black/30 text-white text-xs rounded p-2 border border-white/5 outline-none" value={decoyMsg} onChange={e=>setDecoyMsg(e.target.value)}/>
                       </div>
                    </div>
                 </div>
              )}

              <button 
                onClick={createLink} 
                disabled={loading || !content} 
                className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
              >
                {loading ? "Encrypting..." : "Create Secret Link "}
              </button>

>>>>>>> c0fa3ac (new features)
            </div>
          </div>
        )}
        
        {/* FOOTER LINK */}
        {/* <div className="text-center mt-8">
            <a href="https://github.com/TERA_USERNAME/secret-notes" target="_blank" className="text-neutral-600 text-xs hover:text-white transition-colors border-b border-neutral-800 pb-1">
                View Source Code on GitHub
            </a>
        </div> */}
      </div>
    </main>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PenLine, Type, Upload, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/api/config";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

const TABS = [
  { id: "draw",   label: "Draw",   icon: PenLine },
  { id: "type",   label: "Type",   icon: Type },
  { id: "upload", label: "Upload", icon: Upload },
];

function DrawPad({ onCapture }) {
  const canvasRef = useRef();
  const drawing = useRef(false);
  const [strokeWidth, setStrokeWidth] = useState(2.5);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDraw = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    if (e.cancelable) e.preventDefault();
  };

  const draw = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineCap = "round";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    if (e.cancelable) e.preventDefault();
  };

  const stopDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onCapture(canvasRef.current.toDataURL());
  };

  const clear = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onCapture(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stroke Size</label>
        <div className="flex items-center gap-2">
          <input 
            type="range" min="1" max="8" step="0.5" 
            value={strokeWidth} 
            onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
            className="w-24 accent-accent"
          />
          <span className="text-[10px] font-bold text-foreground w-6">{strokeWidth}</span>
        </div>
      </div>
      <canvas ref={canvasRef} width={420} height={160}
        className="w-full border border-input rounded-xl bg-white cursor-crosshair touch-none shadow-inner"
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
      <button onClick={clear} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
        <RefreshCw className="w-3 h-3" /> Clear Signature
      </button>
    </div>
  );
}

export default function ESignSign() {
  const { token } = useParams();
  const [tab, setTab] = useState("draw");
  const [typed, setTyped] = useState("");
  const [sigData, setSigData] = useState(null);
  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [docInfo, setDocInfo] = useState(null);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/esign/public/sign/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.already_signed) { setAlreadySigned(true); setSigned(true); }
        else if (d.message === "Invalid signing link") setTokenInvalid(true);
        else setDocInfo(d);
      })
      .catch(() => setTokenInvalid(true));
  }, [token]);

  const handleSubmit = async () => {
    if (!sigData && !typed.trim()) { toast.error("Please provide your signature."); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/esign/public/sign/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature_data: sigData || `typed:${typed}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");
      setSigned(true);
      toast.success("Document signed successfully!");
    } catch (err) {
      toast.error(err?.message || "Failed to submit signature.");
    } finally {
      setSubmitting(false);
    }
  };

  if (tokenInvalid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="bg-card ink-border rounded-2xl shadow-xl p-10 text-center max-w-sm">
          <p className="text-destructive font-bold text-lg mb-2">Invalid Link</p>
          <p className="text-muted-foreground text-sm">This signing link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-card ink-border rounded-2xl shadow-xl p-10 text-center max-w-sm">
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Document Signed!</h1>
          <p className="text-muted-foreground text-sm">Thank you. Your signature has been recorded. A confirmation has been sent via email.</p>
          <p className="mt-6 text-xs text-muted-foreground">Powered by <span className="font-bold text-foreground">DUGOSOFT</span></p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="h-14 border-b bg-card px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/3cd00a9ca_Gemini_Generated_Image_6abwj06abwj06abw-removebg-preview.png" alt="Dugosoft" className="h-7 w-7 object-contain" />
          <span className="font-black text-sm tracking-tight">DUGOSOFT</span>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-foreground truncate max-w-[200px]">{docInfo?.doc?.title || "Sign Document"}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Review & Sign</p>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Document Preview */}
        <div className="flex-1 bg-muted/50 p-4 md:p-8 pb-32 overflow-y-auto hidden md:block">
          <div className="max-w-4xl mx-auto bg-card shadow-2xl rounded-xl overflow-hidden min-h-[1200px] relative" id="doc-preview">
            {docInfo?.doc?.file_data ? (
              <>
                <iframe
                  src={`data:application/pdf;base64,${docInfo.doc.file_data}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="absolute inset-0 w-full h-full border-none pointer-events-none"
                  title="Document"
                />
                <div className="absolute inset-0">
                  {docInfo.doc.fields?.map(f => (
                    <div
                      key={f.id}
                      onClick={() => {
                        if (f.type === "signature") setTab("draw");
                        else if (f.type === "name") setTab("type");
                        // Scroll sidebar to field?
                      }}
                      style={{ 
                        left: `${f.x}px`, 
                        top: `${f.y}px`, 
                        width: `${f.w}px`, 
                        height: `${f.h}px`,
                        borderColor: f.type === "signature" ? "#3b82f6" : "#22c55e"
                      }}
                      className={`absolute border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-accent/5 ${sigData && f.type === "signature" ? "bg-white/80" : "bg-accent/5"}`}
                    >
                      {f.type === "signature" && sigData ? (
                        sigData.startsWith("typed:") ? (
                          <span className="text-xl italic font-serif text-foreground">{sigData.replace("typed:", "")}</span>
                        ) : (
                          <img src={sigData} alt="Sig" className="max-h-full max-w-full object-contain" />
                        )
                      ) : f.type === "name" && typed ? (
                        <span className="text-sm font-bold text-foreground">{typed}</span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-tighter text-accent/50">{f.type}</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground animate-pulse">
                Loading document preview...
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full md:w-[420px] bg-card border-l flex flex-col p-8 pb-32 pb-safe space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-foreground">Sign this document</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">Please review the document on the left and provide your signature below to complete the request.</p>
          </div>

          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 font-medium">
             Use a desktop browser to view the document full-screen while signing.
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-muted p-1 gap-1">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs font-bold transition-all ${tab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <Icon className="w-4 h-4" />{t.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 space-y-6">
            {tab === "draw" && (
              <div className="space-y-4">
                <DrawPad onCapture={setSigData} />
                {sigData && !sigData.startsWith("typed:") && (
                  <div className="p-3 bg-accent/5 rounded-xl border border-accent/10">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2">Captured Signature</p>
                    <img src={sigData} alt="Signature Preview" className="max-h-20 mx-auto" />
                  </div>
                )}
              </div>
            )}
            {tab === "type" && (
              <div className="space-y-3">
                <input value={typed} onChange={e => setTyped(e.target.value)} placeholder="Type your full name"
                  className="w-full h-14 rounded-xl border border-input bg-muted/20 px-4 text-xl italic font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  style={{ fontFamily: "Georgia, serif" }} />
                <p className="text-[10px] text-muted-foreground text-center">Your typed name serves as a legal digital signature.</p>
              </div>
            )}
            {tab === "upload" && (
              <div className="space-y-4">
                <input 
                  type="file" 
                  id="sig-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (re) => setSigData(re.target.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label 
                  htmlFor="sig-upload"
                  className="block border-2 border-dashed border-border rounded-2xl p-10 text-center text-sm text-muted-foreground cursor-pointer hover:border-accent/50 transition-colors bg-muted/10"
                >
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="font-medium text-foreground mb-1">Click to upload signature</p>
                  <p className="text-xs">PNG or JPG with transparent background preferred</p>
                </label>
                {sigData && !sigData.startsWith("typed:") && (
                  <div className="p-3 bg-accent/5 rounded-xl border border-accent/10">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2">Uploaded Signature</p>
                    <img src={sigData} alt="Uploaded Preview" className="max-h-20 mx-auto" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-6 border-t">
            <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-12 font-bold text-sm gap-2 shadow-lg shadow-accent/20">
              {submitting ? <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {submitting ? "Submitting..." : "Finish and Sign"}
            </Button>
            <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Secure E-Signature by Dugosoft</p>
          </div>
        </div>
      </main>
    </div>
  );
}
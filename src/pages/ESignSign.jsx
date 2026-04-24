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

  const startDraw = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const draw = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineCap = "round";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };
  const stopDraw = () => {
    drawing.current = false;
    onCapture(canvasRef.current.toDataURL());
  };
  const clear = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onCapture(null);
  };

  return (
    <div className="space-y-2">
      <canvas ref={canvasRef} width={420} height={160}
        className="w-full border border-input rounded-xl bg-white cursor-crosshair"
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} />
      <button onClick={clear} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
        <RefreshCw className="w-3 h-3" /> Clear
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
        <div className="flex-1 bg-muted/50 p-4 md:p-8 overflow-y-auto hidden md:block">
          <div className="max-w-4xl mx-auto bg-card shadow-2xl rounded-xl overflow-hidden min-h-[1000px] relative">
            {docInfo?.doc?.file_data ? (
              <iframe
                src={`data:application/pdf;base64,${docInfo.doc.file_data}#toolbar=0&navpanes=0&scrollbar=0`}
                className="absolute inset-0 w-full h-full border-none"
                title="Document"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground animate-pulse">
                Loading document preview...
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full md:w-[420px] bg-card border-l flex flex-col p-8 space-y-6 overflow-y-auto">
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
            {tab === "draw" && <DrawPad onCapture={setSigData} />}
            {tab === "type" && (
              <div className="space-y-3">
                <input value={typed} onChange={e => setTyped(e.target.value)} placeholder="Type your full name"
                  className="w-full h-14 rounded-xl border border-input bg-muted/20 px-4 text-xl italic font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  style={{ fontFamily: "Georgia, serif" }} />
                <p className="text-[10px] text-muted-foreground text-center">Your typed name serves as a legal digital signature.</p>
              </div>
            )}
            {tab === "upload" && (
              <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center text-sm text-muted-foreground cursor-pointer hover:border-accent/50 transition-colors bg-muted/10">
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="font-medium text-foreground mb-1">Click to upload signature</p>
                <p className="text-xs">PNG or JPG with transparent background preferred</p>
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
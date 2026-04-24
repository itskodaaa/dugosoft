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
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card ink-border rounded-2xl shadow-xl w-full max-w-lg p-8 space-y-6">
        <div className="text-center">
          <img src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/3cd00a9ca_Gemini_Generated_Image_6abwj06abwj06abw-removebg-preview.png" alt="Dugosoft" className="h-10 w-10 object-contain mx-auto mb-2" />
          <h1 className="text-xl font-extrabold text-foreground">Sign Document</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {docInfo?.doc?.title ? `Document: ${docInfo.doc.title}` : "You've been requested to sign a document via Dugosoft."}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-muted p-1 gap-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="w-3.5 h-3.5" />{t.label}
              </button>
            );
          })}
        </div>

        {tab === "draw" && <DrawPad onCapture={setSigData} />}
        {tab === "type" && (
          <div>
            <input value={typed} onChange={e => setTyped(e.target.value)} placeholder="Type your full name"
              className="w-full h-16 rounded-xl border border-input bg-white px-4 text-2xl italic font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              style={{ fontFamily: "Georgia, serif" }} />
          </div>
        )}
        {tab === "upload" && (
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-sm text-muted-foreground cursor-pointer hover:border-accent/50 transition-colors">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>Click to upload signature image (PNG/JPG)</p>
          </div>
        )}

        <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-11 font-bold gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {submitting ? "Submitting..." : "Submit Signature"}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">Secured by <span className="font-bold">DUGOSOFT</span> E-Signature</p>
      </motion.div>
    </div>
  );
}
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, PenLine, Type, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignaturePadModal({ onClose, onSave }) {
  const [tab, setTab] = useState("draw");
  const [typed, setTyped] = useState("");
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

  const stopDraw = () => { drawing.current = false; };

  const clear = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const save = () => {
    if (tab === "draw") {
      const data = canvasRef.current.toDataURL();
      onSave(data);
    } else {
      if (!typed.trim()) return;
      onSave(`typed:${typed}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card ink-border rounded-[32px] p-8 w-full max-w-xl z-10 shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-foreground">Provide Signature</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="flex bg-muted rounded-2xl p-1 gap-1">
          <button onClick={() => setTab("draw")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${tab === "draw" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <PenLine className="w-4 h-4" /> Draw
          </button>
          <button onClick={() => setTab("type")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${tab === "type" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <Type className="w-4 h-4" /> Type
          </button>
        </div>

        <div className="h-60 bg-muted/20 border-2 border-dashed border-border rounded-3xl overflow-hidden relative group">
          {tab === "draw" ? (
            <>
              <canvas ref={canvasRef} width={500} height={240} className="w-full h-full cursor-crosshair bg-white"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} />
              <button onClick={clear} className="absolute bottom-4 right-4 bg-white/80 backdrop-blur p-2 rounded-lg text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[10px] font-bold border shadow-sm">
                <RefreshCw className="w-3 h-3" /> CLEAR PAD
              </button>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 space-y-4">
              <input value={typed} onChange={e => setTyped(e.target.value)} placeholder="Type your full name"
                className="w-full bg-transparent text-4xl italic font-serif text-center text-foreground focus:outline-none placeholder:text-muted-foreground/30" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select a font style below</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl h-12 font-bold">Cancel</Button>
          <Button onClick={save} className="flex-[2] bg-accent hover:bg-accent/90 text-accent-foreground rounded-2xl h-12 font-bold gap-2 shadow-lg shadow-accent/20">
            <CheckCircle2 className="w-4 h-4" /> Use Signature
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Secure E-Signature Verification</p>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PenLine, Type, Calendar, Send, Save, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/api/config";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import SignerModal from "../components/esign/SignerModal";
import RemindersPanel from "../components/esign/RemindersPanel";
import SignaturePadModal from "../components/esign/SignaturePadModal";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const FIELD_TYPES = [
  { type: "signature", label: "Signature", icon: PenLine, color: "bg-blue-500" },
  { type: "name",      label: "Name",      icon: Type,    color: "bg-green-500" },
  { type: "date",      label: "Date",      icon: Calendar,color: "bg-purple-500" },
];

export default function ESignEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [fields, setFields] = useState([]);
  const [draggingField, setDraggingField] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showSignerModal, setShowSignerModal] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const previewRef = useRef();

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("auth_token");
    fetch(`${API_BASE}/api/esign/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setDoc(d); setFields(d.fields || []); });
  }, [id]);

  const addField = (type) => {
    setFields(f => [...f, { id: Date.now(), type, x: 80, y: 80 + f.length * 60, w: 160, h: 40 }]);
  };

  const removeField = (fid) => setFields(f => f.filter(x => x.id !== fid));

  const onMouseDown = (e, fid) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggingField(fid);
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const onMouseMove = (e) => {
    if (!draggingField || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    setFields(f => f.map(field => field.id === draggingField ? { ...field, x: Math.max(0, x), y: Math.max(0, y) } : field));
  };

  const onMouseUp = () => setDraggingField(null);

  const handleFieldClick = (e, field) => {
    e.stopPropagation();
    if (draggingField) return;
    setActiveField(field);
  };

  const updateFieldContent = (content) => {
    setFields(f => f.map(field => field.id === activeField.id ? { ...field, content } : field));
    setActiveField(null);
  };

  const generateSignedPDF = async () => {
    if (!doc?.file_data) return;
    try {
      const existingPdfBytes = Uint8Array.from(atob(doc.file_data), c => c.charCodeAt(0));
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      
      const previewWidth = previewRef.current.offsetWidth;
      const previewHeight = previewRef.current.offsetHeight;
      const scaleX = width / previewWidth;
      const scaleY = height / previewHeight;

      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

      for (const field of fields) {
        if (!field.content) continue;

        // PDF coordinates start from bottom-left
        const x = field.x * scaleX;
        const y = height - (field.y * scaleY) - (field.h * scaleY);

        if (field.type === "signature" && field.content.startsWith("data:")) {
          const imgData = field.content.split(",")[1];
          const imgBytes = Uint8Array.from(atob(imgData), c => c.charCodeAt(0));
          const image = await pdfDoc.embedPng(imgBytes);
          firstPage.drawImage(image, {
            x, y,
            width: field.w * scaleX,
            height: field.h * scaleY,
          });
        } else {
          const text = field.content.replace("typed:", "");
          firstPage.drawText(text, {
            x: x + (5 * scaleX),
            y: y + (field.h * scaleY / 4),
            size: 12 * scaleY,
            font: field.type === "signature" ? italicFont : font,
            color: rgb(0, 0, 0),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Signed_${doc.title || "Document"}.pdf`;
      link.click();
      toast.success("PDF generated and downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF.");
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${API_BASE}/api/esign/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fields }),
    });
    
    if (res.ok) {
      toast.success("Fields saved to cloud!");
      await generateSignedPDF();
    } else {
      toast.error("Failed to save fields.");
    }
  };

  const FIELD_COLORS = { signature: "#3b82f6", name: "#22c55e", date: "#a855f7" };

  return (
    <div className="max-w-6xl space-y-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{doc?.title || "Document Editor"}</h1>
          <p className="text-muted-foreground text-sm">Drag signature fields onto the document preview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} className="rounded-xl gap-2">
            <Save className="w-4 h-4" /> Save
          </Button>
          <Button onClick={() => setShowSignerModal(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2">
            <Send className="w-4 h-4" /> Request Signatures
          </Button>
        </div>
      </motion.div>

      <div className="flex gap-4 flex-wrap lg:flex-nowrap">
        {/* Toolbar */}
        <div className="w-full lg:w-52 shrink-0 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Add Fields</p>
          {FIELD_TYPES.map(ft => {
            const Icon = ft.icon;
            return (
              <button key={ft.type} onClick={() => addField(ft.type)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-card ink-border rounded-xl hover:bg-muted/40 transition-colors text-sm font-semibold text-foreground">
                <div className={`w-7 h-7 rounded-lg ${ft.color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                {ft.label}
                <Plus className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
              </button>
            );
          })}
          {fields.length > 0 && (
            <div className="mt-4 space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Placed Fields</p>
              {fields.map(f => (
                <div key={f.id} className="flex items-center justify-between px-3 py-2 bg-muted/40 rounded-lg text-xs">
                  <span className="font-medium capitalize">{f.type}</span>
                  <button onClick={() => removeField(f.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document preview canvas */}
        <div className="flex-1 bg-card ink-border rounded-2xl overflow-hidden">
          <div
            ref={previewRef}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            className="relative bg-white min-h-[700px] select-none cursor-crosshair"
            style={{ userSelect: "none" }}
          >
            {/* Document Content */}
            {doc?.file_data ? (
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                <iframe
                  src={`data:application/pdf;base64,${doc.file_data}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full border-none pointer-events-none"
                  title="Document Preview"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col p-10 gap-3 pointer-events-none opacity-20">
                <div className="h-3 bg-gray-300 rounded w-1/2" />
                <div className="h-2 bg-gray-200 rounded w-3/4 mt-4" />
                <div className="h-2 bg-gray-200 rounded w-full" />
                <div className="h-2 bg-gray-200 rounded w-5/6" />
                <div className="h-2 bg-gray-200 rounded w-full mt-4" />
                <div className="h-2 bg-gray-200 rounded w-2/3" />
                <div className="h-2 bg-gray-200 rounded w-full" />
                <div className="h-2 bg-gray-200 rounded w-4/5 mt-6" />
                <div className="h-2 bg-gray-200 rounded w-full" />
                <div className="h-2 bg-gray-200 rounded w-3/4" />
              </div>
            )}

            {/* Signature fields */}
            {fields.map(f => (
              <div
                key={f.id}
                onMouseDown={e => onMouseDown(e, f.id)}
                onClick={e => handleFieldClick(e, f)}
                style={{ left: f.x, top: f.y, width: f.w, height: f.h, borderColor: FIELD_COLORS[f.type] }}
                className={`absolute border-2 border-dashed rounded-lg flex items-center justify-center cursor-move group transition-colors ${f.content ? "bg-white/50 backdrop-blur-[2px]" : "bg-white/10"}`}
              >
                {f.content ? (
                  f.type === "signature" ? (
                    f.content.startsWith("data:") ? (
                      <img src={f.content} className="max-w-full max-h-full object-contain pointer-events-none" alt="Signature" />
                    ) : (
                      <span className="text-xl italic font-serif pointer-events-none">{f.content.replace("typed:", "")}</span>
                    )
                  ) : (
                    <span className="text-sm font-bold text-foreground pointer-events-none">{f.content}</span>
                  )
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: FIELD_COLORS[f.type] }}>{f.type}</span>
                )}
                
                <button
                  onMouseDown={e => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); removeField(f.id); }}
                  className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {doc?.status === "pending" && (
        <RemindersPanel docId={id} docTitle={doc?.title} />
      )}

      {showSignerModal && (
        <SignerModal
          docId={id}
          docTitle={doc?.title}
          onClose={() => setShowSignerModal(false)}
          onSent={() => { setShowSignerModal(false); navigate("/dashboard/esign"); }}
        />
      )}

      {activeField?.type === "signature" && (
        <SignaturePadModal onClose={() => setActiveField(null)} onSave={updateFieldContent} />
      )}

      {activeField?.type === "name" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setActiveField(null)} />
          <div className="relative bg-card ink-border rounded-2xl p-6 w-full max-w-xs z-10 shadow-2xl">
            <h3 className="font-bold mb-4">Enter Full Name</h3>
            <input autoFocus className="w-full h-10 px-3 rounded-lg border bg-background mb-4" 
              onKeyDown={e => e.key === "Enter" && updateFieldContent(e.target.value)}
              onBlur={e => updateFieldContent(e.target.value)}
            />
            <Button onClick={() => setActiveField(null)} className="w-full">Cancel</Button>
          </div>
        </div>
      )}

      {activeField?.type === "date" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setActiveField(null)} />
          <div className="relative bg-card ink-border rounded-2xl p-6 w-full max-w-xs z-10 shadow-2xl">
            <h3 className="font-bold mb-4">Set Date</h3>
            <input type="date" autoFocus className="w-full h-10 px-3 rounded-lg border bg-background mb-4" 
              defaultValue={new Date().toISOString().split("T")[0]}
              onBlur={e => updateFieldContent(e.target.value)}
            />
            <Button onClick={() => setActiveField(null)} className="w-full">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
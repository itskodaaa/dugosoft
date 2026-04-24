import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PenLine, Type, Calendar, Send, Save, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/api/config";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import SignerModal from "../components/esign/SignerModal";
import RemindersPanel from "../components/esign/RemindersPanel";

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

  const handleSave = async () => {
    const token = localStorage.getItem("auth_token");
    await fetch(`${API_BASE}/api/esign/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fields }),
    });
    toast.success("Fields saved!");
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
            {/* Placeholder document */}
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

            {/* Signature fields */}
            {fields.map(f => (
              <div
                key={f.id}
                onMouseDown={e => onMouseDown(e, f.id)}
                style={{ left: f.x, top: f.y, width: f.w, height: f.h, borderColor: FIELD_COLORS[f.type] }}
                className="absolute border-2 border-dashed rounded-lg flex items-center justify-center cursor-move group"
              >
                <span className="text-xs font-bold capitalize" style={{ color: FIELD_COLORS[f.type] }}>{f.type}</span>
                <button
                  onMouseDown={e => e.stopPropagation()}
                  onClick={() => removeField(f.id)}
                  className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
    </div>
  );
}
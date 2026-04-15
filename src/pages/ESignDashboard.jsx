import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSignature, Plus, Clock, CheckCircle2, AlertCircle,
  Eye, Send, Trash2, Upload, LayoutTemplate, Users, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import BulkSendModal from "../components/esign/BulkSendModal";
import TemplatesModal from "../components/esign/TemplatesModal";
import RemindersPanel from "../components/esign/RemindersPanel";

const STATUS_CFG = {
  draft:   { label: "Draft",   cls: "bg-muted text-muted-foreground",   icon: Clock },
  pending: { label: "Pending", cls: "bg-blue-100 text-blue-700",         icon: Clock },
  signed:  { label: "Signed",  cls: "bg-green-100 text-green-700",       icon: CheckCircle2 },
  expired: { label: "Expired", cls: "bg-red-100 text-red-700",           icon: AlertCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

export default function ESignDashboard() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkDoc, setBulkDoc] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const navigate = useNavigate();

  const loadDocs = () => {
    setLoading(true);
    base44.entities.ESignDocument.list("-created_date", 50)
      .then(setDocs)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDocs(); }, []);

  const handleDelete = async (id) => {
    await base44.entities.ESignDocument.delete(id);
    setDocs(p => p.filter(d => d.id !== id));
    toast.success("Document deleted.");
  };

  const pendingDocs = docs.filter(d => d.status === "pending");

  return (
    <div className="max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1 flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-accent" /> E-Signature
          </h1>
          <p className="text-muted-foreground text-sm">Upload, send, and track documents for digital signing.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowTemplates(true)} className="rounded-xl gap-2">
            <LayoutTemplate className="w-4 h-4" /> Templates
          </Button>
          <Link to="/dashboard/esign/upload">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2">
              <Plus className="w-4 h-4" /> New Document
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",   value: docs.length,                                   color: "text-foreground" },
          { label: "Pending", value: docs.filter(d => d.status === "pending").length, color: "text-blue-600" },
          { label: "Signed",  value: docs.filter(d => d.status === "signed").length,  color: "text-green-600" },
          { label: "Draft",   value: docs.filter(d => d.status === "draft").length,   color: "text-muted-foreground" },
        ].map(s => (
          <div key={s.label} className="bg-card ink-border rounded-2xl p-4 text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending reminders nudge */}
      {pendingDocs.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
          <Bell className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-amber-800 font-medium flex-1">
            {pendingDocs.length} document{pendingDocs.length > 1 ? "s are" : " is"} awaiting signatures.
          </p>
          <button onClick={() => setExpandedDoc(expandedDoc ? null : pendingDocs[0])}
            className="text-xs font-bold text-amber-700 hover:underline">
            View Signers
          </button>
        </div>
      )}

      {/* Expanded reminders panel */}
      <AnimatePresence>
        {expandedDoc && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <RemindersPanel docId={expandedDoc.id} docTitle={expandedDoc.title} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan notice */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Free Plan:</span> 3 documents/month · Dugosoft watermark.{" "}
        <Link to="/dashboard/pricing" className="text-accent font-semibold hover:underline">Upgrade →</Link>
      </div>

      {/* Document list */}
      <div className="bg-card ink-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading...</div>
        ) : docs.length === 0 ? (
          <div className="p-16 text-center">
            <FileSignature className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-semibold text-foreground mb-1">No documents yet</p>
            <p className="text-sm text-muted-foreground mb-4">Start from a template or upload your own document.</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button size="sm" variant="outline" onClick={() => setShowTemplates(true)} className="rounded-xl gap-2">
                <LayoutTemplate className="w-3.5 h-3.5" /> Use Template
              </Button>
              <Link to="/dashboard/esign/upload">
                <Button size="sm" className="bg-accent text-accent-foreground rounded-xl gap-2">
                  <Upload className="w-3.5 h-3.5" /> Upload Document
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {docs.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <FileSignature className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(doc.created_date).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={doc.status} />
                <div className="flex items-center gap-1">
                  <Link to={`/dashboard/esign/editor/${doc.id}`}>
                    <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors" title="View / Edit">
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </Link>
                  <button onClick={() => setBulkDoc(doc)}
                    className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors" title="Bulk Send">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  {doc.status === "pending" && (
                    <button
                      onClick={() => setExpandedDoc(expandedDoc?.id === doc.id ? null : doc)}
                      className="w-8 h-8 rounded-lg hover:bg-amber-50 flex items-center justify-center transition-colors" title="Reminders">
                      <Bell className={`w-3.5 h-3.5 ${expandedDoc?.id === doc.id ? "text-amber-500" : "text-muted-foreground"}`} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(doc.id)}
                    className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showTemplates && <TemplatesModal onClose={() => setShowTemplates(false)} />}
        {bulkDoc && (
          <BulkSendModal
            doc={bulkDoc}
            onClose={() => setBulkDoc(null)}
            onSent={() => { setBulkDoc(null); loadDocs(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
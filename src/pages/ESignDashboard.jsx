import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileSignature, Plus, Clock, CheckCircle2, AlertCircle, Eye, Send, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const STATUS_CFG = {
  draft:   { label: "Draft",   cls: "bg-muted text-muted-foreground",      icon: Clock },
  pending: { label: "Pending", cls: "bg-blue-100 text-blue-700",            icon: Clock },
  signed:  { label: "Signed",  cls: "bg-green-100 text-green-700",          icon: CheckCircle2 },
  expired: { label: "Expired", cls: "bg-red-100 text-red-700",              icon: AlertCircle },
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
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.ESignDocument.list("-created_date", 50)
      .then(setDocs)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await base44.entities.ESignDocument.delete(id);
    setDocs(p => p.filter(d => d.id !== id));
    toast.success("Document deleted.");
  };

  return (
    <div className="max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1 flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-accent" /> E-Signature
          </h1>
          <p className="text-muted-foreground text-sm">Upload, send, and track documents for digital signing.</p>
        </div>
        <Link to="/dashboard/esign/upload">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2">
            <Plus className="w-4 h-4" /> New Document
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: docs.length, color: "text-foreground" },
          { label: "Pending", value: docs.filter(d => d.status === "pending").length, color: "text-blue-600" },
          { label: "Signed", value: docs.filter(d => d.status === "signed").length, color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="bg-card ink-border rounded-2xl p-4 text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Plan notice */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Free Plan:</span> 3 documents/month · 1 signer per document · Dugosoft watermark.{" "}
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
            <p className="text-sm text-muted-foreground mb-4">Upload your first document to get started.</p>
            <Link to="/dashboard/esign/upload">
              <Button size="sm" className="bg-accent text-accent-foreground rounded-xl gap-2">
                <Upload className="w-3.5 h-3.5" /> Upload Document
              </Button>
            </Link>
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
                  <button onClick={() => { toast.success("Signing request sent!"); }} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors" title="Send">
                    <Send className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
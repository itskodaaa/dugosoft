import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Share2, Trash2, Eye, FileText, File, Table, FileCode, Clock, CheckCircle2, AlertCircle, SlidersHorizontal, Mail, X, Folder, FolderPlus, ChevronRight, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DocumentPreviewModal from "../components/documents/DocumentPreviewModal";

const TYPE_ICONS = { PDF: FileText, DOCX: File, TXT: FileCode, XLSX: Table };
const TYPE_COLORS = { PDF: "#f97316", DOCX: "#4f8ef7", TXT: "#10b981", XLSX: "#8b5cf6" };

const INITIAL_FOLDERS = [
  { id: "resumes", name: "Resumes", color: "text-accent" },
  { id: "contracts", name: "Contracts", color: "text-orange-500" },
  { id: "reports", name: "Reports", color: "text-purple-500" },
];

const INITIAL_DOCS = [
  { id: 1, name: "Senior_Dev_Resume_2026.pdf", type: "PDF", size: "245 KB", date: "2026-03-31", category: "Resume", status: "ready", folder: "resumes" },
  { id: 2, name: "Marketing_Contract_FR.docx", type: "DOCX", size: "188 KB", date: "2026-03-29", category: "Translation", status: "ready", folder: "contracts" },
  { id: 3, name: "Q1_Financial_Report.xlsx", type: "XLSX", size: "1.2 MB", date: "2026-03-27", category: "Conversion", status: "ready", folder: "reports" },
  { id: 4, name: "Cover_Letter_Google.pdf", type: "PDF", size: "92 KB", date: "2026-03-25", category: "Resume", status: "ready", folder: "resumes" },
  { id: 5, name: "Invoice_March2026.txt", type: "TXT", size: "14 KB", date: "2026-03-22", category: "OCR", status: "ready", folder: null },
  { id: 6, name: "Portfolio_Design.pdf", type: "PDF", size: "4.8 MB", date: "2026-03-20", category: "Conversion", status: "processing", folder: null },
  { id: 7, name: "Employee_Handbook.docx", type: "DOCX", size: "522 KB", date: "2026-03-18", category: "Translation", status: "error", folder: null },
  { id: 8, name: "Resume_Entry_Level.pdf", type: "PDF", size: "178 KB", date: "2026-03-15", category: "Resume", status: "ready", folder: "resumes" },
];

const CATEGORIES = ["All", "Resume", "Translation", "Conversion", "OCR"];

function StatusBadge({ status }) {
  const cfg = {
    ready: { label: "Ready", icon: CheckCircle2, cls: "bg-green-100 text-green-700" },
    processing: { label: "Processing", icon: Clock, cls: "bg-blue-100 text-blue-700" },
    error: { label: "Error", icon: AlertCircle, cls: "bg-red-100 text-red-700" },
  };
  const { label, icon: Icon, cls } = cfg[status] || cfg.ready;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      <Icon className="w-3 h-3" />{label}
    </span>
  );
}

function EmailModal({ doc, onClose }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(`[Dugosoft] ${doc.name}`);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const send = async () => {
    if (!to) { toast.error("Please enter a recipient email."); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1400));
    setSending(false);
    toast.success(`Document sent to ${to}`);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card ink-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Mail className="w-5 h-5 text-accent" /><h2 className="font-bold text-foreground">Send Document</h2></div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="bg-muted/40 rounded-xl px-4 py-3 text-sm text-foreground font-medium">{doc.name}</div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Recipient Email *</label>
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="recruiter@company.com"
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Personal Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Hi, please find my document attached..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={send} disabled={sending} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
            {sending ? "Sending..." : "Send via Dugosoft"}
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">Sent with a professional Dugosoft-branded template.</p>
      </motion.div>
    </div>
  );
}

function MoveModal({ doc, folders, onMove, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card ink-border rounded-2xl shadow-2xl w-full max-w-xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-foreground">Move to Folder</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-1">
          <button onClick={() => onMove(null)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm text-muted-foreground">
            <File className="w-4 h-4" /> No Folder (Root)
          </button>
          {folders.map(f => (
            <button key={f.id} onClick={() => onMove(f.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm text-foreground">
              <Folder className={`w-4 h-4 ${f.color}`} /> {f.name}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function MyDocuments() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [folders, setFolders] = useState(INITIAL_FOLDERS);
  const [activeFolder, setActiveFolder] = useState(null); // null = all
  const [previewDoc, setPreviewDoc] = useState(null);
  const [emailDoc, setEmailDoc] = useState(null);
  const [moveDoc, setMoveDoc] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [addingFolder, setAddingFolder] = useState(false);
  const [selected, setSelected] = useState([]);

  const filtered = docs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || d.category === categoryFilter;
    const matchFolder = activeFolder === null ? true : d.folder === activeFolder;
    return matchSearch && matchCat && matchFolder;
  });

  const handleDelete = (id) => {
    setDocs(p => p.filter(d => d.id !== id));
    setSelected(s => s.filter(x => x !== id));
    toast.success("Document deleted.");
  };

  const handleDeleteSelected = () => {
    setDocs(p => p.filter(d => !selected.includes(d.id)));
    setSelected([]);
    toast.success(`${selected.length} document(s) deleted.`);
  };

  const handleMove = (folderId) => {
    setDocs(p => p.map(d => d.id === moveDoc.id ? { ...d, folder: folderId } : d));
    setMoveDoc(null);
    toast.success("Document moved.");
  };

  const handleMoveSelected = (folderId) => {
    setDocs(p => p.map(d => selected.includes(d.id) ? { ...d, folder: folderId } : d));
    setSelected([]);
    toast.success("Documents moved.");
  };

  const addFolder = () => {
    if (!newFolderName.trim()) return;
    const colors = ["text-accent", "text-orange-500", "text-purple-500", "text-green-500", "text-pink-500"];
    setFolders(f => [...f, { id: Date.now().toString(), name: newFolderName.trim(), color: colors[f.length % colors.length] }]);
    setNewFolderName("");
    setAddingFolder(false);
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  // Drag & drop folder
  const onDragStart = (e, docId) => e.dataTransfer.setData("docId", docId);
  const onDropFolder = (e, folderId) => {
    const docId = parseInt(e.dataTransfer.getData("docId"));
    setDocs(p => p.map(d => d.id === docId ? { ...d, folder: folderId } : d));
    toast.success("Moved to folder.");
    e.preventDefault();
  };

  return (
    <div className="max-w-6xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">My Documents</h1>
        <p className="text-muted-foreground text-sm">All your processed files in one place. Drag files onto folders to organize.</p>
      </motion.div>

      <div className="flex gap-4 flex-wrap lg:flex-nowrap">
        {/* Folder sidebar */}
        <div className="w-full lg:w-48 shrink-0 space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">Folders</p>
          <button
            onClick={() => setActiveFolder(null)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeFolder === null ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted"}`}
          >
            <File className="w-4 h-4 shrink-0" /> All Files
            <span className="ml-auto text-xs">{docs.length}</span>
          </button>
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              onDragOver={e => e.preventDefault()}
              onDrop={e => onDropFolder(e, f.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeFolder === f.id ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Folder className={`w-4 h-4 shrink-0 ${f.color}`} />
              <span className="truncate flex-1 text-left">{f.name}</span>
              <span className="ml-auto text-xs">{docs.filter(d => d.folder === f.id).length}</span>
            </button>
          ))}
          {addingFolder ? (
            <div className="flex gap-1 mt-2">
              <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addFolder(); if (e.key === "Escape") setAddingFolder(false); }}
                placeholder="Folder name" className="flex-1 h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none" />
              <button onClick={addFolder} className="h-8 px-2 bg-accent text-white rounded-lg text-xs font-bold">Add</button>
            </div>
          ) : (
            <button onClick={() => setAddingFolder(true)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1">
              <FolderPlus className="w-3.5 h-3.5" /> New Folder
            </button>
          )}
        </div>

        {/* Main area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-background" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${categoryFilter === c ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border text-muted-foreground hover:border-accent/40"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Batch actions */}
          {selected.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-accent/5 border border-accent/20 rounded-xl text-sm">
              <span className="font-semibold text-foreground">{selected.length} selected</span>
              <button onClick={handleDeleteSelected} className="text-destructive font-semibold hover:underline flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-muted-foreground mr-1">Move to:</span>
                {folders.map(f => (
                  <button key={f.id} onClick={() => handleMoveSelected(f.id)}
                    className="text-xs font-semibold px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 flex items-center gap-1">
                    <Folder className={`w-3 h-3 ${f.color}`} />{f.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">{filtered.length} document{filtered.length !== 1 ? "s" : ""} found</p>

          {/* Table */}
          <div className="bg-card ink-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 w-8">
                      <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                        onChange={e => setSelected(e.target.checked ? filtered.map(d => d.id) : [])}
                        className="rounded border-border" />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">File</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Folder</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((doc, i) => {
                      const Icon = TYPE_ICONS[doc.type] || File;
                      const color = TYPE_COLORS[doc.type] || "#4f8ef7";
                      const folderInfo = folders.find(f => f.id === doc.folder);
                      return (
                        <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.03 }}
                          draggable onDragStart={e => onDragStart(e, doc.id)}
                          className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-grab ${selected.includes(doc.id) ? "bg-accent/5" : ""}`}>
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={selected.includes(doc.id)} onChange={() => toggleSelect(doc.id)} className="rounded border-border" />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + "20" }}>
                                <Icon className="w-4 h-4" style={{ color }} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate max-w-[160px]">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.size}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden sm:table-cell">
                            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: color + "20", color }}>{doc.type}</span>
                          </td>
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            {folderInfo ? (
                              <span className={`text-xs font-semibold flex items-center gap-1 ${folderInfo.color}`}>
                                <Folder className="w-3 h-3" />{folderInfo.name}
                              </span>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground">{doc.date}</span>
                          </td>
                          <td className="px-4 py-3.5"><StatusBadge status={doc.status} /></td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setPreviewDoc(doc)} title="Preview"
                                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                              <button onClick={() => toast.success("Downloading...")} title="Download"
                                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                              <button onClick={() => setMoveDoc(doc)} title="Move to folder"
                                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                                <MoveRight className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                              <button onClick={() => setEmailDoc(doc)} title="Email"
                                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                              <button onClick={() => handleDelete(doc.id)} title="Delete"
                                className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors">
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-muted-foreground text-sm">No documents match your filters.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {previewDoc && (
        <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)}
          onDownload={() => toast.success("Downloading...")} onShare={() => toast.info("Share link copied!")} />
      )}
      <AnimatePresence>
        {emailDoc && <EmailModal doc={emailDoc} onClose={() => setEmailDoc(null)} />}
        {moveDoc && <MoveModal doc={moveDoc} folders={folders} onMove={handleMove} onClose={() => setMoveDoc(null)} />}
      </AnimatePresence>
    </div>
  );
}
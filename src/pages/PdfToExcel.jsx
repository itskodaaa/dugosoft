import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table2, Copy, Download, Check, Type, FileUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProcessingBorder from "../components/shared/ProcessingBorder";
import FileUpload from "../components/shared/FileUpload";
import InputModeToggle from "../components/shared/InputModeToggle";
import StatusBadge from "../components/shared/StatusBadge";
import { toast } from "sonner";

const PLACEHOLDER_DATA = [
  { date: "2024-01-15", description: "Office Supplies — Staples Inc.", category: "Operations", amount: "$234.50", status: "Paid" },
  { date: "2024-01-18", description: "Cloud Services — AWS", category: "Infrastructure", amount: "$1,200.00", status: "Paid" },
  { date: "2024-02-01", description: "Employee Training — Udemy", category: "HR", amount: "$450.00", status: "Paid" },
  { date: "2024-02-10", description: "Software License — Figma", category: "Design", amount: "$180.00", status: "Pending" },
  { date: "2024-02-15", description: "Marketing — Google Ads", category: "Marketing", amount: "$3,500.00", status: "Paid" },
  { date: "2024-03-01", description: "Internet Service — AT&T", category: "Utilities", amount: "$89.99", status: "Paid" },
  { date: "2024-03-05", description: "Legal Consultation — Smith & Co.", category: "Legal", amount: "$750.00", status: "Pending" },
];

const inputModes = [
  { value: "upload", label: "Upload PDF", icon: FileUp },
  { value: "paste", label: "Paste Text", icon: Type },
];

export default function PdfToExcel() {
  const [inputMode, setInputMode] = useState("upload");
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const canConvert = inputMode === "upload" ? file !== null : inputText.trim().length > 0;

  const handleConvert = () => {
    if (!canConvert) {
      toast.warning(inputMode === "upload" ? "Please upload a PDF file first" : "Please paste some content first");
      return;
    }
    setStatus("processing");
    setResult(null);
    setTimeout(() => {
      setResult(PLACEHOLDER_DATA);
      setStatus("complete");
    }, 2200);
  };

  const handleCopyTSV = () => {
    const header = "Date\tDescription\tCategory\tAmount\tStatus";
    const rows = result.map((r) => `${r.date}\t${r.description}\t${r.category}\t${r.amount}\t${r.status}`).join("\n");
    navigator.clipboard.writeText(header + "\n" + rows);
    setCopied(true);
    toast.success("Table copied as TSV — paste directly into Excel");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModeChange = (mode) => {
    setInputMode(mode);
    setResult(null);
    setStatus("idle");
  };

  const totalPaid = result ? result.filter((r) => r.status === "Paid").reduce((s, r) => s + parseFloat(r.amount.replace(/[$,]/g, "")), 0) : 0;

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">
          PDF to Excel Converter
        </h1>
        <p className="text-muted-foreground mb-6">
          Extract structured data from PDFs and export as Excel or CSV tables.
        </p>
      </motion.div>

      {/* Mode toggle */}
      <div className="mb-6">
        <InputModeToggle modes={inputModes} active={inputMode} onChange={handleModeChange} />
      </div>

      {/* Input area */}
      <motion.div
        key={inputMode}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-6"
      >
        <AnimatePresence mode="wait">
          {inputMode === "upload" ? (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">
                Upload PDF File
              </Label>
              <FileUpload
                accept=".pdf"
                acceptLabel="PDF files only — tables, invoices, financial reports"
                file={file}
                onFile={setFile}
                onRemove={() => { setFile(null); setResult(null); setStatus("idle"); }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Best results with: invoices, financial statements, data tables, receipts
              </p>
            </motion.div>
          ) : (
            <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">
                Paste Unstructured Data
              </Label>
              <Textarea
                placeholder="Paste invoice data, financial tables, or any structured text content here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[160px] bg-card ink-border resize-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Convert button */}
      <Button
        onClick={handleConvert}
        disabled={status === "processing"}
        className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-12 px-10 font-semibold gap-2 mb-8"
      >
        {status === "processing" ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
            Extracting Data...
          </>
        ) : (
          <>
            <Table2 className="w-4 h-4" />
            Extract & Convert
          </>
        )}
      </Button>

      {/* Results */}
      <AnimatePresence>
        {(result || status === "processing") && (
          <ProcessingBorder processing={status === "processing"}>
            <div className="p-6">
              {result ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Header + Stats */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        Extracted Data
                      </h2>
                      <StatusBadge status="complete" label={`${result.length} rows`} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopyTSV} className="rounded-full h-8 text-xs gap-1.5">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied!" : "Copy as TSV"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full h-8 text-xs gap-1.5"
                        onClick={() => toast.success("Excel export started (simulated)")}
                      >
                        <Download className="w-3 h-3" />
                        Download Excel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full h-8 text-xs gap-1.5"
                        onClick={() => toast.success("CSV export started (simulated)")}
                      >
                        <Download className="w-3 h-3" />
                        Download CSV
                      </Button>
                    </div>
                  </div>

                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="p-4 rounded-lg bg-muted/50 ink-border text-center">
                      <p className="text-2xl font-extrabold text-foreground">{result.length}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Total Rows</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 ink-border text-center">
                      <p className="text-2xl font-extrabold text-foreground">5</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Columns</p>
                    </div>
                    <div className="p-4 rounded-lg bg-success/5 ink-border text-center">
                      <p className="text-2xl font-extrabold text-success">${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Total (Paid)</p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-lg ink-border overflow-hidden overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          {["Date", "Description", "Category", "Amount", "Status"].map((h) => (
                            <TableHead key={h} className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.map((row, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="font-mono text-xs whitespace-nowrap">{row.date}</TableCell>
                            <TableCell className="text-sm">{row.description}</TableCell>
                            <TableCell>
                              <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium text-muted-foreground">
                                {row.category}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold font-mono text-sm text-right whitespace-nowrap">{row.amount}</TableCell>
                            <TableCell>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                row.status === "Paid"
                                  ? "bg-success/10 text-success"
                                  : "bg-amber-500/10 text-amber-600"
                              }`}>
                                {row.status}
                              </span>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Extracting data from your document...
                </div>
              )}
            </div>
          </ProcessingBorder>
        )}
      </AnimatePresence>
    </div>
  );
}
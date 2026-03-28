import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table2, Upload, Copy, Download, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProcessingBorder from "../components/shared/ProcessingBorder";
import { toast } from "sonner";

const PLACEHOLDER_DATA = [
  { date: "2024-01-15", description: "Office Supplies - Staples", amount: "$234.50" },
  { date: "2024-01-18", description: "Cloud Services - AWS", amount: "$1,200.00" },
  { date: "2024-02-01", description: "Employee Training - Udemy", amount: "$450.00" },
  { date: "2024-02-10", description: "Software License - Figma", amount: "$180.00" },
  { date: "2024-02-15", description: "Marketing - Google Ads", amount: "$3,500.00" },
  { date: "2024-03-01", description: "Internet Service - AT&T", amount: "$89.99" },
];

export default function PdfToExcel() {
  const [inputText, setInputText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    setProcessing(true);
    setResult(null);
    setTimeout(() => {
      setResult(PLACEHOLDER_DATA);
      setProcessing(false);
    }, 2000);
  };

  const handleCopy = () => {
    const text = result
      .map((r) => `${r.date}\t${r.description}\t${r.amount}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Table data copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">
          PDF to Excel Converter
        </h1>
        <p className="text-muted-foreground mb-8">
          Extract structured data from documents and convert into organized tables.
        </p>
      </motion.div>

      {/* Upload area */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div
          className="rounded-xl ink-border bg-card p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors min-h-[180px]"
          onClick={() => toast.info("File upload will be available in the full version")}
        >
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
            <Upload className="w-5 h-5 text-accent" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Upload a PDF or document</p>
          <p className="text-xs text-muted-foreground">Drag and drop or click to browse</p>
        </div>

        <div>
          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">
            Or paste text directly
          </Label>
          <Textarea
            placeholder="Paste unstructured text, invoice data, or table content..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[180px] bg-card ink-border resize-none"
          />
        </div>
      </div>

      <Button
        onClick={handleConvert}
        disabled={processing}
        className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-12 px-10 font-semibold gap-2 mb-8"
      >
        {processing ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <Table2 className="w-4 h-4" />
            Convert to Table
          </>
        )}
      </Button>

      {/* Results */}
      {(result || processing) && (
        <ProcessingBorder processing={processing}>
          <div className="p-6">
            {result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Extracted Data
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="rounded-full h-8 text-xs gap-1.5"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full h-8 text-xs gap-1.5"
                      onClick={() => toast.info("Export will be available in the full version")}
                    >
                      <Download className="w-3 h-3" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg ink-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Description</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.map((row, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="border-b border-border last:border-0"
                        >
                          <TableCell className="font-mono text-sm">{row.date}</TableCell>
                          <TableCell className="text-sm">{row.description}</TableCell>
                          <TableCell className="text-sm font-semibold text-right font-mono">{row.amount}</TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Extracting data...
              </div>
            )}
          </div>
        </ProcessingBorder>
      )}
    </div>
  );
}
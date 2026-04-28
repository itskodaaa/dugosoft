import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Users, Building2, Globe, Mail, Phone, 
  Linkedin, Twitter, Zap, ArrowRight,
  ShieldCheck, MapPin, TrendingUp, Filter,
  Download, Loader2, Sparkles, Plus, RefreshCw, Facebook, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function VibeProspecting() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [enriching, setEnriching] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [outreachModal, setOutreachModal] = useState(false);
  const [outreachData, setOutreachData] = useState(null);
  const [userContext, setUserContext] = useState(() => localStorage.getItem("vp_user_context") || "");
  const [isEditingContext, setIsEditingContext] = useState(false);

  const isValidLink = (link) => link && link !== "N/A" && link !== "null" && link !== "" && link !== "undefined";

  const handleSearch = async (e, forceNew = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!query) return;

    if (forceNew) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vibeprospecting/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({ 
          query,
          randomSeed: forceNew ? Math.random().toString() : "stable"
        })
      });
      const data = await response.json();
      setResults(data.results || []);
      if (forceNew) toast.success("Refreshed with new leads!");
    } catch (error) {
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEnrich = async (lead) => {
    const leadId = lead.id;
    setEnriching(leadId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vibeprospecting/enrich`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({ 
          id: leadId,
          name: lead.name,
          company: lead.company
        })
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setResults(prev => prev.map(l => l.id === leadId ? { ...l, ...data, enriched: true } : l));
      if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, ...data, enriched: true });
      
      toast.success("Data enriched successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to enrich lead");
    } finally {
      setEnriching(null);
    }
  };

  const handleDraftOutreach = async () => {
    if (!selectedLead) return;
    setDrafting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vibeprospecting/outreach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({ 
          lead: selectedLead,
          userContext: userContext
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setOutreachData(data.outreach);
      setOutreachModal(true);
    } catch (error) {
      toast.error(error.message || "Failed to draft outreach");
    } finally {
      setDrafting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-accent/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20">Alpha</Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Vibe Prospecting</h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Power your outreach with B2B data. Create lead lists, research companies, and personalize your messages in seconds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 rounded-xl font-bold">
            <Plus className="w-4 h-4" /> New List
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex items-center bg-card border border-border focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/5 rounded-2xl p-2 transition-all shadow-xl">
            <Search className="w-5 h-5 text-muted-foreground ml-3" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies or professionals (e.g., 'Engineers at Google' or 'SaaS Founders in Austin')"
              className="border-0 focus-visible:ring-0 text-base h-12 bg-transparent w-full"
            />
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-8 h-12 font-bold shadow-lg shadow-accent/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search Leads"}
            </Button>
          </div>
        </form>
        
        <div className="flex items-center gap-4 mt-4 px-2 overflow-x-auto no-scrollbar pb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest shrink-0">Popular:</span>
          {["Fortune 500 CEOs", "Series A Startups", "Marketing Directors", "Tech in London"].map((tag) => (
            <button 
              key={tag}
              onClick={() => { setQuery(tag); handleSearch(); }}
              className="text-xs font-semibold text-muted-foreground hover:text-accent hover:bg-accent/10 px-3 py-1.5 rounded-full border border-border hover:border-accent/30 transition-all whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Results List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              {results.length > 0 ? `Results (${results.length})` : "Start searching to find leads"}
            </h2>
            {results.length > 0 && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSearch(null, true)}
                  disabled={refreshing}
                  className="text-xs gap-1.5 h-8 text-accent"
                >
                  {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Refresh Results
                </Button>
                <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8">
                  <Filter className="w-3.5 h-3.5" /> Filter
                </Button>
              </div>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {results.map((lead, i) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedLead(lead)}
                className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedLead?.id === lead.id 
                    ? "bg-accent/5 border-accent/40 shadow-lg" 
                    : "bg-card border-border hover:border-accent/30 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center border border-border group-hover:border-accent/20 transition-colors text-xl font-bold text-muted-foreground">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground leading-tight">{lead.name}</h3>
                      <p className="text-sm text-muted-foreground font-medium">{lead.role} at {lead.company}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lead.location}</span>
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {lead.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {lead.enriched ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1.5">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); handleEnrich(lead); }}
                        disabled={enriching === lead.id}
                        className="h-8 rounded-lg gap-1.5 text-accent hover:bg-accent/10 font-bold"
                      >
                        {enriching === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        Enrich
                      </Button>
                    )}
                  </div>
                </div>
                
                {lead.enriched && (
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                      <Mail className="w-3.5 h-3.5 text-accent" /> {lead.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                      <Phone className="w-3.5 h-3.5 text-accent" /> {lead.phone}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">No leads found</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">Try searching for a job title, company name, or location to see results.</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Detail / Insight Panel */}
        <div className="space-y-6">
          {/* User Context Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-accent" />
                <p className="text-sm font-bold text-foreground">My Profile / Company</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  if (isEditingContext) {
                    localStorage.setItem("vp_user_context", userContext);
                    toast.success("Profile context saved!");
                  }
                  setIsEditingContext(!isEditingContext);
                }}
                className="h-8 text-xs font-bold"
              >
                {isEditingContext ? "Save" : "Edit"}
              </Button>
            </div>
            
            {isEditingContext ? (
              <textarea
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="Describe yourself or your company (e.g. 'I am a software agency specializing in AI'). This will be used to personalize your outreach."
                className="w-full min-h-[120px] p-3 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 transition resize-none leading-relaxed"
              />
            ) : (
              <div className="text-xs text-muted-foreground leading-relaxed italic">
                {userContext || "No context added yet. Click edit to add details about yourself or your company for better AI drafts."}
              </div>
            )}
            <div className="mt-3 flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Auto-saved to drafts
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
            {selectedLead ? (
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 rounded-2xl bg-accent/10 border-2 border-accent/20 mx-auto flex items-center justify-center text-3xl font-bold text-accent">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground">{selectedLead.name}</h3>
                    <p className="text-muted-foreground font-medium">{selectedLead.role} @ {selectedLead.company}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Personal Socials</p>
                    <div className="flex items-center justify-center gap-3">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className={`rounded-full w-10 h-10 transition-all ${isValidLink(selectedLead.linkedin) ? "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" : "opacity-30 cursor-not-allowed"}`}
                        onClick={() => isValidLink(selectedLead.linkedin) && window.open(selectedLead.linkedin, "_blank")}
                        disabled={!isValidLink(selectedLead.linkedin)}
                        title={isValidLink(selectedLead.linkedin) ? selectedLead.linkedin : "LinkedIn not found"}
                      >
                        <Linkedin className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className={`rounded-full w-10 h-10 transition-all ${isValidLink(selectedLead.twitter) ? "hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200" : "opacity-30 cursor-not-allowed"}`}
                        onClick={() => isValidLink(selectedLead.twitter) && window.open(selectedLead.twitter, "_blank")}
                        disabled={!isValidLink(selectedLead.twitter)}
                        title={isValidLink(selectedLead.twitter) ? selectedLead.twitter : "Twitter not found"}
                      >
                        <Twitter className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className={`rounded-full w-10 h-10 transition-all ${isValidLink(selectedLead.website || selectedLead.url) ? "hover:bg-muted" : "opacity-30 cursor-not-allowed"}`}
                        onClick={() => isValidLink(selectedLead.website || selectedLead.url) && window.open(selectedLead.website || selectedLead.url, "_blank")}
                        disabled={!isValidLink(selectedLead.website || selectedLead.url)}
                        title={isValidLink(selectedLead.website || selectedLead.url) ? (selectedLead.website || selectedLead.url) : "Website not found"}
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedLead.enriched && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Company Socials</p>
                      <div className="flex items-center justify-center gap-3">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className={`rounded-full w-10 h-10 transition-all ${isValidLink(selectedLead.companyLinkedin) ? "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" : "opacity-30 cursor-not-allowed"}`}
                          onClick={() => isValidLink(selectedLead.companyLinkedin) && window.open(selectedLead.companyLinkedin, "_blank")}
                          disabled={!isValidLink(selectedLead.companyLinkedin)}
                          title={isValidLink(selectedLead.companyLinkedin) ? selectedLead.companyLinkedin : "Company LinkedIn not found"}
                        >
                          <Linkedin className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className={`rounded-full w-10 h-10 transition-all ${isValidLink(selectedLead.companyTwitter) ? "hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200" : "opacity-30 cursor-not-allowed"}`}
                          onClick={() => isValidLink(selectedLead.companyTwitter) && window.open(selectedLead.companyTwitter, "_blank")}
                          disabled={!isValidLink(selectedLead.companyTwitter)}
                          title={isValidLink(selectedLead.companyTwitter) ? selectedLead.companyTwitter : "Company Twitter not found"}
                        >
                          <Twitter className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className={`rounded-full w-10 h-10 transition-all ${isValidLink(selectedLead.companyFacebook) ? "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300" : "opacity-30 cursor-not-allowed"}`}
                          onClick={() => isValidLink(selectedLead.companyFacebook) && window.open(selectedLead.companyFacebook, "_blank")}
                          disabled={!isValidLink(selectedLead.companyFacebook)}
                          title={isValidLink(selectedLead.companyFacebook) ? selectedLead.companyFacebook : "Company Facebook not found"}
                        >
                          <Facebook className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Company Insights</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                        <p className="text-xs text-muted-foreground">Growth</p>
                        <p className="text-sm font-bold">{selectedLead.growth || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                        <Building2 className="w-3.5 h-3.5 text-accent" />
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-sm font-bold">{selectedLead.revenue || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedLead.tags || ["B2B", "SaaS", "Tech"]).map(tag => (
                        <span key={tag} className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleDraftOutreach}
                  disabled={drafting}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2 rounded-xl font-bold h-11"
                >
                  {drafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Draft Outreach
                </Button>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-muted-foreground/30" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-foreground">Select a lead</p>
                  <p className="text-xs text-muted-foreground">Select a profile from the results to view deep insights and contact data.</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <p className="text-sm font-bold text-foreground">Pro Tip</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use "Intent Signals" to find companies that are currently searching for your services. We track technographics, hiring trends, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Outreach Modal */}
      <AnimatePresence>
        {outreachModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setOutreachModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Outreach Draft</h3>
                    <p className="text-xs text-muted-foreground">Personalized for {selectedLead?.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOutreachModal(false)} className="rounded-full">
                  <Plus className="w-5 h-5 rotate-45" />
                </Button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Subject Line</label>
                  <div className="p-4 bg-muted/50 rounded-xl font-medium border border-border/50">
                    {outreachData?.subject}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Message Body</label>
                  <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 text-sm leading-relaxed whitespace-pre-wrap min-h-[200px]">
                    {outreachData?.body}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 sticky bottom-0 bg-card/80 backdrop-blur-sm pb-2">
                  <Button 
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-bold h-12"
                    onClick={() => {
                      navigator.clipboard.writeText(`${outreachData?.subject}\n\n${outreachData?.body}`);
                      toast.success("Copied to clipboard!");
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl font-bold h-12"
                    onClick={() => {
                      const mailto = `mailto:${selectedLead?.email || ""}?subject=${encodeURIComponent(outreachData?.subject)}&body=${encodeURIComponent(outreachData?.body)}`;
                      window.location.href = mailto;
                    }}
                  >
                    Open in Email App
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

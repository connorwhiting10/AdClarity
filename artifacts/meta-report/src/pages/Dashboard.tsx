import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  BarChart3, 
  Activity, 
  Users, 
  Target,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  ShieldAlert,
  Info,
  Star,
  Rocket,
  FlaskConical,
  Trophy,
  ChevronDown,
  Gauge,
  Lock,
  Zap,
  X
} from "lucide-react";
import { 
  parseMetaReport, 
  exportToCSV, 
  type ParsedReport,
  type AnalysisInsight,
  type MetricAssessment,
  type FunnelStage,
  type Alert
} from "@/lib/excel-parser";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useAILayer } from "@/context/AILayerContext";
import { supabase } from "@/lib/supabase";
import { getSampleReport } from "@/lib/sample-report";
import AIToggle from "@/components/ai/AIToggle";
import AIBriefingCard from "@/components/ai/AIBriefingCard";
import AIChatDrawer from "@/components/ai/AIChatDrawer";
import AIOrb from "@/components/ai/AIOrb";
import { buildBriefing } from "@/lib/ai-briefing";

function InsightCard({ insight, index }: { insight: AnalysisInsight; index: number }) {
  const config = {
    positive: { icon: CheckCircle2, border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', iconColor: 'text-emerald-400' },
    warning:  { icon: ShieldAlert,  border: 'border-amber-500/20',   bg: 'bg-amber-500/5',   iconColor: 'text-amber-400'   },
    info:     { icon: Info,         border: 'border-blue-500/20',    bg: 'bg-blue-500/5',    iconColor: 'text-blue-400'    },
  };
  const { icon: Icon, border, bg, iconColor } = config[insight.type];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
      <div className={`rounded-xl border p-5 ${border} ${bg}`}>
        <div className="flex items-start gap-4">
          <div className={`mt-0.5 shrink-0 ${iconColor}`}><Icon className="w-5 h-5" /></div>
          <div>
            <p className="font-semibold text-foreground mb-1">{insight.title}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.body}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ metric, index }: { metric: MetricAssessment; index: number }) {
  const ratingConfig = {
    good:    { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Good' },
    average: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   label: 'Average' },
    poor:    { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     label: 'Poor' },
  };
  const cfg = ratingConfig[metric.rating];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
      <div className={`rounded-xl border p-5 ${cfg.border} bg-card`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="font-semibold text-foreground text-sm">{metric.name}</p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{cfg.label}</span>
        </div>
        <p className={`text-2xl font-bold mb-2 ${cfg.color}`}>{metric.value}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{metric.explanation}</p>
      </div>
    </motion.div>
  );
}

function AlertCard({ alert, index }: { alert: Alert; index: number }) {
  const severityConfig = {
    high:   { icon: ShieldAlert, border: 'border-red-500/30',    bg: 'bg-red-500/5',    iconColor: 'text-red-400',    label: 'High Priority',   labelClass: 'bg-red-500/10 text-red-400 border-red-500/20' },
    medium: { icon: AlertCircle, border: 'border-amber-500/30',  bg: 'bg-amber-500/5',  iconColor: 'text-amber-400',  label: 'Watch This',      labelClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    low:    { icon: CheckCircle2,border: 'border-emerald-500/20',bg: 'bg-emerald-500/5',iconColor: 'text-emerald-400',label: 'All Good',        labelClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  };
  const cfg = severityConfig[alert.severity];
  const Icon = cfg.icon;
  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}>
      <div className={`rounded-xl border p-5 ${cfg.border} ${cfg.bg}`}>
        <div className="flex items-start gap-4">
          <div className={`mt-0.5 shrink-0 ${cfg.iconColor}`}><Icon className="w-5 h-5" /></div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-foreground">{alert.title}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.labelClass}`}>{cfg.label}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{alert.text}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FunnelViz({ stages }: { stages: FunnelStage[] }) {
  const maxCount = stages[0]?.count ?? 1;
  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const widthPct = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
        return (
          <motion.div key={stage.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-medium text-muted-foreground w-6 text-right">{i + 1}</span>
              <span className="text-sm font-semibold text-foreground">{stage.label}</span>
              <span className="ml-auto text-sm font-bold text-foreground">{stage.count.toLocaleString()}</span>
              {stage.pctFromPrev !== undefined && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stage.pctFromPrev < 1 ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {stage.pctFromPrev.toFixed(2)}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6" />
              <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ delay: i * 0.1 + 0.2, duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
            {i < stages.length - 1 && (
              <div className="flex items-center gap-3 mt-1">
                <div className="w-6" />
                <ChevronDown className="w-4 h-4 text-muted-foreground/40 ml-1" />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 ml-9 leading-relaxed">{stage.note}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

// Guest (not signed in) report counter lives in localStorage since guests
// have no Supabase profile. Signed-in users are tracked server-side via the
// usage table and can_create_report() RLS gate.
const GUEST_STORAGE_KEY = "adclarity_report_count";
const GUEST_MONTH_KEY = "adclarity_report_month";

function getGuestReportCount(): number {
  const storedMonth = localStorage.getItem(GUEST_MONTH_KEY);
  const thisMonth = new Date().toISOString().slice(0, 7);
  if (storedMonth !== thisMonth) {
    localStorage.setItem(GUEST_MONTH_KEY, thisMonth);
    localStorage.setItem(GUEST_STORAGE_KEY, "0");
    return 0;
  }
  return parseInt(localStorage.getItem(GUEST_STORAGE_KEY) ?? "0", 10);
}

function incrementGuestReportCount() {
  const count = getGuestReportCount();
  localStorage.setItem(GUEST_STORAGE_KEY, String(count + 1));
}

function UpgradeModal({ onClose, onViewPricing }: { onClose: () => void; onViewPricing: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-primary/30 bg-card shadow-2xl shadow-primary/10 p-8 text-center"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-2xl font-display font-bold mb-2">You've reached your free limit</h3>
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
          Upgrade to continue. Unlock unlimited reports and get the full analysis every time.
        </p>

        <div className="rounded-xl border border-white/5 bg-muted/10 p-4 mb-6 text-left">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">What you unlock with Basic</p>
          {[
            "Unlimited reports per month",
            "Full written performance analysis",
            "Funnel, alerts & scaling sections",
            "30-day report history",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-foreground/80 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {f}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Button className="w-full shadow-lg shadow-primary/30" onClick={onViewPricing}>
            <Zap className="w-4 h-4 mr-2" />
            View Plans
          </Button>
          <Button variant="outline" className="w-full border-white/10 text-muted-foreground hover:text-foreground" onClick={onClose}>
            Maybe later
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">From R279/month · Cancel anytime</p>
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportData, setReportData] = useState<ParsedReport | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [reportsUsed, setReportsUsed] = useState(0);
  const [isSampleMode, setIsSampleMode] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const { enabled: aiEnabled } = useAILayer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isLoggedIn, reportLimit, logout: authLogout, login, signup, isAdmin, plan, session } = useAuth();
  const isPro = plan === "pro" || isAdmin;

  const effectiveLimit = isPro ? Infinity : reportLimit;

  // Read monthly usage for the signed-in user; guests use localStorage.
  const fetchUsage = useCallback(async () => {
    if (!session?.user) {
      setReportsUsed(getGuestReportCount());
      return;
    }
    const monthStart = new Date().toISOString().slice(0, 7) + "-01";
    const { data } = await supabase
      .from("usage")
      .select("report_count")
      .eq("user_id", session.user.id)
      .eq("month", monthStart)
      .maybeSingle();
    setReportsUsed(data?.report_count ?? 0);
  }, [session]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // Rehydrate a saved report when navigated from /reports.
  useEffect(() => {
    const raw = sessionStorage.getItem("adclarity_view_report");
    if (!raw) return;
    sessionStorage.removeItem("adclarity_view_report");
    try {
      const parsed = JSON.parse(raw) as ParsedReport;
      setReportData(parsed);
      setIsSampleMode(false);
    } catch {
      // Malformed payload — ignore.
    }
  }, []);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload an Excel (.xlsx) file exported from Meta Ads.",
        variant: "destructive"
      });
      return;
    }

    // Guest gate: no account → 1 free report, then nudge to sign up.
    if (!isLoggedIn && getGuestReportCount() >= effectiveLimit) {
      signup();
      return;
    }

    setIsProcessing(true);
    try {
      const parsed = await parseMetaReport(file);

      if (isLoggedIn && session?.user) {
        // Server-side enforcement: RLS can_create_report() gates the insert.
        // analysis jsonb holds the full ParsedReport so /reports can rehydrate.
        const { error } = await supabase.from("reports").insert({
          user_id: session.user.id,
          filename: file.name,
          analysis: parsed as never,
          summary: parsed.summary as never,
          date_range: parsed.dateRange,
        });
        if (error) {
          const isLimitBlock =
            error.code === "42501" ||
            error.message.toLowerCase().includes("row-level security");
          if (isLimitBlock && !isPro) {
            setShowUpgradeModal(true);
          } else {
            toast({
              title: "Could not save report",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }
        await fetchUsage();
      } else {
        // Guest: local-only. Do not persist to DB.
        incrementGuestReportCount();
        setReportsUsed(getGuestReportCount());
      }

      setReportData(parsed);
      toast({
        title: "Report parsed successfully!",
        description: `Extracted ${parsed.simplifiedData.length} rows of simplified data.`,
      });
    } catch (error) {
      toast({
        title: "Failed to parse report",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const resetState = () => {
    setReportData(null);
    setIsSampleMode(false);
  };

  const showSample = () => {
    setReportData(getSampleReport());
    setIsSampleMode(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_-3px_rgba(24,119,242,0.5)]">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight hidden sm:block">
              AdClarity
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* AI Layer toggle — always visible so demo can switch live */}
            <AIToggle />

            {/* Admin badge */}
            {isAdmin && (
              <span className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1">
                <Lock className="w-3 h-3" />
                Admin · Pro
              </span>
            )}

            {/* Free usage indicator — hidden for admin/pro */}
            {!isAdmin && !reportData && (
              <span className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 border border-white/5 rounded-full px-3 py-1">
                <span className={`w-1.5 h-1.5 rounded-full ${reportsUsed < effectiveLimit ? 'bg-emerald-400' : 'bg-red-400'}`} />
                {reportsUsed < effectiveLimit
                  ? `${effectiveLimit - reportsUsed} free report${effectiveLimit - reportsUsed !== 1 ? "s" : ""} left`
                  : "Free limit reached"}
              </span>
            )}

            {/* History link — only when signed in */}
            {isLoggedIn && (
              <button
                onClick={() => navigate("/reports")}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground transition-colors border border-white/8 rounded-full px-3 py-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                History
              </button>
            )}

            {/* View Plans button — hidden for admin */}
            {!isAdmin && (
              <button
                onClick={() => navigate("/pricing")}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/15 border border-primary/20 rounded-full px-3 py-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                View Plans
              </button>
            )}

            {/* Auth: sign in or user pill */}
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => navigate("/account")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]"
                  title="My Account"
                >
                  {user?.email}
                </button>
                <button
                  onClick={authLogout}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-white/5 rounded-full px-2.5 py-1"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground transition-colors border border-white/8 rounded-full px-3 py-1.5"
              >
                Sign in
              </button>
            )}
            {reportData && (
              <>
                <Badge variant="outline" className="hidden md:inline-flex bg-background/50 border-border text-xs">
                  {reportData.dateRange}
                </Badge>
                <Button variant="outline" size="sm" onClick={resetState} className="hidden sm:flex">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Report
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => exportToCSV(reportData.simplifiedData)}
                  className="shadow-lg shadow-primary/20"
                >
                  <Download className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AnimatePresence mode="wait">
          {!reportData ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center pt-12 pb-24"
            >
              <div className="text-center max-w-2xl mb-12">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  Transform complex reports into clear insights.
                </h2>
                <p className="text-lg text-muted-foreground">
                  Upload your raw Meta Ads Excel export and instantly get a simplified dashboard, actionable metrics, and a clean CSV you can actually read.
                </p>
              </div>

              {/* AI layer teaser — visible whenever the toggle is ON but no report is loaded */}
              {aiEnabled && (
                <div className="w-full max-w-3xl mb-10">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-violet-300">
                      Preview — AI layer on sample data
                    </p>
                    <Button size="sm" variant="outline" onClick={showSample} className="border-violet-500/30 hover:bg-violet-500/10">
                      <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                      Open full sample
                    </Button>
                  </div>
                  <AIBriefingCard
                    briefing={buildBriefing(getSampleReport())}
                    onOpenChat={() => {
                      setReportData(getSampleReport());
                      setIsSampleMode(true);
                      setShowChatDrawer(true);
                    }}
                  />
                </div>
              )}

              <Card 
                className={`w-full max-w-xl transition-all duration-300 border-2 ${
                  isDragging ? 'border-primary shadow-[0_0_40px_-10px_rgba(24,119,242,0.3)]' : 'border-border/50 border-dashed hover:border-primary/50'
                }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <CardContent className="flex flex-col items-center justify-center py-20 px-8 text-center relative overflow-hidden">
                  {/* Decorative background blur */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                  
                  {isProcessing ? (
                    <div className="flex flex-col items-center animate-pulse">
                      <RefreshCw className="w-16 h-16 text-primary mb-6 animate-spin" />
                      <h3 className="text-xl font-bold mb-2">Parsing Report...</h3>
                      <p className="text-muted-foreground text-sm">Crunching the numbers and organizing data.</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6 ring-1 ring-white/10">
                        <UploadCloud className={`w-10 h-10 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Upload Report</h3>
                      <p className="text-muted-foreground mb-8 max-w-sm">
                        Drag and drop your Meta Ads .xlsx file here, or click to browse your files.
                      </p>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                        accept=".xlsx,.xls,.csv" 
                        className="hidden" 
                      />
                      
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Button
                          size="lg"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full sm:w-auto relative group overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center">
                            <FileSpreadsheet className="w-5 h-5 mr-2" />
                            Select Excel File
                          </span>
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={showSample}
                          className="w-full sm:w-auto border-white/10 hover:bg-white/5"
                        >
                          <FlaskConical className="w-5 h-5 mr-2" />
                          See sample analysis
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-4">
                        {isLoggedIn
                          ? "Logged in · 3 free reports per month"
                          : "No credit card required · Get 3 free reports/month after sign-up"}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {isSampleMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-violet-400" />
                    <span className="text-violet-200">
                      This is sample data. Upload your Meta Ads export to analyze your own account.
                    </span>
                  </div>
                  <Button size="sm" variant="outline" onClick={resetState} className="border-violet-500/30 hover:bg-violet-500/10">
                    Upload your report
                  </Button>
                </motion.div>
              )}

              {/* AI LAYER — briefing on top of the report when toggle is on */}
              {aiEnabled && (
                <AIBriefingCard
                  briefing={buildBriefing(reportData)}
                  onOpenChat={() => setShowChatDrawer(true)}
                />
              )}

              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Total Spend", value: formatCurrency(reportData.summary.totalSpend), icon: BarChart3, color: "text-blue-400", bg: "bg-blue-400/10" },
                  { title: "Total Results", value: formatNumber(reportData.summary.totalResults), icon: Target, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                  { title: "Impressions", value: formatNumber(reportData.summary.totalImpressions), icon: Activity, color: "text-purple-400", bg: "bg-purple-400/10" },
                  { title: "Reach", value: formatNumber(reportData.summary.totalReach), icon: Users, color: "text-amber-400", bg: "bg-amber-400/10" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="hover:border-border/80 transition-colors bg-card/50 backdrop-blur-sm border-white/5">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                          <div className={`p-2 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                          </div>
                        </div>
                        <h4 className="text-3xl font-display font-bold">{stat.value}</h4>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* ===== FULL PERFORMANCE ANALYSIS ===== */}
              {reportData.analysis && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">

                {/* ── 1. EXECUTIVE SUMMARY ───────────────────────────────── */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10"><Trophy className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h2 className="text-lg font-bold">Executive Summary</h2>
                      <p className="text-xs text-muted-foreground">High-level verdict on your campaign performance</p>
                    </div>
                  </div>
                  <Card className="border-white/5 bg-card/50">
                    <CardContent className="p-6">
                      {/* Rating + Profitability row */}
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                              <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" className="text-white/5" strokeWidth="8"/>
                              <circle cx="32" cy="32" r="26" fill="none"
                                stroke={reportData.analysis.verdict === 'excellent' ? '#34d399' : reportData.analysis.verdict === 'good' ? '#60a5fa' : reportData.analysis.verdict === 'fair' ? '#fbbf24' : '#f87171'}
                                strokeWidth="8"
                                strokeDasharray={`${(reportData.analysis.rating / 10) * 163.4} 163.4`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className={`text-lg font-black ${reportData.analysis.verdictColor}`}>{reportData.analysis.rating}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Performance Score</p>
                            <p className={`text-xl font-bold ${reportData.analysis.verdictColor}`}>{reportData.analysis.verdictLabel}</p>
                            <p className="text-xs text-muted-foreground">out of 10</p>
                          </div>
                        </div>
                        <div className="h-12 w-px bg-white/10 hidden sm:block" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Campaign Verdict</p>
                          <Badge className={`text-sm font-bold px-4 py-1.5 border ${
                            reportData.analysis.profitabilityVerdict === 'profitable'     ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            reportData.analysis.profitabilityVerdict === 'break-even'    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                                                                           'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}>
                            {reportData.analysis.profitabilityVerdict === 'profitable' ? '✓ Profitable' :
                             reportData.analysis.profitabilityVerdict === 'break-even' ? '~ Break-Even' : '✗ Underperforming'}
                          </Badge>
                        </div>
                      </div>
                      {/* Top 3 Positives + Issues */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Top 3 Positives
                          </p>
                          <ul className="space-y-2">
                            {reportData.analysis.top3Positives.map((p, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" /> Top 3 Issues
                          </p>
                          <ul className="space-y-2">
                            {reportData.analysis.top3Issues.map((issue, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* ── 2. PERFORMANCE OVERVIEW ────────────────────────────── */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h2 className="text-lg font-bold">Performance Overview</h2>
                      <p className="text-xs text-muted-foreground">Written summary and key diagnosis</p>
                    </div>
                  </div>
                  <Card className="border-white/5 bg-card/50 mb-4">
                    <CardContent className="p-6">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Campaign Summary</h3>
                      <p className="text-base leading-relaxed text-foreground/90">{reportData.analysis.performanceSummary}</p>
                    </CardContent>
                  </Card>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reportData.analysis.insights.map((insight, i) => (
                      <InsightCard key={i} insight={insight} index={i} />
                    ))}
                  </div>
                </div>

                {/* ── 3. CORE METRICS ASSESSMENT ────────────────────────── */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10"><Gauge className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h2 className="text-lg font-bold">Core Metrics Assessment</h2>
                      <p className="text-xs text-muted-foreground">Each metric rated Good / Average / Poor with an explanation</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {reportData.analysis.metricsAssessment.map((m, i) => (
                      <MetricCard key={i} metric={m} index={i} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 italic">Note: CPC, CTR, and ROAS are not available in this export — request a more detailed report from Meta Ads Manager for a complete picture.</p>
                </div>

                {/* ── 4. AUDIENCE INSIGHTS ──────────────────────────────── */}
                <Card className="border-white/5 bg-card/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <CardTitle className="text-base">Audience Insights</CardTitle>
                    </div>
                    <CardDescription>Breakdown of who is engaging with your ads</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm leading-relaxed text-muted-foreground mb-5">{reportData.analysis.audienceSummary}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Primary Age Group</p>
                        <p className="text-2xl font-bold text-primary">{reportData.analysis.primaryAgeGroup}</p>
                        <p className="text-xs text-muted-foreground mt-1">Most leads generated</p>
                      </div>
                      <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Best Value Audience</p>
                        <p className="text-2xl font-bold text-emerald-400">{reportData.analysis.mostEfficientAgeGroup}</p>
                        <p className="text-xs text-muted-foreground mt-1">Lowest cost per lead</p>
                      </div>
                      <div className="rounded-lg bg-purple-500/5 border border-purple-500/10 p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Top Campaign</p>
                        <p className="text-lg font-bold text-purple-400 truncate">{reportData.analysis.topCampaign}</p>
                        <p className="text-xs text-muted-foreground mt-1">Most results delivered</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ── 5. FUNNEL ANALYSIS ────────────────────────────────── */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10"><TrendingDown className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h2 className="text-lg font-bold">Funnel Analysis</h2>
                      <p className="text-xs text-muted-foreground">Where your audience is dropping off in the customer journey</p>
                    </div>
                  </div>
                  <Card className="border-white/5 bg-card/50">
                    <CardContent className="p-6">
                      <FunnelViz stages={reportData.analysis.funnelStages} />
                    </CardContent>
                  </Card>
                </div>

                {/* ── 6. ALERTS & RED FLAGS ─────────────────────────────── */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-red-500/10"><ShieldAlert className="w-5 h-5 text-red-400" /></div>
                    <div>
                      <h2 className="text-lg font-bold">Alerts & Red Flags</h2>
                      <p className="text-xs text-muted-foreground">Issues that need your attention</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {reportData.analysis.alerts.map((alert, i) => (
                      <AlertCard key={i} alert={alert} index={i} />
                    ))}
                  </div>
                </div>

                {/* ── 7. SCALING OPPORTUNITIES ──────────────────────────── */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-500/10"><Rocket className="w-5 h-5 text-emerald-400" /></div>
                    <div>
                      <h2 className="text-lg font-bold">Scaling Opportunities</h2>
                      <p className="text-xs text-muted-foreground">What to increase, duplicate, or pause to grow results</p>
                    </div>
                  </div>
                  <Card className="border-white/5 bg-card/50">
                    <CardContent className="p-6">
                      <ul className="space-y-3">
                        {reportData.analysis.scalingOpportunities.map((opp, i) => (
                          <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                            className="flex items-start gap-3 text-sm text-muted-foreground">
                            <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 text-xs font-bold">{i + 1}</span>
                            {opp}
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* ── 8. TESTING SUGGESTIONS ────────────────────────────── */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/10"><FlaskConical className="w-5 h-5 text-blue-400" /></div>
                    <div>
                      <h2 className="text-lg font-bold">Testing Suggestions</h2>
                      <p className="text-xs text-muted-foreground">Experiments to improve performance over time</p>
                    </div>
                  </div>
                  <Card className="border-white/5 bg-card/50">
                    <CardContent className="p-6">
                      <ul className="space-y-3">
                        {reportData.analysis.testingSuggestions.map((sug, i) => (
                          <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                            className="flex items-start gap-3 text-sm text-muted-foreground">
                            <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400 text-xs font-bold">{i + 1}</span>
                            {sug}
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* ── 9. OPTIMISATION RECOMMENDATIONS ──────────────────── */}
                <Card className="border-white/5 bg-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <CardTitle className="text-base">Optimisation Recommendations</CardTitle>
                    </div>
                    <CardDescription>Clear, actionable next steps to improve your campaigns</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {reportData.analysis.recommendations.map((rec, i) => (
                        <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 text-xs font-bold">{i + 1}</span>
                          {rec}
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

              </motion.div>
              )}

              {/* GRID: CAMPAIGN & AGE BREAKDOWN */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CAMPAIGN BREAKDOWN */}
                <Card className="flex flex-col border-white/5 bg-card/50">
                  <CardHeader>
                    <CardTitle>Campaign Breakdown</CardTitle>
                    <CardDescription>Performance aggregated by campaign</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[40%]">Campaign</TableHead>
                          <TableHead className="text-right">Spend</TableHead>
                          <TableHead className="text-right">Results</TableHead>
                          <TableHead className="text-right">Cost/Res</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.byCampaign.map((campaign) => (
                          <TableRow key={campaign.name}>
                            <TableCell className="font-medium">
                              <span className="truncate block max-w-[200px]" title={campaign.name}>
                                {campaign.name}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(campaign.Spend)}</TableCell>
                            <TableCell className="text-right font-semibold text-primary">{formatNumber(campaign.Results)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatCurrency(campaign.CostPerResult)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {reportData.byCampaign.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No campaign data found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* AGE BREAKDOWN */}
                <Card className="flex flex-col border-white/5 bg-card/50">
                  <CardHeader>
                    <CardTitle>Demographics (Age)</CardTitle>
                    <CardDescription>Performance sorted by total results</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Age Group</TableHead>
                          <TableHead className="text-right">Spend</TableHead>
                          <TableHead className="text-right">Results</TableHead>
                          <TableHead className="text-right">Cost/Res</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.byAge.map((age) => (
                          <TableRow key={age.name}>
                            <TableCell>
                              <Badge variant="outline" className="font-mono bg-background/50">{age.name}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(age.Spend)}</TableCell>
                            <TableCell className="text-right font-semibold text-emerald-400">{formatNumber(age.Results)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatCurrency(age.CostPerResult)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* FULL SIMPLIFIED TABLE */}
              <Card className="border-white/5 bg-card/50 overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Simplified Raw Data</CardTitle>
                    <CardDescription>Cleaned up columns ready for export</CardDescription>
                  </div>
                  <Button variant="secondary" onClick={() => exportToCSV(reportData.simplifiedData)}>
                    <Download className="w-4 h-4 mr-2" /> Download CSV
                  </Button>
                </CardHeader>
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader className="bg-muted/20">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="min-w-[200px]">Campaign</TableHead>
                        <TableHead className="min-w-[150px]">Ad Set</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead className="text-right">Reach</TableHead>
                        <TableHead className="text-right">Impressions</TableHead>
                        <TableHead className="text-right font-semibold text-primary">Results</TableHead>
                        <TableHead className="text-right">Spend</TableHead>
                        <TableHead className="text-right">Cost/Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.simplifiedData.slice(0, 50).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium truncate max-w-[200px]" title={row.Campaign}>
                            {row.Campaign}
                          </TableCell>
                          <TableCell className="truncate max-w-[150px]" title={row.AdSet}>{row.AdSet}</TableCell>
                          <TableCell><Badge variant="secondary" className="font-mono text-[10px]">{row.Age}</Badge></TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatNumber(row.Reach)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatNumber(row.Impressions)}</TableCell>
                          <TableCell className="text-right font-bold text-primary">{formatNumber(row.Results)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(row.Spend)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(row.CostPerResult)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {reportData.simplifiedData.length > 50 && (
                  <div className="p-4 text-center border-t border-border/50 text-sm text-muted-foreground bg-muted/10 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Showing first 50 rows. Download CSV to see all {reportData.simplifiedData.length} rows.
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Upgrade modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeModal
            onClose={() => setShowUpgradeModal(false)}
            onViewPricing={() => { setShowUpgradeModal(false); navigate("/pricing"); }}
          />
        )}
      </AnimatePresence>

      {/* Floating AI orb — visible on dashboard view when AI layer is on */}
      {aiEnabled && reportData && (
        <div className="fixed bottom-6 right-6 z-30">
          <div className="flex items-center gap-2 rounded-full bg-[#0d1117]/90 backdrop-blur-lg border border-white/10 pr-4 pl-1 py-1 shadow-[0_0_40px_-10px_rgba(139,92,246,0.4)]">
            <AIOrb size="md" onClick={() => setShowChatDrawer(true)} />
            <span className="text-xs font-semibold text-foreground/80 hidden sm:inline">
              Ask the AI
            </span>
          </div>
        </div>
      )}

      {/* AI chat drawer */}
      {reportData && (
        <AIChatDrawer
          open={showChatDrawer}
          onClose={() => setShowChatDrawer(false)}
          report={reportData}
          briefing={buildBriefing(reportData)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground/50">
          <span>© {new Date().getFullYear()} AdClarity</span>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/legal")} className="hover:text-muted-foreground transition-colors">Privacy Policy</button>
            <button onClick={() => navigate("/legal")} className="hover:text-muted-foreground transition-colors">Terms of Service</button>
            <button onClick={() => navigate("/legal")} className="hover:text-muted-foreground transition-colors">Disclaimer</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

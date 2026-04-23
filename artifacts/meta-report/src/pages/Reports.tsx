import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Activity,
  ChevronLeft,
  FileSpreadsheet,
  Trash2,
  Calendar,
  TrendingUp,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import type { ParsedReport } from "@/lib/excel-parser";
import { formatCurrency, formatNumber } from "@/lib/utils";

type ReportRow = {
  id: string;
  filename: string | null;
  date_range: string | null;
  uploaded_at: string;
  summary: ParsedReport["summary"] | null;
  analysis: ParsedReport | null;
};

export default function Reports() {
  const [, navigate] = useLocation();
  const { isLoaded, isLoggedIn, session } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoaded, isLoggedIn, navigate]);

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from("reports")
      .select("id, filename, date_range, uploaded_at, summary, analysis")
      .order("uploaded_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast({
            title: "Couldn't load history",
            description: error.message,
            variant: "destructive",
          });
          setRows([]);
          return;
        }
        setRows((data ?? []) as unknown as ReportRow[]);
      });
  }, [session, toast]);

  const openReport = (row: ReportRow) => {
    if (!row.analysis) {
      toast({
        title: "Report is empty",
        description: "This entry was saved before we started persisting full data.",
        variant: "destructive",
      });
      return;
    }
    sessionStorage.setItem("adclarity_view_report", JSON.stringify(row.analysis));
    navigate("/");
  };

  const deleteReport = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("reports").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((prev) => (prev ?? []).filter((r) => r.id !== id));
  };

  if (!isLoaded || rows === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_-3px_rgba(24,119,242,0.5)]">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight hidden sm:block">AdClarity</h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl font-display font-bold mb-2">Report history</h2>
          <p className="text-muted-foreground mb-10">
            Every report you've uploaded. Click any row to reopen the analysis.
          </p>

          {rows.length === 0 ? (
            <Card className="border-dashed border-white/10 bg-card/40">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-1">No reports yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload your first Meta Ads export to start your history.
                </p>
                <Button onClick={() => navigate("/")}>Upload a report</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => {
                const spend = row.summary?.totalSpend;
                const results = row.summary?.totalResults;
                return (
                  <Card
                    key={row.id}
                    className="group border-white/8 bg-card hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => openReport(row)}
                  >
                    <CardContent className="flex flex-wrap items-center gap-4 p-5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{row.filename ?? "Untitled report"}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                          {row.date_range && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {row.date_range}
                            </span>
                          )}
                          <span>Uploaded {new Date(row.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {spend !== undefined && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="w-3 h-3" />
                          {formatCurrency(spend)} spend
                        </div>
                      )}
                      {results !== undefined && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                          <Target className="w-3 h-3" />
                          {formatNumber(results)} results
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground/60 hover:text-red-400 hover:bg-red-500/10"
                        disabled={deletingId === row.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteReport(row.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

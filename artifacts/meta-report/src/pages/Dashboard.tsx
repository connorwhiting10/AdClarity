import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  BarChart3, 
  Activity, 
  Users, 
  Target,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { 
  parseMetaReport, 
  exportToCSV, 
  type ParsedReport 
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

export default function Dashboard() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportData, setReportData] = useState<ParsedReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload an Excel (.xlsx) file exported from Meta Ads.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const parsed = await parseMetaReport(file);
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

  const resetState = () => setReportData(null);

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
              MetaAds Simplifier
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {reportData && (
              <>
                <Badge variant="outline" className="hidden md:inline-flex bg-background/50 border-border">
                  Period: {reportData.dateRange}
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
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Decorative AI Background Image Element */}
              <div className="mt-16 w-full max-w-4xl opacity-40 mix-blend-screen pointer-events-none">
                <img 
                  src={`${import.meta.env.BASE_URL}images/hero-abstract.png`} 
                  alt="Abstract background" 
                  className="w-full h-auto object-cover rounded-3xl"
                />
              </div>

            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
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
    </div>
  );
}

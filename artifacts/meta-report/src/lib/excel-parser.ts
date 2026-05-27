import * as XLSX from 'xlsx';
import { unparse } from 'papaparse';
import { cleanCampaignName } from './utils';

export interface MetaReportRow {
  "Campaign name": string;
  "Ad set name": string;
  "Age": string;
  "Month": string;
  "Delivery status": string;
  "Delivery level": string;
  "Reach": string | number;
  "Impressions": string | number;
  "Frequency": string | number;
  "Attribution setting": string;
  "Result Type": string;
  "Results": string | number;
  "Amount spent (ZAR)": string | number;
  "Cost per result": string | number;
  "Starts": string;
  "Ends": string;
  "Reporting starts": string;
  "Reporting ends": string;
}

export interface SimplifiedRow {
  Campaign: string;
  AdSet: string;
  Age: string;
  Reach: number;
  Impressions: number;
  Results: number;
  Spend: number;
  CostPerResult: number;
}

export interface MetricSummary {
  name: string;
  Reach: number;
  Impressions: number;
  Results: number;
  Spend: number;
  CostPerResult: number;
}

export interface AnalysisInsight {
  type: 'positive' | 'warning' | 'info';
  title: string;
  body: string;
}

export interface MetricAssessment {
  name: string;
  value: string;
  rating: 'good' | 'average' | 'poor';
  explanation: string;
}

export interface FunnelStage {
  label: string;
  count: number;
  pctFromPrev?: number;
  note: string;
}

export interface Alert {
  severity: 'high' | 'medium' | 'low';
  title: string;
  text: string;
}

export interface ReportAnalysis {
  // Executive Summary
  rating: number;
  profitabilityVerdict: 'profitable' | 'break-even' | 'underperforming';
  top3Positives: string[];
  top3Issues: string[];

  // Verdict (existing)
  verdict: 'excellent' | 'good' | 'fair' | 'poor';
  verdictLabel: string;
  verdictColor: string;

  // Written summaries
  performanceSummary: string;
  audienceSummary: string;

  // Automated insights
  insights: AnalysisInsight[];

  // Core metrics
  metricsAssessment: MetricAssessment[];

  // Funnel
  funnelStages: FunnelStage[];

  // Audience
  primaryAgeGroup: string;
  mostEfficientAgeGroup: string;
  topCampaign: string;

  // Alerts
  alerts: Alert[];

  // Scaling & testing
  scalingOpportunities: string[];
  testingSuggestions: string[];

  // Existing recommendations
  recommendations: string[];
}

export interface ParsedReport {
  simplifiedData: SimplifiedRow[];
  summary: {
    totalSpend: number;
    totalResults: number;
    totalImpressions: number;
    totalReach: number;
  };
  byCampaign: MetricSummary[];
  byAge: MetricSummary[];
  dateRange: string;
  analysis: ReportAnalysis;
}

export function generateAnalysis(
  summary: ParsedReport['summary'],
  byCampaign: MetricSummary[],
  byAge: MetricSummary[],
  dateRange: string
): ReportAnalysis {
  const { totalSpend, totalResults, totalImpressions, totalReach } = summary;
  const overallCPR = totalResults > 0 ? totalSpend / totalResults : 0;
  const avgFrequency = totalReach > 0 ? totalImpressions / totalReach : 0;
  const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const reachToResultRate = totalReach > 0 ? (totalResults / totalReach) * 100 : 0;
  const impressionToResultRate = totalImpressions > 0 ? (totalResults / totalImpressions) * 100 : 0;

  const topAgeByResults = byAge.filter(a => a.name !== 'Unknown').sort((a, b) => b.Results - a.Results)[0];
  const topAgeByEfficiency = byAge.filter(a => a.name !== 'Unknown' && a.Results > 0).sort((a, b) => a.CostPerResult - b.CostPerResult)[0];
  const worstAgeByEfficiency = byAge.filter(a => a.name !== 'Unknown' && a.Results > 0).sort((a, b) => b.CostPerResult - a.CostPerResult)[0];
  const sortedCampaigns = [...byCampaign].sort((a, b) => b.Results - a.Results);
  const topCampaign = sortedCampaigns[0];
  const secondCampaign = sortedCampaigns[1];
  const bestCPRCampaign = [...byCampaign].filter(c => c.Results > 0).sort((a, b) => a.CostPerResult - b.CostPerResult)[0];

  // ── VERDICT (CPR benchmarks for lead gen in ZAR) ──────────────────────────
  let verdict: ReportAnalysis['verdict'];
  let verdictLabel: string;
  let verdictColor: string;
  if (overallCPR < 50) {
    verdict = 'excellent'; verdictLabel = 'Excellent'; verdictColor = 'text-emerald-400';
  } else if (overallCPR < 80) {
    verdict = 'good'; verdictLabel = 'Good'; verdictColor = 'text-blue-400';
  } else if (overallCPR < 120) {
    verdict = 'fair'; verdictLabel = 'Fair'; verdictColor = 'text-amber-400';
  } else {
    verdict = 'poor'; verdictLabel = 'Needs Attention'; verdictColor = 'text-red-400';
  }

  // ── RATING (out of 10) ────────────────────────────────────────────────────
  let rating = 5;
  if (overallCPR < 40) rating += 2.5;
  else if (overallCPR < 60) rating += 1.5;
  else if (overallCPR < 80) rating += 0.5;
  else if (overallCPR > 120) rating -= 2;
  if (avgFrequency < 2.5) rating += 0.5;
  else if (avgFrequency > 3.5) rating -= 1;
  if (totalResults > 100) rating += 1;
  if (reachToResultRate > 0.15) rating += 0.5;
  rating = Math.min(10, Math.max(1, Math.round(rating * 10) / 10));

  // ── PROFITABILITY VERDICT ─────────────────────────────────────────────────
  const profitabilityVerdict: ReportAnalysis['profitabilityVerdict'] =
    overallCPR < 70 ? 'profitable' : overallCPR < 120 ? 'break-even' : 'underperforming';

  // ── TOP 3 POSITIVES ───────────────────────────────────────────────────────
  const top3Positives: string[] = [];
  if (overallCPR < 80) top3Positives.push(`Strong cost efficiency — generating leads at R${overallCPR.toFixed(2)} each`);
  if (totalResults > 50) top3Positives.push(`Solid lead volume — ${totalResults} leads generated in the reporting period`);
  if (avgFrequency < 2.5) top3Positives.push(`Healthy ad frequency (${avgFrequency.toFixed(1)}) — no signs of audience fatigue`);
  if (topAgeByEfficiency) top3Positives.push(`${topAgeByEfficiency.name} age group converting at just R${topAgeByEfficiency.CostPerResult.toFixed(2)} per lead`);
  if (byCampaign.length > 1 && topCampaign) top3Positives.push(`"${topCampaign.name}" campaign is a strong performer with ${topCampaign.Results} leads`);
  top3Positives.splice(3);
  while (top3Positives.length < 3) top3Positives.push('Campaigns are actively delivering results and reaching new audiences.');

  // ── TOP 3 ISSUES ──────────────────────────────────────────────────────────
  const top3Issues: string[] = [];
  if (overallCPR > 80) top3Issues.push(`Cost per lead (R${overallCPR.toFixed(2)}) is above the ideal target — efficiency can be improved`);
  if (avgFrequency > 3) top3Issues.push(`High frequency (${avgFrequency.toFixed(1)}) — audiences are seeing the same ads too often`);
  if (worstAgeByEfficiency && worstAgeByEfficiency.CostPerResult > overallCPR * 1.5) {
    top3Issues.push(`${worstAgeByEfficiency.name} age group has a high cost per lead at R${worstAgeByEfficiency.CostPerResult.toFixed(2)}`);
  }
  if (byCampaign.length >= 2 && secondCampaign && topCampaign && (topCampaign.Results / Math.max(1, secondCampaign.Results)) > 2) {
    top3Issues.push(`Budget imbalance — one campaign is significantly outperforming the other`);
  }
  top3Issues.push('No CPC/CTR data available — creative performance cannot be fully assessed from this export');
  top3Issues.splice(3);

  // ── AUTOMATED INSIGHTS ────────────────────────────────────────────────────
  const insights: AnalysisInsight[] = [];

  if (verdict === 'excellent' || verdict === 'good') {
    insights.push({ type: 'positive', title: 'Cost Per Lead is Healthy',
      body: `Your average cost per lead is R${overallCPR.toFixed(2)}, which is ${verdict === 'excellent' ? 'well below' : 'below'} the typical benchmark for lead generation campaigns in this sector. The budget is being used efficiently.`
    });
  } else {
    insights.push({ type: 'warning', title: 'Cost Per Lead Needs Improvement',
      body: `Your average cost per lead is R${overallCPR.toFixed(2)}. This is above the ideal target — consider refreshing ad creative or tightening audience targeting to bring this down.`
    });
  }

  if (avgFrequency > 3) {
    insights.push({ type: 'warning', title: 'Audience Fatigue Risk',
      body: `Frequency is ${avgFrequency.toFixed(1)} — people are seeing your ads more than 3 times on average. This causes banner blindness and rising costs. Broaden your audience or rotate creatives.`
    });
  } else {
    insights.push({ type: 'positive', title: 'Frequency is Under Control',
      body: `At ${avgFrequency.toFixed(1)}, your audience isn't being over-exposed to the ads. This is healthy and suggests your reach strategy is working well.`
    });
  }

  if (byCampaign.length >= 2 && topCampaign && secondCampaign) {
    const leader = topCampaign.Results >= secondCampaign.Results ? topCampaign : secondCampaign;
    const laggard = leader === topCampaign ? secondCampaign : topCampaign;
    insights.push({ type: 'info', title: 'Campaign Performance Gap',
      body: `"${leader.name}" is delivering ${leader.Results} leads vs "${laggard.name}" with ${laggard.Results}. The leading campaign also has a lower cost per result (R${leader.CostPerResult.toFixed(2)} vs R${laggard.CostPerResult.toFixed(2)}). Budget reallocation toward the leader could improve overall ROI.`
    });
  }

  if (topAgeByEfficiency) {
    insights.push({ type: 'positive', title: `Best-Value Audience: ${topAgeByEfficiency.name}`,
      body: `The ${topAgeByEfficiency.name} age group delivers leads at R${topAgeByEfficiency.CostPerResult.toFixed(2)} each — your most efficient segment. Increasing budget here would likely generate more leads for less spend.`
    });
  }

  insights.push({ type: reachToResultRate > 0.15 ? 'positive' : 'info', title: 'Reach-to-Lead Conversion',
    body: `Of the ${totalReach.toLocaleString()} unique people reached, ${totalResults} converted into leads (${reachToResultRate.toFixed(2)}%). ${reachToResultRate > 0.15 ? 'This is a solid conversion rate from reach.' : 'Improving ad relevance or refining targeting could convert more of your reached audience into actual leads.'}`
  });

  // ── CORE METRICS ASSESSMENT ───────────────────────────────────────────────
  const metricsAssessment: MetricAssessment[] = [];

  metricsAssessment.push({
    name: 'Cost Per Result (CPR)',
    value: `R${overallCPR.toFixed(2)}`,
    rating: overallCPR < 60 ? 'good' : overallCPR < 100 ? 'average' : 'poor',
    explanation: overallCPR < 60
      ? 'Excellent — you are generating leads at a very competitive rate. Keep the current strategy running.'
      : overallCPR < 100
      ? 'Reasonable, but there is room to improve. Small creative or targeting tweaks could push this down further.'
      : 'Above target — this level of cost per lead makes profitability harder. Prioritise reducing this before scaling.'
  });

  metricsAssessment.push({
    name: 'CPM (Cost per 1,000 Impressions)',
    value: `R${cpm.toFixed(2)}`,
    rating: cpm < 50 ? 'good' : cpm < 120 ? 'average' : 'poor',
    explanation: cpm < 50
      ? 'Low CPM — your ads are reaching people at a great price. The targeting and auction dynamics are in your favour.'
      : cpm < 120
      ? 'Moderate CPM — within acceptable range. Monitor whether rising CPM is affecting your overall cost per result.'
      : 'High CPM — you are paying a lot to get seen. This often signals a narrow or competitive audience. Consider broadening your targeting.'
  });

  metricsAssessment.push({
    name: 'Frequency',
    value: avgFrequency.toFixed(2),
    rating: avgFrequency < 2 ? 'good' : avgFrequency < 3 ? 'average' : 'poor',
    explanation: avgFrequency < 2
      ? 'Great — your audience is seeing the ad at a healthy rate without oversaturation.'
      : avgFrequency < 3
      ? 'Acceptable — getting close to where ad fatigue can start. Worth monitoring.'
      : 'High frequency — your audience has seen this ad too many times. Expect rising costs and declining results if not addressed.'
  });

  metricsAssessment.push({
    name: 'Impression-to-Lead Rate',
    value: `${impressionToResultRate.toFixed(3)}%`,
    rating: impressionToResultRate > 0.1 ? 'good' : impressionToResultRate > 0.05 ? 'average' : 'poor',
    explanation: impressionToResultRate > 0.1
      ? 'Strong — a good proportion of people who see your ad are converting. The offer and creative are resonating well.'
      : impressionToResultRate > 0.05
      ? 'Moderate — your ads are generating some conversions but there is room to improve the quality of your creative or offer.'
      : 'Low — most people who see the ad are not converting. This could indicate a mismatch between the ad and what users find on the landing page.'
  });

  // ── FUNNEL ANALYSIS ───────────────────────────────────────────────────────
  const funnelStages: FunnelStage[] = [
    {
      label: 'Impressions Delivered',
      count: totalImpressions,
      note: 'Total number of times your ads were shown to users on Facebook and Instagram.'
    },
    {
      label: 'Unique People Reached',
      count: totalReach,
      pctFromPrev: totalImpressions > 0 ? (totalReach / totalImpressions) * 100 : 0,
      note: `Each person saw the ad an average of ${avgFrequency.toFixed(1)} times. ${avgFrequency > 3 ? 'This high repeat exposure suggests the audience pool is too small.' : 'Frequency is healthy.'}`
    },
    {
      label: 'Leads Converted',
      count: totalResults,
      pctFromPrev: totalReach > 0 ? (totalResults / totalReach) * 100 : 0,
      note: `${reachToResultRate.toFixed(2)}% of reached people converted. ${reachToResultRate < 0.1 ? 'This drop-off suggests the ad creative, offer, or landing page may need improvement.' : 'This is a solid conversion rate from reach to lead.'}`
    }
  ];

  // ── ALERTS & RED FLAGS ────────────────────────────────────────────────────
  const alerts: Alert[] = [];

  if (avgFrequency > 3.5) {
    alerts.push({ severity: 'high', title: 'Ad Fatigue Detected',
      text: `Frequency has reached ${avgFrequency.toFixed(1)}. Your audience is being over-exposed to the same ads. Expect costs to rise and results to decline if not addressed immediately.`
    });
  } else if (avgFrequency > 2.5) {
    alerts.push({ severity: 'medium', title: 'Frequency Approaching Danger Zone',
      text: `Frequency is at ${avgFrequency.toFixed(1)} — approaching the threshold where ad fatigue becomes a problem. Start planning creative refreshes or audience expansion.`
    });
  }

  if (overallCPR > 100) {
    alerts.push({ severity: 'high', title: 'High Cost Per Lead',
      text: `At R${overallCPR.toFixed(2)} per lead, profitability is at risk. This needs to be addressed before increasing ad spend.`
    });
  } else if (overallCPR > 70) {
    alerts.push({ severity: 'medium', title: 'Cost Per Lead Above Target',
      text: `R${overallCPR.toFixed(2)} per lead is manageable but not ideal. Small optimisations in targeting or creative could bring this down meaningfully.`
    });
  }

  if (worstAgeByEfficiency && worstAgeByEfficiency.CostPerResult > overallCPR * 1.8 && worstAgeByEfficiency.Spend > totalSpend * 0.1) {
    alerts.push({ severity: 'medium', title: `Underperforming Age Segment: ${worstAgeByEfficiency.name}`,
      text: `The ${worstAgeByEfficiency.name} group is costing R${worstAgeByEfficiency.CostPerResult.toFixed(2)} per lead — significantly above your average. Consider reducing spend on this segment.`
    });
  }

  if (byCampaign.length >= 2 && secondCampaign && secondCampaign.Results === 0) {
    alerts.push({ severity: 'high', title: 'Campaign Generating No Results',
      text: `"${secondCampaign.name}" has spent budget but generated zero results. This campaign should be paused and investigated immediately.`
    });
  }

  if (alerts.length === 0) {
    alerts.push({ severity: 'low', title: 'No Critical Issues Detected',
      text: 'Your campaigns are running without any major red flags. Continue monitoring performance regularly to catch any changes early.'
    });
  }

  // ── AUDIENCE SUMMARY ──────────────────────────────────────────────────────
  const topAgeRows = byAge.filter(a => a.name !== 'Unknown' && a.Results > 0).slice(0, 3);
  const hasAgeBreakdown = topAgeRows.length > 0;
  const topAgesFormatted = topAgeRows.map(a => `${a.name} (${a.Results} leads)`).join(', ');

  const audienceSummary = hasAgeBreakdown
    ? `Your ads are reaching people across multiple age groups. The strongest response is coming from the ${topAgeByResults!.name} bracket, which is generating the most leads overall. Top age groups by lead volume: ${topAgesFormatted}.${topAgeByEfficiency ? ` The most cost-efficient conversions are happening with the ${topAgeByEfficiency.name} group at R${topAgeByEfficiency.CostPerResult.toFixed(2)} per lead — your best-value audience.` : ''}`
    : `This export does not include an age breakdown, so a demographic analysis is not available. Re-export the report from Meta Ads Manager with "Age" added as a breakdown to enable audience insights.`;

  // ── SCALING OPPORTUNITIES ─────────────────────────────────────────────────
  const scalingOpportunities: string[] = [];
  if (bestCPRCampaign) {
    scalingOpportunities.push(`Scale up "${bestCPRCampaign.name}" — it has the best cost per result (R${bestCPRCampaign.CostPerResult.toFixed(2)}) and should receive a higher share of budget.`);
  }
  if (topAgeByEfficiency) {
    scalingOpportunities.push(`Increase budget allocation for the ${topAgeByEfficiency.name} age group — your most efficient audience segment at R${topAgeByEfficiency.CostPerResult.toFixed(2)} per lead.`);
  }
  scalingOpportunities.push('Duplicate your best-performing ad set into a new campaign with a Lookalike Audience built from past converters — this often delivers similar or better results at scale.');
  scalingOpportunities.push('If ROAS data is available on specific campaigns, prioritise scaling those campaigns first before touching others.');
  if (worstAgeByEfficiency && worstAgeByEfficiency.CostPerResult > overallCPR * 1.5) {
    scalingOpportunities.push(`Reduce or pause spend on the ${worstAgeByEfficiency.name} age group — reallocate that budget to your top-performing segments instead.`);
  }

  // ── TESTING SUGGESTIONS ───────────────────────────────────────────────────
  const testingSuggestions: string[] = [
    'Test a video creative vs. your current static image — video ads typically achieve lower CPM and higher engagement on Meta.',
    'Run a carousel ad showcasing multiple product benefits or testimonials — these often perform well for health-related products.',
    `Create a dedicated ad set targeting only the ${topAgeByEfficiency?.name ?? '35-44'} age group with messaging tailored to their life stage and health priorities.`,
    'Test two different headline variations using the same visual — this isolates whether the copy or the image is driving results.',
    'A/B test your landing page with a shorter form (e.g. just name + phone number) to reduce friction and improve the lead conversion rate.',
    'Experiment with a retargeting campaign targeting users who visited your website but did not submit a lead — these warm audiences typically convert at 2-3x the rate of cold audiences.',
    'Test an interest-based audience alongside your current broad targeting to see which delivers better quality leads.'
  ];

  // ── RECOMMENDATIONS ───────────────────────────────────────────────────────
  const recommendations: string[] = [];
  if (overallCPR > 60) recommendations.push('Refresh your ad creative — new visuals or a stronger, benefit-focused headline can meaningfully reduce your cost per lead.');
  if (avgFrequency > 2.5) recommendations.push('Broaden your audience or add Lookalike Audiences to prevent the same people from seeing your ads repeatedly.');
  if (topAgeByEfficiency && topAgeByEfficiency.name !== topAgeByResults?.name) {
    recommendations.push(`Shift more budget toward the ${topAgeByEfficiency.name} age group — they convert at the lowest cost per lead and represent your best ROI opportunity.`);
  }
  if (byCampaign.length >= 2 && bestCPRCampaign) {
    recommendations.push(`Reallocate budget toward "${bestCPRCampaign.name}" — it has a lower cost per result than the other campaign(s) and should be prioritised.`);
  }
  recommendations.push('Review your landing page experience — ensure it loads fast, matches the promise in your ad, and has a simple, clear form above the fold.');
  recommendations.push('Set up a Meta Pixel retargeting audience for website visitors — this lets you follow up with people who showed interest but did not convert.');

  // ── PERFORMANCE SUMMARY ───────────────────────────────────────────────────
  const performanceSummary = `During ${dateRange}, your Meta Ads campaigns generated ${totalResults} leads at a total spend of R${totalSpend.toFixed(2)}, averaging R${overallCPR.toFixed(2)} per lead. The campaigns reached ${totalReach.toLocaleString()} unique people with ${totalImpressions.toLocaleString()} impressions. Overall, the campaign is performing ${verdictLabel.toLowerCase()} — ${verdict === 'excellent' || verdict === 'good' ? 'lead costs are well-controlled and the ads are delivering results at a sustainable rate' : 'there are opportunities to improve efficiency and reduce the cost per lead with targeted adjustments'}.`;

  return {
    rating,
    profitabilityVerdict,
    top3Positives,
    top3Issues,
    verdict,
    verdictLabel,
    verdictColor,
    performanceSummary,
    insights,
    metricsAssessment,
    funnelStages,
    audienceSummary,
    primaryAgeGroup: topAgeByResults?.name ?? 'N/A',
    mostEfficientAgeGroup: topAgeByEfficiency?.name ?? 'N/A',
    topCampaign: topCampaign?.name ?? 'N/A',
    alerts,
    scalingOpportunities,
    testingSuggestions,
    recommendations
  };
}

export async function parseMetaReport(file: File): Promise<ParsedReport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Find the correct sheet, default to first if "Raw Data Report" isn't found
        const sheetName = workbook.SheetNames.includes("Raw Data Report") 
          ? "Raw Data Report" 
          : workbook.SheetNames[0];
          
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json<MetaReportRow>(sheet, { defval: '' });

        if (!rawData || rawData.length === 0) {
          throw new Error("No data found in the Excel file");
        }

        // Determine Date Range from first row
        const firstRow = rawData[0];
        const dateRange = firstRow["Reporting starts"] && firstRow["Reporting ends"] 
          ? `${firstRow["Reporting starts"]} to ${firstRow["Reporting ends"]}`
          : "All Time";

        const simplifiedData: SimplifiedRow[] = [];

        // Reach is unique users per row — non-additive across time periods (weeks/months).
        // Aggregate by audience unit (campaign|adset|age) first: SUM additive metrics across
        // time-series rows, MAX reach (conservative lower bound for unique users in that unit).
        // Totals and group summaries are then built from these unit aggregates.
        type Unit = { campaign: string; adSet: string; age: string;
          reachMax: number; impressions: number; results: number; spend: number };
        const unitMap = new Map<string, Unit>();

        rawData.forEach(row => {
          const reach = Number(row["Reach"]) || 0;
          const impressions = Number(row["Impressions"]) || 0;
          const results = Number(row["Results"]) || 0;
          const spend = Number(row["Amount spent (ZAR)"]) || 0;

          if (!row["Campaign name"] && spend === 0 && impressions === 0) return;

          const cleanName = cleanCampaignName(row["Campaign name"]);
          const adSet = row["Ad set name"] || "Unknown";
          const age = row["Age"] || "Unknown";

          simplifiedData.push({
            Campaign: cleanName,
            AdSet: adSet,
            Age: age,
            Reach: reach,
            Impressions: impressions,
            Results: results,
            Spend: spend,
            CostPerResult: results > 0 ? spend / results : 0
          });

          const unitKey = `${cleanName}||${adSet}||${age}`;
          const u = unitMap.get(unitKey);
          if (u) {
            u.reachMax = Math.max(u.reachMax, reach);
            u.impressions += impressions;
            u.results += results;
            u.spend += spend;
          } else {
            unitMap.set(unitKey, { campaign: cleanName, adSet, age,
              reachMax: reach, impressions, results, spend });
          }
        });

        let totalSpend = 0;
        let totalResults = 0;
        let totalImpressions = 0;
        let totalReach = 0;
        const campaignMap = new Map<string, MetricSummary>();
        const ageMap = new Map<string, MetricSummary>();

        unitMap.forEach(u => {
          totalSpend += u.spend;
          totalResults += u.results;
          totalImpressions += u.impressions;
          totalReach += u.reachMax;

          const cData = campaignMap.get(u.campaign) ??
            { name: u.campaign, Reach: 0, Impressions: 0, Results: 0, Spend: 0, CostPerResult: 0 };
          cData.Reach += u.reachMax;
          cData.Impressions += u.impressions;
          cData.Results += u.results;
          cData.Spend += u.spend;
          cData.CostPerResult = cData.Results > 0 ? cData.Spend / cData.Results : 0;
          campaignMap.set(u.campaign, cData);

          const aData = ageMap.get(u.age) ??
            { name: u.age, Reach: 0, Impressions: 0, Results: 0, Spend: 0, CostPerResult: 0 };
          aData.Reach += u.reachMax;
          aData.Impressions += u.impressions;
          aData.Results += u.results;
          aData.Spend += u.spend;
          aData.CostPerResult = aData.Results > 0 ? aData.Spend / aData.Results : 0;
          ageMap.set(u.age, aData);
        });

        // Sort byCampaign by Results desc so table order matches analysis.topCampaign.
        const byCampaign = Array.from(campaignMap.values()).sort((a, b) => b.Results - a.Results);
        const byAge = Array.from(ageMap.values()).sort((a, b) => b.Results - a.Results);

        const parsedSummary = { totalSpend, totalResults, totalImpressions, totalReach };
        const analysis = generateAnalysis(parsedSummary, byCampaign, byAge, dateRange);

        resolve({
          simplifiedData,
          summary: parsedSummary,
          byCampaign,
          byAge,
          dateRange,
          analysis
        });
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Failed to parse Excel file"));
      }
    };

    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsBinaryString(file);
  });
}

export function exportToCSV(data: SimplifiedRow[], filename = "simplified-meta-report.csv") {
  const csv = unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

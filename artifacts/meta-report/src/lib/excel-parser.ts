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

export interface ReportAnalysis {
  verdict: 'excellent' | 'good' | 'fair' | 'poor';
  verdictLabel: string;
  verdictColor: string;
  performanceSummary: string;
  insights: AnalysisInsight[];
  audienceSummary: string;
  primaryAgeGroup: string;
  mostEfficientAgeGroup: string;
  topCampaign: string;
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

function generateAnalysis(
  summary: ParsedReport['summary'],
  byCampaign: MetricSummary[],
  byAge: MetricSummary[],
  dateRange: string
): ReportAnalysis {
  const { totalSpend, totalResults, totalImpressions, totalReach } = summary;
  const overallCPR = totalResults > 0 ? totalSpend / totalResults : 0;
  const avgFrequency = totalReach > 0 ? totalImpressions / totalReach : 0;

  // Determine performance verdict based on CPR for lead gen (ZAR)
  // <R50 = excellent, <R80 = good, <R120 = fair, >R120 = poor
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

  const topAgeByResults = byAge.filter(a => a.name !== 'Unknown').sort((a, b) => b.Results - a.Results)[0];
  const topAgeByEfficiency = byAge.filter(a => a.name !== 'Unknown' && a.Results > 0).sort((a, b) => a.CostPerResult - b.CostPerResult)[0];
  const topCampaign = byCampaign.sort((a, b) => b.Results - a.Results)[0];
  const secondCampaign = byCampaign[1];

  const insights: AnalysisInsight[] = [];

  // Performance verdict insight
  if (verdict === 'excellent' || verdict === 'good') {
    insights.push({
      type: 'positive',
      title: 'Cost Per Result is Healthy',
      body: `Your average cost per lead is R${overallCPR.toFixed(2)}, which is ${verdict === 'excellent' ? 'well below' : 'below'} the typical benchmark for lead generation campaigns in this sector. The budget is being used efficiently.`
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Cost Per Result Needs Monitoring',
      body: `Your average cost per lead is R${overallCPR.toFixed(2)}. This is on the higher end — consider refining audience targeting or refreshing ad creative to bring this down.`
    });
  }

  // Frequency insight
  if (avgFrequency > 3) {
    insights.push({
      type: 'warning',
      title: 'Audience Fatigue Risk',
      body: `The average frequency is ${avgFrequency.toFixed(1)}, meaning people are seeing your ad more than 3 times on average. This can cause ad fatigue and rising costs. Consider broadening your audience or rotating creatives.`
    });
  } else {
    insights.push({
      type: 'positive',
      title: 'Frequency is Well Controlled',
      body: `With an average frequency of ${avgFrequency.toFixed(1)}, your audience is not being over-exposed to the ads. This is a healthy sign of fresh reach and engagement.`
    });
  }

  // Campaign comparison
  if (byCampaign.length >= 2 && topCampaign && secondCampaign) {
    const leader = topCampaign.Results > secondCampaign.Results ? topCampaign : secondCampaign;
    const laggard = leader === topCampaign ? secondCampaign : topCampaign;
    const diff = leader.Results - laggard.Results;
    insights.push({
      type: 'info',
      title: 'Campaign Region Comparison',
      body: `The "${leader.name}" campaign is outperforming "${laggard.name}" by ${diff} results. Both campaigns are active, but budget reallocation toward the stronger region may improve overall efficiency.`
    });
  }

  // Age group efficiency
  if (topAgeByEfficiency) {
    insights.push({
      type: 'positive',
      title: `Most Efficient Age Group: ${topAgeByEfficiency.name}`,
      body: `The ${topAgeByEfficiency.name} age group delivers leads at R${topAgeByEfficiency.CostPerResult.toFixed(2)} each — the lowest cost per result of all age groups. This segment offers the best return on spend.`
    });
  }

  // Reach vs Results
  const reachToResultRate = totalReach > 0 ? (totalResults / totalReach) * 100 : 0;
  insights.push({
    type: reachToResultRate > 0.1 ? 'positive' : 'info',
    title: 'Reach-to-Lead Conversion',
    body: `Out of ${totalReach.toLocaleString()} unique people reached, ${totalResults} converted into leads — a ${reachToResultRate.toFixed(2)}% conversion from reach. ${reachToResultRate > 0.15 ? 'This is a strong conversion rate.' : 'There is room to improve targeting quality to convert more of your reach into results.'}`
  });

  // Build audience summary
  const topAgesFormatted = byAge
    .filter(a => a.name !== 'Unknown' && a.Results > 0)
    .slice(0, 3)
    .map(a => `${a.name} (${a.Results} leads)`).join(', ');

  const audienceSummary = `Your ads are reaching people across multiple age groups, but the strongest engagement is coming from the ${topAgeByResults?.name ?? 'N/A'} bracket, which generated the most leads overall. The top three age groups by lead volume are: ${topAgesFormatted}. ${topAgeByEfficiency ? `However, the most cost-efficient conversions are happening with the ${topAgeByEfficiency.name} group at just R${topAgeByEfficiency.CostPerResult.toFixed(2)} per lead.` : ''} This tells us your core audience is likely ${topAgeByResults?.name ?? ''} adults who are in a phase of life where health and sleep quality become a priority — a strong fit for a mattress health product.`;

  // Recommendations
  const recommendations: string[] = [];
  if (overallCPR > 60) recommendations.push('Review ad creative and copy — fresher visuals or a stronger call-to-action could reduce your cost per lead.');
  if (avgFrequency > 2.5) recommendations.push('Expand your target audience or introduce Lookalike audiences to avoid reaching the same people repeatedly.');
  if (topAgeByEfficiency && topAgeByEfficiency.name !== topAgeByResults?.name) {
    recommendations.push(`Consider shifting more budget toward the ${topAgeByEfficiency.name} age group — they convert at the lowest cost per lead.`);
  }
  if (byCampaign.length >= 2) {
    const sorted = [...byCampaign].sort((a, b) => a.CostPerResult - b.CostPerResult);
    recommendations.push(`The "${sorted[0].name}" campaign has a better cost per result. Consider reallocating budget from the weaker campaign to maximise ROI.`);
  }
  recommendations.push('A/B test different ad formats (carousel vs single image) to see which resonates more with your top-performing age groups.');
  recommendations.push('Set up a retargeting campaign for website visitors who did not convert — this often yields much lower CPR than cold audience campaigns.');

  const performanceSummary = `During the period ${dateRange}, your Meta Ads campaigns generated ${totalResults} leads at a total spend of R${totalSpend.toFixed(2)}, averaging R${overallCPR.toFixed(2)} per lead. The campaigns reached ${totalReach.toLocaleString()} unique people and delivered ${totalImpressions.toLocaleString()} impressions. Overall, the campaign is performing ${verdictLabel.toLowerCase()} — ${verdict === 'excellent' || verdict === 'good' ? 'costs are well-controlled and the ads are generating real leads at a sustainable rate' : 'there are opportunities to improve efficiency and reduce the cost per lead with some strategic adjustments'}.`;

  return {
    verdict,
    verdictLabel,
    verdictColor,
    performanceSummary,
    insights,
    audienceSummary,
    primaryAgeGroup: topAgeByResults?.name ?? 'N/A',
    mostEfficientAgeGroup: topAgeByEfficiency?.name ?? 'N/A',
    topCampaign: topCampaign?.name ?? 'N/A',
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
        let totalSpend = 0;
        let totalResults = 0;
        let totalImpressions = 0;
        let totalReach = 0;

        const campaignMap = new Map<string, MetricSummary>();
        const ageMap = new Map<string, MetricSummary>();

        rawData.forEach(row => {
          // Parse numbers safely
          const reach = Number(row["Reach"]) || 0;
          const impressions = Number(row["Impressions"]) || 0;
          const results = Number(row["Results"]) || 0;
          const spend = Number(row["Amount spent (ZAR)"]) || 0;
          
          // Skip completely empty rows that might be parsed at the end
          if (!row["Campaign name"] && spend === 0 && impressions === 0) return;

          const cleanName = cleanCampaignName(row["Campaign name"]);
          const adSet = row["Ad set name"] || "Unknown";
          const age = row["Age"] || "Unknown";

          const costPerResult = results > 0 ? spend / results : 0;

          simplifiedData.push({
            Campaign: cleanName,
            AdSet: adSet,
            Age: age,
            Reach: reach,
            Impressions: impressions,
            Results: results,
            Spend: spend,
            CostPerResult: costPerResult
          });

          // Global Totals
          totalSpend += spend;
          totalResults += results;
          totalImpressions += impressions;
          totalReach += reach;

          // Aggregate by Campaign
          if (!campaignMap.has(cleanName)) {
            campaignMap.set(cleanName, { name: cleanName, Reach: 0, Impressions: 0, Results: 0, Spend: 0, CostPerResult: 0 });
          }
          const cData = campaignMap.get(cleanName)!;
          cData.Reach += reach;
          cData.Impressions += impressions;
          cData.Results += results;
          cData.Spend += spend;
          cData.CostPerResult = cData.Results > 0 ? cData.Spend / cData.Results : 0;

          // Aggregate by Age
          if (!ageMap.has(age)) {
            ageMap.set(age, { name: age, Reach: 0, Impressions: 0, Results: 0, Spend: 0, CostPerResult: 0 });
          }
          const aData = ageMap.get(age)!;
          aData.Reach += reach;
          aData.Impressions += impressions;
          aData.Results += results;
          aData.Spend += spend;
          aData.CostPerResult = aData.Results > 0 ? aData.Spend / aData.Results : 0;
        });

        // Sort summaries
        const byCampaign = Array.from(campaignMap.values()).sort((a, b) => b.Spend - a.Spend);
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

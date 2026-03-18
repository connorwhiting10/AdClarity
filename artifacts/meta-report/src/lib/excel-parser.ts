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

        resolve({
          simplifiedData,
          summary: { totalSpend, totalResults, totalImpressions, totalReach },
          byCampaign,
          byAge,
          dateRange
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

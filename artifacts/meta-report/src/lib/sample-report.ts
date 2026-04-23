import {
  generateAnalysis,
  type MetricSummary,
  type ParsedReport,
  type SimplifiedRow,
} from "./excel-parser";

// Fake Meta Ads data for a beauty brand's March–April 2026 flight.
// Chosen to exercise every dashboard section — spread across 3 campaigns,
// 4 age groups, realistic ZAR numbers for South African lead gen.

const byCampaign: MetricSummary[] = [
  {
    name: "Spring Launch - Lookalike 2%",
    Reach: 52_840,
    Impressions: 168_210,
    Results: 412,
    Spend: 18_940,
    CostPerResult: 45.97,
  },
  {
    name: "Always-On Interest - Beauty + Skincare",
    Reach: 34_210,
    Impressions: 121_880,
    Results: 168,
    Spend: 12_615,
    CostPerResult: 75.09,
  },
  {
    name: "Retargeting - 30d Engagers",
    Reach: 8_420,
    Impressions: 58_330,
    Results: 147,
    Spend: 6_180,
    CostPerResult: 42.04,
  },
];

const byAge: MetricSummary[] = [
  {
    name: "25-34",
    Reach: 41_220,
    Impressions: 132_410,
    Results: 328,
    Spend: 14_820,
    CostPerResult: 45.18,
  },
  {
    name: "35-44",
    Reach: 28_930,
    Impressions: 98_440,
    Results: 219,
    Spend: 11_230,
    CostPerResult: 51.28,
  },
  {
    name: "18-24",
    Reach: 17_540,
    Impressions: 74_620,
    Results: 118,
    Spend: 7_390,
    CostPerResult: 62.63,
  },
  {
    name: "45-54",
    Reach: 7_780,
    Impressions: 42_950,
    Results: 62,
    Spend: 4_295,
    CostPerResult: 69.27,
  },
];

const summary: ParsedReport["summary"] = {
  totalSpend: 37_735,
  totalResults: 727,
  totalImpressions: 348_420,
  totalReach: 95_470,
};

// A small slice of the underlying simplified rows so CSV export + table views
// have something meaningful to render.
const simplifiedData: SimplifiedRow[] = [
  { Campaign: "Spring Launch - Lookalike 2%", AdSet: "LAL 2% - 25-34 - Beauty", Age: "25-34", Reach: 21_430, Impressions: 72_180, Results: 186, Spend: 8_420, CostPerResult: 45.27, Frequency: 3.37 },
  { Campaign: "Spring Launch - Lookalike 2%", AdSet: "LAL 2% - 35-44 - Beauty", Age: "35-44", Reach: 18_220, Impressions: 61_840, Results: 142, Spend: 6_820, CostPerResult: 48.03, Frequency: 3.40 },
  { Campaign: "Spring Launch - Lookalike 2%", AdSet: "LAL 2% - 18-24 - Beauty", Age: "18-24", Reach: 13_190, Impressions: 34_190, Results: 84, Spend: 3_700, CostPerResult: 44.05, Frequency: 2.59 },
  { Campaign: "Always-On Interest - Beauty + Skincare", AdSet: "Interest - Skincare - 25-44", Age: "25-44", Reach: 19_430, Impressions: 68_220, Results: 96, Spend: 7_340, CostPerResult: 76.46, Frequency: 3.51 },
  { Campaign: "Always-On Interest - Beauty + Skincare", AdSet: "Interest - Beauty - 35-54", Age: "35-54", Reach: 14_780, Impressions: 53_660, Results: 72, Spend: 5_275, CostPerResult: 73.26, Frequency: 3.63 },
  { Campaign: "Retargeting - 30d Engagers", AdSet: "RT - 30d Engagers - All", Age: "All", Reach: 8_420, Impressions: 58_330, Results: 147, Spend: 6_180, CostPerResult: 42.04, Frequency: 6.93 },
] as unknown as SimplifiedRow[];

const dateRange = "01 Mar 2026 – 31 Mar 2026";

/**
 * Returns a fully-populated fake ParsedReport so the landing page can
 * preview the dashboard without asking the visitor for their own export.
 * Computed via the real generateAnalysis so all 9 sections are populated
 * with consistent numbers.
 */
export function getSampleReport(): ParsedReport {
  return {
    simplifiedData,
    summary,
    byCampaign,
    byAge,
    dateRange,
    analysis: generateAnalysis(summary, byCampaign, byAge, dateRange),
  };
}

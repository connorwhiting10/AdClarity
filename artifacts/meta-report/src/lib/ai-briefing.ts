import type { ParsedReport } from "./excel-parser";

export type BriefingPriority = "high" | "medium" | "low";

export interface BriefingItem {
  priority: BriefingPriority;
  category: "Fix" | "Scale" | "Test" | "Watch";
  headline: string;
  detail: string;
  action: string;
}

export interface Briefing {
  greeting: string;
  oneLiner: string;
  items: BriefingItem[];
  suggestions: string[];
}

/**
 * Derives a Kinso-style priority briefing from a parsed report.
 * The underlying ReportAnalysis still has the rule-based text; this module
 * re-shapes it into the "3 things to do this week" format an ads manager
 * would write, with priority ranking the dashboard doesn't surface today.
 */
export function buildBriefing(report: ParsedReport): Briefing {
  const { analysis, summary, byCampaign, byAge } = report;
  const firstName = "you"; // we inject the real first name at render time

  const sortedCampaigns = [...byCampaign].sort((a, b) => a.CostPerResult - b.CostPerResult);
  const bestCampaign = sortedCampaigns[0];
  const worstCampaign = [...byCampaign]
    .filter((c) => c.Results > 0)
    .sort((a, b) => b.CostPerResult - a.CostPerResult)[0];
  const sortedAges = [...byAge]
    .filter((a) => a.name !== "Unknown" && a.Results > 0)
    .sort((a, b) => a.CostPerResult - b.CostPerResult);
  const bestAge = sortedAges[0];
  const worstAge = sortedAges[sortedAges.length - 1];

  const overallCPR = summary.totalResults > 0 ? summary.totalSpend / summary.totalResults : 0;

  const items: BriefingItem[] = [];

  if (worstCampaign && bestCampaign && worstCampaign.name !== bestCampaign.name) {
    const delta = Math.round(((worstCampaign.CostPerResult - bestCampaign.CostPerResult) / bestCampaign.CostPerResult) * 100);
    items.push({
      priority: delta > 40 ? "high" : "medium",
      category: "Fix",
      headline: `${worstCampaign.name} is costing ${delta}% more per result`,
      detail: `It's spending R${worstCampaign.Spend.toLocaleString()} for R${worstCampaign.CostPerResult.toFixed(0)}/result while ${bestCampaign.name} delivers at R${bestCampaign.CostPerResult.toFixed(0)}. You're paying a tax on the wrong audience.`,
      action: `Pause this campaign for 72 hours, redirect 70% of its budget into ${bestCampaign.name}, and re-audit Friday.`,
    });
  }

  if (bestCampaign) {
    items.push({
      priority: "medium",
      category: "Scale",
      headline: `${bestCampaign.name} is your hero — scale it carefully`,
      detail: `At R${bestCampaign.CostPerResult.toFixed(0)} per result it's your most efficient buy. But scaling this means creative fatigue next week if you don't get ahead of it.`,
      action: `Plan a creative refresh for Monday, and duplicate to a broader Lookalike (5%) with the same creative to test headroom.`,
    });
  }

  if (bestAge && worstAge && bestAge.name !== worstAge.name) {
    items.push({
      priority: "low",
      category: "Watch",
      headline: `${worstAge.name} is underperforming against ${bestAge.name}`,
      detail: `${bestAge.name} converts at R${bestAge.CostPerResult.toFixed(0)}/result vs R${worstAge.CostPerResult.toFixed(0)} for ${worstAge.name}. Budget is leaking.`,
      action: `Exclude ${worstAge.name} from your always-on campaign; the budget is better spent doubling down on ${bestAge.name}.`,
    });
  }

  const verdict = analysis.profitabilityVerdict;
  const oneLiner =
    verdict === "profitable"
      ? `Your account is carrying itself at R${overallCPR.toFixed(0)} per result — here's how to stretch that lead.`
      : verdict === "break-even"
        ? `You're treading water at R${overallCPR.toFixed(0)} per result. Three moves this week to tip into profit.`
        : `R${overallCPR.toFixed(0)} per result is above where it needs to be. These are your priorities to fix it.`;

  return {
    greeting: `Morning, ${firstName} — here's what I found in this week's data.`,
    oneLiner,
    items: items.slice(0, 3),
    suggestions: [
      "Why is my Interest-Beauty campaign underperforming?",
      "Draft an ad copy variant to test against my hero creative.",
      "Summarise this report for my client in two paragraphs.",
      "What should I do if my ROAS drops another 10%?",
    ],
  };
}

/**
 * Pre-canned responses for the chat drawer. Keyed by a normalised question.
 * All hard-coded for demo purposes — no LLM call.
 */
export function mockChatAnswer(question: string, report: ParsedReport): string {
  const q = question.toLowerCase();
  const worst = [...report.byCampaign]
    .filter((c) => c.Results > 0)
    .sort((a, b) => b.CostPerResult - a.CostPerResult)[0];
  const best = [...report.byCampaign].sort((a, b) => a.CostPerResult - b.CostPerResult)[0];

  if (q.includes("interest") || q.includes("underperform")) {
    return [
      `${worst?.name ?? "Your slowest campaign"} is carrying most of the cost because the audience signal is broader than your converting cohort.`,
      "",
      `Three things are likely in play:`,
      `• Frequency is high without a creative refresh, so the audience is seeing the same ad 4+ times`,
      `• The interest targeting is too wide — you're paying for impressions on people with no purchase intent`,
      `• The landing page isn't matched to interest-based visitors (who convert slower than warm/Lookalike traffic)`,
      "",
      `The fastest fix is to pause it for 72 hours, ship one new creative, and re-run with a narrowed interest stack. If the CPR doesn't drop below R${((best?.CostPerResult ?? 60) * 1.3).toFixed(0)} inside a week, kill it and redirect the budget.`,
    ].join("\n");
  }

  if (q.includes("draft") || q.includes("copy") || q.includes("variant")) {
    return [
      `Here are three ad copy variants in your brand voice, each written to fight fatigue on ${best?.name ?? "your hero campaign"}:`,
      "",
      `**1. Proof-led**`,
      `"We didn't expect 2,400 reviews in 6 months. Neither did our accountant. Here's what the fuss is about →"`,
      "",
      `**2. Pattern-break**`,
      `"Bad skincare costs you twice — once at checkout, once in the mirror. Skip the first one."`,
      "",
      `**3. Cold objection handle**`,
      `"Every 'overnight glow' product lies. Ours takes 14 nights. 87% of customers re-order by night 20."`,
      "",
      `All three route to the same landing page. Launch all three to the same Lookalike 2% with a R500/day cap each, kill the two that don't beat your current benchmark by day 5.`,
    ].join("\n");
  }

  if (q.includes("summaris") || q.includes("summarize") || q.includes("client")) {
    return [
      `Here's a client-ready summary you can paste or send as-is:`,
      "",
      `**This month's performance**`,
      `Spend: R${report.summary.totalSpend.toLocaleString()}. Results: ${report.summary.totalResults.toLocaleString()}. Blended cost per result: R${(report.summary.totalSpend / Math.max(report.summary.totalResults, 1)).toFixed(0)}.`,
      "",
      `**What worked**`,
      `${best?.name ?? "Your top campaign"} delivered results at R${best?.CostPerResult.toFixed(0) ?? ""} — well under the R80 benchmark for this category. It's the clearest growth lever.`,
      "",
      `**What needs attention**`,
      `${worst?.name ?? "The weakest campaign"} came in at R${worst?.CostPerResult.toFixed(0) ?? ""}/result — above benchmark. We're reallocating its budget for next month and testing two new creative angles on the hero campaign to prevent fatigue.`,
    ].join("\n");
  }

  if (q.includes("roas") || q.includes("drop")) {
    return [
      `If ROAS drops another 10% from here, run the playbook in this order — don't skip steps:`,
      "",
      `**Day 1** — look at creative. 80% of ROAS decay is creative fatigue. If frequency is >4 on any top ad set, that's the cause. Ship a refresh.`,
      "",
      `**Day 3** — if refresh didn't arrest the drop, audit the audience. Broad targeting widened? Lookalike seed list stale? Rebuild from last-90-day purchasers.`,
      "",
      `**Day 5** — if creative + audience are clean, it's likely external: competitor raising bids or seasonality. Pull CPM trend, compare to last 30 days. If CPM is up >15%, you're in a bidding war — hold budget, don't chase.`,
      "",
      `**Don't** cut budget. That's the reflex move and almost always makes it worse — the algorithm needs volume to find converting users.`,
    ].join("\n");
  }

  return [
    `I don't have a pre-scripted answer to that one yet — this is a demo layer, so I'm running on hand-authored responses rather than a live model.`,
    "",
    `In the real build I'd read the full report, call Claude Sonnet with your question + the data, and stream an answer back in about 2 seconds.`,
  ].join("\n");
}

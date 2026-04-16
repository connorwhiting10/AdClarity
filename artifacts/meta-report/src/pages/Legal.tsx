import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Activity, ArrowLeft, AlertTriangle, CheckSquare, Square } from "lucide-react";

type Tab = "privacy" | "terms" | "disclaimer";

const TABS: { id: Tab; label: string }[] = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms of Service" },
  { id: "disclaimer", label: "Disclaimer" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-white/5">{title}</h2>
      <div className="space-y-3 text-sm text-foreground/75 leading-relaxed">{children}</div>
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground/90 mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1.5 text-foreground/70 pl-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function PrivacyPolicy() {
  return (
    <>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: April 2025. This Privacy Policy explains how AdClarity handles your data when you use our
        platform to analyse advertising reports.
      </p>

      <Section title="1. What We Do">
        <p>
          AdClarity is a digital tool that generates simplified ad performance reports based on files you upload.
          The platform processes your data temporarily in memory to produce insights and does not retain any
          information after your session ends.
        </p>
      </Section>

      <Section title="2. No Account Required">
        <p>
          No user account is required to use AdClarity. You may upload a file and receive a report without
          providing any personal information such as your name, email address, or phone number.
        </p>
      </Section>

      <Section title="3. Data Processing &amp; Storage">
        <Sub title="Temporary processing only">
          <p>
            All uploaded files and generated reports are processed entirely in memory during your active session.
            No data is written to permanent storage, databases, or third-party services.
          </p>
        </Sub>
        <Sub title="Automatic deletion">
          <p>
            Once your report is generated and your session ends — or the temporary access link expires — all
            associated data is permanently removed from our systems. It cannot be recovered.
          </p>
        </Sub>
      </Section>

      <Section title="4. Report Delivery Options">
        <p>Reports are made available via one of two methods:</p>
        <Ul
          items={[
            "Instant download — you must save the report file to your device immediately. Once your browser session ends, the report is gone.",
            "Temporary access link — a time-limited URL (valid for approximately 30 minutes) that allows you to view or download your report. After expiry, the link and its data are permanently deleted.",
          ]}
        />
      </Section>

      <Section title="5. User Responsibility">
        <p className="font-medium text-foreground/90">
          You are solely responsible for saving your report. AdClarity does not retain copies of generated reports
          under any circumstances. Once a report is downloaded or its access link expires, it cannot be recovered,
          regenerated, or retrieved by us.
        </p>
      </Section>

      <Section title="6. No Data Sharing or Sale">
        <p>
          We do not sell, share, rent, or otherwise transfer your data or uploaded files to any third party.
          Your data is used only to generate your report and is then discarded.
        </p>
      </Section>

      <Section title="7. Payments">
        <p>
          Payments are processed by <strong className="text-foreground/90">PayFast</strong>, a third-party payment
          provider based in South Africa. AdClarity does not store, process, or have access to your payment card
          details. All financial transactions are governed by PayFast's own privacy policy and terms of service.
        </p>
      </Section>

      <Section title="8. Cookies &amp; Analytics">
        <p>
          AdClarity may use minimal, privacy-respecting analytics to understand how the platform is used in
          aggregate (e.g. page views, feature usage). No personally identifiable information is collected via
          analytics. We do not use advertising cookies or tracking pixels.
        </p>
      </Section>

      <Section title="9. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Continued use of the platform after any changes
          constitutes acceptance of the updated policy. We encourage you to review this page periodically.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          For any privacy-related questions, please contact us at{" "}
          <a href="mailto:support@adclarity.co.za" className="text-primary hover:underline">
            support@adclarity.co.za
          </a>
          .
        </p>
      </Section>
    </>
  );
}

function TermsOfService() {
  return (
    <>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: April 2025. By using AdClarity, you agree to these Terms of Service. Please read them carefully.
      </p>

      <Section title="1. Acceptance of Terms">
        <p>
          By accessing or using AdClarity, you confirm that you are at least 18 years of age and agree to be
          bound by these Terms of Service. If you do not agree, you must not use the platform.
        </p>
      </Section>

      <Section title="2. Lawful Use">
        <p>
          You agree to use AdClarity only for lawful purposes and in a manner that does not infringe the rights
          of others. You must not upload files that contain illegal, fraudulent, or harmful content, or that
          violate any applicable law or regulation.
        </p>
      </Section>

      <Section title="3. Service Availability">
        <Ul
          items={[
            "AdClarity is provided on an 'as is' and 'as available' basis.",
            "We do not guarantee uninterrupted, error-free, or continuous availability of the service.",
            "We reserve the right to modify, suspend, or discontinue the platform at any time, with or without notice.",
            "We are not liable for any loss or inconvenience caused by service unavailability.",
          ]}
        />
      </Section>

      <Section title="4. No Data Retention">
        <p>
          AdClarity does not store your uploaded files or generated reports after your session ends. Reports are
          not retained, backed up, or recoverable under any circumstances. You are solely responsible for
          downloading and saving your report before your session or access link expires.
        </p>
      </Section>

      <Section title="5. Report Non-recoverability">
        <p className="font-medium text-foreground/90">
          Once a report has been downloaded or its temporary access link has expired, it is permanently deleted
          and cannot be recovered, regenerated, or retrieved — by you or by AdClarity. We accept no liability
          for lost reports.
        </p>
      </Section>

      <Section title="6. Payments">
        <p>
          All payments are processed by <strong className="text-foreground/90">PayFast</strong>, a third-party
          payment provider. By making a payment, you also agree to PayFast's terms and conditions. AdClarity
          does not store any payment information. Refund requests are subject to our refund policy, available on
          request.
        </p>
      </Section>

      <Section title="7. Limitation of Liability">
        <p>To the fullest extent permitted by applicable law, AdClarity shall not be liable for:</p>
        <Ul
          items={[
            "Any loss of data, reports, or uploaded files — including those lost due to session expiry, browser closure, or technical failure.",
            "Any business decisions, financial losses, or actions taken based on information contained in generated reports.",
            "Any indirect, incidental, consequential, or punitive damages arising from your use of the platform.",
            "Service interruptions, bugs, or inaccuracies in generated reports.",
          ]}
        />
      </Section>

      <Section title="8. Intellectual Property">
        <p>
          All content, design, and code comprising the AdClarity platform is the property of AdClarity and its
          licensors. You may not copy, reproduce, or distribute any part of the platform without prior written
          permission.
        </p>
      </Section>

      <Section title="9. Modifications to Terms">
        <p>
          We reserve the right to update these Terms at any time. Your continued use of the platform after
          changes are posted constitutes acceptance of the revised Terms.
        </p>
      </Section>

      <Section title="10. Governing Law">
        <p>
          These Terms are governed by the laws of the Republic of South Africa. Any disputes shall be subject
          to the exclusive jurisdiction of the South African courts.
        </p>
      </Section>
    </>
  );
}

function Disclaimer() {
  return (
    <>
      <p className="text-sm text-muted-foreground mb-8">
        Please read this Disclaimer carefully before using any report generated by AdClarity.
      </p>

      <Section title="1. Automated Report Generation">
        <p>
          Reports produced by AdClarity are generated automatically using algorithms that process the data
          contained in your uploaded file. The output is based entirely on the information you provide.
          AdClarity does not manually review, verify, or validate any uploaded data or report output.
        </p>
      </Section>

      <Section title="2. No Guarantee of Accuracy">
        <p>
          While we strive to provide useful and accurate analysis, AdClarity makes no representations or
          warranties — express or implied — regarding the accuracy, completeness, reliability, or suitability
          of any report. Results may contain errors, omissions, or misinterpretations of your data.
        </p>
      </Section>

      <Section title="3. Informational Purposes Only">
        <p>
          All reports generated by AdClarity are provided for <strong className="text-foreground/90">informational
          purposes only</strong>. They do not constitute financial, marketing, legal, or professional advice of
          any kind. You should not rely solely on report output when making business or financial decisions.
        </p>
      </Section>

      <Section title="4. Use at Your Own Risk">
        <p>
          Your use of AdClarity and any report it produces is entirely at your own risk. AdClarity, its
          owners, employees, and affiliates accept no responsibility for any outcomes — financial or otherwise —
          resulting from the use of, or reliance on, any generated report.
        </p>
      </Section>

      <Section title="5. Third-Party Data">
        <p>
          If your uploaded file contains data sourced from third-party platforms (such as Meta Ads Manager),
          the accuracy of that underlying data is beyond AdClarity's control. We cannot be held responsible for
          errors or discrepancies originating in data you have exported from another platform.
        </p>
      </Section>
    </>
  );
}

export default function Legal() {
  const [activeTab, setActiveTab] = useState<Tab>("privacy");
  const [acknowledged, setAcknowledged] = useState(false);
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_-3px_rgba(24,119,242,0.5)]">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden sm:block">AdClarity</span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to app
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">Legal</h1>
          <p className="text-muted-foreground">Privacy Policy, Terms of Service, and Disclaimer for AdClarity.</p>
        </motion.div>

        {/* Warning box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-5 py-4 mb-8"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300">Important:</strong> This report will not be stored. Please download
            and save it immediately after generation. It cannot be recovered later.
          </p>
        </motion.div>

        {/* Acknowledgement checkbox */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-3 rounded-xl border border-white/8 bg-muted/20 px-5 py-4 mb-10 cursor-pointer select-none"
          onClick={() => setAcknowledged(!acknowledged)}
        >
          {acknowledged ? (
            <CheckSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          ) : (
            <Square className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-foreground/80 leading-relaxed">
            I understand that my data will not be stored and my report cannot be recovered once downloaded or
            once the access link expires.
          </p>
        </motion.div>

        {/* Tab navigation */}
        <div className="flex gap-1 bg-muted/20 border border-white/5 rounded-xl p-1 mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max rounded-lg px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm border border-white/8"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab anchor links */}
        <div className="flex flex-wrap gap-3 mb-10 text-xs text-muted-foreground">
          {activeTab === "privacy" && (
            <>
              {["Data Processing", "Report Delivery", "User Responsibility", "Payments", "Data Sharing"].map((anchor) => (
                <span key={anchor} className="px-2.5 py-1 rounded-full border border-white/5 bg-muted/10 hover:text-foreground transition-colors cursor-default">
                  {anchor}
                </span>
              ))}
            </>
          )}
          {activeTab === "terms" && (
            <>
              {["Lawful Use", "Availability", "No Retention", "Payments", "Liability"].map((anchor) => (
                <span key={anchor} className="px-2.5 py-1 rounded-full border border-white/5 bg-muted/10 hover:text-foreground transition-colors cursor-default">
                  {anchor}
                </span>
              ))}
            </>
          )}
          {activeTab === "disclaimer" && (
            <>
              {["Automated Reports", "Accuracy", "Informational Only", "Own Risk"].map((anchor) => (
                <span key={anchor} className="px-2.5 py-1 rounded-full border border-white/5 bg-muted/10 hover:text-foreground transition-colors cursor-default">
                  {anchor}
                </span>
              ))}
            </>
          )}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="rounded-2xl border border-white/5 bg-card/40 px-6 sm:px-10 py-10"
          >
            {activeTab === "privacy" && <PrivacyPolicy />}
            {activeTab === "terms" && <TermsOfService />}
            {activeTab === "disclaimer" && <Disclaimer />}
          </motion.div>
        </AnimatePresence>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground/50 text-center mt-10">
          AdClarity · South Africa · Questions?{" "}
          <a href="mailto:support@adclarity.co.za" className="hover:text-muted-foreground transition-colors">
            support@adclarity.co.za
          </a>
        </p>
      </main>
    </div>
  );
}

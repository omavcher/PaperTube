import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ShieldCheck, RotateCcw, Clock, CheckCircle2, AlertCircle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Paperxify",
  description: "Read Paperxify's cancellation and refund policy. Learn about our 7-day money-back guarantee, refund timelines, and cancellation process.",
  alternates: {
    canonical: "https://paperxify.com/refund-policy",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans flex flex-col selection:bg-red-900/50">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black opacity-80" />

      <main className="relative z-10 flex-grow w-full max-w-4xl mx-auto px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-red-400 mb-4">
            <RotateCcw size={11} />
            <span>Customer Protection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-3 leading-relaxed">
            At Paperxify, we are committed to providing the highest quality AI study tools. If you are not satisfied with your subscription, we offer a transparent, hassle-free cancellation and refund process.
          </p>
          <p className="text-[11px] text-neutral-500 mt-2 font-mono">
            Last Updated: November 2026
          </p>
        </div>

        {/* Highlight Box: 7-Day Money Back Guarantee */}
        <div className="rounded-2xl bg-gradient-to-r from-red-950/30 via-[#101015] to-neutral-900/40 border border-red-500/25 p-6 mb-10 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                7-Day Money-Back Guarantee
              </h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                If you purchase any paid subscription (Pro Scholar or Power Scholar) and are not fully satisfied with our service, you are eligible for a 100% full refund within 7 calendar days of your initial payment date. No questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8 text-neutral-300 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <div className="rounded-2xl bg-[#0d0d12] border border-white/[0.06] p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-red-400">1.</span> Subscription Cancellation
            </h2>
            <p>
              You can cancel your recurring subscription at any time directly through your Paperxify user dashboard:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
              <li>Log in to your Paperxify account and navigate to <strong>Profile &gt; Manage Subscription</strong>.</li>
              <li>Click <strong>Cancel Subscription</strong>. Your subscription will be cancelled immediately.</li>
              <li>Upon cancellation, you will continue to have full access to your paid features and AI capacity until the end of your current paid billing period (30 days for monthly plans, 365 days for annual plans).</li>
              <li>You will not be charged any subsequent recurring fees after cancellation.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="rounded-2xl bg-[#0d0d12] border border-white/[0.06] p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-red-400">2.</span> Refund Eligibility
            </h2>
            <p>
              Refund requests are honored in accordance with the following criteria:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>First-time Purchase:</strong> Eligible for a 100% refund if requested within 7 days from the transaction date.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Technical Outages or Billing Errors:</strong> If you were charged incorrectly, double-charged, or experienced prolonged service downtime preventing AI generation, you are entitled to a full refund regardless of plan period.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Excessive AI Usage Exclusions:</strong> Accounts that have fully consumed over 80% of their monthly AI capacity within the 7-day period prior to requesting a refund may be evaluated for prorated refunds to prevent misuse of computational AI resources.</span>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rounded-2xl bg-[#0d0d12] border border-white/[0.06] p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-red-400">3.</span> Refund Processing Timeline &amp; Mode
            </h2>
            <p>
              Once a refund request is received and approved by our support team:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
              <li><strong>Approval Time:</strong> Requests are reviewed and processed within 24–48 hours.</li>
              <li><strong>Credit Turnaround Time:</strong> Funds are credited back to the original source payment method (UPI, NetBanking, Credit/Debit Card, or PayPal) within <strong>5 to 7 business working days</strong>, depending on your issuing bank or payment gateway.</li>
              <li><strong>Zero Processing Fees:</strong> We do not deduct any administrative or cancellation penalties from approved refunds.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="rounded-2xl bg-[#0d0d12] border border-white/[0.06] p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-red-400">4.</span> How to Request a Refund
            </h2>
            <p>
              To request a refund, please send an email to our support desk with your transaction details:
            </p>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-1.5 font-mono text-xs">
              <p>Email: <a href="mailto:support@paperxify.com" className="text-red-400 underline">support@paperxify.com</a> or <a href="mailto:omawchar07@gmail.com" className="text-red-400 underline">omawchar07@gmail.com</a></p>
              <p>Subject: Refund Request - [Your Registered Email]</p>
              <p>Include: Transaction ID / Order ID, registered email address, and reason for cancellation.</p>
            </div>
            <p className="text-xs text-neutral-400">
              Our dedicated support team typically responds to all inquiries within 12–24 business hours.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center text-xs text-neutral-500">
          Have questions before subscribing? Visit our{" "}
          <Link href="/pricing" className="text-neutral-300 underline hover:text-white">
            Pricing &amp; Plans
          </Link>{" "}
          or reach out on our{" "}
          <Link href="/contact" className="text-neutral-300 underline hover:text-white">
            Contact Support Page
          </Link>
          .
        </div>
      </main>

      <Footer />
    </div>
  );
}


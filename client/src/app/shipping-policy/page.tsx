import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Zap, ShieldCheck, Clock, CheckCircle2, Globe, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Paperxify",
  description: "Learn how Paperxify delivers electronic digital services, AI capacity units, and subscription benefits instantly to user accounts.",
  alternates: {
    canonical: "https://paperxify.com/shipping-policy",
  },
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans flex flex-col selection:bg-red-900/50">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black opacity-80" />

      <main className="relative z-10 flex-grow w-full max-w-4xl mx-auto px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-red-400 mb-4">
            <Zap size={11} />
            <span>Digital Fulfillment</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-3 leading-relaxed">
            Paperxify operates exclusively as a cloud-based Software-as-a-Service (SaaS) platform providing digital AI study tools. Read our electronic delivery timeline and terms below.
          </p>
          <p className="text-[11px] text-neutral-500 mt-2 font-mono">
            Last Updated: November 2026
          </p>
        </div>

        {/* Highlight Box: 100% Digital & Instant Delivery */}
        <div className="rounded-2xl bg-gradient-to-r from-red-950/30 via-[#101015] to-neutral-900/40 border border-red-500/25 p-6 mb-10 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Instant Electronic Digital Delivery
              </h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                All subscriptions, feature upgrades, and AI capacity allocations on Paperxify are delivered electronically. <strong>No physical goods or parcel shipments are involved.</strong> Delivery takes place automatically and immediately upon successful payment verification.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8 text-neutral-300 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <div className="rounded-2xl bg-[#0d0d12] border border-white/[0.06] p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-red-400">1.</span> Delivery Timeline &amp; Method
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-neutral-400">
              <li>
                <strong>Turnaround Time:</strong> Immediate (0 to 5 minutes). As soon as your transaction is confirmed via our payment gateway (Razorpay, PayPal, or LemonSqueezy), your user account is automatically upgraded.
              </li>
              <li>
                <strong>Delivery Method:</strong> Your paid tier status (Pro Scholar or Power Scholar), increased AI generation limits, and computational capacity units are activated directly inside your web application dashboard.
              </li>
              <li>
                <strong>Confirmation Email:</strong> A payment receipt and electronic tax invoice confirming your subscription details are dispatched instantly to your registered account email address.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="rounded-2xl bg-[#0d0d12] border border-white/[0.06] p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-red-400">2.</span> Shipping Costs &amp; Handling Fees
            </h2>
            <p>
              Because Paperxify provides 100% digital web software services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
              <li>There are <strong>zero shipping fees, courier charges, or handling costs</strong> associated with any purchase on our platform.</li>
              <li>All displayed pricing on our website is inclusive of full digital delivery and access.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="rounded-2xl bg-[#0d0d12] border border-white/[0.06] p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-red-400">3.</span> What to Do If Activation Is Delayed
            </h2>
            <p>
              In rare instances of bank communication delays or network timeouts:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-400">
              <li>
                <strong>Step 1:</strong> Refresh your dashboard browser tab or visit your profile at <Link href="/profile" className="text-red-400 underline">paperxify.com/profile</Link>.
              </li>
              <li>
                <strong>Step 2:</strong> Check your email inbox (including spam/promotions folder) for the confirmation invoice.
              </li>
              <li>
                <strong>Step 3:</strong> If your account has not upgraded within 15 minutes of deduction, please contact our support team at <a href="mailto:support@paperxify.com" className="text-red-400 underline">support@paperxify.com</a> or <a href="mailto:omawchar07@gmail.com" className="text-red-400 underline">omawchar07@gmail.com</a> with your transaction ID, and our engineering team will manually verify and credit your subscription immediately.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="rounded-2xl bg-[#0d0d12] border border-white/[0.06] p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-red-400">4.</span> Operational Office &amp; Contact Details
            </h2>
            <p>
              For any questions regarding order fulfillment, delivery, or subscriptions, please reach out to:
            </p>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-1 text-xs font-mono">
              <p>Business Name: Paperxify</p>
              <p>Founder &amp; Owner: Om Eknath Avchar</p>
              <p>Support Email: <a href="mailto:support@paperxify.com" className="text-red-400 underline">support@paperxify.com</a> / <a href="mailto:omawchar07@gmail.com" className="text-red-400 underline">omawchar07@gmail.com</a></p>
              <p>Operational Location: Maharashtra, India</p>
              <p>Operating Hours: Monday – Saturday, 9:00 AM – 7:00 PM IST</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center text-xs text-neutral-500">
          Want to learn more about our refund terms? View our{" "}
          <Link href="/refund-policy" className="text-neutral-300 underline hover:text-white">
            Cancellation &amp; Refund Policy
          </Link>{" "}
          or our{" "}
          <Link href="/terms" className="text-neutral-300 underline hover:text-white">
            Terms of Service
          </Link>
          .
        </div>
      </main>

      <Footer />
    </div>
  );
}


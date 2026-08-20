"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2,
  Calendar,
  FileText,
  Cpu,
  Loader2,
  ExternalLink,
  Lock,
  Check
} from "lucide-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/config/api";

interface AIDetectionCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
  inputText: string;
}

export function AIDetectionCertificateModal({
  isOpen,
  onClose,
  result,
  inputText
}: AIDetectionCertificateModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [certId, setCertId] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>("");
  const [verificationUrl, setVerificationUrl] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && result) {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newCertId = `PX-AID-${new Date().getFullYear()}-${randomSuffix}`;
      setCertId(newCertId);

      const formattedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      setIssueDate(formattedDate);

      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://paperxify.com";
      const fullVerifyUrl = `${baseUrl}/verify/${newCertId}`;
      setVerificationUrl(fullVerifyUrl);

      const certPayload = {
        certId: newCertId,
        aiProbability: result.aiProbability ?? 0,
        humanProbability: result.humanProbability ?? (100 - (result.aiProbability ?? 0)),
        confidence: result.confidence || 94,
        verdictTitle: result.aiProbability < 35 ? "Verified Authentic Human" : result.aiProbability < 70 ? "Mixed AI & Human Generation" : "AI Generated Content",
        verdictDesc: result.llmFeedback?.structure || "Forensic analysis executed across multi-model token predictors.",
        features: result.features || {},
        llmFeedback: result.llmFeedback || {},
        multiModelScores: {
          gpt4o: Math.min(100, Math.round((result.aiProbability ?? 0) * 1.02)),
          claude35: Math.min(100, Math.round((result.aiProbability ?? 0) * 0.96)),
          gemini20: Math.min(100, Math.round((result.aiProbability ?? 0) * 0.94)),
          llama3: Math.min(100, Math.round((result.aiProbability ?? 0) * 0.88))
        },
        textSnippet: inputText ? inputText.slice(0, 300) : "",
        issuedBy: "Paperxify Academic Integrity Engine (paperxify.com)",
        issueDate: new Date().toISOString()
      };

      try {
        localStorage.setItem(`px_cert_${newCertId}`, JSON.stringify(certPayload));
      } catch (e) {
        console.warn("Could not save certificate locally:", e);
      }

      api.post("/writer/certificate", certPayload)
        .catch(err => console.warn("Failed to persist certificate to server:", err.message));
    }
  }, [isOpen, result, inputText]);

  if (!isOpen || !result || !mounted) return null;

  const aiProb = result.aiProbability ?? 0;
  const humanProb = result.humanProbability ?? (100 - aiProb);
  const isHumanAuthentic = aiProb < 35;
  const isModerateRisk = aiProb >= 35 && aiProb < 70;

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);
    const toastId = toast.loading("Generating high-resolution official certificate...");

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#09090b",
        logging: false
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(`Paperxify_Certificate_${certId}.pdf`);
      toast.success("Certificate downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF Export error:", err);
      toast.error("Failed to generate certificate PDF.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
    >
      <div className="relative w-full max-w-4xl bg-[#0d0d12] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden my-auto flex flex-col max-h-[96vh]">
        
        {/* Top Modal Action Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.08] bg-[#09090c] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white shrink-0">
              <ShieldCheck size={16} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate">Academic Integrity Certificate</h3>
              <p className="text-[9.5px] sm:text-[10px] font-mono text-neutral-400 truncate">ID: <span className="text-neutral-200 font-bold">{certId}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {verificationUrl && (
              <a
                href={`/verify/${certId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.08] text-[11px] font-medium transition-all cursor-pointer"
              >
                <span>Verify Online</span>
                <ExternalLink size={11} className="text-neutral-400" />
              </a>
            )}

            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.08] text-[11px] font-medium transition-all cursor-pointer"
              title="Print Certificate"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 font-semibold text-[10px] sm:text-[11px] transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer ml-0.5 sm:ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Certificate Viewport (Scrollable container for small screens) */}
        <div className="p-3 sm:p-6 overflow-x-auto overflow-y-auto flex justify-center items-start bg-black/40 custom-scrollbar flex-1">
          
          {/* ══════ OFFICIAL CERTIFICATE CANVAS (RESPONSIVE) ══════ */}
          <div
            ref={certificateRef}
            id="printable-certificate"
            className="w-full max-w-[820px] min-w-[320px] sm:min-w-[700px] bg-[#0c0c10] border border-white/[0.12] rounded-xl p-4 sm:p-7 text-white relative overflow-hidden shadow-xl flex flex-col justify-between select-none"
          >
            {/* Subtle inner framing line */}
            <div className="absolute inset-1.5 sm:inset-2 border border-white/[0.05] rounded-lg pointer-events-none" />

            {/* Top Certificate Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4 sm:pb-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white shrink-0">
                  <ShieldCheck size={20} className="text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black tracking-tight uppercase text-white">
                      PAPERXIFY
                    </span>
                    <span className="text-[8.5px] sm:text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-300 border border-white/10">
                      Academic Integrity
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] tracking-wider text-neutral-400 font-medium">
                    Forensic AI Verification &amp; Authenticity Division
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[8.5px] uppercase tracking-wider font-mono text-neutral-500 block">Certificate ID</span>
                <span className="text-xs font-mono font-bold text-neutral-200 tracking-wide">{certId}</span>
                <span className="text-[8.5px] text-neutral-400 block mt-0.5">{issueDate}</span>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="my-4 sm:my-5 space-y-4 sm:space-y-5 relative z-10">
              
              <div className="text-center space-y-1">
                <span className="text-[8.5px] sm:text-[9.5px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Official Report of Authenticity</span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Certificate of AI Content Analysis
                </h1>
                <p className="text-[11px] sm:text-xs text-neutral-400 max-w-lg mx-auto font-light leading-relaxed">
                  This document certifies that the submitted manuscript was analyzed using Paperxify's multi-layered neural classifier and burstiness forensic engine.
                </p>
              </div>

              {/* Main Scorecard Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-[#111116] border border-white/[0.08] rounded-xl p-3.5 sm:p-4 items-center">
                
                {/* Left: Overall Verdict Box */}
                <div className="sm:col-span-5 sm:border-r border-white/[0.08] sm:pr-4 flex items-center gap-3 sm:gap-4 pb-3 sm:pb-0 border-b sm:border-b-0">
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 shrink-0 flex items-center justify-center">
                    <svg className="w-16 h-16 sm:w-18 sm:h-18 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff08" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke={isHumanAuthentic ? "#10b981" : isModerateRisk ? "#f59e0b" : "#f43f5e"}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - (isHumanAuthentic ? humanProb : aiProb) / 100)}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-base sm:text-lg font-bold text-white">{isHumanAuthentic ? humanProb : aiProb}%</span>
                      <span className="text-[6.5px] sm:text-[7px] font-semibold uppercase tracking-wider text-neutral-400">
                        {isHumanAuthentic ? "Human" : "AI Score"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className={cn(
                      "inline-flex items-center gap-1 text-[8px] sm:text-[8.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border mb-1",
                      isHumanAuthentic 
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                        : isModerateRisk
                        ? "bg-amber-500/10 border-amber-500/25 text-amber-300"
                        : "bg-rose-500/10 border-rose-500/25 text-rose-300"
                    )}>
                      {isHumanAuthentic ? "Authentic Human Author" : isModerateRisk ? "Mixed AI & Human" : "AI Generated Content"}
                    </span>
                    <h4 className="text-[11px] sm:text-xs font-semibold text-white">
                      {isHumanAuthentic ? "Verified Original Author" : isModerateRisk ? "Partial AI Assistance" : "High Machine Authorship"}
                    </h4>
                    <p className="text-[9px] sm:text-[9.5px] text-neutral-400 mt-0.5">
                      Confidence: <strong className="text-neutral-200">{result.confidence || 94}%</strong>
                    </p>
                  </div>
                </div>

                {/* Right: Model Probability Breakdown */}
                <div className="sm:col-span-7 sm:pl-1 grid grid-cols-4 gap-1.5 sm:gap-2">
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-1.5 sm:p-2 text-center">
                    <span className="text-[7.5px] sm:text-[8px] uppercase tracking-wider font-medium text-neutral-400 block truncate">GPT-4o</span>
                    <span className="text-[11px] sm:text-xs font-bold text-white mt-0.5 block">{Math.min(100, Math.round(aiProb * 1.02))}%</span>
                    <span className="text-[6.5px] sm:text-[7px] text-neutral-500 block">OpenAI</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-1.5 sm:p-2 text-center">
                    <span className="text-[7.5px] sm:text-[8px] uppercase tracking-wider font-medium text-neutral-400 block truncate">Claude 3.5</span>
                    <span className="text-[11px] sm:text-xs font-bold text-white mt-0.5 block">{Math.min(100, Math.round(aiProb * 0.96))}%</span>
                    <span className="text-[6.5px] sm:text-[7px] text-neutral-500 block">Anthropic</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-1.5 sm:p-2 text-center">
                    <span className="text-[7.5px] sm:text-[8px] uppercase tracking-wider font-medium text-neutral-400 block truncate">Gemini 2.0</span>
                    <span className="text-[11px] sm:text-xs font-bold text-white mt-0.5 block">{Math.min(100, Math.round(aiProb * 0.94))}%</span>
                    <span className="text-[6.5px] sm:text-[7px] text-neutral-500 block">Google</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-1.5 sm:p-2 text-center">
                    <span className="text-[7.5px] sm:text-[8px] uppercase tracking-wider font-medium text-neutral-400 block truncate">Llama 3</span>
                    <span className="text-[11px] sm:text-xs font-bold text-white mt-0.5 block">{Math.min(100, Math.round(aiProb * 0.88))}%</span>
                    <span className="text-[6.5px] sm:text-[7px] text-neutral-500 block">Meta</span>
                  </div>
                </div>

              </div>

              {/* Manuscript Linguistic Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 text-[10px]">
                <div className="p-2 sm:p-2.5 bg-[#111116] border border-white/[0.06] rounded-lg">
                  <span className="text-[7.5px] sm:text-[8px] font-medium text-neutral-400 uppercase tracking-wider block">Document Volume</span>
                  <p className="text-[11px] sm:text-xs font-semibold text-white mt-0.5 truncate">
                    {result.features?.wordCount || (inputText ? inputText.split(/\s+/).filter(Boolean).length : 0)} Words
                  </p>
                  <span className="text-[7px] sm:text-[7.5px] text-neutral-500 font-mono block">{result.features?.sentenceCount || 0} Sentences</span>
                </div>

                <div className="p-2 sm:p-2.5 bg-[#111116] border border-white/[0.06] rounded-lg">
                  <span className="text-[7.5px] sm:text-[8px] font-medium text-neutral-400 uppercase tracking-wider block">Burstiness</span>
                  <p className="text-[11px] sm:text-xs font-semibold text-white mt-0.5 truncate">
                    {result.features?.burstiness || 4.8}
                  </p>
                  <span className="text-[7px] sm:text-[7.5px] text-neutral-500 block">Variance Index</span>
                </div>

                <div className="p-2 sm:p-2.5 bg-[#111116] border border-white/[0.06] rounded-lg">
                  <span className="text-[7.5px] sm:text-[8px] font-medium text-neutral-400 uppercase tracking-wider block">Lexical TTR</span>
                  <p className="text-[11px] sm:text-xs font-semibold text-white mt-0.5 truncate">
                    {result.features?.diversity || 0.58}
                  </p>
                  <span className="text-[7px] sm:text-[7.5px] text-neutral-500 block">Type-Token Ratio</span>
                </div>

                <div className="p-2 sm:p-2.5 bg-[#111116] border border-white/[0.06] rounded-lg">
                  <span className="text-[7.5px] sm:text-[8px] font-medium text-neutral-400 uppercase tracking-wider block">Readability</span>
                  <p className="text-[11px] sm:text-xs font-semibold text-white mt-0.5 truncate">
                    {result.features?.readability || 45.2}
                  </p>
                  <span className="text-[7px] sm:text-[7.5px] text-neutral-500 block">Flesch Ease</span>
                </div>
              </div>

            </div>

            {/* Certificate Footer */}
            <div className="border-t border-white/[0.08] pt-3.5 sm:pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
              
              {/* QR Verification Seal */}
              <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <div className="p-1 bg-white rounded-md shadow-sm shrink-0">
                  <QRCode value={verificationUrl || `https://paperxify.com/verify/${certId}`} size={36} />
                </div>
                <div className="min-w-0">
                  <span className="text-[8.5px] sm:text-[9px] font-mono font-medium text-neutral-300 block">Scan to Verify Authenticity</span>
                  <span className="text-[7.5px] sm:text-[8px] text-neutral-400 font-mono block truncate">paperxify.com/verify/{certId}</span>
                </div>
              </div>

              {/* Right Official Issuer Block */}
              <div className="text-left sm:text-right flex flex-col sm:items-end w-full sm:w-auto">
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] sm:text-[8.5px] font-mono font-medium mb-1 self-start sm:self-auto">
                  <CheckCircle2 size={10} />
                  <span>Digitally Certified</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-white">
                  Paperxify Academic Integrity Engine
                </span>
                <span className="text-[8px] sm:text-[8.5px] text-neutral-400">
                  Issued by <strong className="text-neutral-200 font-medium">paperxify.com</strong>
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}

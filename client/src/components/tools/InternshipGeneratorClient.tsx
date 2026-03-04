"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  Download, Edit3, FileCheck, Loader2,
  ArrowLeft, CheckCircle2, Sparkles, Printer, User, Eye,
  Settings2, LayoutTemplate, Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo";

// ─── Data ────────────────────────────────────────────────────────────────────

const SIGNATORIES = [
  { name: "Dr. Rajesh Kumar", title: "Chief Operations Officer", initials: "RK" },
  { name: "Sunita Sharma", title: "Head of Talent Acquisition", initials: "SS" },
  { name: "Vikram Mehta", title: "Director of Engineering", initials: "VM" },
  { name: "Priya Nair", title: "VP of Human Resources", initials: "PN" },
  { name: "Amit Agarwal", title: "Managing Director", initials: "AA" },
];

const TEMPLATES = [
  { id: "t1", label: "Sarkari", accent: "#FF6200", bg: "#fffbe6", secondary: "#138808" },
  { id: "t2", label: "IIT Style", accent: "#003366", bg: "#f0f4ff", secondary: "#c8a951" },
  { id: "t3", label: "University", accent: "#6B0F1A", bg: "#fdf6ec", secondary: "#c8a951" },
  { id: "t4", label: "Corporate", accent: "#1A237E", bg: "#e8eaf6", secondary: "#FF6F00" },
  { id: "t5", label: "Startup", accent: "#0F172A", bg: "#f8fafc", secondary: "#22D3EE" },
  { id: "t6", label: "Skill India", accent: "#006400", bg: "#f0fff4", secondary: "#FF9933" },
  { id: "t7", label: "Heritage", accent: "#7B2D00", bg: "#fff8f0", secondary: "#D4A017" },
  { id: "t8", label: "Premium", accent: "#1B1B1B", bg: "#fffff8", secondary: "#B8962E" },
  { id: "t9", label: "Ministry", accent: "#003153", bg: "#f5f9ff", secondary: "#8B0000" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

function generateCertId(): string {
  const year = new Date().getFullYear();
  return `INT/${year}/${Math.random().toString(36).substring(2, 6).toUpperCase()}/${Math.floor(1000 + Math.random() * 9000)}`;
}

// ─── SVG Helpers ─────────────────────────────────────────────────────────────

function SignatureSVG({ initials, color }: { initials: string; color: string }) {
  return (
    <svg width="130" height="44" viewBox="0 0 130 44" fill="none">
      <path d="M8,36 C20,10 38,8 52,24 C66,40 80,12 98,18 C110,22 120,14 126,10" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M8,36 C15,32 22,38 28,34" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      <text x="6" y="44" fontSize="9" fontWeight="bold" fill={color} opacity="0.4" fontFamily="serif">{initials}</text>
    </svg>
  );
}

function AshokChakra({ size = 60, color = "#003366" }: { size?: number; color?: string }) {
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24;
    const rad = (angle * Math.PI) / 180;
    const r = size / 2 - 4;
    return { x1: size / 2, y1: size / 2, x2: size / 2 + r * Math.sin(rad), y2: size / 2 - r * Math.cos(rad) };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill="none" stroke={color} strokeWidth="2" />
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 8} fill="none" stroke={color} strokeWidth="1" />
      {spokes.map((s, i) => <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={color} strokeWidth="1" opacity="0.7" />)}
      <circle cx={size / 2} cy={size / 2} r={4} fill={color} />
    </svg>
  );
}

function OrnateCorner({ color }: { color: string }) {
  return (
    <svg width="70" height="70" viewBox="0 0 70 70">
      <path d="M0,0 L60,0 L60,5 L5,5 L5,60 L0,60 Z" fill={color} opacity="0.8" />
      <path d="M10,10 L50,10 L50,14 L14,14 L14,50 L10,50 Z" fill={color} opacity="0.4" />
      <circle cx="12" cy="12" r="3" fill={color} opacity="0.6" />
      <path d="M18,18 Q25,12 32,18 Q39,24 46,18" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}

function MandalaDecor({ size = 120, color = "#7B2D00" }: { size?: number; color?: string }) {
  const rings = [0.85, 0.65, 0.45, 0.3];
  const petals8 = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);
  const petals16 = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} opacity="0.15">
      {rings.map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r * size / 2} fill="none" stroke={color} strokeWidth="1" />
      ))}
      {petals8.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const r = size * 0.38;
        const x = cx + r * Math.sin(rad);
        const y = cy - r * Math.cos(rad);
        return <ellipse key={i} cx={x} cy={y} rx={8} ry={14} fill={color} transform={`rotate(${angle},${x},${y})`} />;
      })}
      {petals16.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const r = size * 0.28;
        const x = cx + r * Math.sin(rad);
        const y = cy - r * Math.cos(rad);
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
      <circle cx={cx} cy={cy} r={6} fill={color} />
    </svg>
  );
}

// ─── Certificate Templates ────────────────────────────────────────────────────

type CertData = {
  userName: string; companyName: string; role: string;
  department: string; startDate: string; endDate: string; description: string;
};
type Template = (typeof TEMPLATES)[0];
type Signatory = (typeof SIGNATORIES)[0];

// T1: Sarkari / Government Style — Tricolor header, Ashoka Chakra, formal
function CertSarkari({ data, template, signatory, certId, certDate }: { data: CertData; template: Template; signatory: Signatory; certId: string; certDate: string }) {
  return (
    <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: "#fff", fontFamily: "'Times New Roman', Georgia, serif", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
      {/* Tricolor Header */}
      <div style={{ height: 12, backgroundColor: "#FF9933", width: "100%" }} />
      <div style={{ height: 12, backgroundColor: "#ffffff", width: "100%", borderTop: "1px solid #eee", borderBottom: "1px solid #eee" }} />
      <div style={{ height: 12, backgroundColor: "#138808", width: "100%" }} />

      {/* Outer decorative border */}
      <div style={{ margin: "16px", border: `3px double ${template.accent}`, minHeight: "calc(297mm - 68px)", position: "relative", padding: "24px 28px" }}>
        {/* Inner border */}
        <div style={{ position: "absolute", inset: 6, border: `1px solid ${template.accent}44`, pointerEvents: "none" }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <AshokChakra size={64} color={template.accent} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase", color: template.accent }}>
            {data.companyName || "Company Name"}
          </div>
          <div style={{ fontSize: 10, color: "#666", letterSpacing: 3, marginTop: 3, textTransform: "uppercase" }}>
            Established & Registered Under Companies Act
          </div>
          <div style={{ height: 2, background: `linear-gradient(to right, transparent, ${template.accent}, ${template.secondary}, ${template.accent}, transparent)`, margin: "12px auto", maxWidth: 380 }} />
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 6, textTransform: "uppercase", color: "#222", fontFamily: "'Times New Roman', serif" }}>
            Internship Certificate
          </div>
          <div style={{ fontSize: 9, color: "#888", letterSpacing: 4, marginTop: 4 }}>— प्रशिक्षण प्रमाण-पत्र —</div>
        </div>

        <div style={{ height: 1, backgroundColor: `${template.accent}33`, marginBottom: 28 }} />

        {/* Cert ID */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: 9, color: "#888", fontFamily: "monospace" }}>
          <span>Certificate No: <strong style={{ color: template.accent }}>{certId}</strong></span>
          <span>Date: {certDate}</span>
        </div>

        {/* Body */}
        <div style={{ textAlign: "center", fontSize: 13, color: "#444", lineHeight: 2.2, marginBottom: 20 }}>
          This is to certify that
        </div>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: "#111", borderBottom: `3px solid ${template.accent}`, paddingBottom: 4, fontFamily: "'Times New Roman', serif", letterSpacing: 1 }}>
            {data.userName || "Full Name"}
          </span>
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: "#555", lineHeight: 2, maxWidth: 420, margin: "0 auto 16px" }}>
          S/o / D/o / W/o _________________________ has satisfactorily completed
          the Internship Training Programme in the capacity of
        </div>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <span style={{ display: "inline-block", border: `2px solid ${template.accent}`, padding: "6px 24px", fontSize: 16, fontWeight: 800, color: template.accent, letterSpacing: 2, textTransform: "uppercase" }}>
            {data.role || "Role Title"}
          </span>
        </div>
        {data.department && (
          <div style={{ textAlign: "center", fontSize: 11, color: "#666", marginBottom: 10 }}>
            ({data.department} Division)
          </div>
        )}
        <div style={{ textAlign: "center", fontSize: 12, color: "#555", lineHeight: 2, maxWidth: 460, margin: "0 auto 10px" }}>
          at <strong>{data.companyName || "Company"}</strong> from{" "}
          <strong>{formatDate(data.startDate)}</strong> to{" "}
          <strong>{formatDate(data.endDate)}</strong>.
        </div>
        {data.description && (
          <div style={{ fontSize: 11, color: "#666", lineHeight: 1.9, textAlign: "justify", margin: "14px auto 0", maxWidth: 430, borderLeft: `3px solid ${template.accent}44`, paddingLeft: 12, fontStyle: "italic" }}>
            {data.description}
          </div>
        )}
        <div style={{ fontSize: 11, color: "#555", textAlign: "center", marginTop: 16, lineHeight: 2 }}>
          We wish him/her all the best in future endeavours.
        </div>

        {/* Signature */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 48 }}>
          <div style={{ textAlign: "center" }}>
            <SignatureSVG initials={signatory.initials} color={template.accent} />
            <div style={{ width: 160, height: 1, backgroundColor: "#333", margin: "4px auto" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{signatory.name}</div>
            <div style={{ fontSize: 9, color: "#888", letterSpacing: 1 }}>{signatory.title}</div>
          </div>
         
        </div>

        {/* Place & Date line */}
        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888" }}>
          <span>Date: {certDate}</span>
        </div>
      </div>

      {/* Tricolor Footer */}
      <div style={{ height: 8, backgroundColor: "#FF9933", position: "absolute", bottom: 28, left: 0, right: 0 }} />
      <div style={{ height: 8, backgroundColor: "#ffffff", position: "absolute", bottom: 20, left: 0, right: 0 }} />
      <div style={{ height: 8, backgroundColor: "#138808", position: "absolute", bottom: 12, left: 0, right: 0 }} />
      <div style={{ height: 12, backgroundColor: "#111", position: "absolute", bottom: 0, left: 0, right: 0 }} />
    </div>
  );
}

// T2: IIT/Tech Institute Style — Academic, structured, blue & gold
function CertIIT({ data, template, signatory, certId, certDate }: { data: CertData; template: Template; signatory: Signatory; certId: string; certDate: string }) {
  return (
    <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: template.bg, fontFamily: "'Georgia', serif", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
      {/* Top institutional band */}
      <div style={{ backgroundColor: template.accent, padding: "18px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Arial Black', sans-serif" }}>
            {data.companyName || "Institute"}
          </div>
          <div style={{ fontSize: 9, color: `${template.secondary}`, letterSpacing: 3, marginTop: 3 }}>
            TECHNOLOGY · INNOVATION · EXCELLENCE
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: `${template.secondary}22`, border: `3px solid ${template.secondary}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 8, fontWeight: 900, color: template.secondary, textAlign: "center", letterSpacing: 1 }}>TECH<br />INST</div>
          </div>
        </div>
      </div>

      {/* Gold stripe */}
      <div style={{ height: 5, background: `linear-gradient(to right, ${template.secondary}, #fff, ${template.secondary})` }} />

      {/* Content */}
      <div style={{ padding: "28px 36px" }}>
        {/* Certificate header */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 9, letterSpacing: 6, textTransform: "uppercase", color: template.secondary, marginBottom: 6 }}>
            ◆ Certificate of Internship Completion ◆
          </div>
          <div style={{ fontSize: 11, color: "#888", fontStyle: "italic", marginBottom: 4 }}>Academic Year — {new Date().getFullYear()}-{new Date().getFullYear() + 1}</div>
          <div style={{ fontSize: 8, fontFamily: "monospace", color: "#aaa" }}>Ref: {certId}</div>
        </div>

        {/* Main block */}
        <div style={{ backgroundColor: "#fff", border: `1px solid ${template.accent}33`, borderLeft: `4px solid ${template.accent}`, padding: "24px 28px", marginBottom: 24 }}>
          <p style={{ margin: "0 0 12px 0", fontSize: 12, color: "#555", lineHeight: 2 }}>This is to certify that</p>
          <div style={{ fontSize: 38, fontWeight: 900, color: template.accent, marginBottom: 8, fontFamily: "'Times New Roman', serif", letterSpacing: -0.5 }}>
            {data.userName || "Full Name"}
          </div>
          <div style={{ height: 2, width: 80, backgroundColor: template.secondary, marginBottom: 16 }} />
          <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "#555", lineHeight: 2 }}>
            has successfully completed a <strong>Summer / Industrial Internship</strong> in the role of
          </p>
          <div style={{ display: "inline-block", backgroundColor: `${template.accent}0f`, border: `1px solid ${template.accent}44`, borderRadius: 4, padding: "6px 20px", marginBottom: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: template.accent, letterSpacing: 1 }}>
              {data.role || "Role"}
            </span>
            {data.department && <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>— {data.department}</span>}
          </div>
          <p style={{ margin: "8px 0 0 0", fontSize: 12, color: "#555", lineHeight: 2 }}>
            at <strong style={{ color: "#111" }}>{data.companyName || "Organization"}</strong> from{" "}
            <strong>{formatDate(data.startDate)}</strong> to <strong>{formatDate(data.endDate)}</strong>.
          </p>
        </div>

        {data.description && (
          <div style={{ backgroundColor: `${template.secondary}11`, border: `1px solid ${template.secondary}33`, borderRadius: 4, padding: "12px 20px", marginBottom: 24, fontSize: 11, color: "#666", lineHeight: 1.8, fontStyle: "italic" }}>
            <strong style={{ color: template.secondary, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Mentor's Remarks:</strong>
            {data.description}
          </div>
        )}

        {/* Grading box */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
          {["Performance", "Punctuality", "Initiative"].map((label) => (
            <div key={label} style={{ flex: 1, textAlign: "center", border: `1px solid ${template.accent}33`, padding: "10px 0", borderRadius: 4 }}>
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#888", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: template.accent }}>A+</div>
            </div>
          ))}
        </div>

        {/* Signature row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `2px solid ${template.accent}22`, paddingTop: 24 }}>
          <div>
            <SignatureSVG initials={signatory.initials} color={template.accent} />
            <div style={{ width: 160, height: 1, backgroundColor: "#333", margin: "4px 0" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{signatory.name}</div>
            <div style={{ fontSize: 9, color: "#888" }}>{signatory.title}</div>
            <div style={{ fontSize: 9, color: "#888" }}>{data.companyName}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "#aaa", marginBottom: 4 }}>Issued on</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>{certDate}</div>
            <div style={{ fontSize: 8, fontFamily: "monospace", color: "#bbb", marginTop: 4 }}>{certId}</div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <div style={{ height: 3, background: `linear-gradient(to right, ${template.secondary}, ${template.accent}, ${template.secondary})` }} />
        <div style={{ height: 12, backgroundColor: template.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 7, color: "#ffffff88", letterSpacing: 4, textTransform: "uppercase" }}>
            Verified · Authentic · Official
          </span>
        </div>
      </div>
    </div>
  );
}

// T3: University/Classic — Parchment feel, ornate corners, scroll style
function CertUniversity({ data, template, signatory, certId, certDate }: { data: CertData; template: Template; signatory: Signatory; certId: string; certDate: string }) {
  return (
    <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: "#fdf6ec", fontFamily: "'Times New Roman', Georgia, serif", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
      {/* Parchment texture overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, #f0e8d644 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #f0e8d622 40px)", pointerEvents: "none" }} />

      {/* Ornate corners */}
      <div style={{ position: "absolute", top: 0, left: 0 }}><OrnateCorner color={template.accent} /></div>
      <div style={{ position: "absolute", top: 0, right: 0, transform: "scaleX(-1)" }}><OrnateCorner color={template.accent} /></div>
      <div style={{ position: "absolute", bottom: 0, left: 0, transform: "scaleY(-1)" }}><OrnateCorner color={template.accent} /></div>
      <div style={{ position: "absolute", bottom: 0, right: 0, transform: "scale(-1)" }}><OrnateCorner color={template.accent} /></div>

      {/* Double border frame */}
      <div style={{ position: "absolute", inset: 16, border: `3px solid ${template.accent}`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 22, border: `1px solid ${template.secondary}66`, pointerEvents: "none" }} />

      <div style={{ padding: "50px 48px 40px", position: "relative", zIndex: 1 }}>
        {/* University Logo Area */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ display: "inline-block", width: 80, height: 80, borderRadius: "50%", border: `3px solid ${template.accent}`, backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <AshokChakra size={56} color={template.accent} />
          </div>
          <div style={{ fontSize: 9, letterSpacing: 5, textTransform: "uppercase", color: template.secondary, marginBottom: 4 }}>
            ✦ ✦ ✦
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: template.accent, letterSpacing: 2, textTransform: "uppercase" }}>
            {data.companyName || "University / Organization"}
          </div>
          <div style={{ fontSize: 9, color: "#888", letterSpacing: 3, marginTop: 4, textTransform: "uppercase" }}>
            Approved · Accredited · Recognized
          </div>
        </div>

        {/* Ornamental divider */}
        <div style={{ textAlign: "center", fontSize: 16, color: template.secondary, letterSpacing: 8, margin: "14px 0 18px" }}>
          ❧ ━━━━━━━━━━━━━━━━━━ ❧
        </div>

        <div style={{ textAlign: "center", fontSize: 28, fontWeight: 900, letterSpacing: 5, textTransform: "uppercase", color: "#222", marginBottom: 6 }}>
          Certificate
        </div>
        <div style={{ textAlign: "center", fontSize: 14, letterSpacing: 3, color: template.accent, marginBottom: 20 }}>
          of Internship Completion
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#555", lineHeight: 2.2, fontStyle: "italic", marginBottom: 16 }}>
          This is to certify that
        </div>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ display: "inline-block", fontSize: 40, color: template.accent, fontWeight: 900, borderBottom: `2px solid ${template.secondary}`, paddingBottom: 4, fontStyle: "italic" }}>
            {data.userName || "Full Name"}
          </span>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#555", lineHeight: 2.2, maxWidth: 420, margin: "0 auto 16px" }}>
          has dutifully and satisfactorily undergone internship training as
        </div>

        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span style={{ display: "inline-block", borderTop: `1px solid ${template.secondary}`, borderBottom: `1px solid ${template.secondary}`, padding: "6px 24px", fontSize: 17, fontWeight: 700, color: "#222", letterSpacing: 2, textTransform: "uppercase" }}>
            {data.role || "Role"}
          </span>
        </div>
        {data.department && (
          <div style={{ textAlign: "center", fontSize: 11, color: "#888", marginBottom: 8, fontStyle: "italic" }}>
            {data.department} Department
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 12, color: "#555", lineHeight: 2.2, maxWidth: 460, margin: "0 auto 10px" }}>
          in <strong>{data.companyName || "Organization"}</strong> from{" "}
          <span style={{ color: template.accent, fontWeight: 700 }}>{formatDate(data.startDate)}</span>{" "}
          to <span style={{ color: template.accent, fontWeight: 700 }}>{formatDate(data.endDate)}</span>.
        </div>

        {data.description && (
          <div style={{ margin: "14px auto 0", maxWidth: 420, fontSize: 11, color: "#666", lineHeight: 1.9, textAlign: "center", fontStyle: "italic", borderTop: `1px solid ${template.secondary}44`, borderBottom: `1px solid ${template.secondary}44`, padding: "10px 0" }}>
            "{data.description}"
          </div>
        )}

        {/* Ornamental divider */}
        <div style={{ textAlign: "center", fontSize: 14, color: template.secondary, letterSpacing: 6, margin: "20px 0 16px" }}>
          ✦ ━━━━━━━━━━━━━ ✦
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 9, color: "#aaa", fontFamily: "monospace", marginBottom: 2 }}>No.: {certId}</div>
            <div style={{ fontSize: 9, color: "#aaa" }}>Date: {certDate}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <SignatureSVG initials={signatory.initials} color={template.accent} />
            <div style={{ width: 170, height: 1, backgroundColor: "#333", margin: "4px auto" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{signatory.name}</div>
            <div style={{ fontSize: 9, color: "#888", letterSpacing: 1 }}>{signatory.title}</div>
          </div>
          <div style={{ width: 70, height: 70, borderRadius: "50%", border: `2px solid ${template.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", border: `1px solid ${template.secondary}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 7, fontWeight: 900, color: template.accent, textAlign: "center", lineHeight: 1.6 }}>OFFICIAL<br />SEAL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// T4: Corporate India — Bold diagonal design, modern Indian corporate
function CertCorporate({ data, template, signatory, certId, certDate }: { data: CertData; template: Template; signatory: Signatory; certId: string; certDate: string }) {
  return (
    <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: "#fff", fontFamily: "'Arial', sans-serif", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
      {/* Bold left stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 14, backgroundColor: template.accent }} />
      <div style={{ position: "absolute", top: 0, left: 14, bottom: 0, width: 6, background: `linear-gradient(to bottom, ${template.secondary}, ${template.accent}44)` }} />

      {/* Top right diagonal accent */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: `linear-gradient(135deg, transparent 50%, ${template.accent}08 50%)`, pointerEvents: "none" }} />

      {/* Top bar */}
      <div style={{ backgroundColor: template.accent, height: 60, display: "flex", alignItems: "center", paddingLeft: 36, paddingRight: 24, justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: 1, textTransform: "uppercase" }}>
            {data.companyName || "Company"}
          </div>
          <div style={{ fontSize: 8, color: `${template.secondary}`, letterSpacing: 3, marginTop: 2 }}>CORPORATE TRAINING DIVISION</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 8, color: "#ffffff88", fontFamily: "monospace" }}>{certId}</div>
          <div style={{ fontSize: 8, color: "#ffffff88" }}>{certDate}</div>
        </div>
      </div>

      {/* Orange accent line */}
      <div style={{ height: 6, background: `linear-gradient(to right, ${template.secondary}, ${template.secondary}44)` }} />

      <div style={{ paddingLeft: 44, paddingRight: 36, paddingTop: 36, paddingBottom: 48 }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, letterSpacing: 5, textTransform: "uppercase", color: template.secondary, marginBottom: 8 }}>
            ▶ Certificate of Completion
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, color: "#111", letterSpacing: -2, lineHeight: 1.1, textTransform: "uppercase", fontFamily: "'Arial Black', sans-serif" }}>
            Internship
          </div>
          <div style={{ height: 4, width: 100, backgroundColor: template.secondary, marginTop: 10 }} />
        </div>

        {/* Name block */}
        <div style={{ backgroundColor: `${template.accent}08`, borderLeft: `6px solid ${template.accent}`, padding: "18px 22px", marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#888", marginBottom: 6 }}>Awarded to</div>
          <div style={{ fontSize: 38, fontWeight: 900, color: template.accent, letterSpacing: -0.5, lineHeight: 1 }}>
            {data.userName || "Full Name"}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          <div style={{ border: `1px solid #eee`, borderTop: `3px solid ${template.accent}`, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>Role</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#222" }}>{data.role || "Position"}</div>
          </div>
          <div style={{ border: `1px solid #eee`, borderTop: `3px solid ${template.secondary}`, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>Department</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#222" }}>{data.department || "—"}</div>
          </div>
          <div style={{ border: `1px solid #eee`, borderTop: `3px solid ${template.accent}`, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>Start Date</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>{formatDate(data.startDate)}</div>
          </div>
          <div style={{ border: `1px solid #eee`, borderTop: `3px solid ${template.secondary}`, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>End Date</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>{formatDate(data.endDate)}</div>
          </div>
        </div>

        {data.description && (
          <div style={{ fontSize: 11, color: "#555", lineHeight: 1.8, marginBottom: 20, padding: "12px 14px", backgroundColor: "#fafafa", borderLeft: `3px solid ${template.secondary}` }}>
            {data.description}
          </div>
        )}

        {/* Signature */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `2px solid #eee`, paddingTop: 20 }}>
          <div>
            <SignatureSVG initials={signatory.initials} color={template.accent} />
            <div style={{ width: 170, height: 1.5, backgroundColor: "#222", margin: "4px 0" }} />
            <div style={{ fontSize: 11, fontWeight: 800, color: "#111", textTransform: "uppercase" }}>{signatory.name}</div>
            <div style={{ fontSize: 9, color: "#888" }}>{signatory.title}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 3, height: 60, backgroundColor: template.accent }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: template.accent, letterSpacing: 3 }}>VERIFIED</div>
              <div style={{ fontSize: 8, color: "#aaa", letterSpacing: 2 }}>AUTHENTIC DOCUMENT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 18, backgroundColor: template.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 7, color: "#ffffff66", letterSpacing: 6, textTransform: "uppercase" }}>
          {data.companyName} — Official Internship Certificate
        </span>
      </div>
    </div>
  );
}

// T5: Startup/Modern — Asymmetric, bold typography, cyan accents
function CertStartup({ data, template, signatory, certId, certDate }: { data: CertData; template: Template; signatory: Signatory; certId: string; certDate: string }) {
  return (
    <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: template.bg, fontFamily: "'Helvetica Neue', Arial, sans-serif", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
      {/* Top cyan strip */}
      <div style={{ height: 8, background: `linear-gradient(to right, ${template.secondary}, ${template.secondary}88)` }} />

      {/* Geometric background shapes */}
      <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", border: `2px solid ${template.secondary}22`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", border: `1px solid ${template.secondary}15`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", border: `2px solid ${template.accent}11`, pointerEvents: "none" }} />

      <div style={{ padding: "30px 36px", position: "relative", zIndex: 1 }}>
        {/* Header — Split layout */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: template.accent, letterSpacing: -1, textTransform: "uppercase", lineHeight: 1.1 }}>
              {data.companyName || "Company"}
            </div>
            <div style={{ fontSize: 8, color: template.secondary, letterSpacing: 4, marginTop: 4, textTransform: "uppercase" }}>
              Startup · India · Innovation
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "inline-block", backgroundColor: template.secondary, color: "#000", fontSize: 9, fontWeight: 900, letterSpacing: 2, padding: "3px 10px", textTransform: "uppercase" }}>
              INTERN CERT
            </div>
            <div style={{ fontSize: 8, color: "#aaa", fontFamily: "monospace", marginTop: 6 }}>{certId}</div>
          </div>
        </div>

        {/* Big number + category */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: 6, textTransform: "uppercase", color: "#aaa", marginBottom: 10 }}>
            Certificate of Internship
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: template.accent, letterSpacing: -4, lineHeight: 0.9, fontFamily: "'Arial Black', sans-serif" }}>
            {(data.userName || "Name").split(" ")[0]}
          </div>
          {(data.userName || "Name").split(" ").length > 1 && (
            <div style={{ fontSize: 72, fontWeight: 900, color: template.secondary, letterSpacing: -4, lineHeight: 0.9, fontFamily: "'Arial Black', sans-serif" }}>
              {(data.userName || "Name").split(" ").slice(1).join(" ")}
            </div>
          )}
          <div style={{ height: 3, backgroundColor: template.secondary, width: 120, marginTop: 16 }} />
        </div>

        {/* Role */}
        <div style={{ marginBottom: 28 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: template.accent, borderBottom: `2px solid ${template.secondary}`, paddingBottom: 3 }}>
            {data.role || "Role"}
          </span>
          {data.department && <span style={{ fontSize: 13, color: "#888", marginLeft: 10 }}>@ {data.department}</span>}
        </div>

        {/* Timeline */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, padding: "14px 16px", backgroundColor: `${template.accent}05`, borderLeft: `4px solid ${template.secondary}` }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: "#aaa" }}>From</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: template.accent }}>{formatDate(data.startDate)}</div>
          </div>
          <div style={{ flex: 1, height: 2, background: `linear-gradient(to right, ${template.secondary}, ${template.accent})` }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: "#aaa" }}>To</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: template.accent }}>{formatDate(data.endDate)}</div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: "#555", lineHeight: 2, marginBottom: 12, maxWidth: 420 }}>
          has successfully completed the internship programme at{" "}
          <strong style={{ color: "#111" }}>{data.companyName || "Company"}</strong>.
        </div>

        {data.description && (
          <div style={{ fontSize: 11, color: "#666", lineHeight: 1.8, borderLeft: `3px solid ${template.secondary}`, paddingLeft: 12, fontStyle: "italic", marginBottom: 24 }}>
            {data.description}
          </div>
        )}

        {/* Signature */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40, paddingTop: 20, borderTop: `1px solid #e5e7eb` }}>
          <div>
            <SignatureSVG initials={signatory.initials} color={template.accent} />
            <div style={{ width: 150, height: 1, backgroundColor: "#333", margin: "4px 0" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{signatory.name}</div>
            <div style={{ fontSize: 9, color: "#888" }}>{signatory.title}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "#aaa" }}>Issued on {certDate}</div>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${template.secondary}`, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "auto", marginTop: 8 }}>
              <div style={{ fontSize: 7, fontWeight: 900, color: template.secondary, textAlign: "center" }}>VALID<br />✓</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: `linear-gradient(to right, ${template.secondary}, ${template.accent}, ${template.secondary})` }} />
    </div>
  );
}

// T6: Skill India — Badge style, saffron-green, government scheme feel
function CertSkillIndia({ data, template, signatory, certId, certDate }: { data: CertData; template: Template; signatory: Signatory; certId: string; certDate: string }) {
  return (
    <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: "#fff", fontFamily: "'Arial', sans-serif", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
      {/* Saffron-green-saffron top band */}
      <div style={{ display: "flex", height: 16 }}>
        <div style={{ flex: 1, backgroundColor: "#FF9933" }} />
        <div style={{ flex: 1, backgroundColor: "#fff" }} />
        <div style={{ flex: 1, backgroundColor: template.accent }} />
      </div>

      {/* Content */}
      <div style={{ padding: "20px 36px 40px" }}>
        {/* Header with badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#FF9933", textTransform: "uppercase", marginBottom: 4 }}>
              SKILL INDIA · DIGITAL INDIA
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: template.accent, textTransform: "uppercase", letterSpacing: 1 }}>
              {data.companyName || "Organization"}
            </div>
            <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>National Skill Development · Certified Programme</div>
          </div>
          {/* Star badge */}
          <svg width="80" height="80" viewBox="0 0 80 80">
            <polygon points="40,5 48,28 74,28 54,44 62,68 40,52 18,68 26,44 6,28 32,28" fill="#FF9933" opacity="0.9" />
            <polygon points="40,12 46,30 66,30 51,41 57,60 40,49 23,60 29,41 14,30 34,30" fill="#fff" opacity="0.3" />
            <text x="40" y="44" textAnchor="middle" fontSize="8" fontWeight="900" fill="#fff" letterSpacing="1">CERT</text>
          </svg>
        </div>

        {/* Green divider */}
        <div style={{ height: 3, background: `linear-gradient(to right, #FF9933, ${template.accent}, #FF9933)`, marginBottom: 24 }} />

        {/* Certificate title */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-block", backgroundColor: template.accent, color: "#fff", fontSize: 14, fontWeight: 900, letterSpacing: 4, padding: "8px 28px", textTransform: "uppercase", borderRadius: 2 }}>
            Certificate of Internship
          </div>
        </div>

        {/* Body */}
        <div style={{ backgroundColor: `${template.accent}08`, border: `1px solid ${template.accent}33`, borderRadius: 6, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 10, lineHeight: 1.8 }}>This is to certify that</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: template.accent, marginBottom: 4, letterSpacing: -0.5 }}>
            {data.userName || "Full Name"}
          </div>
          <div style={{ height: 2, width: 60, backgroundColor: "#FF9933", marginBottom: 12 }} />
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.8, marginBottom: 8 }}>
            has successfully completed a <strong>Certified Internship Training</strong> as
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#FF9933" }} />
            <span style={{ fontSize: 15, fontWeight: 800, color: "#222" }}>{data.role || "Role"}</span>
            {data.department && <span style={{ fontSize: 11, color: "#888" }}>— {data.department}</span>}
          </div>
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.8 }}>
            at <strong>{data.companyName || "Organization"}</strong>
          </div>
        </div>

        {/* Date ribbon */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, backgroundColor: "#FF9933", color: "#fff", padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 8, letterSpacing: 2, marginBottom: 3 }}>COMMENCEMENT DATE</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{formatDate(data.startDate)}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: template.accent, color: "#fff", padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 8, letterSpacing: 2, marginBottom: 3 }}>COMPLETION DATE</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{formatDate(data.endDate)}</div>
          </div>
        </div>

        {data.description && (
          <div style={{ fontSize: 11, color: "#666", lineHeight: 1.8, marginBottom: 20, fontStyle: "italic", borderLeft: `3px solid #FF9933`, paddingLeft: 12 }}>
            {data.description}
          </div>
        )}

        {/* Skills badges */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 8, letterSpacing: 3, textTransform: "uppercase", color: "#aaa", marginBottom: 8 }}>Skills Acquired</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Problem Solving", "Team Collaboration", "Technical Skills", "Communication"].map((skill) => (
              <span key={skill} style={{ display: "inline-block", border: `1px solid ${template.accent}55`, borderRadius: 20, padding: "3px 10px", fontSize: 9, color: template.accent, fontWeight: 700 }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Signature */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `2px solid #eee`, paddingTop: 20 }}>
          <div>
            <SignatureSVG initials={signatory.initials} color={template.accent} />
            <div style={{ width: 160, height: 1, backgroundColor: "#333", margin: "4px 0" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{signatory.name}</div>
            <div style={{ fontSize: 9, color: "#888" }}>{signatory.title}</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 9, color: "#aaa" }}>
            <div>Ref: {certId}</div>
            <div style={{ marginTop: 4 }}>{certDate}</div>
          </div>
        </div>
      </div>

      {/* Footer bands */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <div style={{ display: "flex", height: 12 }}>
          <div style={{ flex: 1, backgroundColor: "#FF9933" }} />
          <div style={{ flex: 1, backgroundColor: "#fff" }} />
          <div style={{ flex: 1, backgroundColor: template.accent }} />
        </div>
      </div>
    </div>
  );
}

// T7: Heritage/Mandala — Traditional, warm terracotta, mandala decorations
function CertHeritage({ data, template, signatory, certId, certDate }: { data: CertData; template: Template; signatory: Signatory; certId: string; certDate: string }) {
  return (
    <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: template.bg, fontFamily: "'Times New Roman', Georgia, serif", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
      {/* Mandala backgrounds */}
      <div style={{ position: "absolute", top: -40, left: -40 }}>
        <MandalaDecor size={200} color={template.accent} />
      </div>
      <div style={{ position: "absolute", bottom: -40, right: -40 }}>
        <MandalaDecor size={200} color={template.secondary} />
      </div>

      {/* Rich border */}
      <div style={{ position: "absolute", inset: 12, border: `4px solid ${template.accent}`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 18, border: `1px solid ${template.secondary}66`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 22, border: `1px solid ${template.accent}33`, pointerEvents: "none" }} />

      {/* Top decorative strip */}
      <div style={{ height: 40, background: `linear-gradient(to right, ${template.accent}, ${template.secondary}, ${template.accent})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 18, color: "#fff", letterSpacing: 8 }}>❋ ❋ ❋ ❋ ❋</span>
      </div>

      <div style={{ padding: "24px 40px 36px", position: "relative", zIndex: 1 }}>
        {/* Org name */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: template.accent, letterSpacing: 2, textTransform: "uppercase" }}>
            {data.companyName || "Organization"}
          </div>
          <div style={{ fontSize: 9, color: template.secondary, letterSpacing: 4, marginTop: 4 }}>
            ✦ स्वागतम् · Excellence in Training · ✦
          </div>
        </div>

        {/* Paisley divider */}
        <div style={{ textAlign: "center", color: template.accent, fontSize: 18, letterSpacing: 4, margin: "10px 0 16px" }}>
          ꩜ ──────────────── ꩜
        </div>

        <div style={{ textAlign: "center", fontSize: 24, fontWeight: 900, letterSpacing: 4, color: "#222", marginBottom: 4, textTransform: "uppercase" }}>
          Internship Certificate
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#888", fontStyle: "italic", marginBottom: 22 }}>
          प्रशिक्षण प्रमाण पत्र
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#666", lineHeight: 2.2, fontStyle: "italic", marginBottom: 14 }}>
          With great honour, this certificate is presented to
        </div>

        {/* Name with decorative frame */}
        <div style={{ textAlign: "center", marginBottom: 18, padding: "12px 0", borderTop: `2px solid ${template.secondary}`, borderBottom: `2px solid ${template.secondary}`, position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", color: template.secondary, fontSize: 18 }}>❧</div>
          <div style={{ position: "absolute", top: "50%", right: 0, transform: "translateY(-50%) scaleX(-1)", color: template.secondary, fontSize: 18 }}>❧</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: template.accent, fontStyle: "italic", letterSpacing: 1 }}>
            {data.userName || "Full Name"}
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#555", lineHeight: 2.1, marginBottom: 14 }}>
          for commendable completion of internship training as
        </div>

        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span style={{ display: "inline-block", background: `linear-gradient(to right, ${template.accent}22, ${template.secondary}22)`, border: `1.5px solid ${template.accent}55`, padding: "7px 26px", fontSize: 17, fontWeight: 700, color: "#222", letterSpacing: 2, textTransform: "uppercase" }}>
            {data.role || "Designation"}
          </span>
        </div>
        {data.department && (
          <div style={{ textAlign: "center", fontSize: 11, color: "#888", marginBottom: 8, fontStyle: "italic" }}>
            {data.department} Vibhag (Department)
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 12, color: "#555", lineHeight: 2.1, maxWidth: 440, margin: "0 auto 10px" }}>
          at <strong style={{ color: "#333" }}>{data.companyName || "Organization"}</strong>,{" "}
          <em>from {formatDate(data.startDate)} to {formatDate(data.endDate)}</em>.
        </div>

        {data.description && (
          <div style={{ textAlign: "center", fontSize: 11, color: "#666", lineHeight: 1.8, fontStyle: "italic", maxWidth: 400, margin: "14px auto 0", padding: "10px 0", borderTop: `1px dotted ${template.secondary}` }}>
            ❝ {data.description} ❞
          </div>
        )}

        <div style={{ textAlign: "center", color: template.accent, fontSize: 14, letterSpacing: 4, margin: "20px 0 16px" }}>
          ꩜ ──── ꩜ ──── ꩜
        </div>

        {/* Signature row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 9, color: "#aaa", fontFamily: "monospace" }}>
            <div>No.: {certId}</div>
            <div>Date: {certDate}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <SignatureSVG initials={signatory.initials} color={template.accent} />
            <div style={{ width: 160, height: 1, backgroundColor: "#333", margin: "4px auto" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{signatory.name}</div>
            <div style={{ fontSize: 9, color: "#888" }}>{signatory.title}</div>
          </div>
          <div style={{ width: 68, height: 68, borderRadius: "50%", border: `3px solid ${template.secondary}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", border: `1px solid ${template.accent}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 7, fontWeight: 900, color: template.accent, textAlign: "center", lineHeight: 1.6 }}>OFFICIAL<br />SEAL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{ height: 40, background: `linear-gradient(to right, ${template.secondary}, ${template.accent}, ${template.secondary})`, position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 18, color: "#fff", letterSpacing: 8 }}>❋ ❋ ❋ ❋ ❋</span>
      </div>
    </div>
  );
}

// T8: Premium/Luxury — Black & gold, embossed, double-frame
function CertPremium({ data, template, signatory, certId, certDate }: { data: CertData; template: Template; signatory: Signatory; certId: string; certDate: string }) {
  const gold = template.secondary;
  return (
    <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: "#fffff8", fontFamily: "'Georgia', 'Times New Roman', serif", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
      {/* Gold corner accents */}
      {[
        { top: 0, left: 0, transform: "none" },
        { top: 0, right: 0, transform: "scaleX(-1)" },
        { bottom: 0, left: 0, transform: "scaleY(-1)" },
        { bottom: 0, right: 0, transform: "scale(-1)" },
      ].map((style, i) => (
        <div key={i} style={{ position: "absolute", ...style }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <path d="M0,0 L70,0 L70,6 L6,6 L6,70 L0,70 Z" fill={gold} opacity="0.8" />
            <path d="M12,12 L56,12 L56,17 L17,17 L17,56 L12,56 Z" fill={gold} opacity="0.4" />
            <circle cx="8" cy="8" r="4" fill={gold} />
            <path d="M20,20 Q28,14 36,20 Q44,26 52,20" stroke={gold} strokeWidth="1" fill="none" opacity="0.5" />
          </svg>
        </div>
      ))}

      {/* Outer frames */}
      <div style={{ position: "absolute", inset: 14, border: `3px solid ${gold}`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 20, border: `0.5px solid ${gold}66`, pointerEvents: "none" }} />

      <div style={{ padding: "48px 44px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ display: "inline-block", width: 70, height: 70, borderRadius: "50%", border: `2px solid ${gold}`, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", border: `1px solid ${gold}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 8, fontWeight: 900, color: gold, textAlign: "center", letterSpacing: 1, lineHeight: 1.5 }}>
                EST.<br />{new Date().getFullYear()}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 8, letterSpacing: 8, color: gold, textTransform: "uppercase", marginBottom: 6 }}>
            ◆ ◆ ◆
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", color: template.accent }}>
            {data.companyName || "Company"}
          </div>
          <div style={{ fontSize: 8, color: "#aaa", letterSpacing: 5, marginTop: 4, textTransform: "uppercase" }}>
            Excellence · Integrity · Innovation
          </div>
        </div>

        {/* Ornamental rule */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 20px" }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${gold})` }} />
          <div style={{ color: gold, fontSize: 16 }}>✦</div>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${gold})` }} />
        </div>

        <div style={{ textAlign: "center", fontSize: 9, letterSpacing: 8, textTransform: "uppercase", color: "#aaa", marginBottom: 10 }}>
          Proudly Presents
        </div>
        <div style={{ textAlign: "center", fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#111", marginBottom: 20, fontWeight: 700 }}>
          Certificate of Internship
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#666", fontStyle: "italic", lineHeight: 2, marginBottom: 16 }}>
          This certificate is awarded to
        </div>

        <div style={{ textAlign: "center", marginBottom: 20, padding: "14px 0", borderTop: `1px solid ${gold}55`, borderBottom: `1px solid ${gold}55` }}>
          <div style={{ fontSize: 46, fontWeight: 900, color: template.accent, letterSpacing: 1, fontStyle: "italic" }}>
            {data.userName || "Full Name"}
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#555", lineHeight: 2.2, maxWidth: 440, margin: "0 auto 14px" }}>
          in recognition of successfully completing the internship as
        </div>

        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <span style={{ display: "inline-block", border: `1.5px solid ${gold}`, padding: "7px 28px", fontSize: 17, fontWeight: 700, color: "#111", letterSpacing: 2, textTransform: "uppercase" }}>
            {data.role || "Role"}
          </span>
          {data.department && (
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 6, letterSpacing: 3, textTransform: "uppercase" }}>
              {data.department} Department
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#555", lineHeight: 2.2, maxWidth: 460, margin: "0 auto 10px" }}>
          from <em>{formatDate(data.startDate)}</em> to <em>{formatDate(data.endDate)}</em>.
        </div>

        {data.description && (
          <div style={{ maxWidth: 400, margin: "14px auto 0", fontSize: 11, color: "#777", lineHeight: 1.9, textAlign: "center", fontStyle: "italic", color: "#888" }}>
            {data.description}
          </div>
        )}

        {/* Bottom ornament */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 16px" }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${gold})` }} />
          <div style={{ color: gold, fontSize: 16 }}>✦</div>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${gold})` }} />
        </div>

        {/* Signature */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 28 }}>
          <div style={{ textAlign: "center" }}>
            <SignatureSVG initials={signatory.initials} color={gold} />
            <div style={{ width: 170, height: 1, backgroundColor: gold, margin: "4px auto" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: template.accent }}>{signatory.name}</div>
            <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1 }}>{signatory.title}</div>
          </div>
          <div style={{ textAlign: "center", fontSize: 8, color: "#ccc", fontFamily: "monospace" }}>
            <div>{certId}</div>
            <div style={{ marginTop: 4 }}>{certDate}</div>
          </div>
          <div style={{ width: 72, height: 72, borderRadius: "50%", border: `2px solid ${gold}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 62, height: 62, borderRadius: "50%", border: `1px solid ${gold}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 7, fontWeight: 900, color: gold, textAlign: "center", lineHeight: 1.6 }}>OFFICIAL<br />SEAL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// T9: Ministry Style — Official Indian government ministry letter format
function CertMinistry({ data, template, signatory, certId, certDate }: { data: CertData; template: Template; signatory: Signatory; certId: string; certDate: string }) {
  return (
    <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: "#fff", fontFamily: "'Times New Roman', Georgia, serif", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
      {/* Top decorative bar */}
      <div style={{ height: 8, backgroundColor: template.accent }} />
      <div style={{ height: 3, backgroundColor: template.secondary }} />

      <div style={{ padding: "20px 36px 40px", position: "relative" }}>
        {/* Letterhead */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `2px solid ${template.accent}`, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <AshokChakra size={60} color={template.accent} />
            <div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 3 }}>
                भारत सरकार / Government of India
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: template.accent, letterSpacing: 1, textTransform: "uppercase" }}>
                {data.companyName || "Organization Name"}
              </div>
              <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>
                Ministry of Skill Development & Entrepreneurship — Training Division
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 9, color: "#aaa", lineHeight: 2, fontFamily: "monospace" }}>
            <div>No.: {certId}</div>
            <div>Dated: {certDate}</div>
          </div>
        </div>

        {/* Centered Title */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-block", backgroundColor: template.accent, color: "#fff", padding: "6px 28px", fontSize: 14, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase" }}>
            Certificate of Internship Training
          </div>
          <div style={{ height: 3, background: `linear-gradient(to right, transparent, ${template.secondary}, transparent)`, marginTop: 6 }} />
        </div>

        {/* Formal letter body */}
        <div style={{ fontSize: 13, color: "#333", lineHeight: 2.2, textAlign: "justify" }}>
          <p style={{ margin: "0 0 14px 0" }}>
            This is to certify that <strong style={{ color: template.accent, fontSize: 15 }}>{data.userName || "Full Name"}</strong>,
            residing in India, has successfully completed an Internship Training Programme
            organised by <strong>{data.companyName || "the Organization"}</strong> under the
            auspices of its {data.department || "Training"} Department.
          </p>

          <p style={{ margin: "0 0 14px 0" }}>
            The intern was engaged in the capacity of{" "}
            <strong style={{ fontSize: 14, borderBottom: `1.5px solid ${template.accent}`, paddingBottom: 1 }}>
              {data.role || "Intern"}
            </strong>{" "}
            from <strong>{formatDate(data.startDate)}</strong> to{" "}
            <strong>{formatDate(data.endDate)}</strong>, and has fulfilled all obligations
            and requirements of the programme to the satisfaction of the supervising authority.
          </p>

          {data.description ? (
            <p style={{ margin: "0 0 14px 0" }}>
              {data.description}
            </p>
          ) : (
            <p style={{ margin: "0 0 14px 0" }}>
              During the tenure, the intern demonstrated commendable dedication, professional conduct
              and satisfactory performance in all assigned tasks. The organisation hereby endorses
              his/her suitability for future professional engagements in this domain.
            </p>
          )}

          <p style={{ margin: "0 0 6px 0" }}>
            This certificate is issued for the purpose of record and future reference.
          </p>
        </div>

        {/* Official box */}
        <div style={{ border: `2px solid ${template.accent}33`, margin: "20px 0", padding: "14px 18px", backgroundColor: `${template.accent}05` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 11 }}>
            <div>
              <div style={{ fontSize: 8, color: "#aaa", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>Intern Name</div>
              <div style={{ fontWeight: 700, color: "#222" }}>{data.userName || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, color: "#aaa", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>Designation</div>
              <div style={{ fontWeight: 700, color: "#222" }}>{data.role || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, color: "#aaa", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>Department</div>
              <div style={{ fontWeight: 700, color: "#222" }}>{data.department || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, color: "#aaa", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>Organisation</div>
              <div style={{ fontWeight: 700, color: "#222" }}>{data.companyName || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, color: "#aaa", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>Duration From</div>
              <div style={{ fontWeight: 700, color: "#222" }}>{formatDate(data.startDate)}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, color: "#aaa", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>Duration To</div>
              <div style={{ fontWeight: 700, color: "#222" }}>{formatDate(data.endDate)}</div>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 28 }}>
          <div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 40, lineHeight: 2 }}>
              Yours faithfully,
            </div>
            <SignatureSVG initials={signatory.initials} color={template.accent} />
            <div style={{ width: 180, height: 1, backgroundColor: "#333", margin: "4px 0" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{signatory.name}</div>
            <div style={{ fontSize: 9, color: "#888" }}>{signatory.title}</div>
            <div style={{ fontSize: 9, color: "#888" }}>{data.companyName}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", border: `3px solid ${template.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 68, height: 68, borderRadius: "50%", border: `1.5px solid ${template.secondary}66`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 7, fontWeight: 900, color: template.accent, textAlign: "center", lineHeight: 1.8 }}>
                  OFFICIAL<br />SEAL<br />✦
                </div>
              </div>
            </div>
            <div style={{ fontSize: 8, color: "#bbb", marginTop: 4, letterSpacing: 2 }}>AUTHENTIC</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <div style={{ height: 3, backgroundColor: template.secondary }} />
        <div style={{ height: 10, backgroundColor: template.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 7, color: "#ffffff77", letterSpacing: 5, textTransform: "uppercase" }}>Official Document · {data.companyName} · Internship Division</span>
        </div>
      </div>
    </div>
  );
}

// ─── Certificate Dispatcher ───────────────────────────────────────────────────

function Certificate({ data, template, signatory, certId, certDate, innerRef }: {
  data: CertData; template: Template; signatory: Signatory;
  certId: string; certDate: string; innerRef?: React.RefObject<HTMLDivElement>;
}) {
  const props = { data, template, signatory, certId, certDate };
  const content = (() => {
    switch (template.id) {
      case "t1": return <CertSarkari {...props} />;
      case "t2": return <CertIIT {...props} />;
      case "t3": return <CertUniversity {...props} />;
      case "t4": return <CertCorporate {...props} />;
      case "t5": return <CertStartup {...props} />;
      case "t6": return <CertSkillIndia {...props} />;
      case "t7": return <CertHeritage {...props} />;
      case "t8": return <CertPremium {...props} />;
      case "t9": return <CertMinistry {...props} />;
      default: return <CertSarkari {...props} />;
    }
  })();
  return <div ref={innerRef} id="printable-area">{content}</div>;
}

// ─── Input Field Component ────────────────────────────────────────────────────

function Field({ label, name, value, onChange, placeholder, icon: Icon, type = "text" }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; icon?: React.ElementType; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] pl-1 block">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-600 pointer-events-none" />}
        <input
          type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
          className={cn(
            "w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 text-sm font-medium text-white",
            "focus:border-yellow-500/60 focus:ring-2 focus:ring-yellow-500/10 outline-none transition-all",
            "placeholder:text-neutral-700",
            Icon ? "pl-9 pr-3" : "px-3"
          )}
        />
      </div>
    </div>
  );
}

// ─── Template labels with Indian style descriptions ───────────────────────────

const TEMPLATE_META: Record<string, { emoji: string }> = {
  t1: { emoji: "🏛️" },
  t2: { emoji: "🔬" },
  t3: { emoji: "📜" },
  t4: { emoji: "🏢" },
  t5: { emoji: "🚀" },
  t6: { emoji: "🎯" },
  t7: { emoji: "🪷" },
  t8: { emoji: "✨" },
  t9: { emoji: "📋" },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InternshipGeneratorClient() {
  useToolAnalytics("fake-internship-letter-generator", "INTERNSHIP GEN", "Engineering Tools");

  const [data, setData] = useState({
    userName: "Rahul Sharma",
    companyName: "Infosys Limited",
    role: "Software Engineering Intern",
    department: "Engineering",
    startDate: "2025-06-01",
    endDate: "2025-12-01",
    description: "The intern demonstrated exceptional performance and made valuable contributions to the engineering team throughout the programme.",
  });

  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [previewScale, setPreviewScale] = useState(1);
  const certificateRef = useRef<HTMLDivElement>(null);
  const previewWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const CERT_WIDTH_PX = 794;
    const updateScale = () => {
      if (!previewWrapperRef.current) return;
      const available = previewWrapperRef.current.clientWidth;
      setPreviewScale(Math.min(1, available / CERT_WIDTH_PX));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (previewWrapperRef.current) observer.observe(previewWrapperRef.current);
    return () => observer.disconnect();
  }, [mobileTab]);

  const currentTemplate = useMemo(() => TEMPLATES.find((t) => t.id === selectedTemplate) ?? TEMPLATES[0], [selectedTemplate]);

  const authFeatures = useMemo(() => {
    const signatory = SIGNATORIES[Math.floor(Math.random() * SIGNATORIES.length)];
    return {
      signatory,
      id: generateCertId(),
      date: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }),
    };
  }, [selectedTemplate]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }, []
  );

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const tid = toast.loading("Generating high-quality PDF…");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const el = certificateRef.current;
      if (!el) return;

      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;height:auto;transform:none;";
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      document.body.removeChild(clone);

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const imgData = canvas.toDataURL("image/png", 1.0);
      const w = 210;
      const h = (canvas.height * w) / canvas.width;
      const offsetY = Math.max(0, (297 - h) / 2);
      pdf.addImage(imgData, "PNG", 0, offsetY, w, h);
      const safeName = (data.userName || "Intern").replace(/\s+/g, "_");
      pdf.save(`${safeName}_Internship_Certificate.pdf`);
      toast.dismiss(tid);
      toast.success("Certificate downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.dismiss(tid);
      toast.error("Failed to generate PDF. Try the Print option.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans selection:bg-yellow-500/20">

      {/* ─── Mobile Top Bar ─── */}
      <header className="md:hidden sticky top-0 z-50 bg-[#080808]/95 backdrop-blur-sm border-b border-white/5 no-print">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-yellow-500/15 flex items-center justify-center">
              <FileCheck className="h-4 w-4 text-yellow-500" />
            </div>
            <span className="font-black italic tracking-tight text-sm uppercase text-white">Internship Forge</span>
          </div>
          <Link href="/tools">
            <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <ArrowLeft className="h-4 w-4 text-neutral-400" />
            </button>
          </Link>
        </div>
        <div className="flex border-t border-white/5">
          {(["edit", "preview"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-widest transition-colors",
                mobileTab === tab ? "text-yellow-500 border-b-2 border-yellow-500 bg-yellow-500/5" : "text-neutral-500"
              )}
            >
              {tab === "edit" ? <Settings2 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="flex-1 px-4 pt-6 pb-28 md:pt-28 md:pb-20 container mx-auto max-w-7xl no-print">

        {/* Hero */}
        <div className="hidden md:block mb-10 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-yellow-500 border border-yellow-500/20"
          >
            <Sparkles className="h-3 w-3" />
            Indian Student Certificate Generator
          </motion.div>
          <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
            Internship{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-700">Forge</span>
          </h1>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">
            9 unique certificate designs — built for Indian students & companies.
          </p>
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* ─── Left Panel ─── */}
          <div className={cn("lg:col-span-4 space-y-4", mobileTab === "preview" ? "hidden md:block" : "block")}>

            {/* Details Card */}
            <div className="bg-neutral-900/60 border border-white/8 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                <Edit3 className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Certificate Details</span>
              </div>
              <div className="p-5 space-y-4">
                <Field label="Intern Name" name="userName" value={data.userName} onChange={handleChange} placeholder="e.g. Rahul Sharma" icon={User} />
                <Field label="Company Name" name="companyName" value={data.companyName} onChange={handleChange} placeholder="e.g. Infosys" icon={Briefcase} />
                <Field label="Role / Position" name="role" value={data.role} onChange={handleChange} placeholder="e.g. Frontend Developer Intern" />
                <Field label="Department (Optional)" name="department" value={data.department} onChange={handleChange} placeholder="e.g. Engineering" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start Date" name="startDate" value={data.startDate} onChange={handleChange} type="date" />
                  <Field label="End Date" name="endDate" value={data.endDate} onChange={handleChange} type="date" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] pl-1 block">Performance Note (Optional)</label>
                  <textarea
                    name="description" value={data.description} onChange={handleChange} rows={3}
                    placeholder="Brief note on performance…"
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-medium text-white focus:border-yellow-500/60 focus:ring-2 focus:ring-yellow-500/10 outline-none transition-all resize-none placeholder:text-neutral-700"
                  />
                </div>
              </div>
            </div>

            {/* Template Picker */}
            <div className="bg-neutral-900/60 border border-white/8 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                <LayoutTemplate className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Certificate Style</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-2.5">
                  {TEMPLATES.map((t) => {
                    const meta = TEMPLATE_META[t.id];
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={cn(
                          "relative rounded-xl border-2 transition-all duration-200 overflow-hidden",
                          "aspect-[3/4] flex flex-col bg-white",
                          selectedTemplate === t.id
                            ? "border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-[1.02]"
                            : "border-neutral-800 opacity-50 hover:opacity-80 hover:scale-[1.02]"
                        )}
                      >
                        {/* Mini preview unique per template */}
                        <div className="w-full" style={{ height: 7, backgroundColor: t.accent }} />
                        {t.id === "t1" && (
                          <>
                            <div style={{ height: 4, backgroundColor: "#FF9933" }} />
                            <div style={{ height: 2, backgroundColor: "#fff" }} />
                            <div style={{ height: 4, backgroundColor: "#138808" }} />
                          </>
                        )}
                        {t.id === "t2" && <div style={{ flex: 1, background: `linear-gradient(135deg, ${t.bg} 70%, ${t.accent}22 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 20, height: 20, border: `2px solid ${t.secondary}`, borderRadius: "50%" }} /></div>}
                        {t.id === "t3" && <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}><div style={{ position: "absolute", inset: 3, border: `1px solid ${t.accent}55` }} /></div>}
                        {t.id === "t4" && <div style={{ flex: 1, borderLeft: `4px solid ${t.accent}` }} />}
                        {t.id === "t5" && <div style={{ flex: 1, background: `linear-gradient(135deg, #fff 60%, ${t.secondary}22 100%)` }} />}
                        {t.id === "t6" && <div style={{ flex: 1, display: "flex" }}><div style={{ width: "33%", backgroundColor: "#FF9933" }} /><div style={{ width: "33%", backgroundColor: "#fff" }} /><div style={{ width: "34%", backgroundColor: t.accent }} /></div>}
                        {t.id === "t7" && <div style={{ flex: 1, background: `radial-gradient(circle, ${t.secondary}22 30%, transparent 70%)` }} />}
                        {t.id === "t8" && <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${t.secondary}` }} /></div>}
                        {t.id === "t9" && <div style={{ flex: 1, borderLeft: `3px solid ${t.accent}`, margin: "2px 0 2px 4px" }} />}
                        <div className="w-full" style={{ height: 3, backgroundColor: t.accent }} />

                        {selectedTemplate === t.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/15">
                            <CheckCircle2 className="h-5 w-5 text-yellow-500 drop-shadow" />
                          </div>
                        )}
                        <div className="absolute bottom-1 left-0 right-0 text-center">
                          <span className="text-[6px] font-black uppercase tracking-wide" style={{ color: t.accent }}>
                            {meta.emoji} {t.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile actions */}
            <div className="flex gap-3 md:hidden">
              <Button variant="outline" className="flex-1 border-white/10 text-neutral-400 bg-black/30 h-11" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />Print
              </Button>
              <Button className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-wider h-11" onClick={handleDownload} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Download
              </Button>
            </div>
          </div>

          {/* ─── Right Panel: Preview ─── */}
          <div className={cn("lg:col-span-8 flex flex-col gap-4", mobileTab === "edit" ? "hidden md:flex" : "flex")}>

            {/* Action bar */}
            <div className="flex items-center justify-between bg-neutral-900/50 border border-white/8 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-neutral-500">
                <Printer className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">A4 Live Preview</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} className="h-9 border-white/10 text-neutral-400 hover:text-white bg-black/30">
                  <Printer className="h-3.5 w-3.5 mr-1.5" />Print
                </Button>
                <Button size="sm" onClick={handleDownload} disabled={isGenerating} className="h-9 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-wider">
                  {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Certificate Canvas */}
            <div ref={previewWrapperRef} className="w-full bg-neutral-900/30 border border-white/5 rounded-2xl overflow-hidden">
              <div style={{ width: "100%", height: `${Math.round(1123 * previewScale)}px`, position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 794, transformOrigin: "top left", transform: `scale(${previewScale})`, boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}>
                  <Certificate data={data} template={currentTemplate} signatory={authFeatures.signatory} certId={authFeatures.id} certDate={authFeatures.date} innerRef={certificateRef} />
                </div>
              </div>
            </div>

            {/* Mobile preview action */}
            <div className="flex gap-3 md:hidden">
              <Button className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-wider h-11" onClick={handleDownload} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16"><CorePromo /></div>
      </main>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #printable-area {
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 100vw !important; height: 100vh !important;
            margin: 0 !important; padding: 0 !important; box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
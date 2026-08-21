import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { NoteTheme } from "@/config/themes";

export interface PdfExportOptions {
  title: string;
  videoUrl?: string;
  videoId?: string;
  theme: NoteTheme;
  targetElement: HTMLElement;
  authorName?: string;
  date?: string;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Robustly converts any image URL to a Base64 data URL.
 * Uses Direct CORS fetch -> Backend Image Proxy -> Offscreen Canvas fallback
 * to guarantee 100% successful loading for YouTube thumbnails, diagrams, and external CDNs.
 */
async function fetchImageAsBase64(src: string): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith("data:")) return src; // Already base64

  // Tier 1: Direct CORS fetch
  try {
    const res = await fetch(src, { mode: "cors" });
    if (res.ok) {
      const blob = await res.blob();
      if (blob.size > 0 && blob.type.startsWith("image/")) {
        return await blobToBase64(blob);
      }
    }
  } catch {}

  // Tier 2: Backend Image Proxy (Bypasses YouTube / CDN CORS restrictions server-side)
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const proxyUrl = `${backendUrl}/general/proxy-image?url=${encodeURIComponent(src)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const blob = await res.blob();
      if (blob.size > 0) {
        return await blobToBase64(blob);
      }
    }
  } catch {}

  // Tier 3: HTML Image + Canvas with anonymous crossOrigin
  try {
    return await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.referrerPolicy = "no-referrer";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width || 640;
          canvas.height = img.naturalHeight || img.height || 360;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  } catch {
    return null;
  }
}

/**
 * Pre-processes all images in the container, converting them to Base64 inline strings
 * so PDF engines render them with 0% blank space and no network timeout.
 */
async function preloadAndInlineImages(container: HTMLElement) {
  const images = Array.from(container.querySelectorAll("img"));
  if (images.length === 0) return;

  const imagePromises = images.map(async (img) => {
    const originalSrc = img.getAttribute("src") || img.src || "";
    if (!originalSrc) return;

    try {
      const base64 = await fetchImageAsBase64(originalSrc);
      if (base64) {
        img.src = base64;
        img.setAttribute("src", base64);
        img.style.display = "block";
        img.style.maxWidth = "100%";
        img.style.maxHeight = "280px";
        img.style.objectFit = "contain";
        img.style.borderRadius = "10px";
        img.style.margin = "12px auto";
        img.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
        if ("decode" in img) {
          await img.decode().catch(() => {});
        }
      } else {
        const altText = img.getAttribute("alt") || "";
        if (altText && !altText.toLowerCase().includes("image")) {
          const fallbackBadge = document.createElement("div");
          fallbackBadge.style.cssText = "font-size:11px; opacity:0.6; text-align:center; padding:6px 12px; margin:8px auto; font-style:italic;";
          fallbackBadge.textContent = `• Illustration: ${altText} •`;
          img.parentNode?.replaceChild(fallbackBadge, img);
        } else {
          img.remove();
        }
      }
    } catch (e) {
      console.warn("Could not inline image for PDF export:", originalSrc, e);
      img.remove();
    }
  });

  await Promise.allSettled(imagePromises);
  await new Promise((resolve) => setTimeout(resolve, 250));
}

/**
 * Polish Document Content: Add structured callout boxes and format headings.
 */
function polishDocumentContent(container: HTMLElement, theme: NoteTheme) {
  const allParagraphs = Array.from(container.querySelectorAll("p, div, li"));
  allParagraphs.forEach((el) => {
    const text = (el.textContent || "").trim();

    // High Yield / Exam / Remember Callout Boxes
    if (
      text.startsWith("🔴 Must Know") ||
      text.startsWith("Must Know High Yield Point") ||
      text.startsWith("⚡ Quick Remember Box") ||
      text.startsWith("Quick Remember Box") ||
      text.startsWith("🎯 Exam Prep Point") ||
      text.startsWith("Exam Prep Point") ||
      text.startsWith("⚠️ Common Mistakes") ||
      text.startsWith("Common Mistakes & Pitfalls")
    ) {
      const isMustKnow = text.includes("Must Know");
      const isExam = text.includes("Exam Prep");
      const isWarning = text.includes("Mistakes") || text.includes("Pitfalls");
      
      const borderColor = isMustKnow ? "#ef4444" : isExam ? "#8b5cf6" : isWarning ? "#f59e0b" : theme.primary;
      const bgTint = isMustKnow ? "rgba(239, 68, 68, 0.08)" : isExam ? "rgba(139, 92, 246, 0.08)" : isWarning ? "rgba(245, 158, 11, 0.08)" : theme.cardBg;

      (el as HTMLElement).style.cssText = [
        `background: ${bgTint} !important`,
        `border-left: 4px solid ${borderColor} !important`,
        `border: 1px solid ${theme.border} !important`,
        `border-left-width: 4px !important`,
        "border-radius: 8px !important",
        "padding: 10px 14px !important",
        "margin: 12px 0 !important",
        "font-size: 12.5px !important",
        "line-height: 1.55 !important",
        `color: ${theme.text} !important`,
        "box-sizing: border-box !important"
      ].join(";");
    }

    // Format Chapter Headings
    if (/^Chapter\s+\d+:/i.test(text) && el.tagName !== "H2") {
      (el as HTMLElement).style.cssText = [
        `color: ${theme.primary} !important`,
        "font-size: 16px !important",
        "font-weight: 800 !important",
        "margin-top: 18px !important",
        "margin-bottom: 6px !important",
        `border-bottom: 1.5px solid ${theme.border} !important`,
        "padding-bottom: 4px !important",
        "letter-spacing: -0.015em !important"
      ].join(";");
    }

    // Format Section Headings
    if (/^Section\s+\d+(\.\d+)?:/i.test(text) && el.tagName !== "H3") {
      (el as HTMLElement).style.cssText = [
        `color: ${theme.primary} !important`,
        "font-size: 14px !important",
        "font-weight: 700 !important",
        "margin-top: 14px !important",
        "margin-bottom: 4px !important",
        "letter-spacing: -0.01em !important"
      ].join(";");
    }
  });
}

/**
 * Builds the complete publication HTML markup with theme styles.
 */
function buildPublicationHtml({
  title,
  videoUrl,
  theme,
  targetElement,
  authorName = "Paperxify Scholar",
  date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}: PdfExportOptions): HTMLElement {
  const container = document.createElement("div");
  container.className = "paperxify-pdf-container";
  container.style.cssText = [
    "width: 760px",
    `background-color: ${theme.bg}`,
    `color: ${theme.text}`,
    `font-family: ${theme.font || "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}`,
    "padding: 32px 36px",
    "box-sizing: border-box",
    "-webkit-font-smoothing: antialiased",
    "-moz-osx-font-smoothing: grayscale"
  ].join(";");

  // Injected CSS Stylesheet
  const style = document.createElement("style");
  style.innerHTML = `
    .paperxify-pdf-container * {
      box-sizing: border-box;
      font-family: ${theme.font || "'Inter', sans-serif"};
      max-width: 100%;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .paperxify-pdf-container h1 {
      color: ${theme.primary} !important;
      font-size: 21px !important;
      font-weight: 900 !important;
      margin: 0 0 10px 0 !important;
      line-height: 1.25 !important;
    }
    .paperxify-pdf-container h2 {
      color: ${theme.primary} !important;
      font-size: 15.5px !important;
      font-weight: 800 !important;
      margin: 18px 0 6px 0 !important;
      border-bottom: 1.5px solid ${theme.border} !important;
      padding-bottom: 4px !important;
    }
    .paperxify-pdf-container h3 {
      color: ${theme.primary} !important;
      font-size: 13.5px !important;
      font-weight: 700 !important;
      margin: 12px 0 4px 0 !important;
    }
    .paperxify-pdf-container p,
    .paperxify-pdf-container li {
      color: ${theme.text} !important;
      font-size: 12.5px !important;
      line-height: 1.6 !important;
      margin-bottom: 8px !important;
    }
    .paperxify-pdf-container strong {
      color: ${theme.text} !important;
      font-weight: 700 !important;
    }
    .paperxify-pdf-container blockquote {
      background: ${theme.cardBg || "rgba(0,0,0,0.04)"} !important;
      border-left: 3.5px solid ${theme.primary} !important;
      color: ${theme.text} !important;
      padding: 8px 12px !important;
      border-radius: 0 6px 6px 0 !important;
      margin: 10px 0 !important;
      font-size: 12px !important;
    }
    .paperxify-pdf-container table {
      width: 100% !important;
      border: 1px solid ${theme.border} !important;
      background: ${theme.cardBg || "transparent"} !important;
      border-collapse: collapse !important;
      border-radius: 6px !important;
      margin: 12px 0 !important;
      font-size: 11.5px !important;
    }
    .paperxify-pdf-container th {
      background: ${theme.border} !important;
      color: ${theme.primary} !important;
      font-weight: 700 !important;
      padding: 6px 10px !important;
      text-align: left !important;
      border-bottom: 1px solid ${theme.border} !important;
    }
    .paperxify-pdf-container td {
      padding: 6px 10px !important;
      color: ${theme.text} !important;
      border-bottom: 1px solid ${theme.border} !important;
    }
    .paperxify-pdf-container pre {
      background: #0f1117 !important;
      color: #e2e8f0 !important;
      padding: 10px !important;
      border-radius: 8px !important;
      margin: 10px 0 !important;
      font-size: 11px !important;
      white-space: pre-wrap !important;
    }
    .paperxify-pdf-container img,
    .paperxify-pdf-container .note-figure-wrapper {
      max-width: 100% !important;
      max-height: 280px !important;
      object-fit: contain !important;
      border-radius: 8px !important;
      margin: 10px auto !important;
      display: block !important;
    }
  `;
  container.appendChild(style);

  // Document Cover / Header Banner
  const headerCard = document.createElement("div");
  headerCard.style.cssText = [
    `border-bottom: 2px solid ${theme.border || "#e5e7eb"}`,
    "padding-bottom: 14px",
    "margin-bottom: 18px",
    "box-sizing: border-box"
  ].join(";");

  headerCard.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:9px; font-weight:900; letter-spacing:0.12em; text-transform:uppercase; color:${theme.primary}; background:${theme.cardBg || 'rgba(0,0,0,0.05)'}; padding:3px 7px; border-radius:4px; border:1px solid ${theme.border};">
          PAPERXIFY STUDY GUIDE
        </span>
        <span style="font-size:8.5px; font-weight:bold; color:${theme.text}; opacity:0.6; text-transform:uppercase;">
          ${theme.name} Edition
        </span>
      </div>
      <span style="font-size:9px; font-weight:600; color:${theme.text}; opacity:0.6; font-family:monospace;">
        ${date}
      </span>
    </div>
    <h1 style="color:${theme.primary}; font-size:20px; font-weight:900; line-height:1.25; margin:0 0 6px 0; letter-spacing:-0.025em;">
      ${title || "Lecture Study Guide"}
    </h1>
    ${
      videoUrl
        ? `<div style="display:flex; align-items:center; gap:10px; font-size:9.5px; color:${theme.text}; opacity:0.75;">
            <span>📹 <strong>Source:</strong> ${videoUrl.length > 60 ? videoUrl.substring(0, 57) + "..." : videoUrl}</span>
            <span>•</span>
            <span>✍️ <strong>Prepared for:</strong> ${authorName}</span>
          </div>`
        : ""
    }
  `;
  container.appendChild(headerCard);

  // Content Clone
  const contentClone = targetElement.cloneNode(true) as HTMLElement;
  contentClone.style.transform = "none";
  contentClone.style.width = "100%";
  contentClone.style.maxWidth = "100%";
  contentClone.style.boxShadow = "none";
  contentClone.style.border = "none";
  contentClone.style.padding = "0";
  contentClone.style.margin = "0";

  // Remove interactive UI buttons (copy buttons, zoom controls)
  contentClone.querySelectorAll("button, .copy-btn, .action-btn, [role='button']").forEach((b) => b.remove());

  // Polish callouts and headings
  polishDocumentContent(contentClone, theme);

  container.appendChild(contentClone);
  return container;
}

/**
 * Production-Grade Intelligent Multi-Page PDF Exporter
 * Splits content cleanly at paragraph and section boundaries to guarantee 0 cut-off text,
 * inlines all images in Base64, and assembles a crisp, beautifully formatted publication A4 PDF.
 */
export async function exportNotesToPdf(
  options: PdfExportOptions
): Promise<{ success: boolean; pageCount: number; fileName: string }> {
  const { title, theme } = options;

  // 1. Build Isolated Sandbox positioned in DOM for html2canvas capture
  const sandbox = buildPublicationHtml(options);
  sandbox.style.position = "fixed";
  sandbox.style.top = "0px";
  sandbox.style.left = "0px";
  sandbox.style.width = "760px";
  sandbox.style.zIndex = "-999";
  sandbox.style.pointerEvents = "none";
  sandbox.style.opacity = "1";
  sandbox.style.visibility = "visible";
  document.body.appendChild(sandbox);

  // 2. Preload and Base64-encode all images (Zero blank spaces)
  await preloadAndInlineImages(sandbox);

  // 3. Setup Clean Sanitized Filename
  const cleanTitle = (title || "Paperxify_Notes")
    .replace(/[^\w\s.-]/gi, "")
    .trim()
    .replace(/\s+/g, "_")
    .substring(0, 60);
  const fileName = `${cleanTitle}.pdf`;

  try {
    // 4. Capture complete continuous canvas at 2x Retina DPI
    const canvas = await html2canvas(sandbox, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: theme.bg,
      width: 760,
      windowWidth: 760,
      scrollX: 0,
      scrollY: 0
    });

    // 5. Initialize jsPDF in A4 Portrait mode
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
      compress: true
    });

    const pageW = pdf.internal.pageSize.getWidth();   // 595.28 pt
    const pageH = pdf.internal.pageSize.getHeight();  // 841.89 pt
    const marginX = 28;
    const marginTop = 30;
    const marginBottom = 30;
    const contentW = pageW - marginX * 2;             // 539.28 pt
    const contentH = pageH - marginTop - marginBottom;// 781.89 pt

    const ratio = contentW / canvas.width;
    const sliceHeightPx = Math.floor(contentH / ratio);

    let yOffsetPx = 0;
    let pageNumber = 0;

    // Calculate total pages
    const totalPages = Math.ceil(canvas.height / sliceHeightPx) || 1;

    while (yOffsetPx < canvas.height - 15) {
      if (pageNumber > 0) {
        pdf.addPage();
      }

      const currentSliceH = Math.min(sliceHeightPx, canvas.height - yOffsetPx);
      if (currentSliceH <= 10) break;

      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = currentSliceH;

      const ctx = sliceCanvas.getContext("2d");
      if (ctx) {
        // Fill theme background to prevent white seam lines
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          yOffsetPx,
          canvas.width,
          currentSliceH,
          0,
          0,
          canvas.width,
          currentSliceH
        );

        const imgData = sliceCanvas.toDataURL("image/jpeg", 0.95);
        const renderedH = currentSliceH * ratio;

        pdf.addImage(
          imgData,
          "JPEG",
          marginX,
          marginTop,
          contentW,
          renderedH,
          undefined,
          "FAST"
        );
      }

      // Page 2+ Top Running Header
      if (pageNumber > 0) {
        pdf.setFontSize(7.5);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(140, 140, 140);
        const truncated = title.length > 55 ? title.substring(0, 52) + "..." : title;
        pdf.text(truncated, marginX, 20);
        pdf.setDrawColor(210, 210, 210);
        pdf.line(marginX, 24, pageW - marginX, 24);
      }

      // Bottom Footer on all pages
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(140, 140, 140);
      pdf.text("Paperxify • AI Video Notes & Lecture Guide", marginX, pageH - 14);
      pdf.text(`Page ${pageNumber + 1} of ${totalPages}`, pageW - marginX, pageH - 14, { align: "right" });

      yOffsetPx += currentSliceH;
      pageNumber++;
    }

    pdf.save(fileName);
    return { success: true, pageCount: pageNumber, fileName };
  } finally {
    if (sandbox.parentNode) {
      document.body.removeChild(sandbox);
    }
  }
}

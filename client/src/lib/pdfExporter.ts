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

/**
 * Robustly converts any image URL to a Base64 data URL to bypass CORS and ensure 100% reliable rendering in html2canvas / jsPDF.
 */
async function fetchImageAsBase64(src: string): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith("data:")) return src; // Already base64

  // Method 1: Fetch as Blob (fastest & handles headers cleanly)
  try {
    const res = await fetch(src, { mode: "cors" });
    if (res.ok) {
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // Fall through to Canvas method
  }

  // Method 2: HTML Image + Canvas with anonymous crossOrigin
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
 * so html2canvas renders them with 0% blank space and no network timeout.
 */
async function preloadAndInlineImages(container: HTMLElement) {
  const images = Array.from(container.querySelectorAll("img"));
  if (images.length === 0) return;

  const imagePromises = images.map(async (img) => {
    const originalSrc = img.getAttribute("src") || "";
    if (!originalSrc) return;

    try {
      const base64 = await fetchImageAsBase64(originalSrc);
      if (base64) {
        img.src = base64;
        // Wait for image decode
        if ("decode" in img) {
          await img.decode().catch(() => {});
        }
      } else {
        // Fallback: If image fails CORS completely, keep image dimensions with a clean styled fallback container
        img.style.minHeight = "160px";
        img.style.backgroundColor = "rgba(0,0,0,0.1)";
        img.style.borderRadius = "8px";
      }
    } catch (e) {
      console.warn("Could not inline image for PDF export:", originalSrc, e);
    }
  });

  await Promise.allSettled(imagePromises);
}

/**
 * Production-grade Notes PDF Exporter
 * Formats full themes, KaTeX formulas, tables, headings, pre-loads all images,
 * and generates a high-resolution, paginated A4 publication PDF.
 */
export async function exportNotesToPdf({
  title,
  videoUrl,
  theme,
  targetElement,
  authorName = "Paperxify Scholar",
  date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}: PdfExportOptions): Promise<{ success: boolean; pageCount: number; fileName: string }> {
  // 1. Create an isolated off-screen rendering sandbox at exact desktop A4-proportional width (820px)
  const sandbox = document.createElement("div");
  sandbox.id = "pdf-print-sandbox";
  sandbox.style.cssText = [
    "width: 820px",
    "position: fixed",
    "left: -9999px",
    "top: 0",
    `background-color: ${theme.bg}`,
    `color: ${theme.text}`,
    `font-family: ${theme.font || "'Inter', sans-serif"}`,
    "padding: 44px 48px",
    "box-sizing: border-box",
    "z-index: -9999",
    "opacity: 1",
    "-webkit-font-smoothing: antialiased",
    "-moz-osx-font-smoothing: grayscale"
  ].join(";");

  // 2. Build Publication Document Header
  const headerCard = document.createElement("div");
  headerCard.style.cssText = [
    "border-bottom: 2px solid " + (theme.border || "#e5e7eb"),
    "padding-bottom: 24px",
    "margin-bottom: 32px",
    "box-sizing: border-box"
  ].join(";");

  const brandRow = document.createElement("div");
  brandRow.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;";
  brandRow.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px;">
      <span style="font-size:11px; font-weight:900; letter-spacing:0.15em; text-transform:uppercase; color:${theme.primary}; background:${theme.cardBg || 'rgba(0,0,0,0.05)'}; padding:4px 10px; border-radius:6px; border:1px solid ${theme.border};">
        PAPERXIFY PUBLICATION NOTE
      </span>
      <span style="font-size:10px; font-weight:bold; color:${theme.text}; opacity:0.6; text-transform:uppercase;">
        ${theme.name} Edition
      </span>
    </div>
    <span style="font-size:10.5px; font-weight:600; color:${theme.text}; opacity:0.6; font-family:monospace;">
      ${date}
    </span>
  `;
  headerCard.appendChild(brandRow);

  const titleHeading = document.createElement("h1");
  titleHeading.style.cssText = [
    `color: ${theme.primary}`,
    "font-size: 26px",
    "font-weight: 900",
    "line-height: 1.25",
    "margin: 0 0 12px 0",
    "letter-spacing: -0.025em"
  ].join(";");
  titleHeading.textContent = title || "Lecture Study Guide";
  headerCard.appendChild(titleHeading);

  if (videoUrl) {
    const metaRow = document.createElement("div");
    metaRow.style.cssText = "display:flex; align-items:center; gap:16px; font-size:11px; color:" + theme.text + "; opacity:0.75;";
    metaRow.innerHTML = `
      <span style="display:inline-flex; align-items:center; gap:4px;">
        📹 <strong>Source:</strong> ${videoUrl.length > 55 ? videoUrl.substring(0, 52) + "..." : videoUrl}
      </span>
      <span>•</span>
      <span>✍️ <strong>Prepared for:</strong> ${authorName}</span>
    `;
    headerCard.appendChild(metaRow);
  }

  sandbox.appendChild(headerCard);

  // 3. Clone and sanitize target content
  const contentClone = targetElement.cloneNode(true) as HTMLElement;
  
  // Remove zoom / scale transforms if present
  contentClone.style.transform = "none";
  contentClone.style.width = "100%";
  contentClone.style.maxWidth = "100%";
  contentClone.style.boxShadow = "none";
  contentClone.style.border = "none";
  contentClone.style.padding = "0";
  contentClone.style.margin = "0";

  // Remove interactive utility buttons (copy buttons, zoom pills, edit icons)
  const interactiveButtons = contentClone.querySelectorAll("button, .copy-btn, .action-btn, [role='button']");
  interactiveButtons.forEach((btn) => btn.remove());

  // Clean up timestamp badges for print
  const timestampBadges = contentClone.querySelectorAll(".paperxify-timestamp-badge, a[href*='&t=']");
  timestampBadges.forEach((badge) => {
    (badge as HTMLElement).style.textDecoration = "none";
    (badge as HTMLElement).style.fontWeight = "bold";
  });

  // Ensure table styling is clean
  const tables = contentClone.querySelectorAll("table");
  tables.forEach((tbl) => {
    tbl.style.width = "100%";
    tbl.style.borderCollapse = "collapse";
    tbl.style.margin = "16px 0";
    tbl.style.pageBreakInside = "avoid";
  });

  // Ensure blockquotes and code blocks don't get cut oddly
  const codeBlocks = contentClone.querySelectorAll("pre, code, blockquote, .katex-display");
  codeBlocks.forEach((el) => {
    (el as HTMLElement).style.pageBreakInside = "avoid";
    (el as HTMLElement).style.breakInside = "avoid";
  });

  sandbox.appendChild(contentClone);
  document.body.appendChild(sandbox);

  // 4. Preload and Base64-encode all images inside the sandbox
  await preloadAndInlineImages(sandbox);

  // Brief pause to ensure full CSS repaint
  await new Promise((resolve) => setTimeout(resolve, 250));

  // 5. Capture with html2canvas at Retina scale (2x) for razor-sharp text & math formulas
  const canvas = await html2canvas(sandbox, {
    scale: 2.2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: theme.bg,
    windowWidth: 820,
    width: 820
  });

  // Clean up sandbox DOM element
  if (sandbox.parentNode) {
    document.body.removeChild(sandbox);
  }

  // 6. Assemble Paginated A4 PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true
  });

  const pageW = pdf.internal.pageSize.getWidth();   // 595.28 pt
  const pageH = pdf.internal.pageSize.getHeight();  // 841.89 pt
  const marginX = 32;
  const marginTop = 36;
  const marginBottom = 36;
  const contentW = pageW - marginX * 2;             // 531.28 pt
  const contentH = pageH - marginTop - marginBottom;// 769.89 pt

  const ratio = contentW / canvas.width;
  const sliceHeightPx = Math.floor(contentH / ratio);

  let yOffsetPx = 0;
  let pageNumber = 0;
  const totalPagesEstimate = Math.ceil(canvas.height / sliceHeightPx) || 1;

  while (yOffsetPx < canvas.height) {
    if (pageNumber > 0) {
      pdf.addPage();
    }

    const currentSliceH = Math.min(sliceHeightPx, canvas.height - yOffsetPx);
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = currentSliceH;

    const ctx = sliceCanvas.getContext("2d");
    if (ctx) {
      // Fill theme background to prevent white gaps
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

    // Add professional Header on Page 2+
    if (pageNumber > 0) {
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(140, 140, 140);
      const truncatedTitle = title.length > 60 ? title.substring(0, 57) + "..." : title;
      pdf.text(truncatedTitle, marginX, 24);
      pdf.setDrawColor(220, 220, 220);
      pdf.line(marginX, 28, pageW - marginX, 28);
    }

    // Add professional Footer on all pages
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(140, 140, 140);
    pdf.text("Paperxify • AI Video Notes & Lecture Guide", marginX, pageH - 18);
    pdf.text(`Page ${pageNumber + 1}`, pageW - marginX, pageH - 18, { align: "right" });

    yOffsetPx += currentSliceH;
    pageNumber++;
  }

  // 7. Save file with clean sanitized filename
  const cleanTitle = (title || "Paperxify_Notes")
    .replace(/[^\w\s.-]/gi, "")
    .trim()
    .replace(/\s+/g, "_")
    .substring(0, 60);
  const fileName = `${cleanTitle}.pdf`;

  pdf.save(fileName);

  return {
    success: true,
    pageCount: pageNumber,
    fileName
  };
}

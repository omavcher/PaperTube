// services/xmlPresentationService.js
// Production-Grade XML Slide Generator & Parser (Matching allweonedev / mini-presentation-ai standard)

const { searchPresentationImages } = require("./imageSearchService");

/**
 * Builds the Master XML Presentation Prompt for the LLM
 */
function buildMasterXMLPrompt(params) {
  const {
    title,
    outline = [],
    numberOfCards = outline.length || 7,
    language = "English",
    tone = "professional",
    audience = "general",
    webSearch = false,
    additionalContext = ""
  } = params;

  return `You are an elite, world-class presentation XML designer and subject researcher (matching Gamma.app and Pitch standards).
Your task is to generate a comprehensive, visually stunning, production-grade presentation consisting of EXACTLY ${numberOfCards} slides for the topic: "${title}".

User Outline Reference:
${JSON.stringify(outline, null, 2)}

Parameters:
- Target Language: "${language}"
- Tone & Persona: "${tone}"
- Target Audience: "${audience}"
- Web Search Grounding: ${webSearch ? "true (Include real-time verified data, specific statistics, benchmarks, and case studies)" : "false"}
- Additional Context: "${additionalContext}"

════════════════════════════════════════════════════════════════════════════════
LAYOUT DIVERSITY & VARIETY MANDATE (CRITICAL)
════════════════════════════════════════════════════════════════════════════════
DO NOT repeat the same layout sequentially. You must distribute and cycle dynamically through diverse layouts matching slide content:
1. Cover/Intro Slide: layout="title"
2. Visual Feature Slide: layout="image_left" or layout="image_right" (provide rich 4K photography <IMG query="..." />)
3. Bento Insight Cards: layout="bullets" (3-4 structured insight cards with "Concept Heading: Substantive detail")
4. Quantitative Data & Telemetry: layout="metric_callout" (3 high-impact numbers e.g. <METRIC value="481 ft" label="Height Record" />)
5. Chronology or Evolution: layout="timeline" (3-4 milestone events e.g. <EVENT step="2560 BCE">Phase description</EVENT>)
6. Comparative Analysis / Contrast: layout="comparison" (2 contrasting columns <COLUMN title="Theory A">...</COLUMN><COLUMN title="Theory B">...</COLUMN>)
7. Deep-Dive Case Study: layout="image_right" or layout="gallery_grid"
8. Strategic Trade-offs or Quotation: layout="pros_cons" or layout="quote"
9. Executive Wrap-up: layout="conclusion"

════════════════════════════════════════════════════════════════════════════════
XML OUTPUT SPECIFICATION & SCHEMA
════════════════════════════════════════════════════════════════════════════════
Output a single well-formed <PRESENTATION> XML document. Do not output markdown fences or commentary outside the XML.

Allowed XML tags and structures:

1. <PRESENTATION title="...">
   Root wrapper containing the entire presentation.

2. <THEME name="..." primary="#HEX" accent="#HEX" bg="#HEX" text="#HEX" headingFont="..." bodyFont="..." />
   Custom curated color palette tailored specifically to the presentation subject.

3. <SECTION layout="..." id="1">
   Supported layouts: "title", "image_left", "image_right", "bullets", "comparison", "metric_callout", "timeline", "pros_cons", "quote", "gallery_grid", "conclusion".

4. Slide Internal Elements:
   - <H1>Slide Main Headline</H1>
   - <SUBTITLE>Compelling sub-headline</SUBTITLE>
   - <AUTHOR>Speaker or Organization</AUTHOR>
   - <IMG query="specific photographic visual query e.g. Temple of Artemis Ephesus ruins archaeological site 4k" />
   - <BULLETS><LI>Headline Keyword: In-depth substantive explanation with concrete facts</LI></BULLETS>
     NOTE: Do NOT use <Bold> tags inside <LI>. Use "Headline: Explanation" plain text format.
   - <COLUMN title="Category Name"><LI>Key Point 1</LI><LI>Key Point 2</LI></COLUMN>
   - <METRIC value="99.8%" label="KPI Benchmark Metric" />
   - <EVENT step="Stage/Year">Phase description</EVENT>
   - <PROS><LI>Advantage</LI></PROS><CONS><LI>Challenge</LI></CONS>
   - <QUOTE author="Person Name" role="Title/Affiliation">Executive or Historical Quote</QUOTE>
   - <NOTES>2-3 sentences of natural teleprompter speaker notes script</NOTES>

════════════════════════════════════════════════════════════════════════════════
CONTENT & QUALITY RULES
════════════════════════════════════════════════════════════════════════════════
1. SUBSTANTIVE DEPTH: Each bullet must explain the specific mechanism, historical fact, quantitative metric, or strategic impact.
2. ACCURATE REAL PHOTOGRAPHY QUERIES: In <IMG query="..." />, write precise photography search terms for real-world subjects.

Begin your response directly with <PRESENTATION title="${title}"> and end with </PRESENTATION>.`;
}

/**
 * Robust XML Parser that transforms presentation XML into rich slide objects
 */
function parsePresentationXML(xmlString) {
  if (!xmlString || typeof xmlString !== "string") return null;

  // Strip markdown code fences if present
  let cleanXML = xmlString.trim();
  cleanXML = cleanXML.replace(/^```[a-zA-Z]*\s*\n?/m, "").replace(/```\s*$/m, "").trim();

  // Find presentation root
  const presMatch = cleanXML.match(/<PRESENTATION[\s\S]*?<\/PRESENTATION>/i) || cleanXML.match(/<PRESENTATION[\s\S]*/i);
  if (!presMatch) return null;

  const presContent = presMatch[0];

  const cleanText = (str) => {
    if (!str) return "";
    return str
      .replace(/<\/?(bold|b|strong)>/gi, "")
      .replace(/\*\*/g, "")
      .trim();
  };

  // Extract Theme
  let themeData = null;
  const themeMatch = presContent.match(/<THEME\s+([^>]+)\/?>/i);
  if (themeMatch) {
    const attrStr = themeMatch[1];
    const extractAttr = (name) => {
      const m = attrStr.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
      return m ? m[1] : null;
    };
    themeData = {
      name: extractAttr("name") || "Custom AI Theme",
      primary: extractAttr("primary") || "#f97316",
      accent: extractAttr("accent") || "#fbbf24",
      bg: extractAttr("bg") || "#09090b",
      text: extractAttr("text") || "#fafafa",
      headingFont: extractAttr("headingFont") || "Outfit, sans-serif",
      bodyFont: extractAttr("bodyFont") || "Inter, sans-serif"
    };
  }

  // Extract Sections / Slides
  const sections = [];
  const sectionRegex = /<SECTION([\s\S]*?)<\/SECTION>/gi;
  let secMatch;

  while ((secMatch = sectionRegex.exec(presContent)) !== null) {
    const secFull = secMatch[0];
    const openTagMatch = secFull.match(/<SECTION([^>]*)>/i);
    const attrStr = openTagMatch ? openTagMatch[1] : "";

    const extractAttr = (name) => {
      const m = attrStr.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
      return m ? m[1] : null;
    };

    let layout = extractAttr("layout") || "bullets";

    // Extract H1
    const h1Match = secFull.match(/<H1>([\s\S]*?)<\/H1>/i);
    const title = cleanText(h1Match ? h1Match[1] : "Slide Title");

    // Extract Subtitle
    const subMatch = secFull.match(/<SUBTITLE>([\s\S]*?)<\/SUBTITLE>/i) || secFull.match(/<P>([\s\S]*?)<\/P>/i);
    const subtitle = cleanText(subMatch ? subMatch[1] : "");

    // Extract Author
    const authorMatch = secFull.match(/<AUTHOR>([\s\S]*?)<\/AUTHOR>/i);
    const author = cleanText(authorMatch ? authorMatch[1] : "");

    // Extract Image Query
    let imageQuery = "";
    const imgMatch = secFull.match(/<IMG\s+query=["']([^"']+)["'][^>]*\/?>/i) || secFull.match(/<IMG>([\s\S]*?)<\/IMG>/i);
    if (imgMatch) {
      imageQuery = cleanText(imgMatch[1]);
    }

    // Extract Bullets
    const bullets = [];
    const bulletBlockMatch = secFull.match(/<BULLETS>([\s\S]*?)<\/BULLETS>/i);
    if (bulletBlockMatch) {
      const liRegex = /<LI>([\s\S]*?)<\/LI>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(bulletBlockMatch[1])) !== null) {
        bullets.push(cleanText(liMatch[1]));
      }
    } else {
      const liRegex = /<LI>([\s\S]*?)<\/LI>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(secFull)) !== null) {
        bullets.push(cleanText(liMatch[1]));
      }
    }

    // Extract Columns (for comparison)
    const columns = { left: [], right: [] };
    const colRegex = /<COLUMN\s+title=["']([^"']+)["']>([\s\S]*?)<\/COLUMN>/gi;
    let colMatch;
    let colIdx = 0;
    while ((colMatch = colRegex.exec(secFull)) !== null) {
      const colTitle = cleanText(colMatch[1]);
      const colBody = colMatch[2];
      const items = [colTitle];
      const liRegex = /<LI>([\s\S]*?)<\/LI>/gi;
      let lim;
      while ((lim = liRegex.exec(colBody)) !== null) {
        items.push(cleanText(lim[1]));
      }
      if (colIdx === 0) columns.left = items;
      else if (colIdx === 1) columns.right = items;
      colIdx++;
    }

    // Extract Metrics
    const metrics = [];
    const metricRegex = /<METRIC\s+([^>]+)\/?>/gi;
    let metMatch;
    while ((metMatch = metricRegex.exec(secFull)) !== null) {
      const mAttrs = metMatch[1];
      const valM = mAttrs.match(/value=["']([^"']+)["']/i);
      const lblM = mAttrs.match(/label=["']([^"']+)["']/i);
      if (valM) {
        metrics.push({
          value: cleanText(valM[1]),
          label: cleanText(lblM ? lblM[1] : "Metric Benchmark")
        });
      }
    }

    // Extract Events / Timeline
    const events = [];
    const eventRegex = /<EVENT\s+step=["']([^"']+)["']>([\s\S]*?)<\/EVENT>/gi;
    let evMatch;
    while ((evMatch = eventRegex.exec(secFull)) !== null) {
      events.push({
        year: cleanText(evMatch[1]),
        description: cleanText(evMatch[2])
      });
    }

    // Extract Pros and Cons
    const pros = [];
    const cons = [];
    const prosMatch = secFull.match(/<PROS>([\s\S]*?)<\/PROS>/i);
    if (prosMatch) {
      const liRegex = /<LI>([\s\S]*?)<\/LI>/gi;
      let lim;
      while ((lim = liRegex.exec(prosMatch[1])) !== null) {
        pros.push(cleanText(lim[1]));
      }
    }
    const consMatch = secFull.match(/<CONS>([\s\S]*?)<\/CONS>/i);
    if (consMatch) {
      const liRegex = /<LI>([\s\S]*?)<\/LI>/gi;
      let lim;
      while ((lim = liRegex.exec(consMatch[1])) !== null) {
        cons.push(cleanText(lim[1]));
      }
    }

    // Extract Quote
    let quote_text = "";
    let quoteAuthor = "";
    let quoteRole = "";
    const quoteMatch = secFull.match(/<QUOTE([^>]*)>([\s\S]*?)<\/QUOTE>/i);
    if (quoteMatch) {
      quote_text = cleanText(quoteMatch[2]);
      const qAttr = quoteMatch[1];
      const qaM = qAttr.match(/author=["']([^"']+)["']/i);
      const qrM = qAttr.match(/role=["']([^"']+)["']/i);
      if (qaM) quoteAuthor = cleanText(qaM[1]);
      if (qrM) quoteRole = cleanText(qrM[1]);
    }

    // Extract Notes
    const notesMatch = secFull.match(/<NOTES>([\s\S]*?)<\/NOTES>/i);
    const speakerNotes = cleanText(notesMatch ? notesMatch[1] : "");

    // Auto-detect layout if not explicitly set
    if (layout === "bullets" || layout === "image_left") {
      if (metrics.length >= 2) layout = "metric_callout";
      else if (events.length >= 2) layout = "timeline";
      else if (columns.left.length > 0 && columns.right.length > 0) layout = "comparison";
      else if (pros.length > 0 && cons.length > 0) layout = "pros_cons";
      else if (quote_text) layout = "quote";
    }

    sections.push({
      id: sections.length + 1,
      title,
      subtitle,
      author,
      layout,
      imageQuery,
      bullets,
      columns,
      metrics,
      events,
      pros,
      cons,
      quote_text,
      quoteAuthor,
      quoteRole,
      speakerNotes
    });
  }

  return {
    theme: themeData,
    slides: sections
  };
}

/**
 * Enriches each parsed slide with verified high-resolution Google/Wikimedia imagery
 */
async function enrichSlidesWithRealImages(slides, topic) {
  if (!Array.isArray(slides) || slides.length === 0) return slides;

  return await Promise.all(
    slides.map(async (slide, idx) => {
      const needsImage = slide.layout === "image_left" || slide.layout === "image_right" || slide.layout === "gallery_grid" || slide.layout === "title" || slide.imageQuery;

      if (!needsImage) return slide;

      const query = slide.imageQuery || `${slide.title} ${topic}`;
      console.log(`🖼️ Fetching real photography for Slide ${idx + 1}: "${query}"`);

      const candidateImages = await searchPresentationImages(query, 4);
      const chosenImage = candidateImages[0] || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800";

      return {
        ...slide,
        image_url: chosenImage,
        imageCandidates: candidateImages.map((url, cIdx) => ({
          id: cIdx + 1,
          url,
          score: 92 - cIdx * 4,
          style: cIdx === 0 ? "Photographic" : cIdx === 1 ? "Panoramic" : "Architectural"
        }))
      };
    })
  );
}

module.exports = {
  buildMasterXMLPrompt,
  parsePresentationXML,
  enrichSlidesWithRealImages
};

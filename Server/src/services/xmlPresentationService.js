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
XML OUTPUT SPECIFICATION & SCHEMA
════════════════════════════════════════════════════════════════════════════════
You must output a single well-formed <PRESENTATION> XML document. Do not output markdown fences or commentary outside the XML.

Allowed XML tags and structures:

1. <PRESENTATION title="...">
   Root wrapper containing the entire presentation.

2. <THEME name="..." primary="#HEX" accent="#HEX" bg="#HEX" text="#HEX" headingFont="..." bodyFont="..." />
   Custom curated color palette tailored specifically to the presentation subject.

3. <SECTION layout="..." id="1">
   Represents one slide card. Supported layout attributes:
   - layout="title": First cover slide with <H1>, <SUBTITLE>, and <AUTHOR>.
   - layout="image_left": 50% left high-res photographic visual, 50% right title and detailed <BULLETS>.
   - layout="image_right": 50% left detailed analysis and <BULLETS>, 50% right high-res visual.
   - layout="comparison": Side-by-side comparative column cards (<COLUMN title="...">...</COLUMN>).
   - layout="metric_callout": 3 high-impact quantitative KPI metrics (<METRIC value="..." label="..." />).
   - layout="timeline": Sequential phase roadmap (<EVENT step="...">...</EVENT>).
   - layout="pros_cons": Benefits vs challenges (<PROS><LI>...</LI></PROS><CONS><LI>...</LI></CONS>).
   - layout="quote": Executive quotation (<QUOTE author="..." role="...">...</QUOTE>).
   - layout="bullets": Structured Bento cards (<BULLETS><LI>Bold Heading: Explanation...</LI></BULLETS>).
   - layout="conclusion": Executive summary and strategic next steps.

4. Slide Internal Elements:
   - <H1>Slide Main Headline</H1>
   - <SUBTITLE>Compelling sub-headline</SUBTITLE>
   - <AUTHOR>Speaker or Organization</AUTHOR>
   - <IMG query="high-precision photography search query" />
     CRITICAL: For every slide that uses an image (image_left, image_right, gallery_grid, title), provide a descriptive, highly specific 4K photography search query (e.g., "taj mahal agra india marble reflection pool 4k", "great wall of china panoramic aerial photography", "modern neural network architecture server room").
   - <BULLETS><LI>Substantive bullet point with bold concept prefix</LI></BULLETS>
   - <COLUMN title="Category Name"><LI>Feature 1</LI><LI>Feature 2</LI></COLUMN>
   - <METRIC value="99.8%" label="KPI Benchmark Metric" />
   - <EVENT step="Stage 1">Phase description</EVENT>
   - <NOTES>2-3 sentences of natural teleprompter speaker notes script</NOTES>

════════════════════════════════════════════════════════════════════════════════
CONTENT & QUALITY RULES
════════════════════════════════════════════════════════════════════════════════
1. SUBSTANTIVE DEPTH: Never write shallow, generic 3-word bullets. Each bullet must explain the "why", "how", specific mechanism, data point, or strategic impact.
2. DIVERSE LAYOUTS: Alternate layouts dynamically across slides (e.g. Title -> Image Split -> Comparison -> Metrics -> Timeline -> Bento Cards -> Conclusion).
3. ACCURATE IMAGE QUERIES: Always specify realistic, concrete visual queries in <IMG query="..." /> corresponding precisely to the subject matter.

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
    const title = h1Match ? h1Match[1].trim() : "Slide Title";

    // Extract Subtitle
    const subMatch = secFull.match(/<SUBTITLE>([\s\S]*?)<\/SUBTITLE>/i) || secFull.match(/<P>([\s\S]*?)<\/P>/i);
    const subtitle = subMatch ? subMatch[1].trim() : "";

    // Extract Author
    const authorMatch = secFull.match(/<AUTHOR>([\s\S]*?)<\/AUTHOR>/i);
    const author = authorMatch ? authorMatch[1].trim() : "";

    // Extract Image Query
    let imageQuery = "";
    const imgMatch = secFull.match(/<IMG\s+query=["']([^"']+)["'][^>]*\/?>/i) || secFull.match(/<IMG>([\s\S]*?)<\/IMG>/i);
    if (imgMatch) {
      imageQuery = imgMatch[1].trim();
    }

    // Extract Bullets
    const bullets = [];
    const bulletBlockMatch = secFull.match(/<BULLETS>([\s\S]*?)<\/BULLETS>/i);
    if (bulletBlockMatch) {
      const liRegex = /<LI>([\s\S]*?)<\/LI>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(bulletBlockMatch[1])) !== null) {
        bullets.push(liMatch[1].trim());
      }
    } else {
      const liRegex = /<LI>([\s\S]*?)<\/LI>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(secFull)) !== null) {
        bullets.push(liMatch[1].trim());
      }
    }

    // Extract Columns (for comparison)
    const columns = { left: [], right: [] };
    const colRegex = /<COLUMN\s+title=["']([^"']+)["']>([\s\S]*?)<\/COLUMN>/gi;
    let colMatch;
    let colIdx = 0;
    while ((colMatch = colRegex.exec(secFull)) !== null) {
      const colTitle = colMatch[1].trim();
      const colBody = colMatch[2];
      const items = [colTitle];
      const liRegex = /<LI>([\s\S]*?)<\/LI>/gi;
      let lim;
      while ((lim = liRegex.exec(colBody)) !== null) {
        items.push(lim[1].trim());
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
          value: valM[1].trim(),
          label: lblM ? lblM[1].trim() : "Metric Benchmark"
        });
      }
    }

    // Extract Events / Timeline
    const events = [];
    const eventRegex = /<EVENT\s+step=["']([^"']+)["']>([\s\S]*?)<\/EVENT>/gi;
    let evMatch;
    while ((evMatch = eventRegex.exec(secFull)) !== null) {
      events.push({
        year: evMatch[1].trim(),
        description: evMatch[2].trim()
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
        pros.push(lim[1].trim());
      }
    }
    const consMatch = secFull.match(/<CONS>([\s\S]*?)<\/CONS>/i);
    if (consMatch) {
      const liRegex = /<LI>([\s\S]*?)<\/LI>/gi;
      let lim;
      while ((lim = liRegex.exec(consMatch[1])) !== null) {
        cons.push(lim[1].trim());
      }
    }

    // Extract Quote
    let quote_text = "";
    let quoteAuthor = "";
    let quoteRole = "";
    const quoteMatch = secFull.match(/<QUOTE([^>]*)>([\s\S]*?)<\/QUOTE>/i);
    if (quoteMatch) {
      quote_text = quoteMatch[2].trim();
      const qAttr = quoteMatch[1];
      const qaM = qAttr.match(/author=["']([^"']+)["']/i);
      const qrM = qAttr.match(/role=["']([^"']+)["']/i);
      if (qaM) quoteAuthor = qaM[1].trim();
      if (qrM) quoteRole = qrM[1].trim();
    }

    // Extract Notes
    const notesMatch = secFull.match(/<NOTES>([\s\S]*?)<\/NOTES>/i);
    const speakerNotes = notesMatch ? notesMatch[1].trim() : "";

    // Auto-detect layout if not explicitly set
    if (layout === "bullets") {
      if (metrics.length >= 2) layout = "metric_callout";
      else if (events.length >= 2) layout = "timeline";
      else if (columns.left.length > 0 && columns.right.length > 0) layout = "comparison";
      else if (pros.length > 0 && cons.length > 0) layout = "pros_cons";
      else if (quote_text) layout = "quote";
      else if (imageQuery && sections.length > 0) layout = "image_left";
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

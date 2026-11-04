# Paperxify 2.0 — Block-Based Document Engine & Data Model

> **Document ID:** `02_block_document_engine.md`  
> **Status:** Production Specification & Schema Contract  
> **Target Release:** Paperxify v2.0  
> **Last Updated:** November 2026  

---

## 1. Overview & Architectural Motivation

In Paperxify 1.0, a study note was stored as a single unstructured markdown string in MongoDB (`content: String`). This created severe limitations:
- **No targeted editing**: An AI edit to paragraph 4 required regenerating or string-replacing the entire 10,000-word document.
- **Fragile hyperlinks**: Clickable timestamps relied on runtime regular expressions (`replace(/(?<!!)\[\s*(\d{1,2}:\d{2})...`) which broke on non-standard caption formatting.
- **Inflexible PDF rendering**: The PDF exporter had to parse raw Markdown and guess where to insert page breaks.

Paperxify 2.0 introduces the **Document Block Object Model (DOM)**. Every note is an ordered sequence of typed, immutable, and addressable blocks.

---

## 2. Block Schema & TypeScript Data Contracts

### 2.1. Core Block Types
```typescript
export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'definition'
  | 'formula'
  | 'table'
  | 'code'
  | 'callout'
  | 'diagram'
  | 'worked_example'
  | 'summary'
  | 'flashcard';

export type CalloutVariant = 
  | 'remember'      // ⚡ Quick Recall memory hook
  | 'high_yield'    // 🔴 Must-know core exam point
  | 'pitfall'       // ⚠️ Dangerous misconception / error
  | 'exam_tip';     // 🎯 Test scoring tip / mark scheme
```

### 2.2. The Canonical `DocumentBlock` Interface
```typescript
export interface DocumentBlock {
  /** Stable unique identifier (UUID v4 or nanoid), e.g. "blk_ch1_04" */
  id: string;

  /** Foreign key pointing to parent chapter ID, e.g. "ch_1" */
  chapterId: string;

  /** Type discriminator */
  type: BlockType;

  /** Zero-based rendering sequence order */
  order: number;

  /** Associated YouTube video timestamp (second-level accuracy) */
  sourceTimestamp?: {
    startSeconds: number;
    endSeconds?: number;
    formatted: string;      // e.g. "04:15" or "04:15 - 05:30"
  };

  /** Origin metadata for student transparency */
  provenance: {
    source: 'transcript' | 'ai_synthesis' | 'user_edit' | 'paperchat_patch';
    confidence: number;     // 0.0 to 1.0
    modelUsed?: string;     // e.g. "deepseek-v4-flash"
    modifiedAt?: Date;
  };

  /** Type-specific typed data payload */
  data: BlockPayload;
}
```

### 2.3. Typed Payloads by Block Type
```typescript
export interface BlockPayload {
  // --- 'heading' ---
  level?: 1 | 2 | 3;
  title?: string;

  // --- 'paragraph' ---
  text?: string;            // Clean markdown subset (bold, italic, inline math)

  // --- 'definition' ---
  term?: string;
  definition?: string;

  // --- 'formula' ---
  latex?: string;           // Standard LaTeX string: "\nabla_W L = \delta \cdot X^T"
  displayMode?: boolean;    // true for $$ block $$, false for inline
  variableLegend?: Array<{
    symbol: string;         // e.g. "W"
    meaning: string;        // e.g. "Weight matrix of layer l"
  }>;

  // --- 'table' ---
  headers?: string[];
  rows?: string[][];
  caption?: string;

  // --- 'code' ---
  language?: string;        // "python" | "typescript" | "cpp" | etc.
  code?: string;
  explanation?: string;

  // --- 'callout' ---
  variant?: CalloutVariant;
  title?: string;
  content?: string;

  // --- 'diagram' ---
  diagramType?: 'mermaid' | 'svg' | 'image_search' | 'ai_generated';
  sourceUrl?: string;       // Cloudflare R2 / Verified Search URL
  mermaidSource?: string;   // Raw Mermaid code (auto-recolors in dark/light mode)
  caption?: string;
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: string;    // e.g. "16/9"
  };

  // --- 'worked_example' ---
  problemStatement?: string;
  steps?: Array<{
    stepNumber: number;
    explanation: string;
    mathSnippet?: string;
  }>;
  finalAnswer?: string;

  // --- 'flashcard' ---
  front?: string;
  back?: string;
  tags?: string[];
}
```

---

## 3. Mongoose Database Models

### 3.1. Updated `Note` Model (`Server/src/models/Note.js`)
```javascript
const mongoose = require("mongoose");

const DocumentBlockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  chapterId: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'heading', 'paragraph', 'definition', 'formula', 
      'table', 'code', 'callout', 'diagram', 
      'worked_example', 'summary', 'flashcard'
    ],
    required: true
  },
  order: { type: Number, required: true },
  sourceTimestamp: {
    startSeconds: { type: Number },
    endSeconds: { type: Number },
    formatted: { type: String }
  },
  provenance: {
    source: { 
      type: String, 
      enum: ['transcript', 'ai_synthesis', 'user_edit', 'paperchat_patch'], 
      default: 'ai_synthesis' 
    },
    confidence: { type: Number, default: 1.0 },
    modelUsed: { type: String },
    modifiedAt: { type: Date, default: Date.now }
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const NoteSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  version: { type: Number, default: 1 },

  // Video Source Details
  videoUrl: { type: String, required: true },
  videoId: { type: String, required: true },
  thumbnail: { type: String, default: "" },
  duration: { type: Number, default: 0 },

  // Canonical Block Document (Paperxify 2.0)
  blocks: [DocumentBlockSchema],

  // Backward-compatibility Markdown cache (auto-generated from blocks)
  content: { type: String },

  // Chapters & Knowledge IR
  chapters: [{
    chapterId: { type: String },
    title: { type: String },
    startSeconds: { type: Number },
    endSeconds: { type: Number },
    summary: { type: String }
  }],
  knowledgeIR: { type: mongoose.Schema.Types.Mixed, default: null },

  // Generation telemetry
  generationDetails: {
    model: { type: String, required: true },
    type: { type: String, enum: ['free', 'premium'], default: 'free' },
    theme: { type: String, default: 'academic' },
    language: { type: String, default: 'English' },
    tokenUsage: { inputTokens: Number, outputTokens: Number, totalTokens: Number },
    processingTime: Number
  }
}, { timestamps: true });

module.exports = mongoose.model("Note", NoteSchema);
```

### 3.2. New `NoteRevision` Model (`Server/src/models/NoteRevision.js`)
Enables one-click rollback, undo/redo, and revision audit tracking:
```javascript
const mongoose = require("mongoose");

const NoteRevisionSchema = new mongoose.Schema({
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true, index: true },
  version: { type: Number, required: true },
  triggeredBy: { 
    type: String, 
    enum: ['initial_generation', 'paperchat_patch', 'user_edit', 'rollback'], 
    required: true 
  },
  patchSummary: { type: String, default: "" },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  blocksSnapshot: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("NoteRevision", NoteRevisionSchema);
```

---

## 4. Deterministic Legacy Markdown -> Blocks Converter

To migrate existing v1.0 notes without data loss, we implement a deterministic AST compiler:

```javascript
// Server/src/utils/markdownToBlocksCompiler.js
const crypto = require("crypto");

function generateBlockId(prefix = "blk") {
  return `${prefix}_${crypto.randomBytes(4).toString("hex")}`;
}

function parseTimeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const clean = timeStr.replace(/[^\d:]/g, "");
  const parts = clean.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

/**
 * Compiles a raw v1.0 Markdown string into structured DocumentBlock array.
 */
function compileMarkdownToBlocks(markdown, chapters = []) {
  if (!markdown) return [];

  const lines = markdown.split("\n");
  const blocks = [];
  let currentChapterId = chapters[0]?.chapterId || "ch_1";
  let blockOrder = 0;
  let lineIdx = 0;

  while (lineIdx < lines.length) {
    const rawLine = lines[lineIdx];
    const line = rawLine.trim();

    if (!line) {
      lineIdx++;
      continue;
    }

    // 1. Heading Detection
    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();

      // Check if heading matches chapter title
      const matchedChapter = chapters.find(c => 
        title.toLowerCase().includes(c.title.toLowerCase())
      );
      if (matchedChapter) currentChapterId = matchedChapter.chapterId;

      blocks.push({
        id: generateBlockId("h"),
        chapterId: currentChapterId,
        type: "heading",
        order: blockOrder++,
        provenance: { source: "transcript", confidence: 1.0 },
        data: { level, title }
      });
      lineIdx++;
      continue;
    }

    // 2. Callout Box Detection (> ⚡ **Quick Remember**, > 🔴 **Must Know**, etc.)
    if (line.startsWith(">")) {
      let calloutContent = [];
      let variant = "remember";
      let title = "Note";

      while (lineIdx < lines.length && lines[lineIdx].trim().startsWith(">")) {
        const cLine = lines[lineIdx].trim().replace(/^>\s*/, "");
        if (cLine.includes("Quick Remember") || cLine.includes("⚡")) {
          variant = "remember";
          title = "Quick Recall";
        } else if (cLine.includes("Must Know") || cLine.includes("🔴")) {
          variant = "high_yield";
          title = "High-Yield Point";
        } else if (cLine.includes("Pitfall") || cLine.includes("Mistake") || cLine.includes("⚠️")) {
          variant = "pitfall";
          title = "Common Misconception";
        } else if (cLine.includes("Exam") || cLine.includes("🎯")) {
          variant = "exam_tip";
          title = "Exam Scoring Tip";
        }
        calloutContent.push(cLine);
        lineIdx++;
      }

      blocks.push({
        id: generateBlockId("cal"),
        chapterId: currentChapterId,
        type: "callout",
        order: blockOrder++,
        provenance: { source: "transcript", confidence: 1.0 },
        data: {
          variant,
          title,
          content: calloutContent.join(" ")
        }
      });
      continue;
    }

    // 3. KaTeX Display Math ($$ ... $$)
    if (line.startsWith("$$")) {
      let formulaLines = [line.replace(/^\$\$/, "")];
      lineIdx++;
      while (lineIdx < lines.length && !lines[lineIdx].includes("$$")) {
        formulaLines.push(lines[lineIdx]);
        lineIdx++;
      }
      if (lineIdx < lines.length) {
        formulaLines.push(lines[lineIdx].replace(/\$\$$/, ""));
        lineIdx++;
      }

      blocks.push({
        id: generateBlockId("eq"),
        chapterId: currentChapterId,
        type: "formula",
        order: blockOrder++,
        provenance: { source: "transcript", confidence: 1.0 },
        data: {
          latex: formulaLines.join("\n").trim(),
          displayMode: true,
          variableLegend: []
        }
      });
      continue;
    }

    // 4. Code Blocks (```python ... ```)
    if (line.startsWith("```")) {
      const lang = line.replace(/^```/, "").trim() || "text";
      lineIdx++;
      let codeLines = [];
      while (lineIdx < lines.length && !lines[lineIdx].trim().startsWith("```")) {
        codeLines.push(lines[lineIdx]);
        lineIdx++;
      }
      lineIdx++; // skip closing ```

      blocks.push({
        id: generateBlockId("code"),
        chapterId: currentChapterId,
        type: "code",
        order: blockOrder++,
        provenance: { source: "transcript", confidence: 1.0 },
        data: {
          language: lang,
          code: codeLines.join("\n")
        }
      });
      continue;
    }

    // 5. Comparative Markdown Table (| Col 1 | Col 2 |)
    if (line.startsWith("|") && line.endsWith("|")) {
      let tableLines = [];
      while (lineIdx < lines.length && lines[lineIdx].trim().startsWith("|")) {
        tableLines.push(lines[lineIdx].trim());
        lineIdx++;
      }

      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .split("|")
          .map(c => c.trim())
          .filter(c => c.length > 0);
        
        // Skip separator row (line 1: |---|---|)
        const rows = tableLines.slice(2).map(r => 
          r.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        );

        blocks.push({
          id: generateBlockId("tbl"),
          chapterId: currentChapterId,
          type: "table",
          order: blockOrder++,
          provenance: { source: "transcript", confidence: 1.0 },
          data: { headers, rows }
        });
        continue;
      }
    }

    // 6. Standard Paragraph (with timestamp extraction)
    let timestampData = undefined;
    const timeMatch = line.match(/(?<!!)\[\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*\]/);
    if (timeMatch) {
      timestampData = {
        formatted: timeMatch[1],
        startSeconds: parseTimeToSeconds(timeMatch[1])
      };
    }

    blocks.push({
      id: generateBlockId("p"),
      chapterId: currentChapterId,
      type: "paragraph",
      order: blockOrder++,
      sourceTimestamp: timestampData,
      provenance: { source: "transcript", confidence: 1.0 },
      data: { text: line }
    });
    lineIdx++;
  }

  return blocks;
}

module.exports = { compileMarkdownToBlocks };
```

---

## 5. Server-Side Block Validation Rules

Before storing blocks or applying an AI patch, the server executes deterministic validators:
1. **KaTeX Syntax Linter**: Validates that all LaTeX formulas in `type: 'formula'` parse without syntax error. Broken formulas are flagged before persistence.
2. **Table Consistency**: Verifies that every row in `table.rows` has the exact same number of columns as `table.headers`.
3. **Timestamp Bounds**: Verifies that `sourceTimestamp.startSeconds` falls between $0$ and the actual video duration.
4. **Unique ID Constraint**: Enforces unique block IDs per document to prevent collision.


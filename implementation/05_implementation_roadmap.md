# Paperxify 2.0 — Implementation Roadmap & Execution Plan

> **Document ID:** `05_implementation_roadmap.md`  
> **Status:** Execution Roadmap & File Impact Plan  
> **Target Release:** Paperxify v2.0  
> **Last Updated:** November 2026  

---

## 1. Master Phase Schedule

```
PHASE 1: Core Block Model & Migration (Week 1)
├── Task 1.1: Define Mongoose Schemas (Note.blocks, NoteRevision, EditProposal)
├── Task 1.2: Build Markdown-to-Blocks AST Compiler (utils/markdownToBlocksCompiler.js)
├── Task 1.3: Run Migration on Existing Database Notes
└── Task 1.4: Build Frontend BlockRenderer Component (client/src/components/blocks/)

PHASE 2: Sub-30s Parallel Streaming Pipeline (Week 2)
├── Task 2.1: Multi-Tenant Video Cache (Redis/Mongo Cache Key)
├── Task 2.2: Chapter Boundary Chunking & Map-Reduce Workers
├── Task 2.3: Real-Time Chapter Streaming via Server-Sent Events (SSE)
└── Task 2.4: Non-Blocking Background Visual & Diagram Queue

PHASE 3: PaperChat In-Place AI Editor (Week 3)
├── Task 3.1: Lightweight Intent Classifier (Ask vs. Edit vs. Agent)
├── Task 3.2: JSON Patch Proposal Protocol (chatController.js & editService.js)
├── Task 3.3: In-Place Tracked Changes Diff UI (Red/Green decorations in Note Canvas)
└── Task 3.4: One-Click Revision Rollback & Undo History

PHASE 4: Vector-Grade Paged PDF Export (Week 4)
├── Task 4.1: CSS Paged Media Template (@page, Running Headers/Footers)
├── Task 4.2: Server-Side KaTeX Pre-Rendering & Inline SVG Vector Icons
├── Task 4.3: Cover Page Generator with Video QR Code & Dynamic Table of Contents
└── Task 4.4: Automated Layout Linter (Blank-Page & Orphan Prevention)

PHASE 5: Multi-Format Artifacts & Telemetry (Week 5)
├── Task 5.1: Notion Workspace 1-Click Sync (Export Blocks to Notion API)
├── Task 5.2: Anki Flashcard Deck Exporter (.apkg format)
└── Task 5.3: Production Telemetry & Latency Dashboard
```

---

## 2. File Impact & Architecture Directory Map

### 2.1. New Files to Create

| File Path | Purpose |
| :--- | :--- |
| `Server/src/models/NoteRevision.js` | Schema for document versioning, rollback snapshots, and author audit history. |
| `Server/src/models/EditProposal.js` | Schema for pending and rejected AI patch proposals. |
| `Server/src/utils/markdownToBlocksCompiler.js` | Deterministic compiler converting legacy Markdown strings into typed `DocumentBlock` AST. |
| `Server/src/services/parallelNotesEngine.js` | Parallel chapter map-reduce synthesis engine with BullMQ and SSE streaming. |
| `Server/src/services/pagedPdfService.js` | Native CSS Paged-Media print renderer with SSR KaTeX and layout linter. |
| `Server/src/services/intentClassifierService.js` | Lightweight classifier distinguishing informational questions from edit proposals. |
| `client/src/components/blocks/BlockRenderer.tsx` | Master dynamic renderer mapping block types to UI components. |
| `client/src/components/blocks/FormulaBlock.tsx` | Block component for KaTeX display math with interactive variable legends. |
| `client/src/components/blocks/CalloutBlock.tsx` | Block component for SVG-driven pedagogical callout boxes. |
| `client/src/components/blocks/TableBlock.tsx` | Block component for responsive comparative tables. |
| `client/src/components/blocks/DiffBlockWrapper.tsx` | In-place tracked changes wrapper displaying red/green diffs with Accept/Reject controls. |

### 2.2. Existing Files to Refactor

| Existing File Path | Planned Refactoring |
| :--- | :--- |
| `Server/src/models/Note.js` | Add `blocks: [DocumentBlockSchema]`, `version: Number`, and preserve `content: String` for legacy backwards compatibility. |
| `Server/src/controllers/freeNoteController.js` | Integrate parallel chapter streaming and multi-tenant video cache. |
| `Server/src/controllers/chatController.js` | Add support for `edit_proposal` schema and revision application endpoints. |
| `Server/src/controllers/noteController.js` | Deprecate LLM-generated HTML in `generatePDFContent` in favor of `pagedPdfService.js`. |
| `client/src/app/notes/[slug]/page.tsx` | Replace raw markdown renderer with `BlockRenderer` and integrate text-selection toolbar. |

---

## 3. Detailed Phase Breakdown & Acceptance Criteria

### Phase 1: Core Block Model & Migration
- **Goal**: Establish the typed document object model and ensure 100% backward compatibility with existing notes.
- **Key Tasks**:
  1. Deploy updated `Note.js` schema with `blocks` array.
  2. Implement `compileMarkdownToBlocks()` with full test coverage for headings, formulas, callouts, tables, and timestamps.
  3. Create an automated migration script `Server/scripts/migrateLegacyNotesToBlocks.js` that compiles existing database notes into block arrays without downtime.
  4. Build the client `BlockRenderer` to render notes from `blocks` rather than Markdown strings.
- **Acceptance Criteria**:
  - Legacy notes render identically on both web and mobile.
  - Every block has a unique, stable ID (`id`) and timestamp metadata.

### Phase 2: Sub-30s Parallel Streaming Pipeline
- **Goal**: Reduce perceived generation latency from 60s+ to under 8s.
- **Key Tasks**:
  1. Implement Redis key: `video_cache:{videoId}:{lang}:{tier}`.
  2. Slice transcript at semantic chapter boundaries.
  3. Dispatch parallel worker tasks for all chapters simultaneously.
  4. Emit real-time SSE events: `OUTLINE_READY`, `CHAPTER_READY`, and `NOTE_COMPLETE`.
- **Acceptance Criteria**:
  - Lecture outline appears within **3 seconds** of URL submission.
  - Chapter 1 is readable within **8 seconds**.
  - Cache hits for existing videos return within **1.5 seconds**.

### Phase 3: PaperChat In-Place AI Editor
- **Goal**: Enable students to edit and refine notes through conversational proposals.
- **Key Tasks**:
  1. Implement the Intent Router in `chatController.js`.
  2. Implement `POST /api/v2/chat/edit-proposal` returning structured JSON operations.
  3. Build `DiffBlockWrapper.tsx` in the frontend canvas with word-level diffing.
  4. Implement `[✓ Accept]` and `[✕ Reject]` buttons with optimistic UI updates.
  5. Implement `NoteRevision` history and rollback endpoints.
- **Acceptance Criteria**:
  - Selecting text and clicking *"Simplify"* shows inline red/green tracked changes within 2 seconds.
  - Clicking *"Accept"* updates the canvas and increments the revision number without page reload.
  - Clicking *"Undo"* reverts the change cleanly.

### Phase 4: Vector-Grade Paged PDF Export
- **Goal**: Export publication-quality PDFs with zero blank pages.
- **Key Tasks**:
  1. Implement the CSS Paged Media print template (`@page`, running headers/footers).
  2. Implement server-side KaTeX math compiling.
  3. Replace emojis with inline SVG vector icons.
  4. Build the automated layout linter to catch orphan headings and oversized tables.
  5. Pre-generate and cache the default PDF in Cloudflare R2 upon note completion.
- **Acceptance Criteria**:
  - Exported PDF has zero blank or orphaned pages.
  - Tables and formulas are never sliced across page seams.
  - Cover page includes high-res thumbnail and scannable YouTube QR code.

---

## 4. Testing & Verification Matrix

| Test Suite | Target Metric | Verification Command / Method |
| :--- | :--- | :--- |
| **AST Compiler Test** | 100% block parse accuracy | `npm run test:blocks` (Test across 50 sample markdown lectures) |
| **Streaming Latency** | First chapter < 8s | Automated Lighthouse & SSE event timing profiler |
| **Diff Editor Safety** | Zero race condition overwrites | Concurrency test with simulated multi-tab edits (`baseVersion` check) |
| **PDF Visual Regression** | Zero orphan headings / zero blank pages | Automated Puppeteer page-height verification script |
| **Mobile Responsiveness** | 120 FPS scroll, 100dvh compliance | Tested on physical Android (Vivo V40) and iOS devices |


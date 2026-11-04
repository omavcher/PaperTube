# Paperxify 1.0 — Current Project Overview & Architecture Deep Dive

> **Document ID:** `00_project_overview.md`  
> **Status:** Current Production Baseline (v1.0)  
> **Repository:** `omavcher/PaperTube`  
> **Last Updated:** November 2026  

---

## 1. Executive Summary & Mission

**Paperxify** (formerly *PaperTube*) is an AI-powered academic learning workspace that converts long-form educational YouTube content—such as university lectures, technical tutorials, and competitive exam seminars—into structured, textbook-grade study materials.

Unlike generic video summarizers that produce brief bullet points, Paperxify synthesizes **full-length academic study notes** featuring:
- Rigorous mathematical formulations rendered with **KaTeX / LaTeX**
- Structured comparative tables and code syntax blocks
- Verified technical architectural diagrams and visual schematics
- Clickable video timestamps synchronized with second-level accuracy
- An interactive **PaperChat AI Study Tutor** for Socratic question-answering and exam preparation
- Active recall flashcard decks, practice tests, and PDF exports

---

## 2. Technology Stack Breakdown

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             CLIENT (Next.js 14)                          │
│  - React 18, TypeScript, Tailwind CSS, Framer Motion                     │
│  - Lucide React Icons, KaTeX CSS, React Markdown, Canvas Tools          │
│  - Mobile Web App (100dvh, iOS-style Dock, Floating Island)             │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ HTTP REST & SSE (Server-Sent Events)
┌────────────────────────────────────▼─────────────────────────────────────┐
│                            SERVER (Node.js & Express)                    │
│  - Express 4.x REST API, JWT Authentication, Quota Middleware           │
│  - YouTube Transcript Engine, OpenRouter API Multi-Model Router          │
│  - Google Gemini API SDK, Puppeteer Headless PDF Browser Pool            │
└──────────────────┬─────────────────┬──────────────────┬──────────────────┘
                   │                 │                  │
┌──────────────────▼──────┐   ┌──────▼───────────┐   ┌──▼──────────────────┐
│    DATABASE & CACHE     │   │   CLOUD STORAGE  │   │     AI PROVIDERS    │
│  - MongoDB (Mongoose)   │   │  - Cloudflare R2 │   │  - OpenRouter API   │
│  - Redis Session Cache  │   │  - Google Drive  │   │  - Google Gemini    │
└─────────────────────────┘   └──────────────────┘   └─────────────────────┘
```

### Detailed Component Stack:
| Layer | Technologies Used | Primary Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion, TypeScript | UI rendering, responsive mobile dock, Note view canvas, PaperChat drawer, PDF export triggers. |
| **Backend API** | Node.js, Express.js, JWT, CORS, Dotenv, Crypto | Endpoints routing, quota enforcement, background jobs, transcript scraping, AI prompt routing. |
| **Database** | MongoDB Atlas with Mongoose ODM | Storing `User`, `Note`, `GenerationJob`, `AiChat`, `Folder`, analytics, and token usage history. |
| **AI Inference** | OpenRouter API & Google Gemini API (`gemini-2.5-flash`) | Multi-model fallback queue: DeepSeek V4 Flash, Qwen 3.6 Flash, GPT-4o-mini, LLaMA 3.3 70B, Nemotron 3 Ultra. |
| **Visuals & Media** | Cloudflare R2, Google Custom Search API, Multi-Provider Image Scraping | Verified technical diagrams lookup, study image hosting, thumbnails, PDF storage. |
| **Document Export** | Puppeteer Singleton Browser Pool | Headless Chromium instance rendering HTML to print-ready PDF with concurrency locking. |

---

## 3. Repository Directory Structure

```
paperxify/
├── client/                               # Next.js 14 Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                # Root layout with ThemeProvider, Nav, Toast
│   │   │   ├── page.tsx                  # Landing page (Hero, Features, Pricing, Reviews)
│   │   │   ├── youtube-to-notes/         # Main video URL submission & generation page
│   │   │   ├── notes/[slug]/             # Note reader canvas + PaperChat drawer
│   │   │   ├── workspace/                # Agentic AI Workspace / Studio
│   │   │   ├── pricing/                  # Subscription plans & token purchases
│   │   │   └── profile/                  # Account analytics, XP, and history
│   │   ├── components/
│   │   │   ├── Navbar.tsx                # Desktop nav + Mobile liquid-glass bottom dock
│   │   │   ├── HomeMain.tsx              # Input form, model selector, note options
│   │   │   └── ...                       # Modals, flashcards, quizzes
│   │   └── config/                       # Mock notes, SEO config, tier limits
│   └── public/                           # Logos, illustrations, static fonts
│
├── Server/                               # Express.js REST API Backend
│   ├── src/
│   │   ├── index.js                      # Server entry point & MongoDB connection
│   │   ├── youtube-transcript.js         # Direct caption scraping & timing parser
│   │   ├── routes/
│   │   │   ├── noteRoutes.js             # /api/notes (free, premium, job status, PDF)
│   │   │   ├── chatRoutes.js             # /api/chat (PaperChat SSE stream & history)
│   │   │   ├── userRoutes.js             # /api/users (auth, profile, token balance)
│   │   │   ├── paymentRoutes.js          # Razorpay / Stripe subscription webhooks
│   │   │   └── adminRoutes.js            # Platform telemetry & capacity dashboard
│   │   ├── controllers/
│   │   │   ├── freeNoteController.js     # Asynchronous free tier note pipeline
│   │   │   ├── premiumNoteController.js  # High-capacity priority pipeline
│   │   │   ├── chatController.js         # PaperChat 10-mode grounded AI tutor
│   │   │   └── noteController.js         # Note CRUD, folders, and legacy PDF logic
│   │   ├── services/
│   │   │   ├── notesEngineService.js     # 7-Layer Production Generation Pipeline
│   │   │   ├── openRouterService.js      # Resilient multi-model API client & fallback
│   │   │   ├── imageSearchService.js     # Multi-provider verified diagram resolver
│   │   │   ├── imageGenerationService.js # AI-generated study diagrams (DALL-E / SD)
│   │   │   ├── pdfService.js             # Puppeteer browser manager & memory pool
│   │   │   └── capacityService.js        # Token counting & exact USD cost tracking
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js         # JWT verification & session decoding
│   │   │   └── quotaMiddleware.js        # Plan limits (daily/monthly notes & chat limits)
│   │   └── models/
│   │       ├── User.js                   # Profiles, memberships, tokens, XP
│   │       ├── Note.js                   # Saved note schema (Markdown, KnowledgeIR)
│   │       ├── GenerationJob.js          # Asynchronous job tracking with progress %
│   │       └── AiChat.js                 # Multi-turn PaperChat interaction history
│   └── package.json
│
├── implementation/                       # Paperxify 2.0 Architectural & Implementation Docs
│   ├── 00_project_overview.md            # (This file)
│   └── ...
└── PROJECT_PRESENTATION_STATS.md         # Pitch & product metrics deck
```

---

## 4. Current Core Subsystems Deep Dive

### 4.1. The 7-Layer Generation Engine (`notesEngineService.js`)
When a student requests a note from a YouTube video, the request is executed through a 7-stage sequential pipeline:

```
[YouTube Video URL]
        │
        ▼
[youtube-transcript.js] ──► Extracts raw caption cues with timestamps
        │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      7-LAYER PRODUCTION PIPELINE                       │
├────────────────────────────────────────────────────────────────────────┤
│ Layer 1: Normalization       Deduplicates repetitive caption fragments │
│                              Groups text into ~60-word blocks [HH:MM:SS│
├────────────────────────────────────────────────────────────────────────┤
│ Layer 2: Chapter Detection   Fast LLM extracts 4-8 academic milestones │
├────────────────────────────────────────────────────────────────────────┤
│ Layer 3: Semantic Chunking   Partitions into 24,000 char windows with  │
│                              1,500 char backward overlap               │
├────────────────────────────────────────────────────────────────────────┤
│ Layer 4: Knowledge Extract   Map Phase: Extracts definitions, LaTeX    │
│                              formulas, comparative tables, exam traps  │
├────────────────────────────────────────────────────────────────────────┤
│ Layer 5: Knowledge IR        Reduce Phase: Merges, deduplicates, and   │
│                              builds canonical Knowledge Graph IR       │
├────────────────────────────────────────────────────────────────────────┤
│ Layer 6: Note Synthesis      Monolithic Architect prompt writes full   │
│                              textbook Markdown + resolves diagrams     │
├────────────────────────────────────────────────────────────────────────┤
│ Layer 7: Quality Assurance   Fixes \[ \] math delimiters, aligns table │
│                              pipes, and injects YouTube jump links     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
       [Saved to MongoDB Note Model as Single Markdown `content` String]
```

### 4.2. Current PaperChat AI Tutor (`chatController.js`)
PaperChat provides grounded conversational assistance inside `/notes/[slug]`:
- **Context Injection**: Uses `buildGroundedKnowledgeContext()` to pack definitions, formulas, chapter milestones, and a 4,000-character excerpt of the note into the system prompt.
- **Highlighted Text Context**: Accepts `selectedText` from the frontend canvas so students can highlight a specific paragraph and ask questions about it.
- **10 Study Personas**: Supports modes like `tutor` (Socratic), `exam_prep`, `quick`, `deep_dive`, `explain_simply` (ELI5), `coding_tutor`, `problem_solver`, and `quiz`.
- **Streaming Output**: Delivers answers token-by-token using Server-Sent Events (SSE) via `openRouterService.streamChatCompletion()`.
- **Timestamp Provenance**: Automatically formats timestamp tags like `[⏱️ 05:23](https://youtube.com/watch?v=...&t=323s)`.

### 4.3. Subscription Tiers, Limits & Quotas
Enforced via [`quotaMiddleware.js`](file:///c:/Users/Om%20Awchar/Documents/paperxify/Server/src/middleware/quotaMiddleware.js):

| Tier | Price | Video Duration Limit | Notes Quota | PaperChat Quota | AI Models Available |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Free** | $0 / month | Up to **1 Hour** (3,600s) | 3 notes / day (Costs 5 tokens) | 100 messages / day | Flash (DeepSeek / Qwen / LLaMA) |
| **Pro Scholar** | $9.99 / month | Up to **4 Hours** (14,400s) | 120 notes / month | 2,000 messages / month | GPT-4o-mini, DeepSeek V4 Flash |
| **Power Scholar** | $19.99 / month | Up to **12 Hours** (43,200s)| 350 notes / month | 10,000 messages / month | Claude 3.5 Sonnet, Gemini 2.0, GPT-4o |

---

## 5. Identified Bottlenecks & Architectural Limitations of v1.0

Despite the functional strength of Paperxify 1.0, deep architectural analysis reveals five critical bottlenecks that motivate the **Paperxify 2.0** upgrade:

### 1. The "Monolithic Markdown Blob"
- The entire synthesized study note is saved as one single string: `content: String` in MongoDB.
- **Consequences**:
  - Incremental updates are impossible without rewriting or regex-parsing the entire document.
  - Theming is superficial: CSS cannot cleanly restyle distinct block types without complex CSS selectors.
  - Timestamps, formulas, and diagrams cannot be addressed or edited independently.

### 2. High First-Token Latency on Long Lectures
- For a 1-hour or 2-hour lecture, Layer 6 (`synthesizePaperxifyNote`) runs a massive monolithic synthesis call over the entire merged Knowledge IR.
- The student must wait 45 to 90 seconds in a loading spinner before seeing any readable note content.

### 3. Flawed PDF Export Pipeline
- In [`noteController.js:385`](file:///c:/Users/Om%20Awchar/Documents/paperxify/Server/src/controllers/noteController.js#L385), `generatePDFContent()` calls an LLM asking for raw HTML with inline styles.
- This creates massive drawbacks:
  - Doubles API costs and adds 20+ seconds to export time.
  - Generates unpredictable page breaks (e.g. cutting formulas or tables in half across pages).
  - Produces awkward blank pages due to unmanaged CSS page splits.
  - Emojis fail or render as broken black-and-white glyphs on Linux cloud instances.

### 4. PaperChat is Read-Only
- While PaperChat can explain concepts or solve equations, it **cannot edit the note**.
- If a student asks: *"Simplify Chapter 2"* or *"Add a comparison table here"*, PaperChat only outputs text into the chat drawer. The student has to manually copy and paste it into their notes.

### 5. Lack of Video-Level Caching
- If 50 students from the same university class enter the same Stanford CS229 YouTube link, the server executes the full 7-layer generation pipeline 50 separate times, paying full token costs every time.

---

## 6. Summary: The Path to Paperxify 2.0

To overcome these constraints, Paperxify must transition from a **static video summarizer** to a **modular, block-based interactive document engine**.

The full architectural blueprint for this transformation is detailed in [`01_paperxify_2.0_architecture.md`](file:///c:/Users/Om%20Awchar/Documents/paperxify/implementation/01_paperxify_2.0_architecture.md).


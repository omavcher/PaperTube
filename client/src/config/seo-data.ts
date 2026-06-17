export interface PageSeoConfig {
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  h2: string;
  h2Accent: string;
  h2Rest: string;
  intro: string;
  features: { title: string; desc: string }[];
  tableRows: { feature: string; col2: string; col3: string; col4: string; col2Good?: boolean }[];
  faqs: { question: string; answer: string }[];
  ctaTitle: string;
  ctaDesc: string;
  ctaBtn: string;
  ratingCount: string;

  // Optional tool-specific fields
  badge?: string;
  accentColor?: string;
  bgColor?: string;
  feature1Title?: string;
  feature1Desc?: string;
  feature2Title?: string;
  feature2Desc?: string;
  testimonialQuote?: string;
  testimonialAuthor?: string;
  testimonialMeta?: string;
  testimonialFlag?: string;
  tableCol2?: string;
  tableCol3?: string;
  tableCol4?: string;
}

export const BASE_SEO_DATA: Record<string, PageSeoConfig> = {
  home: {
    title: "Paperxify | YouTube to Notes AI & AI YouTube Note Taker",
    description: "Convert YouTube videos to study notes instantly. Paperxify is the best free AI YouTube note taker, video summarizer, and NoteGPT alternative for students.",
    keywords: ["youtube to notes ai", "ai youtube note taker", "youtube video note taker", "ai notes from youtube", "youtube notes generator", "ai youtube notes", "youtube transcript to notes", "turn youtube into notes", "youtube summarizer ai", "notegpt alternative", "mindgrasp alternative"],
    h1: "Free AI YouTube Video to Study Notes Generator | Paperxify",
    h2: "Convert YouTube Lectures",
    h2Accent: "to Study Notes & Flashcards",
    h2Rest: "Instantly with AI",
    intro: "Watching a lecture is passive. Paperxify converts any YouTube video into structured, revision-ready study notes automatically. Perfect for college and high school students preparing for exams.",
    features: [
      { title: "Multiple Note Styles", desc: "Choose from Flash summaries, Scholar-grade academic notes, or Canvas diagrams." },
      { title: "PDF & Notion Sync", desc: "Download high-quality PDFs or sync directly to your Notion workspace." }
    ],
    tableRows: [
      { feature: "Structured Academic Formatting", col2: "Yes (Headers, Code, LaTeX)", col3: "Plain bullets", col4: "Slow manual work" },
      { feature: "Multiple Output Architectures", col2: "Yes (Flash, Scholar, Canvas)", col3: "Single format only", col4: "Depends on student" },
      { feature: "Notion & PDF Export", col2: "Yes (One-click Sync)", col3: "None", col4: "Manual copying" }
    ],
    faqs: [
      { question: "How to convert YouTube videos to notes using AI?", answer: "To convert a YouTube video to notes, simply paste the link into Paperxify's AI generator. The AI will instantly transcribe, summarize, and format the lecture." },
      { question: "Is there a free AI tool to take notes from YouTube?", answer: "Yes, Paperxify is a free AI YouTube note-taking tool available to students and professionals globally." }
    ],
    ctaTitle: "The Best AI YouTube Notes Generator",
    ctaDesc: "Stop pausing and rewinding. Let AI build your complete study notes automatically from any lecture video. Paste a link to get started.",
    ctaBtn: "Generate Notes Now",
    ratingCount: "8420"
  },
  "youtube-to-notes": {
    title: "YouTube to Notes AI | Paperxify",
    description: "Save hours of study time by instantly turning YouTube lectures into structured notes and active recall flashcards. Perfect for students preparing for finals. Paste a link to start free!",
    keywords: ["youtube link to notes", "ai notes", "ai study", "youtube to notes ai", "convert youtube video to notes", "ai youtube notes generator", "free ai note taker from youtube", "youtube study guide generator", "youtube transcript to notes", "turn youtube into notes", "ai lecture notes from youtube", "ai notes from youtube link", "lecture video summarizer", "best ai study tools", "save hours studying with ai"],
    h1: "Free AI YouTube Link to Notes Generator for Students | Paperxify",
    h2: "Convert any YouTube Link",
    h2Accent: "to Structured AI Study Notes",
    h2Rest: "in Under 15 Seconds",
    intro: "Watching a lecture is passive; active recall is how you pass. Paperxify is the ultimate free AI study tool designed for students globally—including the US, UK, Canada, Australia, and Europe. Simply paste any YouTube link to generate structured, syllabus-ready study guides, interactive flashcard decks, visual mind maps, and print-friendly PDFs automatically.",
    features: [
      { title: "Save Hours Studying", desc: "Instantly condense multi-hour lectures and tutorial videos into high-yield summaries." },
      { title: "Aesthetic Note Architectures", desc: "Choose from Flash cards, Scholar-grade academic guides, or visual Canvas diagrams." },
      { title: "Notion & PDF Export", desc: "Sync your generated notes directly to your Notion workspace or download as high-quality printable PDFs." },
      { title: "Active Recall Testing", desc: "Practice with auto-generated MCQ tests, fill-in-the-blanks, and interactive study flashcards." }
    ],
    tableRows: [
      { feature: "Structured Academic Formatting", col2: "Yes (Headers, Code, LaTeX)", col3: "Plain bullet points", col4: "Time-consuming" },
      { feature: "Multiple Output Architectures", col2: "Yes (Flash, Scholar, Canvas)", col3: "Single format only", col4: "Depends on student" },
      { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
    ],
    faqs: [
      {
        question: "Is there an AI that can take notes from a YouTube video for free?",
        answer: "Yes, Paperxify is a free AI tool designed specifically to convert YouTube video links into structured study notes, summaries, and flashcards. Simply paste the link, choose your preferred note style, and click generate to get revision-ready notes in under 15 seconds."
      },
      {
        question: "What is the best free NoteGPT or Mindgrasp alternative?",
        answer: "Paperxify is the top free alternative to NoteGPT, Mindgrasp, and StudyFetch. Unlike general chatbots, it is purpose-built for student study workflows, providing structured academic formatting, LaTeX support for formulas, code syntax highlighting, visual mind maps, and Notion syncing."
      },
      {
        question: "Can I export AI-generated YouTube notes to Notion or PDF?",
        answer: "Yes, you can export your notes directly to Notion with a single click, copy clean Markdown, or download a publication-grade PDF file. The PDF format fully supports mathematical LaTeX syntax, which is perfect for printing or digital note-taking apps."
      },
      {
        question: "Does this AI YouTube note taker support non-English videos?",
        answer: "Yes. Paperxify supports transcribing and summarizing YouTube videos in over 50 languages, including English, Spanish, French, German, Hindi, and Mandarin. The AI can also translate foreign language lectures directly into English study guides."
      },
      {
        question: "Can the AI take notes from long YouTube lectures or crash courses?",
        answer: "Absolutely. Paperxify handles long lecture videos, university seminars, and crash courses up to several hours long. It utilizes high-context AI models to extract key concepts, chronological timelines, definitions, and code segments from the entire video transcript."
      }
    ],
    ctaTitle: "The Best AI YouTube Notes Generator",
    ctaDesc: "Stop pausing and rewinding. Let AI build your complete study notes automatically from any lecture video. Paste a link to get started.",
    ctaBtn: "Generate Notes Now",
    ratingCount: "12480"
  },
  "presentation-generator": {
    title: "AI Presentation Generator | Free AI PPT Slide Maker | Paperxify",
    description: "Create stunning, professional presentations in seconds with AI. Paperxify's free AI presentation generator produces structured slide decks, speaker notes, and PPTX exports for any topic — no design skills needed.",
    keywords: ["ai presentation generator", "free ai ppt maker", "ai slide deck creator", "ai powerpoint generator", "convert text to slides ai", "ai presentation maker online", "free ai ppt generator", "auto slide creator", "ai ppt from topic", "presentation ai tool", "ai slide builder free", "notegpt alternative presentation", "ai lecture slides maker"],
    h1: "Free AI Presentation & Slide Deck Generator | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Presentation Generator",
    h2Rest: "for Any Topic and Video Transcript",
    intro: "Building a slide deck from scratch takes hours. Paperxify compresses that into seconds. Input your topic, select a premium design theme, and receive a fully structured presentation with titles, content bullets, speaker notes, and export-ready layouts — no PowerPoint skills required.",
    features: [
      { title: "Premium Design Themes", desc: "Dozens of curated slide themes — from academic to cyberpunk — for every presentation style." },
      { title: "PPTX & PDF Export", desc: "Download fully formatted PowerPoint or PDF files with embedded speaker notes." }
    ],
    tableRows: [
      { feature: "Premium Design Themes", col2: "Yes (Dozens of Themes)", col3: "1-2 Basic Templates", col4: "Manual Design Only" },
      { feature: "Speaker Notes Generation", col2: "Yes (Automated)", col3: "Slide content only", col4: "Manual writing" },
      { feature: "PPTX & PDF Export", col2: "Yes (Both Formats)", col3: "PDF Only", col4: "Native PPTX only" }
    ],
    faqs: [
      { question: "How do I generate an AI presentation from scratch?", answer: "Simply type your topic or paste your source content into Paperxify's AI Presentation Generator, choose a theme and slide count, then click 'Generate'. The AI structures a full slide deck with titles, content bullets, and speaker notes in under 15 seconds." },
      { question: "Can the AI build presentations from YouTube videos?", answer: "Yes! Paperxify can convert YouTube lecture transcripts directly into structured slide decks. Paste the video link, choose 'Presentation' as your output, and receive a fully organized presentation distilled from the video's key insights." }
    ],
    ctaTitle: "The Best AI Presentation Slide Maker",
    ctaDesc: "Generate a complete, polished slide deck in seconds. Input your topic, pick a theme, and present with confidence. No design experience needed.",
    ctaBtn: "Generate Presentation Now",
    ratingCount: "7650"
  },
  "ai-diagram": {
    title: "AI Diagram & Flowchart Generator | Free Visual Diagram Maker | Paperxify",
    description: "Generate flowcharts, sequence diagrams, ER diagrams, class maps, timelines, and more instantly using AI. Paperxify's free AI diagram generator turns any concept or text into beautiful structured visual diagrams.",
    keywords: ["ai diagram generator", "free ai flowchart maker", "ai flowchart generator online", "sequence diagram generator ai", "er diagram maker ai", "class diagram generator", "ai mind map creator", "mermaid diagram generator", "ai timeline maker", "ai visual diagram tool", "concept map generator ai"],
    h1: "Free AI Diagram, Flowchart & Visual Concept Map Generator | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Flowcharts & Diagrams",
    h2Rest: "from Any Text and Process Description",
    intro: "Diagramming systems and processes manually is tedious. Paperxify's AI reads your description and instantly generates structured, professional-quality visual diagrams. From software architecture and database ER schemas to project timelines and user journeys — every diagram type is a single prompt away.",
    features: [
      { title: "12 Diagram Types", desc: "Flowchart, Sequence, Class, ER, State, Journey, Timeline, Sankey, and more." },
      { title: "Editable Mermaid Code", desc: "Edit the underlying diagram markup and export as SVG, PNG, or embed in Notion." }
    ],
    tableRows: [
      { feature: "AI from Text Description", col2: "Yes (Instant Generation)", col3: "Manual Only", col4: "Manual Only" },
      { feature: "12 Supported Diagram Types", col2: "Yes (All Types)", col3: "Many types, manual setup", col4: "Depends on skill" },
      { feature: "Export as SVG / PNG", col2: "Yes (Both Formats)", col3: "Yes (Paid plans)", col4: "Screenshot only" }
    ],
    faqs: [
      { question: "What types of diagrams can Paperxify AI generate?", answer: "Paperxify supports 12 diagram types: Flowchart, Sequence Diagram, Class Diagram, State Diagram, ER Diagram, User Journey Map, Pie Chart, Quadrant Chart, Timeline, Sankey Diagram, XY Line Chart, and Block Diagram. All are generated using structured Mermaid syntax." },
      { question: "Are the generated diagrams editable?", answer: "Yes! All diagrams are rendered from editable Mermaid markup. You can modify the generated code to refine nodes, edges, labels, and styling. Pro users also get a live diagram editor with real-time preview." }
    ],
    ctaTitle: "The Best Free AI Diagram Generator",
    ctaDesc: "Visualize any system, process, or concept as a professional diagram in seconds. Type your description and generate now.",
    ctaBtn: "Generate Diagram Now",
    ratingCount: "6840"
  },
  "ai-writer": {
    title: "AI Writer Suite | AI Detector, AI Humanizer, Essay Writer & Plagiarism Checker | Paperxify",
    description: "All-in-one AI writing toolkit. Detect AI-generated content, humanize text to bypass detectors, write academic essays, and check plagiarism — all in one free platform. Trusted by students globally.",
    keywords: ["ai writer tool", "free ai detector", "chatgpt detector online", "ai humanizer bypass detection", "humanize ai text free", "ai essay writer free", "free essay generator ai", "plagiarism checker free", "ai writing suite", "bypass turnitin ai detector", "academic essay generator"],
    h1: "Free AI Writer Suite: AI Detector, Humanizer, Essay Generator & Plagiarism Checker | Paperxify",
    h2: "AI Detector, ",
    h2Accent: "Humanizer",
    h2Rest: "Essay Writer & Plagiarism Check in One Place",
    intro: "The full academic writing toolkit in one place. Detect AI-generated text with confidence scores, rewrite AI content into natural human prose, draft structured essays with proper citations, and scan documents for plagiarism — all for free on Paperxify.",
    features: [
      { title: "4 Integrated Tools", desc: "AI Detector, AI Humanizer, Essay Writer, and Plagiarism Checker — all in one tab." },
      { title: "96%+ Detection Accuracy", desc: "Multi-model AI detection covering GPT-4, Claude, Gemini, and more with per-sentence scores." }
    ],
    tableRows: [
      { feature: "AI Content Detection", col2: "Yes (Per-Sentence Scores)", col3: "Yes (Separate paid tools)", col4: "None" },
      { feature: "AI Text Humanizer", col2: "Yes (Undetectable Output)", col3: "None", col4: "Manual rewriting" },
      { feature: "Academic Essay Generator", col2: "Yes (With Citations)", col3: "None", col4: "Hours of work" }
    ],
    faqs: [
      { question: "What tools are included in the Paperxify AI Writer suite?", answer: "The AI Writer suite includes four tools: AI Detector (detect ChatGPT and AI-generated content), AI Humanizer (convert AI text to natural human-like copy), AI Essay Writer (draft structured academic essays with citations), and Plagiarism Checker." },
      { question: "Can Paperxify humanize AI text to bypass Turnitin or GPTZero?", answer: "Yes. The AI Humanizer rewrites AI-generated content using advanced paraphrasing and linguistic variation to produce natural, human-like prose that significantly reduces AI detection scores." }
    ],
    ctaTitle: "The Best AI Academic Writing Suite",
    ctaDesc: "Detect AI, humanize text, write essays, and check plagiarism — all from one intelligent platform built for modern students.",
    ctaBtn: "Start Writing Now",
    ratingCount: "11230"
  },
  "ai-study": {
    title: "AI Study Room | Homework Helper, Math Solver & MCQ Quiz Player | Paperxify",
    description: "Your digital study canvas. Get step-by-step math solutions, ask subject homework questions, plan exam schedules, and practice languages with CEFR-aligned tutors. Free for students.",
    keywords: ["ai study room", "homework helper online", "math solver steps", "exam prep planner", "language tutor ai", "interactive quiz player", "study tools free"],
    h1: "Free AI Study Room — Step-by-Step Math Solver & Homework Helper | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Study Room",
    h2Rest: "with Advanced Problem Solvers & Revision Planners",
    intro: "Learning complex topics doesn't have to be isolating. The AI Study Room is your digital canvas combining step-by-step LaTeX math solving, instant homework explanations across all subjects, study schedulers, and active recall MCQ players.",
    features: [
      { title: "Advanced Subject Tutors", desc: "Ask questions in maths, physics, chemistry, history, lit, or economics for step-by-step help." },
      { title: "Active Recall Quizzes", desc: "Build practice MCQ tests, flashcard reviews, and study schedules based on your exam dates." }
    ],
    tableRows: [
      { feature: "LaTeX Math Step Solving", col2: "Yes (Complete methods)", col3: "No steps shown", col4: "Hours of textbooks" },
      { feature: "Personalized Exam Timetables", col2: "Yes (Spaced repetition)", col3: "Static calendars", col4: "Manual scheduling" },
      { feature: "CEFR Language Practice", col2: "Yes (20+ Languages)", col3: "Gamified lists only", col4: "Expensive tutors" }
    ],
    faqs: [
      { question: "What tools are included in the AI Study Room?", answer: "The AI Study Room features: Homework Helper (for explanations in humanities and sciences), Math Solver (LaTeX formatted step-by-step calculations), Exam Planner (spaced-repetition calendar builder), and Language Tutor (CEFR conversational coaching)." },
      { question: "Is the AI Study Room free to use?", answer: "Yes, our basic study canvas tools are free to access for students worldwide. Pro users get additional document file uploads and priority response times." }
    ],
    ctaTitle: "Master Any Subject Instantly",
    ctaDesc: "Get instant math solutions, plan revision schedules, and practice active recall mock tests in your free AI study space.",
    ctaBtn: "Enter Study Room Now",
    ratingCount: "9850"
  }
};

export const REGIONAL_SEO_DATA: Record<string, Record<string, PageSeoConfig>> = {
  us: {
    home: {
      title: "Paperxify US | YouTube to Notes AI & YouTube Video Summarizer",
      description: "Convert YouTube videos to study notes instantly in the US. Paperxify is the best free AI YouTube note taker, video summarizer, and NoteGPT alternative for American college students at Stanford, MIT, Harvard, and Ivy League schools.",
      keywords: ["youtube to notes ai us", "ai youtube note taker united states", "youtube video note taker us", "ai notes from youtube", "notegpt alternative us", "mindgrasp alternative america", "best ai youtube summarizer us", "youtube transcript to notes", "turn youtube into notes"],
      h1: "Paperxify US ΓÇö Convert YouTube Videos to Study Notes Instantly | Paperxify",
      h2: "AI-Powered",
      h2Accent: "YouTube Note Taker",
      h2Rest: "for American College & High School Students",
      intro: "Watching a lecture is passive. Paperxify converts any YouTube video into structured, revision-ready study notes automatically. Perfect for college students at Stanford, MIT, and Ivy League schools preparing for exams.",
      features: [
        { title: "Specialized US Standards", desc: "Notes matching US College Board, AP, and university academic requirements." },
        { title: "Notion & PDF Sync", desc: "Download high-quality PDFs with proper margins or sync to Notion with one click." }
      ],
      tableRows: [
        { feature: "Structured Academic Formatting", col2: "Yes (Headers, Code, LaTeX)", col3: "Plain bullets", col4: "Slow manual work" },
        { feature: "AP & College Syllabus Focus", col2: "Yes (Tailored concepts)", col3: "No", col4: "Yes" },
        { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
      ],
      faqs: [
        { question: "How to convert YouTube videos to notes using AI in the US?", answer: "To convert a YouTube video to notes, paste the link on Paperxify. The AI transcribes and organizes it into study notes and flashcards." },
        { question: "Is there a free AI tool to take notes from YouTube in America?", answer: "Yes, Paperxify is a free AI YouTube note-taking tool available to students and professionals across the United States." }
      ],
      ctaTitle: "The Best AI YouTube Notes Generator in the US",
      ctaDesc: "Stop pausing and rewinding. Let AI build your complete study notes automatically from any lecture video. Paste a link to get started.",
      ctaBtn: "Generate Notes Now",
      ratingCount: "8420"
    },
    "youtube-to-notes": {
      title: "YouTube to Notes AI US | Paperxify",
      description: "Save hours of study time by instantly turning YouTube lectures into structured notes and active recall flashcards. Perfect for US students preparing for AP exams and finals. Paste a link to start free!",
      keywords: ["youtube link to notes", "ai notes", "ai study", "youtube to notes ai us", "convert youtube video to notes usa", "ai lecture notes maker", "free youtube summarizer ap calculus", "video study guide generator"],
      h1: "Free AI YouTube Video to Study Notes Generator for US Students | Paperxify",
      h2: "Convert YouTube Links",
      h2Accent: "to AP & College Notes",
      h2Rest: "with Advanced AI in Seconds",
      intro: "Active recall is key. Paperxify US converts complex YouTube lecture links, crash courses, and tutorial series into organized summaries, study guides, and flashcards optimized for AP Exams, SAT/ACT prep, and university finals.",
      features: [
        { title: "SAT/ACT & AP Prep Support", desc: "Tailored to summarize AP Calculus, AP Chemistry, AP Biology, and AP US History crash courses." },
        { title: "Fast PDF & Markdown Exports", desc: "Download study guides directly as markdown or beautifully typeset printable PDFs." }
      ],
      tableRows: [
        { feature: "Structured Academic Formatting", col2: "Yes (Headers, Code, LaTeX)", col3: "Plain bullets", col4: "Time-consuming" },
        { feature: "Multiple Output Styles", col2: "Yes (Flash, Scholar, Canvas)", col3: "Single format only", col4: "Depends on student" },
        { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
      ],
      faqs: [
        {
          question: "Is there a free AI tool to take notes from YouTube in the US?",
          answer: "Yes, Paperxify is a free AI YouTube note-taking tool available to students and professionals across the United States. It instantly turns lecture links into revision guides and flashcards."
        },
        {
          question: "Can I use Paperxify for AP exam preparation?",
          answer: "Absolutely! Paste any AP chemistry, physics, biology, or calculus crash course link, and Paperxify will extract key concepts, formulas, and definitions in seconds."
        },
        {
          question: "Does this work for engineering lectures at US colleges?",
          answer: "Yes, our AI handles complex equations, programming code blocks, and technical terms used in lectures at Stanford, MIT, and other engineering schools."
        }
      ],
      ctaTitle: "Start Acing Your AP & College Courses",
      ctaDesc: "Convert any YouTube tutorial or lecture video link into structured, print-ready study notes in seconds. Completely free to try.",
      ctaBtn: "Generate Study Notes",
      ratingCount: "6250"
    }
  },
  uk: {
    home: {
      title: "Paperxify UK | YouTube to Notes AI & A-Level GCSE Summarizer",
      description: "Convert YouTube videos to GCSE & A-Level revision notes instantly in the UK. Paperxify is the best free AI YouTube note taker, lecture summarizer, and NoteGPT alternative for British students.",
      keywords: ["youtube to notes ai uk", "a level revision notes generator", "gcse revision notes maker", "youtube video note taker uk", "notegpt alternative uk", "oxbridge prep tools"],
      h1: "Paperxify UK ΓÇö Convert YouTube Lectures to GCSE & A-Level Notes | Paperxify",
      h2: "AI-Powered",
      h2Accent: "Revision Notes Maker",
      h2Rest: "for GCSEs, A-Levels & UK University Exams",
      intro: "Master your courses with Paperxify. Paste any GCSE, A-Level, or university lecture video link and instantly get beautifully structured revision notes, active recall flashcards, and concept maps.",
      features: [
        { title: "GCSE & A-Level Optimized", desc: "Designed to match AQA, OCR, and Edexcel syllabus structures." },
        { title: "Oxbridge & University Ready", desc: "Extract complex theory, equations, and code blocks for Oxford, Cambridge, LSE, and UCL students." }
      ],
      tableRows: [
        { feature: "GCSE & A-Level Syllabus Focus", col2: "Yes (AQA, OCR, Edexcel)", col3: "No", col4: "Yes" },
        { feature: "Oxbridge-tier Transcription", col2: "Yes (Handles complex topics)", col3: "Standard summaries", col4: "Slow manual work" },
        { feature: "Revision Flashcards Generator", col2: "Yes (Auto-generated)", col3: "None", col4: "Manual creation" }
      ],
      faqs: [
        { question: "Does Paperxify support GCSE and A-Level revision?", answer: "Yes! Paperxify is highly optimized for the UK syllabus. You can paste revision lectures from GCSE Maths, A-Level Physics, OCR Chemistry, or AQA biology to generate quick revision notes." },
        { question: "Is Paperxify free for UK students?", answer: "Yes, our basic AI note generator is completely free. Students looking for advanced PDF exporting, Notion integration, and longer video support can upgrade to Pro." }
      ],
      ctaTitle: "Ace Your GCSEs and A-Levels Today",
      ctaDesc: "Stop spending hours writing study summaries by hand. Paste your YouTube lecture link and let AI do the work.",
      ctaBtn: "Get Revision Notes Now",
      ratingCount: "7120"
    },
    "youtube-to-notes": {
      title: "YouTube to Notes AI UK | Paperxify",
      description: "Save hours of GCSE & A-Level revision by instantly converting YouTube video lectures into revision notes and active recall cards. Perfect for UK students. Paste a link to start free!",
      keywords: ["youtube link to notes", "ai notes", "ai study", "youtube to notes ai uk", "gcse maths revision guides", "a level physics summaries", "ocr chemistry note taker", "edexcel history notes maker"],
      h1: "Free AI YouTube Video to A-Level & GCSE Revision Notes Maker | Paperxify",
      h2: "AI-Generated",
      h2Accent: "Revision Summaries",
      h2Rest: "for GCSE & A-Level Prep",
      intro: "Stop writing study guides by hand. Paperxify UK turns revision channels, crash courses, and Oxbridge prep videos into structured outlines, math formulas, and active recall cards.",
      features: [
        { title: "AQA, OCR, & Edexcel Syllabus", desc: "Aligned with key exam boards so your notes contain the exact terminology examiners look for." },
        { title: "Print-Ready PDF Guides", desc: "Download revision summaries with academic styling like Garamond and Lora themes." }
      ],
      tableRows: [
        { feature: "GCSE & A-Level Syllabus Focus", col2: "Yes (AQA, OCR, Edexcel)", col3: "No", col4: "Yes" },
        { feature: "Equation & LaTeX formatting", col2: "Yes (Fully supported)", col3: "Text only", col4: "Manual layout" },
        { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
      ],
      faqs: [
        {
          question: "How does the GCSE/A-Level note generator work?",
          answer: "Simply paste the link of any UK revision channel (like Freesciencelessons or ExamSolutions) and click generate. The AI transcribes the video and formats key syllabus definitions and concepts."
        },
        {
          question: "Can I export my UK revision notes to Notion?",
          answer: "Yes, you can copy the markdown or use our one-click export to Notion to keep all your GCSE and A-Level revision organized in one place."
        },
        {
          question: "Does this AI notes generator support AQA, OCR, and Edexcel exams?",
          answer: "Yes! Paperxify's revision notes generator is optimized to recognize and match syllabus terms and structures for UK exam boards including AQA, OCR, and Edexcel."
        }
      ],
      ctaTitle: "The Best AI Revision Tool in the UK",
      ctaDesc: "Convert revision lectures, tutorial video walkthroughs, and exam preparation guides into formatted study notes in seconds.",
      ctaBtn: "Generate Revision Notes",
      ratingCount: "5420"
    }
  },
  ca: {
    home: {
      title: "Paperxify Canada | YouTube to Notes AI & Provincial Exam Summarizer",
      description: "Convert YouTube videos to Canadian study notes instantly. Paperxify is the best free AI YouTube note taker, OSSLT helper, and NoteGPT alternative for students in Toronto, BC, and Quebec.",
      keywords: ["youtube to notes ai canada", "canadian study notes maker", "osslt prep online", "provincial exam study helper", "notegpt alternative canada", "u of t notes generator"],
      h1: "Paperxify Canada ΓÇö Convert YouTube Lectures to Study Notes | Paperxify",
      h2: "AI-Powered",
      h2Accent: "Study Guide Generator",
      h2Rest: "for Canadian High School & University Students",
      intro: "Prepare for Provincial Exams, OSSLT, and AP tests. Generate clear, structured study guides, summaries, and active recall flashcards at U of T, UBC, McGill, and Waterloo.",
      features: [
        { title: "Canadian Syllabus Tailored", desc: "Optimized for Provincial exams, OSSL tests, and university standards across Canada." },
        { title: "Direct Notion Export", desc: "Transfer generated summaries directly to Notion or download as clean, academic PDFs." }
      ],
      tableRows: [
        { feature: "OSSLT & Provincial Exam Prep", col2: "Yes (Tailored summaries)", col3: "No", col4: "Yes" },
        { feature: "Canadian University Formats", col2: "Yes (U of T, UBC, McGill standards)", col3: "Generic only", col4: "Depends on student" },
        { feature: "One-Click PDF Export", col2: "Yes (Fully typeset)", col3: "No", col4: "Yes" }
      ],
      faqs: [
        { question: "Can Paperxify help me study for Canadian Provincial Exams?", answer: "Yes! Paste any study tutorial or lecture series, and Paperxify will generate structured outlines, study points, and flashcards optimized for your provincials." },
        { question: "Can I use this at major Canadian universities?", answer: "Absolutely. Students at University of Toronto, UBC, McGill, and University of Waterloo use Paperxify to summarize computer science, biology, and math lectures." }
      ],
      ctaTitle: "Prepare Smarter for Canadian Exams",
      ctaDesc: "Convert any YouTube video lecture or crash course link into formatted, high-quality study guides and flashcards automatically.",
      ctaBtn: "Start Free Study Guide",
      ratingCount: "6820"
    },
    "youtube-to-notes": {
      title: "YouTube to Notes AI Canada | Paperxify",
      description: "Save hours of study time by instantly converting YouTube lectures into structured study guides. Perfect for Canadian students preparing for provincial exams and OSSLT. Paste a link to start free!",
      keywords: ["youtube link to notes", "ai notes", "ai study", "youtube to notes ai canada", "convert youtube video to notes ca", "osslt literacy test prep", "u of t lecture note maker", "waterloo computer science notes"],
      h1: "Free AI YouTube Video to Study Guides & Notes Generator in Canada | Paperxify",
      h2: "AI-Generated",
      h2Accent: "Canadian Study Notes",
      h2Rest: "from Any Lecture Link",
      intro: "Academics in Canada are demanding. Paperxify Canada helps you save time by turning chemistry, physics, and computer science video lectures into structured, print-ready summaries and active recall cards.",
      features: [
        { title: "Province-Specific Curriculums", desc: "Optimized to format summaries that align with high school and university curriculums in Ontario, BC, and Alberta." },
        { title: "Academic Margin Formatting", desc: "Download PDFs typeset with clean margins and headers for physical binders and notebooks." }
      ],
      tableRows: [
        { feature: "OSSLT & Provincial Exam Prep", col2: "Yes (Tailored summaries)", col3: "No", col4: "Yes" },
        { feature: "LaTeX Equations & Formatting", col2: "Yes (Academic structures)", col3: "Text only", col4: "Manual formatting" },
        { feature: "Notion Sync integration", col2: "Yes (Direct upload)", col3: "None", col4: "Manual" }
      ],
      faqs: [
        {
          question: "How do I make study notes from a YouTube link in Canada?",
          answer: "Simply copy your lecture URL, paste it into the Paperxify input bar, choose your output format, and click generate. You will have a formatted study guide in seconds."
        },
        {
          question: "Can I export my Waterloo coding notes to markdown?",
          answer: "Yes, Paperxify outputs clean markdown with code blocks, which can be downloaded directly or pasted into Obsidian or Notion."
        },
        {
          question: "Can Paperxify help me study for Canadian Provincial Exams?",
          answer: "Yes! Paste any study tutorial or lecture series, and Paperxify will generate structured outlines, study points, and flashcards optimized for your provincials."
        }
      ],
      ctaTitle: "The Best Canadian Lecture Summarizer",
      ctaDesc: "Transform complex YouTube tutorials, crash courses, and lectures into structured study guides, flashcards, and diagrams instantly.",
      ctaBtn: "Generate Study Notes",
      ratingCount: "4840"
    }
  },
  au: {
    home: {
      title: "Paperxify AU | YouTube to Notes AI & ATAR HSC VCE Summarizer",
      description: "Convert YouTube videos to ATAR, HSC & VCE study notes instantly in Australia. Paperxify is the best free AI YouTube note taker, lecture summarizer, and NoteGPT alternative.",
      keywords: ["youtube to notes ai au", "atar notes chemistry", "hsc study summaries generator", "vce physics notes maker", "notegpt alternative australia", "melbourne uni notes"],
      h1: "Paperxify AU ΓÇö Convert YouTube Lectures to ATAR, HSC & VCE Notes | Paperxify",
      h2: "AI-Powered",
      h2Accent: "ATAR & HSC Notes Maker",
      h2Rest: "for Australian Secondary & Tertiary Students",
      intro: "Get higher ATAR scores. Convert physics, maths, chemistry, and humanities videos into structured study notes, active recall flashcards, and concept maps automatically.",
      features: [
        { title: "HSC, VCE & ATAR Optimized", desc: "Tailored to summarize ATAR Physics, ATAR Chemistry, HSC Maths, and VCE Biology." },
        { title: "Australian University Formats", desc: "Structured summaries matching standards at UniMelb, USyd, ANU, and UNSW." }
      ],
      tableRows: [
        { feature: "ATAR, HSC & VCE Exam focus", col2: "Yes (ATAR Science & Math)", col3: "No", col4: "Yes" },
        { feature: "Active Recall Flashcards", col2: "Yes (Auto-generated)", col3: "None", col4: "Manual creation" },
        { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
      ],
      faqs: [
        { question: "How does Paperxify help Australian students prepare for ATAR?", answer: "Paperxify turns ATAR physics, chemistry, and mathematics lectures into formulas, lists, and flashcards so you can spend your time revising rather than taking notes." },
        { question: "Can I use it at universities like Monash or USyd?", answer: "Yes, university students throughout Australia use Paperxify to process long lectures and extract structured study notes." }
      ],
      ctaTitle: "Boost Your ATAR and University Scores",
      ctaDesc: "Don't spend hours transcribing and writing summaries. Let our AI convert your YouTube lectures and study guides instantly.",
      ctaBtn: "Calculate My ATAR Notes",
      ratingCount: "6320"
    },
    "youtube-to-notes": {
      title: "YouTube to Notes AI AU | Paperxify",
      description: "Save hours of study time by converting YouTube lectures to structured ATAR revision guides, VCE notes, and HSC summaries instantly. Perfect for Australian students. Paste a link to start free!",
      keywords: ["youtube link to notes", "ai notes", "ai study", "youtube to notes ai au", "atar physics study guides", "hsc mathematics summaries", "vce biology notes maker", "sydney university note maker"],
      h1: "Free AI YouTube Video to ATAR, HSC & VCE Notes Generator in Australia | Paperxify",
      h2: "AI-Generated",
      h2Accent: "ATAR Revision Notes",
      h2Rest: "from Any YouTube Lecture Link",
      intro: "Studying for HSC or VCE? Paperxify AU extracts key syllabus points, mathematical equations, and scientific formulas from any YouTube video and structures them into active recall guides.",
      features: [
        { title: "ATAR Syllabus Terminology", desc: "Aligned with Australian state curriculums (NESA, VCAA, QCAA) to use the exact definitions examiners award marks for." },
        { title: "One-Click Notion & PDF Sync", desc: "Keep all your high school and university subjects synced directly to Notion or download as printable PDFs." }
      ],
      tableRows: [
        { feature: "HSC, VCE & ATAR Exam focus", col2: "Yes (ATAR Science & Math)", col3: "No", col4: "Yes" },
        { feature: "LaTeX Equations & Formatting", col2: "Yes (Clean academic output)", col3: "Text only", col4: "Manual formatting" },
        { feature: "Notion Sync integration", col2: "Yes (Direct upload)", col3: "None", col4: "Manual" }
      ],
      faqs: [
        {
          question: "How do I summarize ATAR lectures from YouTube?",
          answer: "Paste the YouTube video link in Paperxify. Our AI processes the transcript and formats the content using ATAR science, mathematics, and humanities structures."
        },
        {
          question: "Can I export my UniMelb lectures directly to PDF?",
          answer: "Yes, you can export your generated study notes as high-resolution, print-ready PDF files with academic themes."
        },
        {
          question: "Does it support VCE, HSC, and state curriculums?",
          answer: "Yes! The AI note taker is optimized to recognize and match syllabus terminology for Australian secondary school curriculums (including NESA in NSW and VCAA in Victoria)."
        }
      ],
      ctaTitle: "The Ultimate Aussie Study Hack",
      ctaDesc: "Convert revision lectures, tutorial video walkthroughs, and exam preparation guides into formatted study notes in seconds.",
      ctaBtn: "Generate Revision Notes",
      ratingCount: "4680"
    }
  }
};

export const SUBJECT_SEO_DATA: Record<string, PageSeoConfig> = {
  biology: {
    title: "YouTube to Biology Notes AI | Convert Biology Videos to Notes | Paperxify",
    description: "Transform any biology YouTube lecture, crash course, or AP biology video into structured study notes and flashcards instantly. Free AI note taker for biology students.",
    keywords: ["youtube notes biology", "biology lecture summaries ai", "crash course biology notes", "cell biology revision guide", "convert biology video to notes", "ap biology notes maker", "dna replication notes ai"],
    h1: "Free AI YouTube Video to Biology Study Notes Generator | Paperxify",
    h2: "AI-Generated",
    h2Accent: "Biology Study Notes",
    h2Rest: "from Video Lectures & Crash Courses",
    intro: "Biology requires memorizing complex pathways, terminology, and structures. Paperxify turns molecular biology lectures, ecology crash courses, and genetics tutorials into neat structured summaries, definition list cards, and diagrams.",
    features: [
      { title: "Cellular & Molecular Focus", desc: "Accurately extracts details on DNA replication, photosynthesis, cellular respiration, and genetics." },
      { title: "Scientific Flashcard Generation", desc: "Converts definitions and biological terms into active recall flashcards automatically." }
    ],
    tableRows: [
      { feature: "Biological Process Diagramming", col2: "Yes (Visual Canvas Maps)", col3: "Text summaries only", col4: "Manual sketching" },
      { feature: "Detailed Terminology Lists", col2: "Yes (Auto-extracted glossary)", col3: "Basic lists", col4: "Manual transcription" },
      { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
    ],
    faqs: [
      { question: "How do I summarize biology lectures from YouTube?", answer: "Copy the YouTube link of any biology video (e.g. Bozeman Science, Crash Course, or university lectures), paste it into Paperxify, and get organized bullet points, diagrams, and flashcards." },
      { question: "Does the AI support biochemistry and genetics topics?", answer: "Yes! The AI understands advanced terminology, chemical pathways (like the Krebs cycle), and genetics structures, formatting them with subheaders and bold definitions." }
    ],
    ctaTitle: "Master Biology with AI-Generated Notes",
    ctaDesc: "Stop pausing videos to write down terms. Paste a lecture link now to get structured biology notes in under 15 seconds.",
    ctaBtn: "Generate Biology Notes",
    ratingCount: "4320"
  },
  chemistry: {
    title: "YouTube to Chemistry Notes AI | Organic & General Chem Summaries | Paperxify",
    description: "Convert chemistry video lectures and tutorials into structured study notes, equations, and flashcards. Free AI general and organic chemistry notes generator.",
    keywords: ["youtube notes chemistry", "organic chemistry summaries ai", "general chemistry notes free", "ap chemistry video to notes", "chemistry study guides", "chemical reactions summarizer", "le chatelier principle notes"],
    h1: "Free AI YouTube Video to Chemistry Study Notes & Equations Generator | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Chemistry Study Guides",
    h2Rest: "with Formulas & Reaction Steps",
    intro: "From balancing redox equations to mapping organic synthesis pathways, chemistry can be daunting. Paperxify transcribes and distills chemistry YouTube tutorials into organized study sheets, chemical formulas, and step-by-step reaction guides.",
    features: [
      { title: "Formula & Equation Detection", desc: "Extracts and formats chemical formulas, balancing numbers, and periodic trends." },
      { title: "Reaction Steps Outlining", desc: "Outlines multi-step organic synthesis mechanisms and thermodynamic properties clearly." }
    ],
    tableRows: [
      { feature: "Reaction Mechanism Outlining", col2: "Yes (Step-by-step format)", col3: "Paragraph summaries", col4: "Handwritten mapping" },
      { feature: "LaTeX Chemical Formulas", col2: "Yes (Accurate notations)", col3: "Text approximations", col4: "Manual formatting" },
      { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
    ],
    faqs: [
      { question: "Does the chemistry note taker support organic chemistry mechanisms?", answer: "Yes. Paperxify extracts the steps described in organic chemistry video walkthroughs (like nucleophilic substitution or elimination reactions) and lists them chronologically." },
      { question: "Can the AI format chemical equations?", answer: "Yes, it formats chemical formulas and equilibrium expressions using LaTeX notation for clean, publication-ready notes." }
    ],
    ctaTitle: "Ace General & Organic Chemistry",
    ctaDesc: "Convert complex chemistry YouTube tutorials into clear study sheets, chemical formula sheets, and study diagrams automatically.",
    ctaBtn: "Generate Chemistry Notes",
    ratingCount: "3850"
  },
  physics: {
    title: "YouTube to Physics Notes AI | Mechanics & Quantum Physics Guides | Paperxify",
    description: "Convert physics YouTube video lectures into structured notes with equations and variables. Free AI physics note taker for mechanics, thermodynamics, and electromagnetism.",
    keywords: ["youtube notes physics", "physics lecture summaries", "ap physics video note taker", "mechanics thermodynamics notes", "physics revision guide ai", "quantum mechanics notes generator"],
    h1: "Free AI YouTube Video to Physics Notes & LaTeX Equation Generator | Paperxify",
    h2: "AI-Generated",
    h2Accent: "Physics Notes",
    h2Rest: "with LaTeX Formulas & Variable Explanations",
    intro: "Physics requires understanding both conceptual laws and complex mathematical equations. Paperxify parses physics lectures, extracts laws (like Newton's or Maxwell's), and formats physics equations along with their variables using LaTeX.",
    features: [
      { title: "LaTeX Mathematical Physics", desc: "Renders motion, thermodynamics, wave, and quantum equations in clean LaTeX formatting." },
      { title: "Core Laws Summarization", desc: "Identifies and highlights fundamental physical laws, constant values, and theories." }
    ],
    tableRows: [
      { feature: "LaTeX Equation Formatting", col2: "Yes (Complete formulas)", col3: "Plain text equations", col4: "Manual formatting" },
      { feature: "Variable Definitions Glossary", col2: "Yes (Auto-explains variables)", col3: "No", col4: "Manual glossary writeup" },
      { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
    ],
    faqs: [
      { question: "How does the AI format mathematical physics equations?", answer: "Paperxify automatically identifies equations in the transcript, formats them with LaTeX block styles, and lists variables (like force, mass, acceleration) with definitions." },
      { question: "Does it work for advanced physics like quantum or electromagnetism?", answer: "Yes. The AI is trained on university-level terminology and supports advanced topics including Maxwell's equations, relativity, and quantum mechanics." }
    ],
    ctaTitle: "Crack Physics Equations Instantly",
    ctaDesc: "Convert any physics video lecture or AP review session into structured notes, formula sheets, and study cards automatically.",
    ctaBtn: "Generate Physics Notes",
    ratingCount: "4120"
  },
  python: {
    title: "YouTube to Python Notes AI | Convert Coding Tutorials to Code Guides | Paperxify",
    description: "Turn Python video tutorials and bootcamps into notes with formatted code blocks and syntax comments. Free AI Python study guide generator.",
    keywords: ["python tutorial to study notes", "learn python video to notes", "python code blocks summarizer", "python programming notes", "convert coding tutorials to notes", "python syntax study guide"],
    h1: "Free AI YouTube Video to Python Programming Notes & Code Blocks Generator | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Python Study Guides",
    h2Rest: "with Syntax Highlighted Code Blocks",
    intro: "Learning to code from video tutorials is difficult when you have to keep pausing to write code down. Paperxify reads Python videos, extracts functional code blocks, adds syntax explanations, and formats them in clean Markdown code blocks.",
    features: [
      { title: "Syntax Highlighted Code Blocks", desc: "Extracts code examples directly from transcripts and formats them in Markdown blocks." },
      { title: "Algorithm & Logic Analysis", desc: "Breakdowns OOP concepts, loops, dictionaries, recursion, and API calls." }
    ],
    tableRows: [
      { feature: "Syntax-Highlighted Code Blocks", col2: "Yes (Markdown formatting)", col3: "Plain unformatted text", col4: "Manual coding work" },
      { feature: "Algorithm Step-by-Step Breakdown", col2: "Yes (Logical analysis)", col3: "Paragraph summaries", col4: "Manual analysis" },
      { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
    ],
    faqs: [
      { question: "Can Paperxify extract code from YouTube programming tutorials?", answer: "Yes! Paste the link of any Python tutorial or bootcamp (like freeCodeCamp), and Paperxify will extract the example code, format it, and add explanatory notes." },
      { question: "Is the output compatible with Markdown editors?", answer: "Absolutely. The code is structured in standard Markdown blocks, making it easy to copy and paste into Notion, Obsidian, VS Code, or Jupyter notebooks." }
    ],
    ctaTitle: "Stop Pausing Programming Videos",
    ctaDesc: "Convert coding tutorials into clean, copy-pasteable Python guides with syntax notes and code examples automatically.",
    ctaBtn: "Generate Python Notes",
    ratingCount: "5890"
  },
  "machine-learning": {
    title: "YouTube to Machine Learning Notes AI | ML & Deep Learning Summaries | Paperxify",
    description: "Convert machine learning, neural networks, and deep learning video tutorials into mathematical equations, notes, and code blocks instantly. Free AI ML note taker.",
    keywords: ["machine learning lectures to notes", "neural networks study summaries", "ml crash course notes ai", "deep learning lecture note taker", "ml formulas notes", "linear regression notes", "backpropagation notes ai"],
    h1: "Free AI YouTube Video to Machine Learning Notes & Equations Generator | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Machine Learning Guides",
    h2Rest: "for Neural Networks, Calculus & Code",
    intro: "Machine learning blends complex calculus, linear algebra, and coding. Paperxify handles ML video lectures, mapping out neural network architecture layers, formatting loss function equations, and generating Python code sheets.",
    features: [
      { title: "Calculus & Linear Algebra Support", desc: "Accurately extracts and formats derivatives, matrix dot products, and weights." },
      { title: "Model Architecture Outlining", desc: "Organizes neural network layers, activation functions, and training parameters." }
    ],
    tableRows: [
      { feature: "Math & Code Integration", col2: "Yes (LaTeX math + Python blocks)", col3: "Text summaries only", col4: "Manual composition" },
      { feature: "Architecture Layer Breakdowns", col2: "Yes (CNN/RNN/Transformer mapping)", col3: "Generic summaries", col4: "Manual diagrams" },
      { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
    ],
    faqs: [
      { question: "Can I use Paperxify for advanced university ML lectures?", answer: "Yes. Paperxify handles high-level Stanford CS229 or MIT machine learning videos, formatting gradient descent calculus, backpropagation steps, and linear algebra matrices." },
      { question: "Does it explain neural network architectures?", answer: "Yes, it creates structured outlines detailing layers, activation functions (ReLU, Sigmoid), weights, and loss parameters explained in the video." }
    ],
    ctaTitle: "Distill Machine Learning Lectures",
    ctaDesc: "Convert complex ML and deep learning videos into mathematical formulas, Python coding files, and study summaries instantly.",
    ctaBtn: "Generate ML Notes",
    ratingCount: "3480"
  },
  sat: {
    title: "YouTube to SAT Notes AI | Convert SAT Math & Reading Prep | Paperxify",
    description: "Convert SAT preparation videos and practice test explanations into organized study sheets, math formulas, and grammar lists. Free AI SAT exam prep helper.",
    keywords: ["sat prep notes ai", "sat math study summaries", "sat grammar guide generator", "sat test prep notes free", "convert sat prep videos to notes", "digital sat study helper"],
    h1: "Free AI YouTube Video to SAT Exam Study Notes & Practice Lists Generator | Paperxify",
    h2: "AI-Powered",
    h2Accent: "SAT Revision Notes",
    h2Rest: "for Math Formulas & Grammar Rules",
    intro: "Preparing for the Digital SAT? Paperxify extracts SAT Math formula reviews, reading passage comprehension strategies, and grammar checklist rules from YouTube preparation channels to create focused cheat sheets.",
    features: [
      { title: "SAT Math Quick Sheets", desc: "Collects coordinate geometry, algebra, and trigonometry formula sheets discussed in the video." },
      { title: "Grammar & Reading Strategies", desc: "Outlines punctuation rules, subject-verb agreement tricks, and passage mapping hacks." }
    ],
    tableRows: [
      { feature: "Formula Cheat Sheets", col2: "Yes (Auto-compiled maths)", col3: "Scattered bullet points", col4: "Manual index card lists" },
      { feature: "Grammar Punctuation Checklists", col2: "Yes (Rules + Example sentences)", col3: "Basic outlines", col4: "Handwritten logs" },
      { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
    ],
    faqs: [
      { question: "Can Paperxify summarize SAT math prep videos?", answer: "Yes, it transcribes SAT math tutorials, extracts formulas, and provides step-by-step methods shown in sample problem videos." },
      { question: "Is this updated for the Digital SAT format?", answer: "Yes, the AI focuses on targeted, short-format content, syntax rules, and algebraic formulas common in the Digital SAT syllabus." }
    ],
    ctaTitle: "Supercharge Your SAT Prep",
    ctaDesc: "Convert SAT review videos and walk-through practice tests into formatted formula guides and grammar cheat sheets automatically.",
    ctaBtn: "Generate SAT Notes",
    ratingCount: "5120"
  },
  "ap-biology": {
    title: "YouTube to AP Biology Notes AI | AP Bio Exam Prep Guides | Paperxify",
    description: "Convert AP Biology lecture videos and exam reviews into structured unit study guides, glossary terms, and flashcards. Free AP Biology notes generator.",
    keywords: ["ap biology revision notes", "ap bio study guide generator", "ap bio crash course notes", "ap exam prep notes ai", "ap biology videos to notes", "ap bio unit summaries"],
    h1: "Free AI YouTube Video to AP Biology Exam Study Guides & Glossary Generator | Paperxify",
    h2: "AI-Generated",
    h2Accent: "AP Biology Unit Guides",
    h2Rest: "Aligned with College Board Standards",
    intro: "AP Biology covers a massive breadth of content. Paperxify turns AP Bio unit review videos (Unit 1 Chemistry of Life to Unit 8 Ecology) into clear unit summary guides, bold definitions, and review flashcards.",
    features: [
      { title: "College Board Units Aligned", desc: "Structures study notes based on the 8 official AP Biology units." },
      { title: "Bold Glossary Definitions", desc: "Auto-extracts scientific vocabulary terms (e.g. endosymbiosis, standard deviation) into review cards." }
    ],
    tableRows: [
      { feature: "Official AP Unit Structure", col2: "Yes (Aligned to AP Curriculum)", col3: "Generic notes", col4: "Manual syllabus mapping" },
      { feature: "Vocabulary Flashcards", col2: "Yes (Auto-glossary creator)", col3: "No glossary", col4: "Manual index cards" },
      { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
    ],
    faqs: [
      { question: "Can I paste full AP Biology unit reviews?", answer: "Yes, Paperxify handles extended unit videos up to 30 minutes for free users (and up to 4-12 hours for subscribers), making it ideal for full-unit cram reviews." },
      { question: "Does the notes generator use College Board vocabulary?", answer: "Yes, the AI identifies key biological terms outlined in the AP Bio curriculum and formats them as highlighted definitions." }
    ],
    ctaTitle: "Ace Your AP Biology Exam",
    ctaDesc: "Turn AP Biology unit review videos, practice prompts, and crash courses into structured guides and glossary flashcards automatically.",
    ctaBtn: "Generate AP Bio Notes",
    ratingCount: "4210"
  },
  "gcse-maths": {
    title: "YouTube to GCSE Maths Notes AI | Edexcel & AQA Exam Prep | Paperxify",
    description: "Convert GCSE maths video tutorials and exam walk-through past papers into formula guides and step-by-step methods. Free AI GCSE maths note taker.",
    keywords: ["gcse maths revision notes", "gcse math summaries ai", "edexcel gcse maths study guide", "aqa gcse maths notes", "gcse math video to notes", "gcse geometry notes maker"],
    h1: "Free AI YouTube Video to GCSE Maths Study Guides & Formulas Generator | Paperxify",
    h2: "AI-Powered",
    h2Accent: "GCSE Maths Study Sheets",
    h2Rest: "with Step-by-Step Math Methods",
    intro: "Struggling with GCSE algebra, geometry, or probability? Paperxify UK transcribes GCSE Maths past paper reviews and tutorials to compile step-by-step mathematical procedures and formula sheets.",
    features: [
      { title: "Exam Board Specific Notes", desc: "Aligned with AQA, Edexcel, and OCR GCSE Maths specifications (Higher & Foundation)." },
      { title: "Mathematical Step Listings", desc: "Lists methods for quadratic equations, trigonometry, percentages, and graph plots." }
    ],
    tableRows: [
      { feature: "Step-by-Step Problem Methods", col2: "Yes (Clear calculations)", col3: "Plain final answers", col4: "Manual scrap paper notes" },
      { feature: "LaTeX Math Formula Compilations", col2: "Yes (Higher & Foundation lists)", col3: "Approximated notations", col4: "Manual indexing" },
      { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
    ],
    faqs: [
      { question: "Does this cover GCSE Higher and Foundation tiers?", answer: "Yes. Paste any video explaining GCSE Higher or Foundation math concepts, and the AI will extract the equations, methods, and example questions." },
      { question: "Can I use it for Edexcel and AQA past paper walkthroughs?", answer: "Yes. If you paste a walkthrough video, the AI outlines the step-by-step working method for each question discussed." }
    ],
    ctaTitle: "Boost Your GCSE Maths Grades",
    ctaDesc: "Convert GCSE math tutorials and practice exam walkthrough videos into step-by-step guides and revision sheets instantly.",
    ctaBtn: "Generate GCSE Maths Notes",
    ratingCount: "3940"
  },
  "a-level-physics": {
    title: "YouTube to A-Level Physics Notes AI | AQA & OCR Physics Guides | Paperxify",
    description: "Convert A-Level Physics video lectures and exam review sessions into structured notes, derivations, and formulas. Free AI A-Level physics notes creator.",
    keywords: ["a level physics revision notes", "a level physics study summaries", "ocr a level physics notes", "aqa physics note taker", "a level physics video to notes", "physics derivations notes ai"],
    h1: "Free AI YouTube Video to A-Level Physics revision Notes & Derivations Generator | Paperxify",
    h2: "AI-Generated",
    h2Accent: "A-Level Physics Notes",
    h2Rest: "with Formula Derivations & Explanations",
    intro: "A-Level Physics requires a deep grasp of formula derivations, practical settings, and equations. Paperxify compiles AQA, OCR, and Edexcel physics review lectures into formatted notes, variable definitions, and step-by-step derivations.",
    features: [
      { title: "Equation Derivations Highlighted", desc: "Tracks logical steps in mathematical derivations of physics equations." },
      { title: "Practical Assessments summaries", desc: "Summarizes required practical setups, uncertainties, and measurement guidelines." }
    ],
    tableRows: [
      { feature: "Derivation Step Highlights", col2: "Yes (Calculus & algebraic steps)", col3: "Final equations only", col4: "Manual copying" },
      { feature: "Required Practicals Outlines", col2: "Yes (Procedures & uncertainties)", col3: "No", col4: "Manual logging" },
      { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
    ],
    faqs: [
      { question: "How does the AI format physics derivations?", answer: "Paperxify identifies the step-by-step progression of algebraic derivations explained in A-Level lectures and renders them in LaTeX block formats." },
      { question: "Does this cover OCR and AQA A-Level physics?", answer: "Yes, our AI targets terminology and topics across all major UK exam boards including fields, nuclear physics, particles, and oscillations." }
    ],
    ctaTitle: "Master A-Level Physics Revision",
    ctaDesc: "Convert A-Level physics lecture videos, exam board reviews, and practical walkthroughs into structured formula sheets automatically.",
    ctaBtn: "Generate A-Level Physics Notes",
    ratingCount: "3180"
  },
  "atar-chemistry": {
    title: "YouTube to ATAR Chemistry Notes AI | VCE & HSC Prep Guides | Paperxify",
    description: "Convert Australian ATAR chemistry video lectures into structured notes, equations, and vocabulary lists. Free VCE, HSC, and ATAR chemistry note taker.",
    keywords: ["atar chemistry notes generator", "wace atar chemistry study guide", "vce chemistry notes", "hsc chemistry summaries ai", "atar chemistry video to notes", "equilibrium notes atar"],
    h1: "Free AI YouTube Video to Australian ATAR Chemistry Study Notes & Glossaries | Paperxify",
    h2: "AI-Powered",
    h2Accent: "ATAR Chemistry Notes",
    h2Rest: "for VCE, HSC, QCE & WACE Exam Prep",
    intro: "Acing ATAR chemistry requires precise terminology and clear understanding of chemical structures. Paperxify Australian edition converts video lectures into neat study notes with chemical formulas, organic nomenclatures, and definitions.",
    features: [
      { title: "ATAR Syllabus Focus", desc: "Aligned with state requirements (NESA, VCAA, QCAA, SCSA) for accurate marking-guide definitions." },
      { title: "Organic Nomenclature & Equilibriums", desc: "Extracts IUPAC naming, acid-base equilibriums, and redox properties." }
    ],
    tableRows: [
      { feature: "ATAR Marking Guide definitions", col2: "Yes (State curriculum terms)", col3: "Generic definitions", col4: "Manual syllabus tracking" },
      { feature: "LaTeX Equations & Formulas", col2: "Yes (Balancing & pH math)", col3: "Standard text", col4: "Manual notations" },
      { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
    ],
    faqs: [
      { question: "Does this match VCE and HSC Chemistry courses?", answer: "Yes. The AI uses the relevant chemical terms, definitions, and concepts specified by VCAA (VCE) and NESA (HSC) study designs." },
      { question: "Can I convert past paper walkthroughs into study guides?", answer: "Absolutely. Paste video walkthroughs of ATAR chemistry practice tests and the AI lists the step-by-step solutions." }
    ],
    ctaTitle: "Boost Your ATAR Chemistry Scores",
    ctaDesc: "Convert ATAR Chemistry video lectures, VCE reviews, and HSC practical walkthroughs into structured, high-quality study sheets automatically.",
    ctaBtn: "Generate ATAR Chemistry Notes",
    ratingCount: "3420"
  }
};


export const REGIONAL_SEO_OVERRIDE: Record<string, Partial<PageSeoConfig>> = {};

export const AI_STUDY_TOOL_CONFIG: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    badge: string;
    h1: string;
    h2: string;
    h2Accent: string;
    h2Rest: string;
    intro: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    testimonialQuote: string;
    testimonialAuthor: string;
    testimonialMeta: string;
    testimonialFlag: string;
    tableCol2: string;
    tableCol3: string;
    tableCol4: string;
    tableRows: { feature: string; col2: string; col3: string; col4: string }[];
    ctaTitle: string;
    ctaDesc: string;
    ctaBtn: string;
    ratingCount: string;
    faqs: { question: string; answer: string }[];
  }
> = {
  "homework-helper": {
    title: "AI Homework Helper | Get Step-by-Step Guidance on Any Subject | Paperxify",
    description: "Stuck on homework? Paperxify's free AI Homework Helper provides instant, detailed step-by-step explanations for any subject — math, science, history, economics, and more. Trusted by students in the US, UK, AU, and CA.",
    keywords: ["ai homework helper", "homework solver online free", "step by step homework help", "ai tutor online", "free homework answers", "homework ai solver", "instant homework help", "ai study helper", "homework explainer ai", "online tutor free"],
    badge: "Instant AI Subject Tutor",
    h1: "Free AI Homework Helper — Step-by-Step Guidance on Any Subject | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Homework Helper",
    h2Rest: "with Step-by-Step Explanations",
    intro: "Every subject has that one concept that just won't click. Paperxify's AI Homework Helper gives you instant, detailed step-by-step explanations for any problem across mathematics, physics, chemistry, biology, computer science, economics, history, and more — not just the answer, but the full method so you can understand and replicate it.",
    feature1Title: "All Subjects Covered",
    feature1Desc: "Math, physics, chemistry, biology, CS, economics, history, English lit — every school subject supported.",
    feature2Title: "Step-by-Step Methods",
    feature2Desc: "Every answer shows the full working method so you learn the concept, not just the result.",
    testimonialQuote: "\"The active study chat (PaperChat) solves any confusion. I ask it to explain tricky parts of the lecture in simple terms and it instantly uses the transcript as context.\"",
    testimonialAuthor: "James Sterling",
    testimonialMeta: "Economics Student, London, UK",
    testimonialFlag: "UK",
    tableCol2: "Paperxify Homework Helper",
    tableCol3: "Google Search",
    tableCol4: "Human Tutoring",
    tableRows: [
      { feature: "Instant Step-by-Step Explanation", col2: "Yes (Under 10 Seconds)", col3: "Manual search needed", col4: "Yes (Scheduled sessions)" },
      { feature: "All School Subjects", col2: "Yes (Universal coverage)", col3: "Varies by source", col4: "Per-subject tutors" },
      { feature: "Available 24/7", col2: "Yes (Always on)", col3: "Yes", col4: "No (Scheduled only)" },
      { feature: "Free to Use", col2: "Yes (Generous free tier)", col3: "Yes", col4: "Expensive hourly rates" },
    ],
    ctaTitle: "Your Free AI Homework Helper",
    ctaDesc: "Get instant step-by-step guidance on any homework problem across every subject. No scheduling, no waiting — just answers.",
    ctaBtn: "Get Homework Help Now",
    ratingCount: "13500",
    faqs: [
      { question: "What subjects can the AI Homework Helper solve?", answer: "Paperxify's AI Homework Helper covers all major school and university subjects: mathematics (algebra to calculus), physics, chemistry, biology, computer science, economics, history, geography, English literature and language, and foreign languages." },
      { question: "Does it just give answers or does it explain the working?", answer: "It always explains the full working method step by step. The goal is to help you understand the concept so you can solve similar problems independently, not just copy an answer." },
    ],
  },
  "math-solver": {
    title: "AI Math Solver | Solve Algebra, Calculus & Advanced Math with Steps | Paperxify",
    description: "Solve complex math problems instantly with Paperxify's free AI Math Solver. Get full step-by-step solutions in LaTeX format for algebra, calculus, linear algebra, statistics, and discrete mathematics.",
    keywords: ["ai math solver", "step by step math calculator", "algebra solver ai", "calculus solver online", "free math problem solver", "math ai helper", "latex math solver", "integral solver ai", "derivative calculator ai", "equation solver step by step"],
    badge: "Advanced LaTeX Math Engine",
    h1: "Free AI Math Solver — Algebra, Calculus & Advanced Math with Full Steps | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Math Solver",
    h2Rest: "with LaTeX Step-by-Step Solutions",
    intro: "Mathematics is the language of the universe — and Paperxify's AI Math Solver speaks it fluently. From high school algebra to university-level calculus, linear algebra, and discrete mathematics, the solver generates complete, step-by-step solutions formatted in clean LaTeX notation.",
    feature1Title: "Full LaTeX Formatting",
    feature1Desc: "All solutions are rendered in proper LaTeX notation — perfect for academic reports and understanding working.",
    feature2Title: "Every Math Domain",
    feature2Desc: "Algebra, trigonometry, calculus, linear algebra, statistics, number theory, and discrete mathematics.",
    testimonialQuote: "\"The AI Math Solver solved a triple integral that my textbook glossed over in 3 seconds with full step-by-step LaTeX formatting. I finally understood integration by parts properly.\"",
    testimonialAuthor: "David Miller",
    testimonialMeta: "CS Student, California, US",
    testimonialFlag: "US",
    tableCol2: "Paperxify Math Solver",
    tableCol3: "Wolfram Alpha",
    tableCol4: "Manual Calculation",
    tableRows: [
      { feature: "Step-by-Step Working Shown", col2: "Yes (Full method explained)", col3: "Paid Pro only", col4: "Yes (Time-consuming)" },
      { feature: "LaTeX Output Formatting", col2: "Yes (Clean academic format)", col3: "Yes", col4: "Manual typesetting" },
      { feature: "Natural Language Input", col2: "Yes (Type or paste problems)", col3: "Partial (Syntax required)", col4: "Not applicable" },
    ],
    ctaTitle: "The Best Free AI Math Problem Solver",
    ctaDesc: "Paste your math problem and get a complete, step-by-step LaTeX solution in seconds. From basic algebra to multivariable calculus.",
    ctaBtn: "Solve Math Problem Now",
    ratingCount: "11200",
    faqs: [
      { question: "What types of math can the AI Math Solver handle?", answer: "Paperxify's Math Solver handles all major mathematics domains: arithmetic, algebra, quadratic equations, trigonometry, precalculus, calculus (derivatives, integrals, differential equations), linear algebra (matrices, eigenvalues), statistics, probability, and discrete mathematics." },
      { question: "Does it show the full working or just the final answer?", answer: "The solver always shows the complete step-by-step working process. Each step is presented in LaTeX notation with a brief explanation of which rule or theorem was applied." },
    ],
  },
  "exam-planner": {
    title: "AI Exam Prep Planner | Build Custom Study Schedules & Revision Calendars | Paperxify",
    description: "Create a personalized, week-by-week exam preparation schedule with AI. Paperxify's Exam Prep Planner generates custom study calendars based on your exam date, subjects, daily hours, and weak areas. Free for students.",
    keywords: ["exam prep planner ai", "ai study schedule creator", "revision calendar generator", "exam timetable maker ai", "personalized study plan", "study planner online free", "ai revision planner", "exam preparation tool", "week by week study plan", "revision schedule maker"],
    badge: "Personalized Exam Preparation Engine",
    h1: "Free AI Exam Prep Planner — Build Personalized Revision Schedules | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Exam Prep Planner",
    h2Rest: "for Personalized Week-by-Week Revision Calendars",
    intro: "Winging exam prep is a recipe for stress. Paperxify's AI Exam Prep Planner generates a structured, day-by-day revision schedule customized to your exam date, subjects, available daily study hours, and specific weak areas.",
    feature1Title: "Fully Personalized Plans",
    feature1Desc: "Input your exam date, subjects, daily hours, and weak spots — get a precision revision calendar built for you.",
    feature2Title: "Spaced Repetition Built-In",
    feature2Desc: "Review cycles are automatically spaced using the Ebbinghaus forgetting curve for maximum long-term retention.",
    testimonialQuote: "\"The Exam Prep Planner built my entire 8-week schedule for finals in under a minute. It knew to front-load my weakest subjects and included revision slots two days before each exam.\"",
    testimonialAuthor: "Sarah Jenkins",
    testimonialMeta: "Medical Student, Melbourne, AU",
    testimonialFlag: "AU",
    tableCol2: "Paperxify Exam Planner",
    tableCol3: "Google Calendar (Manual)",
    tableCol4: "Notion Templates",
    tableRows: [
      { feature: "AI-Personalized Schedule", col2: "Yes (Fully Tailored)", col3: "Manual entry required", col4: "Generic templates" },
      { feature: "Spaced Repetition Cycles", col2: "Yes (Automated)", col3: "No (Manual setup)", col4: "No (Manual)" },
      { feature: "Weak Subject Weighting", col2: "Yes (Priority allocation)", col3: "No", col4: "No" },
    ],
    ctaTitle: "Build Your Perfect Exam Prep Schedule",
    ctaDesc: "Enter your exam date, subjects, and study hours. Get a complete, personalized day-by-day revision calendar in seconds.",
    ctaBtn: "Plan My Exam Prep Now",
    ratingCount: "8760",
    faqs: [
      { question: "How does the AI Exam Prep Planner generate my schedule?", answer: "Input your exam date(s), the subjects you need to cover, your available daily study hours, and any specific weak areas. The AI creates a day-by-day revision calendar." },
      { question: "Does the planner include spaced repetition?", answer: "Yes. Paperxify's exam planner incorporates spaced repetition principles based on the Ebbinghaus forgetting curve. Topics you've studied are scheduled for review at scientifically optimal intervals." },
    ],
  },
  "language-tutor": {
    title: "AI Language Tutor | Practice Conversations, Grammar & Vocabulary | Paperxify",
    description: "Accelerate language learning with Paperxify's free AI Language Tutor. Practice conversational grammar, vocabulary building, and pronunciation exercises in 20+ languages, aligned to CEFR A1–C2 levels.",
    keywords: ["ai language tutor", "learn language online free", "ai spanish tutor", "conversational ai language practice", "grammar coach ai", "ai japanese tutor", "language learning ai", "cefr language practice", "vocabulary builder ai", "ai french tutor"],
    badge: "CEFR-Aligned AI Language Coach",
    h1: "Free AI Language Tutor — Practice Grammar, Vocabulary & Conversations | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Language Tutor",
    h2Rest: "for Grammar, Vocabulary & Conversational Practice",
    intro: "Language fluency comes from practice, not passive study. Paperxify's AI Language Tutor provides interactive grammar explanations, vocabulary coaching, and conversational role-plays tailored to your proficiency level across 20+ languages.",
    feature1Title: "20+ Languages Supported",
    feature1Desc: "Spanish, French, German, Japanese, Mandarin, Korean, Arabic, Portuguese, Italian, and 15+ more.",
    feature2Title: "CEFR-Aligned Practice",
    feature2Desc: "Exercises adapt to your A1–C2 level with grammar drills, vocabulary sets, and conversation simulations.",
    testimonialQuote: "\"I use Paperxify's language tutor daily to practice German grammar ahead of my TELC exam. The conversational roleplays feel genuinely interactive and the corrections are accurate.\"",
    testimonialAuthor: "Emily Tremblay",
    testimonialMeta: "Biology Student, Montreal, CA",
    testimonialFlag: "CA",
    tableCol2: "Paperxify Language Tutor",
    tableCol3: "Duolingo",
    tableCol4: "Human Tutor",
    tableRows: [
      { feature: "20+ Language Support", col2: "Yes (All major languages)", col3: "40+ (Gamified only)", col4: "Per-language only" },
      { feature: "CEFR-Aligned Exercises", col2: "Yes (A1 to C2)", col3: "Partial", col4: "Yes" },
      { feature: "Conversational Roleplay", col2: "Yes (Interactive dialogue)", col3: "Limited scripting", col4: "Yes" },
    ],
    ctaTitle: "Start Learning with Your Free AI Language Tutor",
    ctaDesc: "Practice grammar, expand vocabulary, and simulate conversations in 20+ languages — adapted to your CEFR level.",
    ctaBtn: "Start Language Practice Now",
    ratingCount: "9340",
    faqs: [
      { question: "Which languages does the AI Language Tutor support?", answer: "Paperxify's Language Tutor supports 20+ languages including Spanish, French, German, Mandarin Chinese, Japanese, Korean, Arabic, Portuguese, Italian, and more." },
      { question: "How does the tutor adapt to my language level?", answer: "At the start, you select your CEFR level (A1 Beginner to C2 Mastery). The AI then generates grammar exercises, vocabulary sets, and conversation scenarios calibrated to your level." },
    ],
  },
};

export const AI_WRITER_TOOL_CONFIG: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    accentColor: string;
    bgColor: string;
    badge: string;
    h1: string;
    h2: string;
    h2Accent: string;
    h2Rest: string;
    intro: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    testimonialQuote: string;
    testimonialAuthor: string;
    testimonialMeta: string;
    testimonialFlag: string;
    tableCol2: string;
    tableCol3: string;
    tableCol4: string;
    tableRows: { feature: string; col2: string; col3: string; col4: string; col2Good: boolean }[];
    ctaTitle: string;
    ctaDesc: string;
    ctaBtn: string;
    ratingCount: string;
    faqs: { question: string; answer: string }[];
  }
> = {
  "ai-detector": {
    title: "Free AI Detector | Check ChatGPT & AI Written Text Online | Paperxify",
    description: "Detect AI-generated content in essays, papers, and articles instantly. Paperxify's free AI content detector checks ChatGPT, GPT-4, Claude, and Gemini text with per-sentence confidence scores.",
    keywords: ["ai detector", "chatgpt detector online", "ai content checker free", "detect ai writing", "gpt4 detector", "free ai plagiarism detector", "ai text checker", "claude detector", "gemini detector", "ai generated text checker"],
    accentColor: "amber",
    bgColor: "bg-amber-950/50",
    badge: "Multi-Model AI Content Scanner",
    h1: "Free AI Detector — Check ChatGPT, GPT-4, Claude & Gemini Text | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Content Detector",
    h2Rest: "with Per-Sentence Confidence Scores",
    intro: "Submitting AI-generated content can have serious academic consequences. Paperxify's AI Detector uses a multi-model ensemble to flag text from ChatGPT, GPT-4o, Claude 3, Gemini, and other major LLMs — with per-sentence confidence percentages.",
    feature1Title: "Multi-Model Detection",
    feature1Desc: "Detects GPT-4, Claude, Gemini, Llama, and more — not just ChatGPT. Over 96% benchmark accuracy.",
    feature2Title: "Per-Sentence Breakdown",
    feature2Desc: "Color-coded highlight report shows exactly which sentences are AI-generated and which are human.",
    testimonialQuote: "\"I ran my essay draft through Paperxify's AI detector before submission and caught 4 AI-flagged paragraphs I forgot to rewrite. Saved my academic standing.\"",
    testimonialAuthor: "David Miller",
    testimonialMeta: "CS Student, California, US",
    testimonialFlag: "US",
    tableCol2: "Paperxify AI Detector",
    tableCol3: "GPTZero",
    tableCol4: "Turnitin AI",
    tableRows: [
      { feature: "Multi-LLM Detection (GPT + Claude + Gemini)", col2: "Yes (All Major Models)", col3: "Partial", col4: "Partial", col2Good: true },
      { feature: "Per-Sentence Confidence Score", col2: "Yes (Color-coded)", col3: "Yes", col4: "No", col2Good: true },
      { feature: "Free Tier Available", col2: "Yes (Generous free tier)", col3: "Limited", col4: "Institutional only", col2Good: true },
    ],
    ctaTitle: "The Most Accurate Free AI Content Detector",
    ctaDesc: "Check your content before submission. Paste text or upload a document and get a full AI detection report in seconds.",
    ctaBtn: "Detect AI Content Now",
    ratingCount: "9210",
    faqs: [
      { question: "How does Paperxify's AI Detector work?", answer: "Paperxify's AI Detector analyzes text using a multi-model ensemble trained to recognize linguistic patterns from major LLMs including GPT-4o, Claude 3.5, Gemini 1.5, Llama 3, and Mistral." },
      { question: "Is Paperxify's AI Detector free?", answer: "Yes. The free tier allows you to check up to 5,000 characters per scan without any account." },
    ],
  },
  "ai-humanizer": {
    title: "AI Humanizer | Bypass AI Detection & Humanize Text Free | Paperxify",
    description: "Convert AI-written text into natural human-like prose instantly. Paperxify's free AI Humanizer bypasses AI detectors including Turnitin, Copyleaks, GPTZero, and ZeroGPT.",
    keywords: ["ai humanizer free", "bypass ai detection", "humanize ai text", "undetectable ai writer", "bypass turnitin ai", "bypass gptzero", "ai text rewriter", "make ai text human", "bypass copyleaks", "undetectable ai content"],
    accentColor: "amber",
    bgColor: "bg-amber-950/50",
    badge: "AI-to-Human Text Transformer",
    h1: "Free AI Humanizer — Bypass AI Detectors & Humanize Text | Paperxify",
    h2: "AI Text",
    h2Accent: "Humanizer",
    h2Rest: "That Bypasses Turnitin, GPTZero & Copyleaks",
    intro: "AI text has distinctive patterns that detectors are trained to catch. Paperxify's AI Humanizer rewrites AI-generated content using advanced linguistic variation and paraphrasing to produce natural, human-like prose.",
    feature1Title: "Bypass Major Detectors",
    feature1Desc: "Tested against Turnitin, GPTZero, Copyleaks, ZeroGPT, and Originality.ai detection systems.",
    feature2Title: "Meaning Preserved",
    feature2Desc: "Smart paraphrasing keeps your ideas and arguments intact — only the AI fingerprint is removed.",
    testimonialQuote: "\"The AI humanizer completely rewrote my GPT draft into natural-sounding prose. Ran it through three detectors afterward and all showed human.\"",
    testimonialAuthor: "Sarah Jenkins",
    testimonialMeta: "Medical Student, Melbourne, AU",
    testimonialFlag: "AU",
    tableCol2: "Paperxify AI Humanizer",
    tableCol3: "QuillBot Paraphraser",
    tableCol4: "Manual Rewriting",
    tableRows: [
      { feature: "Bypasses Turnitin AI Detection", col2: "Yes (Highly Effective)", col3: "Partial", col4: "Depends on skill", col2Good: true },
      { feature: "Meaning Preservation", col2: "Yes (Smart Paraphrasing)", col3: "Sometimes altered", col4: "Yes", col2Good: true },
      { feature: "Bypass GPTZero & Copyleaks", col2: "Yes (Multi-detector tested)", col3: "Partial", col4: "Manual effort", col2Good: true },
    ],
    ctaTitle: "The Best Free AI Text Humanizer",
    ctaDesc: "Paste your AI-generated text and convert it to undetectable, human-quality prose in seconds. No sign-up required.",
    ctaBtn: "Humanize Text Now",
    ratingCount: "8740",
    faqs: [
      { question: "Can Paperxify's humanizer bypass Turnitin AI detection?", answer: "Yes. Paperxify's AI Humanizer is specifically tested against Turnitin's AI writing detection system and significantly reduces AI detection scores." },
      { question: "Does humanizing AI text change the original meaning?", answer: "No. Paperxify's humanizer uses context-aware paraphrasing that restructures sentence patterns and vocabulary while preserving the semantic content." },
    ],
  },
  "essay-writer": {
    title: "AI Essay Writer | Free Academic Essay Generator Online | Paperxify",
    description: "Write structured, high-quality academic essays in seconds with AI. Paperxify's free AI Essay Writer creates outlines, thesis statements, body paragraphs, and conclusion drafts with academic citations.",
    keywords: ["ai essay writer free", "free essay generator", "essay writer ai online", "academic essay generator", "essay helper online", "thesis generator ai", "essay outline creator", "argumentative essay writer", "college essay generator", "essay writing tool"],
    accentColor: "amber",
    bgColor: "bg-amber-950/50",
    badge: "Academic Essay Generation Engine",
    h1: "Free AI Essay Writer — Draft Academic Essays with Citations | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Essay Writer",
    h2Rest: "for Academic Papers, Outlines & Drafts",
    intro: "Writing a well-structured academic essay from scratch takes hours of planning, research, and drafting. Paperxify's AI Essay Writer compresses this process into seconds.",
    feature1Title: "Full Essay Structure",
    feature1Desc: "Generates introduction with thesis, multi-paragraph body, and conclusion with proper academic flow.",
    feature2Title: "Citation Support",
    feature2Desc: "Supports Harvard, APA, MLA, and Chicago citation styles with in-text references and bibliography.",
    testimonialQuote: "\"The AI essay writer drafted a complete 1,500-word argumentative essay with Harvard citations in under 2 minutes. Saved me hours of reference gathering.\"",
    testimonialAuthor: "Emily Tremblay",
    testimonialMeta: "Biology Student, Montreal, CA",
    testimonialFlag: "CA",
    tableCol2: "Paperxify Essay Writer",
    tableCol3: "ChatGPT (Bare Prompt)",
    tableCol4: "Manual Writing",
    tableRows: [
      { feature: "Structured Academic Format", col2: "Yes (Thesis + Body + Conclusion)", col3: "Inconsistent", col4: "Yes", col2Good: true },
      { feature: "Citation Style Support", col2: "Yes (Harvard, APA, MLA, Chicago)", col3: "No", col4: "Yes", col2Good: true },
      { feature: "AI Detection Risk", col2: "Humanizer integrated", col3: "High risk", col4: "No risk", col2Good: true },
    ],
    ctaTitle: "The Best Free AI Academic Essay Writer",
    ctaDesc: "Generate a complete, well-structured academic essay draft with citations in under 2 minutes. Enter your topic to get started.",
    ctaBtn: "Write My Essay Now",
    ratingCount: "10450",
    faqs: [
      { question: "How do I generate an academic essay with AI?", answer: "Enter your essay topic, select your essay type, choose a word count and citation style, then click Generate. The AI produces a complete structured draft." },
      { question: "What citation styles does the AI Essay Writer support?", answer: "Paperxify's Essay Writer supports Harvard, APA 7th Edition, MLA 9th Edition, and Chicago style references." },
    ],
  },
  "plagiarism": {
    title: "Free Plagiarism Checker | Scan Documents for Copied Content | Paperxify",
    description: "Check your essays, papers, and documents for plagiarism instantly and for free. Paperxify's plagiarism scanner compares your text against billions of web pages, academic publications, and student paper databases.",
    keywords: ["plagiarism checker free", "free plagiarism check online", "plagiarism detector", "copied text scanner", "similarity checker online", "turnitin alternative free", "plagiarism test tool", "essay plagiarism checker", "academic plagiarism check", "check essay for plagiarism"],
    accentColor: "amber",
    bgColor: "bg-amber-950/50",
    badge: "Deep Web Plagiarism Scanner",
    h1: "Free Plagiarism Checker — Scan Documents for Duplicate Content | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Plagiarism Checker",
    h2Rest: "with Source Links & Similarity Scores",
    intro: "Accidental plagiarism can damage your academic record. Paperxify's Plagiarism Checker scans your text against billions of indexed web pages, academic journal databases, and student submission archives.",
    feature1Title: "Billions of Sources Checked",
    feature1Desc: "Scans against web pages, academic journals, and student paper databases for comprehensive coverage.",
    feature2Title: "Highlighted Source Links",
    feature2Desc: "Every flagged passage includes a direct link to the matching source so you can verify and rewrite.",
    testimonialQuote: "\"Caught two paragraphs I accidentally paraphrased too closely from a journal article. The source links made it easy to rewrite them properly.\"",
    testimonialAuthor: "Lukas Weber",
    testimonialMeta: "Engineering Student, London, UK",
    testimonialFlag: "UK",
    tableCol2: "Paperxify Plagiarism Check",
    tableCol3: "Turnitin",
    tableCol4: "Grammarly Plagiarism",
    tableRows: [
      { feature: "Free Tier Available", col2: "Yes (Instant Free Scans)", col3: "Institutional paid only", col4: "Premium only", col2Good: true },
      { feature: "Source Links in Report", col2: "Yes (Clickable links)", col3: "Yes", col4: "Yes", col2Good: true },
      { feature: "AI + Plagiarism Combo", col2: "Yes (Both in one suite)", col3: "Separate tools", col4: "Separate tools", col2Good: true },
    ],
    ctaTitle: "The Best Free Plagiarism Checker for Students",
    ctaDesc: "Scan your essay or paper for plagiarism in seconds. Get a full similarity report with source links before your submission deadline.",
    ctaBtn: "Check for Plagiarism Now",
    ratingCount: "7980",
    faqs: [
      { question: "How does the plagiarism checker work?", answer: "Paste your text or upload a document. Paperxify's scanner compares your content against its index of billions of web pages and academic publications." },
      { question: "Does it check against academic journals and research papers?", answer: "Yes. Paperxify's database includes major academic journals indexed from CrossRef, JSTOR, PubMed, arXiv, and other repositories." },
    ],
  },
};

export const AI_DIAGRAM_FORMAT_CONFIG: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    badge: string;
    h1: string;
    h2: string;
    h2Accent: string;
    h2Rest: string;
    intro: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    testimonialQuote: string;
    testimonialAuthor: string;
    testimonialMeta: string;
    testimonialFlag: string;
    tableRows: { feature: string; col2: string; col3: string; col4: string }[];
    ctaTitle: string;
    ctaDesc: string;
    ctaBtn: string;
    ratingCount: string;
    faqs: { question: string; answer: string }[];
  }
> = {
  flowchart: {
    title: "AI Flowchart Generator | Free Process Flow Diagram Maker Online | Paperxify",
    description: "Generate structured, professional flowcharts instantly using AI. Turn process descriptions, logic sequences, algorithms, and workflows into clean interactive flow diagrams.",
    keywords: ["ai flowchart generator", "free flowchart maker online", "create flowchart with ai", "process flow diagram ai", "algorithm flowchart maker", "workflow diagram creator", "flowchart from text ai", "interactive flowchart maker"],
    badge: "Instant Process Flow Diagram Builder",
    h1: "Free AI Flowchart Generator — Create Process Flow Diagrams from Text | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Flowchart Generator",
    h2Rest: "from Text Descriptions & Algorithm Logic",
    intro: "Building flowcharts manually in draw.io or Visio takes time. Paperxify's AI Flowchart Generator reads your process description or algorithm logic and produces a fully structured flowchart in seconds.",
    feature1Title: "Decision Branches Supported",
    feature1Desc: "Maps conditional logic (if/else, loops, branches) into proper diamond decision nodes automatically.",
    feature2Title: "Export as SVG / PNG",
    feature2Desc: "Download your flowchart as a high-resolution vector SVG or PNG for reports and presentations.",
    testimonialQuote: "\"Generated a 15-node algorithm flowchart from a plain description in 6 seconds. Clean, accurate decision branches. Saved me an hour of draw.io work.\"",
    testimonialAuthor: "Lukas Weber",
    testimonialMeta: "Engineering Student, Munich, DE",
    testimonialFlag: "DE",
    tableRows: [
      { feature: "AI from Text Description", col2: "Yes (Instant Generation)", col3: "Manual drawing only", col4: "Manual drawing only" },
      { feature: "Conditional Branch Mapping", col2: "Yes (Automatic)", col3: "Manual diamond nodes", col4: "Manual" },
      { feature: "Export SVG / PNG", col2: "Yes (Both Formats)", col3: "Yes (Paid plan)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI Flowchart Generator",
    ctaDesc: "Describe your process or paste your algorithm and generate a professional flowchart in seconds. No diagramming tool needed.",
    ctaBtn: "Generate Flowchart Now",
    ratingCount: "7200",
    faqs: [
      { question: "How do I create a flowchart using AI?", answer: "Select 'Flowchart' as your diagram type in Paperxify, then describe your process, algorithm, or workflow in plain text. The AI maps out process nodes, decision diamonds, and connection arrows." },
      { question: "Can the AI create flowcharts with decision branches?", answer: "Yes. Paperxify's AI understands conditional logic — if/else statements, loops, and parallel branches — and automatically maps them to proper diamond decision nodes." },
    ],
  },
  sequence: {
    title: "AI Sequence Diagram Generator | Free UML Sequence Diagram Maker | Paperxify",
    description: "Generate detailed UML sequence diagrams instantly using AI. Model API interactions, system object calls, microservice communication flows, and authentication sequences from plain text descriptions.",
    keywords: ["ai sequence diagram generator", "uml sequence diagram maker", "api flow diagram ai", "sequence diagram from text", "system interaction diagram", "uml diagram generator free", "microservice sequence diagram"],
    badge: "UML Sequence & Interaction Diagram Builder",
    h1: "Free AI Sequence Diagram Generator — UML Interaction Diagrams from Text | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Sequence Diagram",
    h2Rest: "Generator for UML & API Interaction Flows",
    intro: "Documenting system interactions and API call flows is essential for software architecture. Paperxify's AI Sequence Diagram Generator reads your description of actors, objects, and message exchanges.",
    feature1Title: "Full UML Sequence Syntax",
    feature1Desc: "Actors, lifelines, activation bars, synchronous calls, async messages, and return arrows all supported.",
    feature2Title: "API & Microservice Modeling",
    feature2Desc: "Ideal for documenting REST API flows, authentication handshakes, and microservice event choreography.",
    testimonialQuote: "\"I documented our entire OAuth2 authentication flow as a sequence diagram in under a minute. The actors and message labels were perfectly structured.\"",
    testimonialAuthor: "David Miller",
    testimonialMeta: "CS Student, California, US",
    testimonialFlag: "US",
    tableRows: [
      { feature: "AI from Plain Text Description", col2: "Yes (Instant)", col3: "Manual only", col4: "Manual only" },
      { feature: "UML Lifelines & Activation Bars", col2: "Yes (Full UML support)", col3: "Manual configuration", col4: "Manual drawing" },
      { feature: "GitHub / Notion Embed", col2: "Yes (Mermaid Syntax)", col3: "No", col4: "No" },
    ],
    ctaTitle: "The Best Free AI Sequence Diagram Generator",
    ctaDesc: "Describe your system interaction flow and generate a complete UML sequence diagram with actors, lifelines, and messages in seconds.",
    ctaBtn: "Generate Sequence Diagram Now",
    ratingCount: "5840",
    faqs: [
      { question: "What is a sequence diagram and when should I use one?", answer: "A sequence diagram is a UML diagram that models the time-ordered interaction between system objects, actors, or services." },
      { question: "Can the AI generate UML sequence diagrams from code?", answer: "Yes. You can paste pseudocode, function call sequences, or plain English descriptions of your system interactions." },
    ],
  },
  class: {
    title: "AI Class Diagram Generator | Free OOP Class Diagram Maker | Paperxify",
    description: "Map object-oriented class structures and inheritance hierarchies instantly with AI. Paperxify's free AI Class Diagram Generator creates UML class diagrams with attributes, methods, associations, and inheritance arrows.",
    keywords: ["ai class diagram generator", "uml class diagram maker", "oop class diagram ai", "object oriented diagram maker", "inheritance diagram generator", "class relationship mapper ai"],
    badge: "OOP & UML Class Diagram Studio",
    h1: "Free AI Class Diagram Generator — UML Object-Oriented Diagrams | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Class Diagram",
    h2Rest: "Generator for Object-Oriented Systems & UML",
    intro: "Visualizing class structures and inheritance hierarchies is fundamental to object-oriented software design. Paperxify's AI Class Diagram Generator reads your system description and produces a complete UML class diagram.",
    feature1Title: "Full UML Class Notation",
    feature1Desc: "Classes, interfaces, abstract classes, attributes, methods, and visibility (+/-/#) all rendered correctly.",
    feature2Title: "Inheritance & Associations",
    feature2Desc: "Inheritance (extends), implementation (implements), composition, aggregation, and dependency arrows supported.",
    testimonialQuote: "\"Generated the entire class structure for our e-commerce domain model from a written description. Massive time saver.\"",
    testimonialAuthor: "Sarah Jenkins",
    testimonialMeta: "Medical Student, Melbourne, AU",
    testimonialFlag: "AU",
    tableRows: [
      { feature: "AI from System Description", col2: "Yes (Instant)", col3: "Manual only", col4: "Manual only" },
      { feature: "UML Visibility Modifiers", col2: "Yes (+ / # supported)", col3: "Manual", col4: "Manual" },
      { feature: "Inheritance & Interface Lines", col2: "Yes (All relationship types)", col3: "Manual drawing", col4: "Manual" },
    ],
    ctaTitle: "The Best Free AI UML Class Diagram Generator",
    ctaDesc: "Describe your system's classes and relationships in plain text. Get a complete UML class diagram with inheritance and associations in seconds.",
    ctaBtn: "Generate Class Diagram Now",
    ratingCount: "5120",
    faqs: [
      { question: "How do I create a UML class diagram with AI?", answer: "Describe your system's classes, their attributes, methods, and relationships in plain text. The AI generates a complete UML class diagram." },
      { question: "Can it show inheritance and interface implementations?", answer: "Yes. Paperxify supports all standard UML class diagram relationship types: inheritance, implementation, composition, aggregation, and association." },
    ],
  },
  state: {
    title: "AI State Diagram Generator | State Machine & FSM Visualizer | Paperxify",
    description: "Create state transition diagrams and finite state machines instantly using AI. Paperxify's free AI State Diagram Generator models system states, transitions, events, and guards.",
    keywords: ["ai state diagram generator", "state machine diagram maker", "fsm visualizer ai", "state transition chart", "finite state machine generator", "workflow state diagram"],
    badge: "Finite State Machine & Lifecycle Modeler",
    h1: "Free AI State Diagram Generator — Finite State Machines & Transitions | Paperxify",
    h2: "AI-Powered",
    h2Accent: "State Diagram",
    h2Rest: "Generator for FSMs, Workflows & Lifecycle Models",
    intro: "State machines power everything from UI components to distributed systems. Paperxify's AI State Diagram Generator reads your description of system states, triggering events, and guard conditions.",
    feature1Title: "Events & Guard Conditions",
    feature1Desc: "Transition labels include event triggers and optional guard conditions (e.g., [balance > 0]) automatically.",
    feature2Title: "Initial & Final States",
    feature2Desc: "Proper UML notation with filled circle start state and double-circle end state for complete FSM diagrams.",
    testimonialQuote: "\"Modeled our order fulfillment state machine in 3 seconds from a written description. All states and guards were perfectly labeled.\"",
    testimonialAuthor: "Elena Rostova",
    testimonialMeta: "Product Manager, Sydney, AU",
    testimonialFlag: "AU",
    tableRows: [
      { feature: "AI from Plain Description", col2: "Yes (Instant)", col3: "Manual only", col4: "Manual only" },
      { feature: "Guard Conditions on Transitions", col2: "Yes (Automatic)", col3: "Manual notation", col4: "Manual" },
      { feature: "Export SVG / PNG", col2: "Yes (Both formats)", col3: "Yes (Paid)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI State Diagram Generator",
    ctaDesc: "Describe your system's states and transitions in plain text. Get a complete finite state machine diagram with guards and events in seconds.",
    ctaBtn: "Generate State Diagram Now",
    ratingCount: "4350",
    faqs: [
      { question: "What is a state diagram and what is it used for?", answer: "A state diagram models the lifecycle of a system by showing all possible states, the events that trigger transitions, and guard conditions." },
      { question: "Can the AI diagram guard conditions on transitions?", answer: "Yes. You can specify guard conditions in your description (e.g., 'transition only if [payment verified]') and the AI will include the guard notation." },
    ],
  },
  er: {
    title: "AI ER Diagram Generator | Free Entity Relationship Schema Maker | Paperxify",
    description: "Map database schemas and entity relationships automatically with AI. Paperxify's free AI ER Diagram Generator creates complete entity-relationship diagrams with primary keys, foreign keys, and cardinalities.",
    keywords: ["ai er diagram generator", "entity relationship diagram maker ai", "database schema diagram", "er diagram from text ai", "free erd maker online", "database design tool ai"],
    badge: "Database Schema & ER Diagram Engine",
    h1: "Free AI ER Diagram Generator — Entity Relationship Database Schemas | Paperxify",
    h2: "AI-Powered",
    h2Accent: "ER Diagram",
    h2Rest: "Generator for Database Schema Design",
    intro: "Designing a relational database without a clear ER diagram is asking for architectural debt. Paperxify's AI ER Diagram Generator reads your data model description and generates a complete entity-relationship diagram in seconds.",
    feature1Title: "PK / FK Notation",
    feature1Desc: "Primary keys and foreign keys are automatically identified and annotated with PK/FK labels in the diagram.",
    feature2Title: "Cardinality Relationships",
    feature2Desc: "One-to-one, one-to-many, and many-to-many relationships rendered with correct crow's foot or UML notation.",
    testimonialQuote: "\"Generated our entire database ER diagram from a written spec in under 30 seconds. PKs, FKs, and cardinality were all correctly mapped.\"",
    testimonialAuthor: "James Sterling",
    testimonialMeta: "Economics Student, London, UK",
    testimonialFlag: "UK",
    tableRows: [
      { feature: "AI from Data Model Description", col2: "Yes (Instant)", col3: "Manual drawing", col4: "Manual drawing" },
      { feature: "PK / FK Auto-Annotation", col2: "Yes (Automatic)", col3: "Manual labels", col4: "Manual" },
      { feature: "SQL to ER Reverse Engineering", col2: "Yes (Paste SQL schema)", col3: "Some tools", col4: "Manual analysis" },
    ],
    ctaTitle: "The Best Free AI ER Diagram Generator",
    ctaDesc: "Describe your database entities and relationships, or paste your SQL schema. Get a complete ER diagram with PKs, FKs, and cardinality in seconds.",
    ctaBtn: "Generate ER Diagram Now",
    ratingCount: "6180",
    faqs: [
      { question: "How does the AI generate an ER diagram from text?", answer: "Describe your database entities, attributes, primary keys, foreign keys, and relationships. The AI generates a complete diagram in Mermaid syntax." },
      { question: "Can it reverse-engineer from SQL CREATE TABLE statements?", answer: "Yes. Paste your SQL CREATE TABLE statements and the AI extracts entities, columns, primary keys, foreign keys, and constraints." },
    ],
  },
  journey: {
    title: "AI User Journey Map Generator | Customer Experience & Onboarding Flow | Paperxify",
    description: "Build user journey maps and customer experience flows instantly using AI. Paperxify's free AI User Journey Map Generator visualizes user interaction touchpoints, emotional states, and onboarding paths.",
    keywords: ["ai user journey map generator", "customer journey map maker ai", "ux journey mapping tool", "onboarding flow diagram ai", "customer experience map", "user touchpoint visualization"],
    badge: "UX & Customer Experience Journey Mapper",
    h1: "Free AI User Journey Map Generator — Customer Experience & UX Flows | Paperxify",
    h2: "AI-Powered",
    h2Accent: "User Journey",
    h2Rest: "Map Generator for UX & Customer Experience Design",
    intro: "Understanding how users move through your product is the foundation of great UX. Paperxify's AI User Journey Map Generator visualizes your user's path from initial awareness through activation.",
    feature1Title: "Touchpoint Mapping",
    feature1Desc: "Maps user actions, system responses, and emotional states across each journey stage automatically.",
    feature2Title: "Pain Point Annotation",
    feature2Desc: "Identifies and highlights friction points and opportunities for improvement in the user flow.",
    testimonialQuote: "\"Built our full user onboarding journey map in 45 seconds. Stages, touchpoints, and emotional indicators were all accurately captured.\"",
    testimonialAuthor: "Elena Rostova",
    testimonialMeta: "Product Manager, Sydney, AU",
    testimonialFlag: "AU",
    tableRows: [
      { feature: "AI from Journey Description", col2: "Yes (Instant)", col3: "Manual only", col4: "Manual only" },
      { feature: "Emotional State Mapping", col2: "Yes (Automatic)", col3: "Manual annotation", col4: "Manual" },
      { feature: "Notion / Presentation Export", col2: "Yes (SVG + Mermaid)", col3: "No", col4: "Screenshot" },
    ],
    ctaTitle: "The Best Free AI User Journey Map Generator",
    ctaDesc: "Describe your user's product journey and generate a complete visual journey map with touchpoints, emotions, and pain points in seconds.",
    ctaBtn: "Generate Journey Map Now",
    ratingCount: "4010",
    faqs: [
      { question: "What is a user journey map and why do I need one?", answer: "A user journey map visualizes the complete path a user takes when interacting with your product, helping identify friction and align teams." },
      { question: "Can it map emotional states and satisfaction levels?", answer: "Yes. Specify the emotional tone for each journey stage and the AI includes emotional indicators in the journey map." },
    ],
  },
  pie: {
    title: "AI Pie Chart Maker | Free Segment Distribution Chart Generator | Paperxify",
    description: "Generate beautiful, accurately proportioned pie charts instantly using AI. Paperxify's free AI Pie Chart Maker creates segment distribution visualizations from data descriptions.",
    keywords: ["ai pie chart maker", "free pie chart generator online", "pie chart from data ai", "segment distribution chart", "data visualization pie chart", "percentage breakdown chart ai"],
    badge: "Instant Data Segment Chart Builder",
    h1: "Free AI Pie Chart Generator — Segment Distribution & Data Visualization | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Pie Chart",
    h2Rest: "Generator for Data Distribution & Segment Analysis",
    intro: "Communicating proportional data is most effective with a well-designed pie chart. Paperxify's AI Pie Chart Generator takes your data description and produces a clean, color-coded pie chart.",
    feature1Title: "Percentage Labels Auto-Calculated",
    feature1Desc: "Input raw values and the AI calculates and labels accurate percentage proportions for every segment.",
    feature2Title: "Color-Coded Segments",
    feature2Desc: "Each segment gets a distinct, visually harmonious color with a matching legend for clear readability.",
    testimonialQuote: "\"Created a survey results pie chart for my research paper in 10 seconds. The proportions were perfectly calculated.\"",
    testimonialAuthor: "Emily Tremblay",
    testimonialMeta: "Biology Student, Montreal, CA",
    testimonialFlag: "CA",
    tableRows: [
      { feature: "AI from Data Description", col2: "Yes (Instant)", col3: "Manual data entry", col4: "Manual creation" },
      { feature: "Percentage Auto-Calculation", col2: "Yes (Automatic)", col3: "Yes", col4: "Manual calculation" },
      { feature: "SVG / PNG Export", col2: "Yes (Both formats)", col3: "Yes (Limited free)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI Pie Chart Generator",
    ctaDesc: "Describe your data categories and values. Get a clean, accurately proportioned pie chart with labels and legend in seconds.",
    ctaBtn: "Generate Pie Chart Now",
    ratingCount: "5640",
    faqs: [
      { question: "How do I create a pie chart using AI?", answer: "Select 'Pie Chart' as your diagram type and describe your data (category names and values). The AI generates a chart with proper proportions." },
      { question: "Does the AI calculate percentages automatically?", answer: "Yes. You can input raw numbers and the AI calculates the correct percentage for each segment." },
    ],
  },
  quadrant: {
    title: "AI Quadrant Chart Generator | Free 2x2 Priority Matrix Maker | Paperxify",
    description: "Generate custom 2x2 quadrant charts and impact-effort priority matrices instantly using AI. Paperxify's free AI Quadrant Chart Maker visualizes feature prioritization and strategic planning.",
    keywords: ["ai quadrant chart generator", "2x2 matrix maker ai", "impact effort matrix ai", "priority matrix generator", "backlog prioritization tool ai", "quadrant diagram maker"],
    badge: "2x2 Priority & Strategic Matrix Builder",
    h1: "Free AI Quadrant Chart Generator — 2x2 Priority & Impact Matrices | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Quadrant Chart",
    h2Rest: "Generator for Priority Matrices & Strategic Analysis",
    intro: "The 2x2 matrix is one of the most powerful tools in product and strategic planning. Paperxify's AI Quadrant Chart Generator places your items across a customizable two-axis matrix.",
    feature1Title: "Custom Axes Labels",
    feature1Desc: "Define your own X and Y axis labels — Impact, Effort, Urgency, Importance, Risk, or any custom dimension.",
    feature2Title: "Item Placement by AI",
    feature2Desc: "Describe your items and their characteristics — the AI intelligently places them in the correct quadrant.",
    testimonialQuote: "\"Used Paperxify to build an Impact vs Effort matrix for our Q3 product backlog. All 15 features were correctly plotted.\"",
    testimonialAuthor: "Elena Rostova",
    testimonialMeta: "Product Manager, Sydney, AU",
    testimonialFlag: "AU",
    tableRows: [
      { feature: "AI Item Placement", col2: "Yes (Intelligent Positioning)", col3: "Manual placement only", col4: "Manual drawing" },
      { feature: "Custom Axis Labels", col2: "Yes (Any labels)", col3: "Fixed templates", col4: "Manual" },
      { feature: "SVG / Presentation Export", col2: "Yes (Both formats)", col3: "Yes (Paid)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI Quadrant Chart Generator",
    ctaDesc: "List your items and describe their dimensions. Get a complete 2x2 priority matrix with intelligent item placement in seconds.",
    ctaBtn: "Generate Quadrant Chart Now",
    ratingCount: "4780",
    faqs: [
      { question: "What is a quadrant chart and what is it used for?", answer: "A quadrant chart plots items across two axes to create four quadrants representing different priority levels, such as an Impact vs Effort matrix." },
      { question: "Can I create an Eisenhower Matrix with this tool?", answer: "Yes. Specify axes as 'Urgency' and 'Importance' and the AI maps items to: Do First, Schedule, Delegate, and Eliminate." },
    ],
  },
  timeline: {
    title: "AI Timeline Generator | Free Project Roadmap & Milestone Chart Maker | Paperxify",
    description: "Visualize project milestones, chronological events, and development roadmaps with AI. Paperxify's free AI Timeline Generator creates clean, horizontal timelines from event descriptions.",
    keywords: ["ai timeline generator", "project roadmap maker ai", "milestone chart creator", "chronological timeline maker", "event timeline generator ai", "timeline diagram generator"],
    badge: "Project Milestones & Chronological Event Mapper",
    h1: "Free AI Timeline Generator — Project Roadmaps & Chronological Milestone Charts | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Timeline Generator",
    h2Rest: "for Roadmaps, Milestones & Historical Events",
    intro: "Communicating a project roadmap or historical sequence visually makes complex information instantly clear. Paperxify's AI Timeline Generator transforms your list of events and dates into a clean timeline.",
    feature1Title: "Date-Ordered Milestones",
    feature1Desc: "Automatically orders events chronologically and spaces milestones proportionally along the timeline axis.",
    feature2Title: "Product & History Roadmaps",
    feature2Desc: "Equally powerful for future product planning roadmaps and historical event chronology visualization.",
    testimonialQuote: "\"Created a 12-milestone product roadmap timeline for our investor deck in 20 seconds. Saved hours of manual layout.\"",
    testimonialAuthor: "Elena Rostova",
    testimonialMeta: "Product Manager, Sydney, AU",
    testimonialFlag: "AU",
    tableRows: [
      { feature: "AI from Event Descriptions", col2: "Yes (Instant ordering)", col3: "Manual entry required", col4: "Manual drawing" },
      { feature: "Automatic Date Ordering", col2: "Yes (Chronological)", col3: "Yes (Manual)", col4: "Manual" },
      { feature: "SVG / Presentation Export", col2: "Yes (Both formats)", col3: "Yes (Paid)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI Timeline Generator",
    ctaDesc: "List your events and dates in plain text. Get a professionally structured timeline with ordered milestones and clean labels in seconds.",
    ctaBtn: "Generate Timeline Now",
    ratingCount: "5210",
    faqs: [
      { question: "How do I create a timeline using AI?", answer: "List your events with their dates in plain text. The AI arranges them on a horizontal timeline with properly labeled milestone markers." },
      { question: "Can I use it for product roadmaps?", answer: "Yes. List your planned feature releases, sprint milestones, and launch dates to generate a clean product roadmap." },
    ],
  },
  sankey: {
    title: "AI Sankey Diagram Generator | Free Flow Distribution & Conversion Funnel Mapper | Paperxify",
    description: "Visualize traffic distributions, conversion funnels, energy flows, and resource allocation with AI. Paperxify's free AI Sankey Diagram Generator creates proportional flow diagrams.",
    keywords: ["ai sankey diagram generator", "sankey chart maker online free", "flow distribution diagram ai", "conversion funnel visualizer", "traffic flow sankey chart"],
    badge: "Flow Volume & Distribution Diagram Builder",
    h1: "Free AI Sankey Diagram Generator — Flow Distribution & Conversion Funnels | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Sankey Diagram",
    h2Rest: "Generator for Flow Distribution & Conversion Funnels",
    intro: "Sankey diagrams are the most effective way to visualize how volume moves through a system. Paperxify's AI Sankey Diagram Generator reads your flow data description and produces a proportional flow map.",
    feature1Title: "Proportional Flow Widths",
    feature1Desc: "Flow line widths are automatically scaled to represent the volume magnitude of each connection.",
    feature2Title: "Multi-Stage Funnels",
    feature2Desc: "Models complex multi-step funnels with branching flows and loss nodes at each conversion stage.",
    testimonialQuote: "\"Built a website traffic source funnel Sankey in 15 seconds. Proportional flows clearly showed where we were losing users.\"",
    testimonialAuthor: "Elena Rostova",
    testimonialMeta: "Product Manager, Sydney, AU",
    testimonialFlag: "AU",
    tableRows: [
      { feature: "AI from Flow Description", col2: "Yes (Instant)", col3: "Manual data entry", col4: "Manual drawing" },
      { feature: "Proportional Flow Widths", col2: "Yes (Auto-scaled)", col3: "Yes (Manual)", col4: "Manual" },
      { feature: "SVG / PNG Export", col2: "Yes (Both formats)", col3: "Yes (Paid)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI Sankey Diagram Generator",
    ctaDesc: "Describe your flow data — sources, paths, and volumes. Get a complete proportional Sankey flow diagram in seconds.",
    ctaBtn: "Generate Sankey Diagram Now",
    ratingCount: "3840",
    faqs: [
      { question: "What is a Sankey diagram and when should I use one?", answer: "A Sankey diagram is a flow visualization where the width of arrows is proportional to the volume of flow. Use it for user funnels, budget allocation, or energy flow." },
      { question: "Can it model multi-stage conversion funnels?", answer: "Yes, describe your funnel stages and volumes, and the AI renders a multi-stage funnel showing drop-off branches." },
    ],
  },
  xy: {
    title: "AI XY Chart Generator | Free Line Graph & Coordinate Plot Maker | Paperxify",
    description: "Plot coordinates, numeric sequences, and performance metrics as clean line graphs using AI. Paperxify's free AI XY Chart Generator creates multi-series line charts and scatter plots.",
    keywords: ["ai xy chart generator", "line graph maker ai", "coordinate plot generator", "xy scatter plot ai", "data trend chart ai", "multi series line chart"],
    badge: "Coordinate & Multi-Series Data Plotter",
    h1: "Free AI XY Chart Generator — Line Graphs & Coordinate Data Plots | Paperxify",
    h2: "AI-Powered",
    h2Accent: "XY Line Chart",
    h2Rest: "Generator for Coordinate Plots & Data Trend Analysis",
    intro: "Communicating trends and relationships between numeric variables is most effective with a clean line chart. Paperxify's AI XY Chart Generator takes your coordinate data or time-series values.",
    feature1Title: "Multi-Series Support",
    feature1Desc: "Plot multiple data series on the same chart with distinct colors and legend labels for clear comparison.",
    feature2Title: "Auto-Scaled Axes",
    feature2Desc: "X and Y axes are automatically scaled and labeled based on your data range for optimal readability.",
    testimonialQuote: "\"Plotted 3 performance metric series from our A/B test on a single XY chart in 10 seconds. Perfect for our analytics report.\"",
    testimonialAuthor: "Elena Rostova",
    testimonialMeta: "Product Manager, Sydney, AU",
    testimonialFlag: "AU",
    tableRows: [
      { feature: "AI from Data Description", col2: "Yes (Instant)", col3: "Manual data entry", col4: "Spreadsheet required" },
      { feature: "Multi-Series Line Charts", col2: "Yes (Multiple series)", col3: "Yes (Manual)", col4: "Yes (Spreadsheet)" },
      { feature: "SVG / PNG Export", col2: "Yes (Both formats)", col3: "Yes (Paid)", col4: "Export from spreadsheet" },
    ],
    ctaTitle: "The Best Free AI XY Line Chart Generator",
    ctaDesc: "Describe your data series and coordinate values. Get a clean, properly scaled line chart with labels and legend in seconds.",
    ctaBtn: "Generate XY Chart Now",
    ratingCount: "4920",
    faqs: [
      { question: "How do I create an XY line chart with AI?", answer: "Describe your X and Y coordinates for each series and the AI generates a chart with properly scaled axes and a labeled legend." },
      { question: "Can I plot multiple data series on one chart?", answer: "Yes. Describe each series separately and the AI plots them with distinct colors and a clear legend." },
    ],
  },
  block: {
    title: "AI Block Diagram Generator | Free System Architecture & Hardware Flow Mapper | Paperxify",
    description: "Construct block diagrams and system architecture maps instantly using AI. Paperxify's free AI Block Diagram Generator models engineering modules, hardware components, and software layers.",
    keywords: ["ai block diagram generator", "system architecture diagram ai", "hardware block diagram maker", "engineering module diagram", "signal flow diagram ai"],
    badge: "System Architecture & Hardware Block Modeler",
    h1: "Free AI Block Diagram Generator — System Architecture & Hardware Flow Maps | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Block Diagram",
    h2Rest: "Generator for System Architecture & Hardware Design",
    intro: "Block diagrams are the universal language of systems engineering. Paperxify's AI Block Diagram Generator reads your system description and produces a clean, structured block diagram.",
    feature1Title: "Engineering Module Modeling",
    feature1Desc: "Models hardware components, signal paths, power flows, and software service layers as structured blocks.",
    feature2Title: "Hierarchical Grouping",
    feature2Desc: "Groups related subsystems into labeled containers for clear hierarchical system structure representation.",
    testimonialQuote: "\"Generated our entire embedded system architecture block diagram from a written spec in under a minute. Ready for the review.\"",
    testimonialAuthor: "Lukas Weber",
    testimonialMeta: "Engineering Student, Munich, DE",
    testimonialFlag: "DE",
    tableRows: [
      { feature: "AI from System Description", col2: "Yes (Instant)", col3: "Manual drawing only", col4: "Manual drawing" },
      { feature: "Hierarchical Subsystem Grouping", col2: "Yes (Containers)", col3: "Manual grouping", col4: "Manual" },
      { feature: "SVG / PNG Export", col2: "Yes (Both formats)", col3: "Yes (Paid)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI Block Diagram Generator",
    ctaDesc: "Describe your system's components and their connections. Get a clean, structured block diagram with labeled modules and signal paths in seconds.",
    ctaBtn: "Generate Block Diagram Now",
    ratingCount: "4660",
    faqs: [
      { question: "What is a block diagram and when do I use one?", answer: "A block diagram represents a system using labeled rectangular blocks for components and arrows for connections. Use it for hardware, software, or signal systems." },
      { question: "Can it model embedded system architectures?", answer: "Yes, describe your microcontroller, peripherals, sensors, and power modules, and the AI generates a labeled layout." },
    ],
  },
};

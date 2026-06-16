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
  tableRows: { feature: string; col2: string; col3: string; col4: string }[];
  faqs: { question: string; answer: string }[];
  ctaTitle: string;
  ctaDesc: string;
  ctaBtn: string;
  ratingCount: string;
}

export const REGIONAL_SEO_DATA: Record<string, Record<string, PageSeoConfig>> = {
  us: {
    home: {
      title: "Paperxify US | YouTube to Notes AI & YouTube Video Summarizer",
      description: "Convert YouTube videos to study notes instantly in the US. Paperxify is the best free AI YouTube note taker, video summarizer, and NoteGPT alternative for American college students at Stanford, MIT, Harvard, and Ivy League schools.",
      keywords: ["youtube to notes ai us", "ai youtube note taker united states", "youtube video note taker us", "ai notes from youtube", "notegpt alternative us", "mindgrasp alternative america", "best ai youtube summarizer us", "youtube transcript to notes", "turn youtube into notes"],
      h1: "Paperxify US — Convert YouTube Videos to Study Notes Instantly | Paperxify",
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
      title: "YouTube to Notes AI US | Convert Lecture Videos to Study Guides | Paperxify",
      description: "Convert YouTube video links into structured study notes and flashcards instantly. Best free AI note taker for US high school and college students.",
      keywords: ["youtube to notes ai us", "convert youtube video to notes usa", "ai lecture notes maker", "free youtube summarizer ap calculus", "video study guide generator"],
      h1: "Free AI YouTube Video to Study Notes Generator for US Students | Paperxify",
      h2: "AI-Generated",
      h2Accent: "AP & College Notes",
      h2Rest: "from Any YouTube Lecture Link",
      intro: "Active recall is key. Paperxify US converts complex YouTube lectures, crash courses, and tutorial series into organized summaries, study guides, and flashcards optimized for AP Exams, SAT/ACT prep, and university finals.",
      features: [
        { title: "SAT/ACT & AP prep support", desc: "Tailored to summarize AP Calculus, AP Chemistry, AP Biology, and AP US History crash courses." },
        { title: "Fast PDF & Markdown Exports", desc: "Download study guides directly as markdown or beautifully typeset printable PDFs." }
      ],
      tableRows: [
        { feature: "Structured Academic Formatting", col2: "Yes (Headers, Code, LaTeX)", col3: "Plain bullets", col4: "Time-consuming" },
        { feature: "Multiple Output Styles", col2: "Yes (Flash, Scholar, Canvas)", col3: "Single format only", col4: "Depends on student" },
        { feature: "Notion & PDF Export", col2: "Yes (One-Click Sync)", col3: "None", col4: "Manual copying" }
      ],
      faqs: [
        { question: "Can I use Paperxify for AP exam preparation?", answer: "Absolutely! Paste any AP chemistry, physics, biology, or calculus crash course link, and Paperxify will extract key concepts, formulas, and definitions in seconds." },
        { question: "Does this work for engineering lectures at US colleges?", answer: "Yes, our AI handles complex equations, programming code blocks, and technical terms used in lectures at Stanford, MIT, and other engineering schools." }
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
      h1: "Paperxify UK — Convert YouTube Lectures to GCSE & A-Level Notes | Paperxify",
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
      title: "YouTube to Notes AI UK | A-Level & GCSE Revision Summaries | Paperxify",
      description: "Convert YouTube video lectures into revision notes and flashcards instantly. Best free AI lecture summarizer and OCR/AQA revision maker for UK students.",
      keywords: ["youtube to notes ai uk", "gcse maths revision guides", "a level physics summaries", "ocr chemistry note taker", "edexcel history notes maker"],
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
        { question: "How does the GCSE/A-Level note generator work?", answer: "Simply paste the link of any UK revision channel (like Freesciencelessons or ExamSolutions) and click generate. The AI transcribes the video and formats key syllabus definitions and concepts." },
        { question: "Can I export my revision notes to Notion?", answer: "Yes, you can copy the markdown or use our one-click export to Notion to keep all your GCSE and A-Level revision organized in one place." }
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
      h1: "Paperxify Canada — Convert YouTube Lectures to Study Notes | Paperxify",
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
      title: "YouTube to Notes AI Canada | Canadian Study Guide Generator | Paperxify",
      description: "Convert YouTube video links into study notes, summaries, and revision guides instantly. Best free AI lecture note taker and OSSLT helper in Canada.",
      keywords: ["youtube to notes ai canada", "convert youtube video to notes ca", "osslt literacy test prep", "u of t lecture note maker", "waterloo computer science notes"],
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
        { question: "How do I make study notes from a YouTube link in Canada?", answer: "Simply copy your lecture URL, paste it into the Paperxify input bar, choose your output format, and click generate. You will have a formatted study guide in seconds." },
        { question: "Can I export my Waterloo coding notes to markdown?", answer: "Yes, Paperxify outputs clean markdown with code blocks, which can be downloaded directly or pasted into obsidian or Notion." }
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
      h1: "Paperxify AU — Convert YouTube Lectures to ATAR, HSC & VCE Notes | Paperxify",
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
      title: "YouTube to Notes AI AU | ATAR, HSC & VCE Study Notes | Paperxify",
      description: "Convert YouTube lectures to ATAR revision guides, VCE notes, and HSC summaries instantly. Best free AI note taker and video summarizer in Australia.",
      keywords: ["youtube to notes ai au", "atar physics study guides", "hsc mathematics summaries", "vce biology notes maker", "sydney university note maker"],
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
        { question: "How do I summarize ATAR lectures from YouTube?", answer: "Paste the YouTube video link in Paperxify. Our AI processes the transcript and formats the content using ATAR science, mathematics, and humanities structures." },
        { question: "Can I export my UniMelb lectures directly to PDF?", answer: "Yes, you can export your generated study notes as high-resolution, print-ready PDF files with academic themes." }
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

import React from "react";
import type { Metadata } from "next";
import AIDiagramClient from "../AIDiagramClient";
import Link from "next/link";
import { FAQAccordion } from "@/components/FAQAccordion";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Sparkles, Trophy, Star, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

// Per-format SEO and content configuration
const FORMAT_CONFIG: Record<
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
    description: "Generate structured, professional flowcharts instantly using AI. Turn process descriptions, logic sequences, algorithms, and workflows into clean interactive flow diagrams. Free AI flowchart maker for engineers, students, and business teams globally.",
    keywords: ["ai flowchart generator", "free flowchart maker online", "create flowchart with ai", "process flow diagram ai", "algorithm flowchart maker", "workflow diagram creator", "flowchart from text ai", "interactive flowchart maker", "free online flowchart tool", "ai process mapping"],
    badge: "Instant Process Flow Diagram Builder",
    h1: "Free AI Flowchart Generator — Create Process Flow Diagrams from Text | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Flowchart Generator",
    h2Rest: "from Text Descriptions & Algorithm Logic",
    intro: "Building flowcharts manually in draw.io or Visio takes time. Paperxify's AI Flowchart Generator reads your process description or algorithm logic and produces a fully structured flowchart — with decision branches, process nodes, start/end terminators, and directional arrows — in seconds. Perfect for software engineers mapping algorithms, business analysts designing workflows, and students visualizing computational logic.",
    feature1Title: "Decision Branches Supported",
    feature1Desc: "Maps conditional logic (if/else, loops, branches) into proper diamond decision nodes automatically.",
    feature2Title: "Export as SVG / PNG",
    feature2Desc: "Download your flowchart as a high-resolution vector SVG or PNG for reports, presentations, and documentation.",
    testimonialQuote: "\"Generated a 15-node algorithm flowchart from a plain description in 6 seconds. Clean, accurate decision branches and labeled arrows. Saved me an hour of draw.io work.\"",
    testimonialAuthor: "Lukas Weber",
    testimonialMeta: "Engineering Student, TU Munich, DE",
    testimonialFlag: "DE",
    tableRows: [
      { feature: "AI from Text Description", col2: "Yes (Instant Generation)", col3: "Manual drawing only", col4: "Manual drawing only" },
      { feature: "Conditional Branch Mapping", col2: "Yes (Automatic)", col3: "Manual diamond nodes", col4: "Manual" },
      { feature: "Export SVG / PNG", col2: "Yes (Both Formats)", col3: "Yes (Paid plan)", col4: "Screenshot only" },
      { feature: "Mermaid / Notion Embed", col2: "Yes (One-click copy)", col3: "No", col4: "No" },
    ],
    ctaTitle: "The Best Free AI Flowchart Generator",
    ctaDesc: "Describe your process or paste your algorithm and generate a professional flowchart in seconds. No diagramming tool needed.",
    ctaBtn: "Generate Flowchart Now",
    ratingCount: "7200",
    faqs: [
      { question: "How do I create a flowchart using AI?", answer: "Select 'Flowchart' as your diagram type in Paperxify, then describe your process, algorithm, or workflow in plain text. The AI maps out process nodes, decision diamonds, and connection arrows. The complete flowchart renders in seconds using Mermaid syntax." },
      { question: "Can the AI create flowcharts with decision branches?", answer: "Yes. Paperxify's AI understands conditional logic — if/else statements, loops, and parallel branches — and automatically maps them to proper diamond decision nodes with labeled Yes/No paths." },
      { question: "What file formats can I export my flowchart as?", answer: "You can export flowcharts as SVG (scalable vector, ideal for documentation), PNG (raster image), or copy the raw Mermaid syntax for embedding in Notion pages, GitHub README files, or other markdown environments." },
      { question: "Is the AI Flowchart Generator free?", answer: "Yes. The free tier lets you generate unlimited flowcharts from text descriptions. Pro subscribers get advanced editing, larger node limits, and batch generation from uploaded documents." },
      { question: "Can it generate flowcharts for software algorithms?", answer: "Yes. Paperxify is particularly strong at visualizing software algorithms, data structure operations (sorting algorithms, tree traversals), API call flows, and microservice interaction sequences as clean flowcharts." },
    ],
  },
  sequence: {
    title: "AI Sequence Diagram Generator | Free UML Sequence Diagram Maker | Paperxify",
    description: "Generate detailed UML sequence diagrams instantly using AI. Model API interactions, system object calls, microservice communication flows, and authentication sequences from plain text descriptions. Free AI sequence diagram maker for software engineers.",
    keywords: ["ai sequence diagram generator", "uml sequence diagram maker", "api flow diagram ai", "sequence diagram from text", "system interaction diagram", "uml diagram generator free", "microservice sequence diagram", "object interaction diagram ai", "software sequence chart maker", "free uml maker online"],
    badge: "UML Sequence & Interaction Diagram Builder",
    h1: "Free AI Sequence Diagram Generator — UML Interaction Diagrams from Text | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Sequence Diagram",
    h2Rest: "Generator for UML & API Interaction Flows",
    intro: "Documenting system interactions and API call flows is essential for software architecture. Paperxify's AI Sequence Diagram Generator reads your description of actors, objects, and message exchanges — and produces a complete UML sequence diagram with lifelines, activation bars, and labeled synchronous and asynchronous messages in seconds.",
    feature1Title: "Full UML Sequence Syntax",
    feature1Desc: "Actors, lifelines, activation bars, synchronous calls, async messages, and return arrows all supported.",
    feature2Title: "API & Microservice Modeling",
    feature2Desc: "Ideal for documenting REST API flows, authentication handshakes, and microservice event choreography.",
    testimonialQuote: "\"I documented our entire OAuth2 authentication flow as a sequence diagram in under a minute. The actors and message labels were perfectly structured.\"",
    testimonialAuthor: "David Miller",
    testimonialMeta: "CS Major, Stanford University, US",
    testimonialFlag: "US",
    tableRows: [
      { feature: "AI from Plain Text Description", col2: "Yes (Instant)", col3: "Manual only", col4: "Manual only" },
      { feature: "UML Lifelines & Activation Bars", col2: "Yes (Full UML support)", col3: "Manual configuration", col4: "Manual drawing" },
      { feature: "Async & Return Messages", col2: "Yes (Automatic detection)", col3: "Manual", col4: "Manual" },
      { feature: "GitHub / Notion Embed", col2: "Yes (Mermaid Syntax)", col3: "No", col4: "No" },
    ],
    ctaTitle: "The Best Free AI Sequence Diagram Generator",
    ctaDesc: "Describe your system interaction flow and generate a complete UML sequence diagram with actors, lifelines, and messages in seconds.",
    ctaBtn: "Generate Sequence Diagram Now",
    ratingCount: "5840",
    faqs: [
      { question: "What is a sequence diagram and when should I use one?", answer: "A sequence diagram is a UML diagram that models the time-ordered interaction between system objects, actors, or services. Use them to document API call flows, authentication handshakes, user registration processes, microservice event choreography, and object method interactions in software systems." },
      { question: "Can the AI generate UML sequence diagrams from code?", answer: "Yes. You can paste pseudocode, function call sequences, or plain English descriptions of your system interactions. The AI identifies actors, objects, messages, and return values and generates a proper UML sequence diagram." },
      { question: "What types of messages can the AI diagram?", answer: "Paperxify supports synchronous method calls, asynchronous messages, return messages, self-calls (loops), and activation/deactivation of lifelines — the full UML sequence diagram notation." },
      { question: "Can I use this for documenting REST API flows?", answer: "Yes. REST API documentation is one of the strongest use cases. Describe your endpoint interactions, request/response cycles, and authentication headers — the AI generates a sequence diagram showing the complete request flow between client, server, and any third-party services." },
      { question: "Is the AI Sequence Diagram Generator free?", answer: "Yes. Free users can generate unlimited sequence diagrams. Pro subscribers get advanced editing, larger diagram limits, and the ability to generate diagrams from uploaded code files or OpenAPI specifications." },
    ],
  },
  class: {
    title: "AI Class Diagram Generator | Free OOP Class Diagram Maker | Paperxify",
    description: "Map object-oriented class structures and inheritance hierarchies instantly with AI. Paperxify's free AI Class Diagram Generator creates UML class diagrams with attributes, methods, associations, and inheritance arrows from plain text descriptions.",
    keywords: ["ai class diagram generator", "uml class diagram maker", "oop class diagram ai", "object oriented diagram maker", "inheritance diagram generator", "class relationship mapper ai", "software design mapping tool", "free uml class diagram", "class structure visualizer", "domain model diagram ai"],
    badge: "OOP & UML Class Diagram Studio",
    h1: "Free AI Class Diagram Generator — UML Object-Oriented Diagrams | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Class Diagram",
    h2Rest: "Generator for Object-Oriented Systems & UML",
    intro: "Visualizing class structures and inheritance hierarchies is fundamental to object-oriented software design. Paperxify's AI Class Diagram Generator reads your system description and produces a complete UML class diagram with classes, attributes, methods, visibility modifiers, associations, and inheritance arrows — perfectly structured for software architecture documentation.",
    feature1Title: "Full UML Class Notation",
    feature1Desc: "Classes, interfaces, abstract classes, attributes, methods, and visibility (+/-/#) all rendered correctly.",
    feature2Title: "Inheritance & Associations",
    feature2Desc: "Inheritance (extends), implementation (implements), composition, aggregation, and dependency arrows supported.",
    testimonialQuote: "\"Generated the entire class structure for our e-commerce domain model from a written description. All inheritance and association lines were correctly placed. Massive time saver.\"",
    testimonialAuthor: "Sarah Jenkins",
    testimonialMeta: "Medical Student, University of Melbourne, AU",
    testimonialFlag: "AU",
    tableRows: [
      { feature: "AI from System Description", col2: "Yes (Instant)", col3: "Manual only", col4: "Manual only" },
      { feature: "UML Visibility Modifiers", col2: "Yes (+ / # supported)", col3: "Manual", col4: "Manual" },
      { feature: "Inheritance & Interface Lines", col2: "Yes (All relationship types)", col3: "Manual drawing", col4: "Manual" },
      { feature: "Export as SVG / PNG", col2: "Yes (Both formats)", col3: "Yes (Paid)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI UML Class Diagram Generator",
    ctaDesc: "Describe your system's classes and relationships in plain text. Get a complete UML class diagram with inheritance and associations in seconds.",
    ctaBtn: "Generate Class Diagram Now",
    ratingCount: "5120",
    faqs: [
      { question: "How do I create a UML class diagram with AI?", answer: "Describe your system's classes, their attributes, methods, and relationships (inheritance, composition, aggregation) in plain text. The AI generates a complete UML class diagram with proper notation including visibility modifiers, data types, and relationship arrows." },
      { question: "Can it show inheritance and interface implementations?", answer: "Yes. Paperxify supports all standard UML class diagram relationship types: inheritance (extends), interface implementation (implements), composition, aggregation, association, and dependency — all rendered with correct UML arrow notation." },
      { question: "Is it suitable for documenting existing code?", answer: "Yes. You can describe your existing codebase structure to the AI (or paste class signatures) and it will generate a class diagram. This is useful for legacy code documentation and architectural reviews." },
      { question: "Can I use this for database schema design?", answer: "For database schema visualization, the ER Diagram type is more appropriate. Class diagrams are optimized for object-oriented programming class structures. However, you can model simple data models using class notation if preferred." },
      { question: "Does it support design patterns?", answer: "Yes. You can ask the AI to generate class diagrams for common design patterns (Singleton, Factory, Observer, Strategy, Decorator) and it will produce the correct class structure with the appropriate relationship arrows." },
    ],
  },
  state: {
    title: "AI State Diagram Generator | State Machine & FSM Visualizer | Paperxify",
    description: "Create state transition diagrams and finite state machines instantly using AI. Paperxify's free AI State Diagram Generator models system states, transitions, events, and guards from plain text descriptions. Ideal for workflow and lifecycle modeling.",
    keywords: ["ai state diagram generator", "state machine diagram maker", "fsm visualizer ai", "state transition chart", "finite state machine generator", "workflow state diagram", "state lifecycle modeling", "uml state machine", "system state map ai", "transition diagram maker"],
    badge: "Finite State Machine & Lifecycle Modeler",
    h1: "Free AI State Diagram Generator — Finite State Machines & Transitions | Paperxify",
    h2: "AI-Powered",
    h2Accent: "State Diagram",
    h2Rest: "Generator for FSMs, Workflows & Lifecycle Models",
    intro: "State machines power everything from UI components to distributed systems. Paperxify's AI State Diagram Generator reads your description of system states, triggering events, and guard conditions — and produces a complete state transition diagram with initial/final states, labeled transitions, and guard clauses — ideal for modeling user interface flows, order lifecycle systems, and background process states.",
    feature1Title: "Events & Guard Conditions",
    feature1Desc: "Transition labels include event triggers and optional guard conditions (e.g., [balance > 0]) automatically.",
    feature2Title: "Initial & Final States",
    feature2Desc: "Proper UML notation with filled circle start state and double-circle end state for complete FSM diagrams.",
    testimonialQuote: "\"Modeled our order fulfillment state machine in 3 seconds from a written description. All states, guards, and transitions were perfectly labeled. Ready for the architecture review.\"",
    testimonialAuthor: "Elena Rostova",
    testimonialMeta: "Product Manager & Continuous Learner, Global",
    testimonialFlag: "GL",
    tableRows: [
      { feature: "AI from Plain Description", col2: "Yes (Instant)", col3: "Manual only", col4: "Manual only" },
      { feature: "Guard Conditions on Transitions", col2: "Yes (Automatic)", col3: "Manual notation", col4: "Manual" },
      { feature: "UML Initial / Final State Notation", col2: "Yes (Standard UML)", col3: "Manual configuration", col4: "Manual" },
      { feature: "Export SVG / PNG", col2: "Yes (Both formats)", col3: "Yes (Paid)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI State Diagram Generator",
    ctaDesc: "Describe your system's states and transitions in plain text. Get a complete finite state machine diagram with guards and events in seconds.",
    ctaBtn: "Generate State Diagram Now",
    ratingCount: "4350",
    faqs: [
      { question: "What is a state diagram and when should I use one?", answer: "A state diagram (or state machine diagram) models the lifecycle of a system by showing all possible states, the events that trigger transitions between states, and any guard conditions. Use them for UI component flows, order/payment lifecycle systems, network protocol modeling, and embedded system logic." },
      { question: "Can the AI diagram guard conditions on transitions?", answer: "Yes. You can specify guard conditions in your description (e.g., 'transition from Pending to Processing only if [payment verified]') and the AI will include the guard notation in square brackets on the transition arrow." },
      { question: "Does it support composite and nested states?", answer: "Yes. Paperxify supports nested state diagrams with composite states (states that contain sub-states). Describe the parent state and its internal state machine, and the AI generates the nested notation." },
      { question: "Can I use it to model React component state machines?", answer: "Yes. Frontend state management is an excellent use case. Describe your component's states (loading, success, error, idle) and the events that trigger transitions (fetchStart, fetchSuccess, fetchError, reset) and the AI generates a clear state machine diagram." },
      { question: "Is the AI State Diagram Generator free?", answer: "Yes. Free tier users can generate unlimited state diagrams from text descriptions. Pro subscribers get advanced editing, larger state limits, and the ability to generate state machines from uploaded code or XState configuration files." },
    ],
  },
  er: {
    title: "AI ER Diagram Generator | Free Entity Relationship Schema Maker | Paperxify",
    description: "Map database schemas and entity relationships automatically with AI. Paperxify's free AI ER Diagram Generator creates complete entity-relationship diagrams with primary keys, foreign keys, attributes, and cardinality notations from plain text descriptions.",
    keywords: ["ai er diagram generator", "entity relationship diagram maker ai", "database schema diagram", "er diagram from text ai", "free erd maker online", "database design tool ai", "primary key foreign key diagram", "sql schema visualizer", "relational database mapper", "cardinality diagram ai"],
    badge: "Database Schema & ER Diagram Engine",
    h1: "Free AI ER Diagram Generator — Entity Relationship Database Schemas | Paperxify",
    h2: "AI-Powered",
    h2Accent: "ER Diagram",
    h2Rest: "Generator for Database Schema Design",
    intro: "Designing a relational database without a clear ER diagram is asking for architectural debt. Paperxify's AI ER Diagram Generator reads your data model description — entities, their attributes, primary keys, foreign keys, and relationships — and generates a complete entity-relationship diagram with proper cardinality notation (one-to-many, many-to-many) in seconds.",
    feature1Title: "PK / FK Notation",
    feature1Desc: "Primary keys and foreign keys are automatically identified and annotated with PK/FK labels in the diagram.",
    feature2Title: "Cardinality Relationships",
    feature2Desc: "One-to-one, one-to-many, and many-to-many relationships rendered with correct crow's foot or UML notation.",
    testimonialQuote: "\"Generated our entire e-commerce database ER diagram from a written spec in under 30 seconds. PKs, FKs, and cardinality were all correctly mapped. Weeks of DB design work visualized instantly.\"",
    testimonialAuthor: "James Sterling",
    testimonialMeta: "Economics Student, LSE, UK",
    testimonialFlag: "UK",
    tableRows: [
      { feature: "AI from Data Model Description", col2: "Yes (Instant)", col3: "Manual drawing", col4: "Manual drawing" },
      { feature: "PK / FK Auto-Annotation", col2: "Yes (Automatic)", col3: "Manual labels", col4: "Manual" },
      { feature: "Cardinality Notation", col2: "Yes (One-to-many / Many-to-many)", col3: "Manual", col4: "Manual" },
      { feature: "SQL to ER Reverse Engineering", col2: "Yes (Paste SQL schema)", col3: "Some tools (Paid)", col4: "Manual analysis" },
    ],
    ctaTitle: "The Best Free AI ER Diagram Generator",
    ctaDesc: "Describe your database entities and relationships, or paste your SQL schema. Get a complete ER diagram with PKs, FKs, and cardinality in seconds.",
    ctaBtn: "Generate ER Diagram Now",
    ratingCount: "6180",
    faqs: [
      { question: "How does the AI generate an ER diagram from text?", answer: "Describe your database entities (tables), their attributes (columns), data types, primary keys, foreign keys, and relationships (one-to-many, many-to-many). The AI generates a complete ER diagram in Mermaid syntax with all entities, attributes, and cardinality-annotated relationship lines." },
      { question: "Can it reverse-engineer an ER diagram from SQL CREATE TABLE statements?", answer: "Yes. Paste your SQL CREATE TABLE statements and the AI extracts entities, columns, primary keys, foreign key constraints, and relationship cardinalities to generate a visual ER diagram automatically." },
      { question: "What cardinality notations does the ER diagram generator support?", answer: "Paperxify supports one-to-one (1:1), one-to-many (1:N), many-to-one (N:1), and many-to-many (N:M) cardinalities, rendered with Mermaid ER notation (||--o{, }o--||, etc.) or descriptive crow's foot notation." },
      { question: "Can I use this for NoSQL or MongoDB schema design?", answer: "While ER diagrams are primarily designed for relational databases, you can use them to model MongoDB collection structures and relationships. The AI will adapt to document-model descriptions and model embedded vs referenced relationships." },
      { question: "Is the AI ER Diagram Generator free?", answer: "Yes. The free tier generates unlimited ER diagrams from text descriptions. Pro subscribers get SQL import, larger entity limits, and advanced diagram editing with live Mermaid code editing." },
    ],
  },
  journey: {
    title: "AI User Journey Map Generator | Customer Experience & Onboarding Flow | Paperxify",
    description: "Build user journey maps and customer experience flows instantly using AI. Paperxify's free AI User Journey Map Generator visualizes user interaction touchpoints, emotional states, and onboarding paths from plain descriptions. Perfect for UX designers and product teams.",
    keywords: ["ai user journey map generator", "customer journey map maker ai", "ux journey mapping tool", "onboarding flow diagram ai", "customer experience map", "user touchpoint visualization", "product journey map ai", "emotional journey mapping", "user story mapping ai", "cx mapping tool free"],
    badge: "UX & Customer Experience Journey Mapper",
    h1: "Free AI User Journey Map Generator — Customer Experience & UX Flows | Paperxify",
    h2: "AI-Powered",
    h2Accent: "User Journey",
    h2Rest: "Map Generator for UX & Customer Experience Design",
    intro: "Understanding how users move through your product is the foundation of great UX. Paperxify's AI User Journey Map Generator visualizes your user's path — from initial awareness through activation, engagement, and retention — with interaction touchpoints, emotional states, and pain points mapped across each stage. Perfect for product managers, UX designers, and startup founders planning their onboarding flows.",
    feature1Title: "Touchpoint Mapping",
    feature1Desc: "Maps user actions, system responses, and emotional states across each journey stage automatically.",
    feature2Title: "Pain Point Annotation",
    feature2Desc: "Identifies and highlights friction points and opportunities for improvement in the user flow.",
    testimonialQuote: "\"Built our full user onboarding journey map in 45 seconds. Stages, touchpoints, and emotional indicators were all accurately captured. Shared it directly in our product review meeting.\"",
    testimonialAuthor: "Elena Rostova",
    testimonialMeta: "Product Manager & Continuous Learner, Global",
    testimonialFlag: "GL",
    tableRows: [
      { feature: "AI from Journey Description", col2: "Yes (Instant)", col3: "Manual only", col4: "Manual only" },
      { feature: "Emotional State Mapping", col2: "Yes (Automatic)", col3: "Manual annotation", col4: "Manual" },
      { feature: "Pain Point Highlighting", col2: "Yes (Identified by AI)", col3: "Manual", col4: "Manual" },
      { feature: "Notion / Presentation Export", col2: "Yes (SVG + Mermaid)", col3: "No", col4: "Screenshot" },
    ],
    ctaTitle: "The Best Free AI User Journey Map Generator",
    ctaDesc: "Describe your user's product journey and generate a complete visual journey map with touchpoints, emotions, and pain points in seconds.",
    ctaBtn: "Generate Journey Map Now",
    ratingCount: "4010",
    faqs: [
      { question: "What is a user journey map and why do I need one?", answer: "A user journey map visualizes the complete path a user takes when interacting with your product or service — from initial discovery through key actions and outcomes. It's essential for identifying friction points, optimizing onboarding, and aligning product teams on the user experience." },
      { question: "How do I create a user journey map with AI?", answer: "Describe your user persona, their goal, and the steps they take to achieve it in your product (e.g., sign up, verify email, set up profile, complete first task). The AI maps each step with the user's action, system response, and emotional state across the journey stages." },
      { question: "Can it map emotional states and satisfaction levels?", answer: "Yes. Specify the emotional tone for each journey stage (frustrated, neutral, satisfied, delighted) in your description and the AI includes emotional indicators in the journey map, helping you identify where user experience drops or peaks." },
      { question: "Is this useful for e-commerce and SaaS products?", answer: "Absolutely. User journey maps are essential for both. For e-commerce, map the discovery → browse → add-to-cart → checkout → delivery → review cycle. For SaaS, map the trial sign-up → onboarding → first value → subscription → expansion journey." },
      { question: "Is the AI User Journey Map Generator free?", answer: "Yes. Free users can generate unlimited journey maps from text descriptions. Pro subscribers get advanced editing with touchpoint customization, emotional arc overlays, and export to presentation-ready formats." },
    ],
  },
  pie: {
    title: "AI Pie Chart Maker | Free Segment Distribution Chart Generator | Paperxify",
    description: "Generate beautiful, accurately proportioned pie charts instantly using AI. Paperxify's free AI Pie Chart Maker creates segment distribution visualizations from data descriptions for reports, presentations, and data analysis.",
    keywords: ["ai pie chart maker", "free pie chart generator online", "pie chart from data ai", "segment distribution chart", "data visualization pie chart", "percentage breakdown chart ai", "categorical data pie chart", "online pie chart creator free", "pie chart generator ai", "data chart maker free"],
    badge: "Instant Data Segment Chart Builder",
    h1: "Free AI Pie Chart Generator — Segment Distribution & Data Visualization | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Pie Chart",
    h2Rest: "Generator for Data Distribution & Segment Analysis",
    intro: "Communicating proportional data is most effective with a well-designed pie chart. Paperxify's AI Pie Chart Generator takes your data description — categories and values — and produces a clean, color-coded pie chart with accurate segment proportions and labeled percentages. Perfect for survey results, budget allocations, market share analysis, and academic research data visualization.",
    feature1Title: "Percentage Labels Auto-Calculated",
    feature1Desc: "Input raw values and the AI calculates and labels accurate percentage proportions for every segment.",
    feature2Title: "Color-Coded Segments",
    feature2Desc: "Each segment gets a distinct, visually harmonious color with a matching legend for clear readability.",
    testimonialQuote: "\"Created a survey results pie chart for my research paper in 10 seconds. The proportions were perfectly calculated and the color scheme was clean enough to put directly into my thesis.\"",
    testimonialAuthor: "Emily Tremblay",
    testimonialMeta: "Biology Sophomore, McGill University, CA",
    testimonialFlag: "CA",
    tableRows: [
      { feature: "AI from Data Description", col2: "Yes (Instant)", col3: "Manual data entry", col4: "Manual creation" },
      { feature: "Percentage Auto-Calculation", col2: "Yes (Automatic)", col3: "Yes", col4: "Manual calculation" },
      { feature: "Color-Coded Legend", col2: "Yes (Auto-generated)", col3: "Yes (Manual styling)", col4: "Manual" },
      { feature: "SVG / PNG Export", col2: "Yes (Both formats)", col3: "Yes (Limited free)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI Pie Chart Generator",
    ctaDesc: "Describe your data categories and values. Get a clean, accurately proportioned pie chart with labels and legend in seconds.",
    ctaBtn: "Generate Pie Chart Now",
    ratingCount: "5640",
    faqs: [
      { question: "How do I create a pie chart using AI?", answer: "Select 'Pie Chart' as your diagram type and describe your data — category names and their values (e.g., 'Marketing: 35%, Engineering: 40%, Sales: 25%'). The AI generates a pie chart with accurate proportions, color-coded segments, and a labeled legend." },
      { question: "Does the AI calculate percentages automatically?", answer: "Yes. You can input raw numbers (e.g., 'Marketing: 350, Engineering: 400, Sales: 250') and the AI calculates the correct percentage for each segment and labels the chart accordingly." },
      { question: "Can I customize the pie chart colors and labels?", answer: "Pro subscribers can customize segment colors, label fonts, and chart title through the live Mermaid editor. Free users get automatically generated, visually harmonious color palettes." },
      { question: "Is this suitable for academic research papers?", answer: "Yes. Paperxify generates clean, publication-quality pie charts exported as SVG (vector format) suitable for academic papers, research reports, and presentations. The SVG format scales without quality loss at any print resolution." },
      { question: "Is the AI Pie Chart Maker free?", answer: "Yes. Free users can generate unlimited pie charts. Pro subscribers get SVG and PNG export, chart customization, and the ability to generate charts from uploaded CSV data files." },
    ],
  },
  quadrant: {
    title: "AI Quadrant Chart Generator | Free 2x2 Priority Matrix Maker | Paperxify",
    description: "Generate custom 2x2 quadrant charts and impact-effort priority matrices instantly using AI. Paperxify's free AI Quadrant Chart Maker visualizes feature prioritization, strategic planning, task backlog management, and competitive analysis.",
    keywords: ["ai quadrant chart generator", "2x2 matrix maker ai", "impact effort matrix ai", "priority matrix generator", "backlog prioritization tool ai", "eisenhower matrix maker", "feature prioritization chart", "strategic planning matrix ai", "quadrant diagram maker", "effort impact chart free"],
    badge: "2x2 Priority & Strategic Matrix Builder",
    h1: "Free AI Quadrant Chart Generator — 2x2 Priority & Impact Matrices | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Quadrant Chart",
    h2Rest: "Generator for Priority Matrices & Strategic Analysis",
    intro: "The 2x2 matrix is one of the most powerful tools in product and strategic planning. Paperxify's AI Quadrant Chart Generator places your items across a customizable two-axis matrix — whether it's an Impact vs Effort chart for backlog prioritization, a Reach vs Confidence matrix for feature ranking, or a Risk vs Reward analysis for strategic decisions — in seconds.",
    feature1Title: "Custom Axes Labels",
    feature1Desc: "Define your own X and Y axis labels — Impact, Effort, Urgency, Importance, Risk, or any custom dimension.",
    feature2Title: "Item Placement by AI",
    feature2Desc: "Describe your items and their characteristics — the AI intelligently places them in the correct quadrant.",
    testimonialQuote: "\"Used Paperxify to build an Impact vs Effort matrix for our Q3 product backlog. All 15 features were correctly plotted and it sparked a great prioritization discussion with the team.\"",
    testimonialAuthor: "Elena Rostova",
    testimonialMeta: "Product Manager & Continuous Learner, Global",
    testimonialFlag: "GL",
    tableRows: [
      { feature: "AI Item Placement", col2: "Yes (Intelligent Positioning)", col3: "Manual placement only", col4: "Manual drawing" },
      { feature: "Custom Axis Labels", col2: "Yes (Any labels)", col3: "Fixed templates", col4: "Manual" },
      { feature: "Multiple Items Supported", col2: "Yes (Unlimited items)", col3: "Limited free tier", col4: "Manual effort" },
      { feature: "SVG / Presentation Export", col2: "Yes (Both formats)", col3: "Yes (Paid)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI Quadrant Chart Generator",
    ctaDesc: "List your items and describe their dimensions. Get a complete 2x2 priority matrix with intelligent item placement in seconds.",
    ctaBtn: "Generate Quadrant Chart Now",
    ratingCount: "4780",
    faqs: [
      { question: "What is a quadrant chart and what is it used for?", answer: "A quadrant chart (2x2 matrix) plots items across two axes to create four quadrants representing different priority levels. Common uses include Impact vs Effort matrices (product backlog prioritization), Urgency vs Importance matrices (Eisenhower Matrix for task planning), Risk vs Reward for strategic analysis, and Reach vs Confidence for feature ranking." },
      { question: "Can I create an Eisenhower Matrix with this tool?", answer: "Yes. Select Quadrant Chart and specify axes as 'Urgency' (X) and 'Importance' (Y). The AI creates the four quadrants: Do First (high urgency, high importance), Schedule (low urgency, high importance), Delegate (high urgency, low importance), and Eliminate (low urgency, low importance)." },
      { question: "Can I use it for product backlog prioritization?", answer: "Yes. This is one of the most popular use cases. List your backlog items and describe their impact and effort levels. The AI places each item in the correct quadrant (Quick Wins, Big Bets, Fill-ins, Time Sinks) on the impact-effort matrix." },
      { question: "How many items can I place on the quadrant chart?", answer: "Free users can plot up to 12 items on a quadrant chart. Pro subscribers can plot unlimited items, and the AI uses intelligent spacing to prevent overlapping labels even with dense datasets." },
      { question: "Is the AI Quadrant Chart Generator free?", answer: "Yes. Free users can generate unlimited quadrant charts from text descriptions. Pro subscribers get custom axis scaling, larger item limits, and SVG/PNG export for use in presentations and documents." },
    ],
  },
  timeline: {
    title: "AI Timeline Generator | Free Project Roadmap & Milestone Chart Maker | Paperxify",
    description: "Visualize project milestones, chronological events, and development roadmaps with AI. Paperxify's free AI Timeline Generator creates clean, horizontal timelines from event descriptions — perfect for project planning, history visualization, and roadmap creation.",
    keywords: ["ai timeline generator", "project roadmap maker ai", "milestone chart creator", "chronological timeline maker", "event timeline generator ai", "gantt alternative timeline", "history timeline maker ai", "product roadmap timeline", "free online timeline maker", "timeline diagram generator"],
    badge: "Project Milestones & Chronological Event Mapper",
    h1: "Free AI Timeline Generator — Project Roadmaps & Chronological Milestone Charts | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Timeline Generator",
    h2Rest: "for Roadmaps, Milestones & Historical Events",
    intro: "Communicating a project roadmap or historical sequence visually makes complex information instantly clear. Paperxify's AI Timeline Generator transforms your list of events and dates into a clean, structured timeline — with properly spaced milestones, labeled events, and clear temporal relationships. Ideal for product roadmaps, academic history projects, and project planning presentations.",
    feature1Title: "Date-Ordered Milestones",
    feature1Desc: "Automatically orders events chronologically and spaces milestones proportionally along the timeline axis.",
    feature2Title: "Product & History Roadmaps",
    feature2Desc: "Equally powerful for future product planning roadmaps and historical event chronology visualization.",
    testimonialQuote: "\"Created a 12-milestone product roadmap timeline for our investor deck in 20 seconds. Dates, labels, and spacing were perfectly arranged. Copied it straight into the presentation.\"",
    testimonialAuthor: "Elena Rostova",
    testimonialMeta: "Product Manager & Continuous Learner, Global",
    testimonialFlag: "GL",
    tableRows: [
      { feature: "AI from Event Descriptions", col2: "Yes (Instant ordering)", col3: "Manual entry required", col4: "Manual drawing" },
      { feature: "Automatic Date Ordering", col2: "Yes (Chronological)", col3: "Yes (Manual)", col4: "Manual" },
      { feature: "Milestone Labels", col2: "Yes (Auto-labeled)", col3: "Manual styling", col4: "Manual" },
      { feature: "SVG / Presentation Export", col2: "Yes (Both formats)", col3: "Yes (Paid)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI Timeline Generator",
    ctaDesc: "List your events and dates in plain text. Get a professionally structured timeline with ordered milestones and clean labels in seconds.",
    ctaBtn: "Generate Timeline Now",
    ratingCount: "5210",
    faqs: [
      { question: "How do I create a timeline using AI?", answer: "List your events in chronological order with their dates or time periods (e.g., 'Q1 2024: Design phase', 'Q2 2024: Development', 'Q3 2024: Beta launch'). The AI arranges them on a horizontal timeline with properly labeled milestone markers and date annotations." },
      { question: "Can I use it for product roadmaps?", answer: "Yes. Product roadmaps are one of the most common timeline use cases. List your planned feature releases, sprint milestones, launch dates, and strategic initiatives. The AI creates a clean product roadmap timeline suitable for investor presentations and team planning." },
      { question: "Can the timeline show date ranges (not just single dates)?", answer: "Yes. You can specify date ranges for timeline items (e.g., 'Research phase: January–March 2025'). The AI creates a Gantt-style timeline bar for range events alongside point milestones." },
      { question: "Is this useful for academic history projects?", answer: "Yes. Historical timelines are a strong use case. List historical events with their dates and the AI creates a clean chronological timeline with proportionally spaced events, perfect for history essays, presentations, and visual aids." },
      { question: "Is the AI Timeline Generator free?", answer: "Yes. Free users can generate unlimited timelines from text descriptions. Pro subscribers get custom date formatting, milestone color coding, and export to presentation-ready SVG and PNG formats." },
    ],
  },
  sankey: {
    title: "AI Sankey Diagram Generator | Free Flow Distribution & Conversion Funnel Mapper | Paperxify",
    description: "Visualize traffic distributions, conversion funnels, energy flows, and resource allocation with AI. Paperxify's free AI Sankey Diagram Generator creates proportional flow diagrams from plain text data descriptions for analytics and system design.",
    keywords: ["ai sankey diagram generator", "sankey chart maker online free", "flow distribution diagram ai", "conversion funnel visualizer", "traffic flow sankey chart", "energy flow diagram ai", "resource allocation sankey", "sankey diagram from data", "alluvial diagram maker ai", "flow volume chart generator"],
    badge: "Flow Volume & Distribution Diagram Builder",
    h1: "Free AI Sankey Diagram Generator — Flow Distribution & Conversion Funnels | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Sankey Diagram",
    h2Rest: "Generator for Flow Distribution & Conversion Funnels",
    intro: "Sankey diagrams are the most effective way to visualize how volume moves through a system — from traffic sources through user funnels, from budget allocations through spending categories, or from energy inputs through transformation outputs. Paperxify's AI Sankey Diagram Generator reads your flow data description and produces a proportional, multi-node Sankey flow map in seconds.",
    feature1Title: "Proportional Flow Widths",
    feature1Desc: "Flow line widths are automatically scaled to represent the volume magnitude of each connection.",
    feature2Title: "Multi-Stage Funnels",
    feature2Desc: "Models complex multi-step funnels with branching flows and loss nodes at each conversion stage.",
    testimonialQuote: "\"Built a website traffic source → conversion funnel Sankey in 15 seconds. The proportional flows clearly showed where we were losing users. Invaluable for our analytics review.\"",
    testimonialAuthor: "Elena Rostova",
    testimonialMeta: "Product Manager & Continuous Learner, Global",
    testimonialFlag: "GL",
    tableRows: [
      { feature: "AI from Flow Description", col2: "Yes (Instant)", col3: "Manual data entry", col4: "Manual drawing" },
      { feature: "Proportional Flow Widths", col2: "Yes (Auto-scaled)", col3: "Yes (Manual)", col4: "Manual" },
      { feature: "Multi-Stage Branching", col2: "Yes (Complex funnels)", col3: "Limited free tier", col4: "Manual" },
      { feature: "SVG / PNG Export", col2: "Yes (Both formats)", col3: "Yes (Paid)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI Sankey Diagram Generator",
    ctaDesc: "Describe your flow data — sources, paths, and volumes. Get a complete proportional Sankey flow diagram in seconds.",
    ctaBtn: "Generate Sankey Diagram Now",
    ratingCount: "3840",
    faqs: [
      { question: "What is a Sankey diagram and when should I use one?", answer: "A Sankey diagram is a flow visualization where the width of arrows is proportional to the volume of flow they represent. Use them for: website traffic source analysis, marketing conversion funnels, energy system modeling, budget allocation tracking, and supply chain flow visualization." },
      { question: "How do I describe my flow data to the AI?", answer: "Describe your nodes and the volume flowing between them (e.g., 'Google Ads → Landing Page: 5000, Landing Page → Sign Up: 1200, Sign Up → Active User: 800, Active User → Paid: 200'). The AI generates a Sankey diagram with proportional flow widths." },
      { question: "Can it model multi-stage conversion funnels?", answer: "Yes. Sankey diagrams are ideal for conversion funnel analysis. Describe your funnel stages (Visitors → Leads → Trials → Paid → Retained) with volume numbers at each stage, and the AI renders a complete multi-stage funnel with loss branches showing drop-off at each step." },
      { question: "Is this useful for energy or material flow analysis?", answer: "Yes. Sankey diagrams originated in energy flow visualization. You can describe energy inputs, transformations, and outputs (e.g., fuel input, mechanical energy output, heat loss) and the AI generates a proportional energy flow Sankey." },
      { question: "Is the AI Sankey Diagram Generator free?", answer: "Yes. Free users can generate unlimited Sankey diagrams from text data descriptions. Pro subscribers get CSV data import, node color customization, and export to SVG and PNG formats." },
    ],
  },
  xy: {
    title: "AI XY Chart Generator | Free Line Graph & Coordinate Plot Maker | Paperxify",
    description: "Plot coordinates, numeric sequences, and performance metrics as clean line graphs using AI. Paperxify's free AI XY Chart Generator creates multi-series line charts and scatter plots from data descriptions for analysis and academic reports.",
    keywords: ["ai xy chart generator", "line graph maker ai", "coordinate plot generator", "xy scatter plot ai", "data trend chart ai", "multi series line chart", "performance metrics chart ai", "free graph maker online", "numeric sequence visualizer", "data plot generator ai"],
    badge: "Coordinate & Multi-Series Data Plotter",
    h1: "Free AI XY Chart Generator — Line Graphs & Coordinate Data Plots | Paperxify",
    h2: "AI-Powered",
    h2Accent: "XY Line Chart",
    h2Rest: "Generator for Coordinate Plots & Data Trend Analysis",
    intro: "Communicating trends and relationships between numeric variables is most effective with a clean line chart. Paperxify's AI XY Chart Generator takes your coordinate data or time-series values and produces a multi-series line chart with properly scaled axes, labeled data points, and a clear legend — ready for academic reports, data analysis presentations, and performance dashboards.",
    feature1Title: "Multi-Series Support",
    feature1Desc: "Plot multiple data series on the same chart with distinct colors and legend labels for clear comparison.",
    feature2Title: "Auto-Scaled Axes",
    feature2Desc: "X and Y axes are automatically scaled and labeled based on your data range for optimal readability.",
    testimonialQuote: "\"Plotted 3 performance metric series from our A/B test on a single XY chart in 10 seconds. The axis labels and legend were perfectly formatted for our analytics report.\"",
    testimonialAuthor: "Elena Rostova",
    testimonialMeta: "Product Manager & Continuous Learner, Global",
    testimonialFlag: "GL",
    tableRows: [
      { feature: "AI from Data Description", col2: "Yes (Instant)", col3: "Manual data entry", col4: "Spreadsheet required" },
      { feature: "Multi-Series Line Charts", col2: "Yes (Multiple series)", col3: "Yes (Manual)", col4: "Yes (Spreadsheet)" },
      { feature: "Auto-Scaled Axes", col2: "Yes (Automatic)", col3: "Manual configuration", col4: "Automatic (Excel)" },
      { feature: "SVG / PNG Export", col2: "Yes (Both formats)", col3: "Yes (Paid)", col4: "Export from spreadsheet" },
    ],
    ctaTitle: "The Best Free AI XY Line Chart Generator",
    ctaDesc: "Describe your data series and coordinate values. Get a clean, properly scaled line chart with labels and legend in seconds.",
    ctaBtn: "Generate XY Chart Now",
    ratingCount: "4920",
    faqs: [
      { question: "How do I create an XY line chart with AI?", answer: "Describe your X and Y axis data points for each series (e.g., 'Series A: (1, 10), (2, 15), (3, 12), (4, 20) — Series B: (1, 5), (2, 8), (3, 14), (4, 18)'). The AI generates a multi-series line chart with scaled axes and a labeled legend." },
      { question: "Can I plot multiple data series on one chart?", answer: "Yes. Describe each series separately with its name and coordinate values. The AI plots all series on the same XY chart with distinct colors and a clear legend for easy comparison." },
      { question: "Is this suitable for academic research data visualization?", answer: "Yes. XY charts generated by Paperxify are export-ready as SVG (publication-quality vector format) for academic papers and research reports. The clean, minimal styling is appropriate for journal submissions." },
      { question: "Can I create a scatter plot instead of a line chart?", answer: "Yes. Specify that you want a scatter plot (data points without connecting lines) in your description, and the AI generates a scatter plot visualization instead of a line chart." },
      { question: "Is the AI XY Chart Generator free?", answer: "Yes. Free users can generate unlimited XY charts from data descriptions. Pro subscribers get CSV data import for large datasets, custom axis labels, and axis range configuration." },
    ],
  },
  block: {
    title: "AI Block Diagram Generator | Free System Architecture & Hardware Flow Mapper | Paperxify",
    description: "Construct block diagrams and system architecture maps instantly using AI. Paperxify's free AI Block Diagram Generator models engineering modules, hardware components, signal paths, and software system layers from plain text descriptions.",
    keywords: ["ai block diagram generator", "system architecture diagram ai", "hardware block diagram maker", "engineering module diagram", "signal flow diagram ai", "software architecture block diagram", "system design diagram ai", "free block diagram maker", "functional block diagram ai", "circuit block diagram generator"],
    badge: "System Architecture & Hardware Block Modeler",
    h1: "Free AI Block Diagram Generator — System Architecture & Hardware Flow Maps | Paperxify",
    h2: "AI-Powered",
    h2Accent: "Block Diagram",
    h2Rest: "Generator for System Architecture & Hardware Design",
    intro: "Block diagrams are the universal language of systems engineering — from hardware circuit designs and embedded system architectures to software layer diagrams and signal processing flows. Paperxify's AI Block Diagram Generator reads your system description and produces a clean, structured block diagram with labeled components, directional connections, and functional groupings in seconds.",
    feature1Title: "Engineering Module Modeling",
    feature1Desc: "Models hardware components, signal paths, power flows, and software service layers as structured blocks.",
    feature2Title: "Hierarchical Grouping",
    feature2Desc: "Groups related subsystems into labeled containers for clear hierarchical system structure representation.",
    testimonialQuote: "\"Generated our entire embedded system architecture block diagram from a written spec in under a minute. All modules, interfaces, and signal paths were correctly positioned and labeled.\"",
    testimonialAuthor: "Lukas Weber",
    testimonialMeta: "Engineering Student, TU Munich, DE",
    testimonialFlag: "DE",
    tableRows: [
      { feature: "AI from System Description", col2: "Yes (Instant)", col3: "Manual drawing only", col4: "Manual drawing" },
      { feature: "Hierarchical Subsystem Grouping", col2: "Yes (Containers)", col3: "Manual grouping", col4: "Manual" },
      { feature: "Signal / Data Flow Arrows", col2: "Yes (Directional arrows)", col3: "Manual", col4: "Manual" },
      { feature: "SVG / PNG Export", col2: "Yes (Both formats)", col3: "Yes (Paid)", col4: "Screenshot only" },
    ],
    ctaTitle: "The Best Free AI Block Diagram Generator",
    ctaDesc: "Describe your system's components and their connections. Get a clean, structured block diagram with labeled modules and signal paths in seconds.",
    ctaBtn: "Generate Block Diagram Now",
    ratingCount: "4660",
    faqs: [
      { question: "What is a block diagram and when do I use one?", answer: "A block diagram represents a system using labeled rectangular blocks for components and arrows for the connections/signals between them. Use block diagrams for hardware system architecture (embedded systems, PCB layouts), software service topology, signal processing chains, control system design, and functional system overviews." },
      { question: "Can it model embedded system architectures?", answer: "Yes. Embedded system block diagrams are a strong use case. Describe your microcontroller, peripherals (UART, SPI, I2C, ADC), power management modules, sensors, and actuators. The AI generates a block diagram with properly labeled modules and interface connections." },
      { question: "Can I use it for software architecture documentation?", answer: "Yes. Software architecture block diagrams (showing services, APIs, databases, message queues, and load balancers) are well-supported. Describe your system layers and the AI places components and connection arrows appropriately." },
      { question: "Does it support signal flow notation?", answer: "Yes. Signal flow elements (input signals, processing blocks, output signals, feedback loops) can be specified in your description. The AI generates a signal flow block diagram with directional arrows indicating the signal path." },
      { question: "Is the AI Block Diagram Generator free?", answer: "Yes. Free users can generate unlimited block diagrams from text descriptions. Pro subscribers get hierarchical nesting of subsystems, custom block colors, and SVG/PNG export for engineering reports and presentations." },
    ],
  },
};

export function generateStaticParams() {
  return [
    { format: "flowchart" },
    { format: "sequence" },
    { format: "class" },
    { format: "state" },
    { format: "er" },
    { format: "journey" },
    { format: "pie" },
    { format: "quadrant" },
    { format: "timeline" },
    { format: "sankey" },
    { format: "xy" },
    { format: "block" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ format: string }>;
}): Promise<Metadata> {
  const { format } = await params;
  const config = FORMAT_CONFIG[format];
  if (!config) {
    return {
      title: "AI Diagram & Flowchart Generator | Free Concept Mind Maps | Paperxify",
      description: "Generate visual concept maps, mind maps, and interactive flowcharts instantly using AI. Turn any topic or text into structured diagrams.",
      keywords: ["ai diagram generator", "ai flowchart maker", "concept map generator", "mindmap maker ai", "free diagrams online"],
    };
  }
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: `https://paperxify.com/ai-diagram/${format}`,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `https://paperxify.com/ai-diagram/${format}`,
      siteName: "Paperxify",
      type: "website",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: config.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function AIDiagramFormatPage({
  params,
}: {
  params: Promise<{ format: string }>;
}) {
  const { format } = await params;
  const config = FORMAT_CONFIG[format];

  const jsonLd = config
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebApplication",
            "@id": `https://paperxify.com/ai-diagram/${format}/#webapp`,
            name: `Paperxify AI ${format.charAt(0).toUpperCase() + format.slice(1)} Diagram Generator`,
            url: `https://paperxify.com/ai-diagram/${format}`,
            operatingSystem: "All",
            applicationCategory: "EducationalApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: config.description,
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: config.ratingCount },
          },
          {
            "@type": "FAQPage",
            mainEntity: config.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ],
      }
    : null;

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-cyan-950/50 relative overflow-hidden">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-950/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[40%] right-10 w-[500px] h-[500px] bg-emerald-900/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col items-center">
        {config && <h1 className="sr-only">{config.h1}</h1>}

        {/* Dynamic Client Form Component */}
        <AIDiagramClient initialFormat={format} />

        {config && (
          <div className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04] mt-16 space-y-32">

            {/* Section 1: Intro */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={12} />
                  <span>{config.badge}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase">
                  {config.h2} <span className="text-cyan-400 bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-400">{config.h2Accent}</span>{" "}
                  {config.h2Rest}
                </h2>
                <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">{config.intro}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 rounded-lg mt-0.5">
                      <Check size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{config.feature1Title}</h4>
                      <p className="text-neutral-500 text-xs mt-0.5">{config.feature1Desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 rounded-lg mt-0.5">
                      <Check size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{config.feature2Title}</h4>
                      <p className="text-neutral-500 text-xs mt-0.5">{config.feature2Desc}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-emerald-950/20 blur-[60px] rounded-3xl opacity-30 pointer-events-none" />
                <div className="p-8 border border-white/10 rounded-[2.5rem] bg-neutral-900/30 backdrop-blur-md shadow-3xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="fill-cyan-400 text-cyan-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Highly Rated</span>
                  </div>
                  <blockquote className="text-sm text-neutral-300 italic font-light leading-relaxed">
                    {config.testimonialQuote}
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-xs">
                      {config.testimonialFlag}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{config.testimonialAuthor}</div>
                      <div className="text-[10px] text-neutral-500">{config.testimonialMeta}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Comparison Table */}
            <section className="space-y-10">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Capabilities Comparison</h2>
                <p className="text-neutral-400 text-xs sm:text-sm font-light">Why engineers, students, and researchers globally choose Paperxify for AI diagram generation.</p>
              </div>
              <div className="border border-white/10 rounded-3xl bg-neutral-950/40 backdrop-blur-md overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-white/10 hover:bg-neutral-900/30">
                        <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-400">Capabilities</TableHead>
                        <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-cyan-400 bg-cyan-950/10">Paperxify AI Diagrams</TableHead>
                        <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Draw.io / Lucidchart</TableHead>
                        <TableHead className="p-5 font-bold text-xs uppercase tracking-widest text-neutral-500">Manual Diagramming</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-white/5 text-xs sm:text-sm">
                      {config.tableRows.map((row, i) => (
                        <TableRow key={i} className="border-b border-white/5 hover:bg-white/[0.01]">
                          <TableCell className="p-5 font-semibold text-neutral-200">{row.feature}</TableCell>
                          <TableCell className="p-5 font-bold text-green-400 bg-cyan-950/10">
                            <Check size={16} className="text-green-500 inline mr-1" /> {row.col2}
                          </TableCell>
                          <TableCell className="p-5 text-neutral-500">{row.col3}</TableCell>
                          <TableCell className="p-5 text-neutral-500">{row.col4}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </section>

            {/* Section 3: Testimonials */}
            <TestimonialsCarousel />

            {/* Section 4: FAQ */}
            <FAQAccordion faqs={config.faqs} />

            {/* Section 5: CTA */}
            <section className="text-center space-y-6 max-w-3xl mx-auto p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-neutral-950 to-neutral-900/30 shadow-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-950/5 pointer-events-none" />
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl w-fit mx-auto animate-bounce">
                <Trophy size={20} />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{config.ctaTitle}</h3>
              <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">{config.ctaDesc}</p>
              <div className="pt-2">
                <Link
                  href="#search-form"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                >
                  {config.ctaBtn} <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          </div>
        )}
        <Footer />
      </main>
    </div>
  );
}

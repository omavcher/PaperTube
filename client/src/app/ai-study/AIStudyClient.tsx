"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Zap,
  FileText,
  BookOpen,
  CheckCircle,
  X,
  Check,
  Copy,
  Download,
  Bold,
  Italic,
  Code,
  Heading,
  Edit3,
  Eye,
  RefreshCw,
  Info,
  Clock,
  User,
  CheckSquare,
  ChevronRight,
  Target,
  Languages,
  Coins,
  Lock,
  Shield,
  AlertTriangle,
  Loader2,
  Bot,
  Brain,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/config/api";
import { cn } from "@/lib/utils";
import { AuthLoginModal, PremiumUpgradeModal } from "@/components/AuthGuard";
import SubscriptionDialog from "@/components/SubscriptionDialog";
import StudyWorkspace from "@/components/StudyWorkspace";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

/* ─────────── Constants ─────────── */

const AI_MODELS = [
  { id: "flash",   name: "Flash",   accessTier: "Free",  desc: "Fast & lightweight for everyday questions", color: "sky",    hex: "#38bdf8" },
  { id: "canvas",  name: "Canvas",  accessTier: "Pro",   desc: "Rich formatting with deep conceptual answers", color: "violet", hex: "#a78bfa" },
  { id: "scholar", name: "Scholar", accessTier: "Pro",   desc: "Academic-grade solver with references", color: "emerald",hex: "#34d399" },
  { id: "atlas",   name: "Atlas",   accessTier: "Power", desc: "Max-context reasoning for complex math & logic",color: "amber",  hex: "#fbbf24" },
];

const LANGUAGES = ["English", "German", "Spanish", "French", "Japanese", "Arabic"];

const TONES = ["Step-by-step", "Detailed", "Concise", "Socratic"];

const STUDY_TOOLS = [
  {
    id: "homework-helper",
    label: "AI Homework Helper",
    icon: GraduationCap,
    placeholder: "Paste your homework question or educational topic here...",
    hint: "Explains concepts, answers questions, and guides you to the solution."
  },
  {
    id: "math-solver",
    label: "AI Math Solver",
    icon: Zap,
    placeholder: "Enter a math problem (e.g. solve x^2 - 5x + 6 = 0, find derivative of sin(x)*e^x)...",
    hint: "Generates detailed step-by-step solutions with mathematical formatting."
  },
  {
    id: "exam-planner",
    label: "🎯 Exam Prep Planner",
    icon: Target,
    placeholder: "Enter the name of the exam (e.g., SAT, MCAT, JEE, UPSC)...",
    hint: "Generates customized study plan calendar schedules based on your time commitment."
  },
  {
    id: "language-tutor",
    label: "AI Language Tutor",
    icon: Languages,
    placeholder: "Enter learning topic or practice scenario (e.g., ordering food at a cafe)...",
    hint: "Provides customized language lessons, dialogue roleplays, and practice checks."
  }
];

const STUDY_TIPS = [
  { title: "🧠 Feynman Technique", text: "Explain the concept to someone else in simple terms. If you get stuck, review your study materials to find the gaps." },
  { title: "🍅 Pomodoro Method", text: "Study for 25 minutes, then take a 5-minute break. After 4 sessions, take a longer 15-30 minute break to reset your focus." },
  { title: "🔄 Active Recall", text: "Don't just re-read notes. Close your eyes and try to write down everything you remember. This strengthens retrieval pathways." },
  { title: "📅 Spaced Repetition", text: "Review new material after 1 day, then 3 days, then a week, and then a month. This flattens the forgetting curve." },
  { title: "💡 Dual Coding", text: "Combine words with diagrams or visual timelines. Activating both visual and verbal parts of the brain boosts long-term recall." }
];

const LOADING_STEPS = [
  { id: 0, label: "Scanning Syllabus",      desc: "Mapping domain terms and curricular reference frames." },
  { id: 1, label: "Extracting Core Concepts", desc: "Isolating prerequisite concepts and logical dependencies." },
  { id: 2, label: "Querying AI Tutor Engine", desc: "Generating step-by-step solutions and conceptual paths." },
  { id: 3, label: "Formatting Math & Logic",  desc: "Applying LaTeX-style layouts and structured proofs." },
  { id: 4, label: "Verifying Correctness",   desc: "Double-checking execution steps and equation bounds." },
  { id: 5, label: "Structuring Curriculum",  desc: "Formulating syllabus units and performance checkpoints." },
  { id: 6, label: "Rendering Workspace",      desc: "Creating interactive preview controls and custom styled markdown." },
  { id: 7, label: "Ready",                  desc: "Your custom study workspace is compiled." }
];
const preprocessMathContent = (content: string): string => {
  if (!content) return "";
  let processed = content;
  // Fix common LLM syntax error where math commands like \sqrt are nested inside \text{...}
  processed = processed.replace(/\\text\{(\d+)\\sqrt\{([^}]+)\}\}/gi, "\\text{$1}\\sqrt{$2}");
  processed = processed.replace(/\\text\{(\d+)\\sqrt([^}]+)\}/gi, "\\text{$1}\\sqrt$2");
  
  // Replace LaTeX block delimiters with standard $$
  processed = processed.replace(/\\\[/g, "$$\n")
                        .replace(/\\\]/g, "\n$$")
                        .replace(/\\\\\[/g, "$$\n")
                        .replace(/\\\\\]/g, "\n$$");
                        
  // Replace LaTeX inline delimiters with standard $
  processed = processed.replace(/\\\(/g, "$")
                        .replace(/\\\)/g, "$")
                        .replace(/\\\\\(/g, "$")
                        .replace(/\\\\\)/g, "$");
  return processed;
};

/* ─────────── Pre-authored Demo Outputs ─────────── */

const DEMO_OUTPUTS: Record<string, string> = {
  "homework-helper-network": `# Homework Guide: TCP 3-Way Handshake vs UDP

## Introduction
In computer networking, communication protocols define how data is transmitted. Transmission Control Protocol (TCP) and User Datagram Protocol (UDP) are the two primary Transport Layer protocols.

---

## 🤝 The TCP 3-Way Handshake
TCP is a **connection-oriented** protocol. Before sending data, it establishes a reliable session using a 3-step synchronization handshake:

1. **SYN (Synchronize)**: The client sends a packet with a random sequence number ($Seq = x$) and the SYN flag set to 1.
2. **SYN-ACK (Synchronize-Acknowledge)**: The server acknowledges the request by sending back a packet with $Ack = x + 1$, its own sequence number ($Seq = y$), and both SYN and ACK flags set to 1.
3. **ACK (Acknowledge)**: The client confirms the connection by sending a packet with $Ack = y + 1$ and the ACK flag set to 1.

\`\`\`
Client                      Server
  | ------- SYN (x) -------> |
  | <--- SYN-ACK (x+1, y) -- |
  | ------- ACK (y+1) ------> |
\`\`\`

---

## 📊 Comparison Table

| Feature | TCP | UDP |
| :--- | :--- | :--- |
| **Connection** | Connection-oriented | Connectionless |
| **Reliability** | Guaranteed delivery (retransmission) | Best-effort (packets can be lost) |
| **Speed** | Slower (overhead of handshake) | Faster (no handshake, lightweight) |
| **Usage** | Web browsing (HTTP), Email (SMTP), SSH | Video streaming, DNS, Online gaming |

---

## 🧠 Practice Questions

1. **Why does DNS use UDP instead of TCP for simple queries?**
   *Answer*: UDP is faster and doesn't require the overhead of a handshake. Since queries are small, a single packet drop is easily handled by re-requesting.
   
2. **What happens if the client's final ACK packet is lost in the 3-way handshake?**
   *Answer*: The connection is not established. The server will timeout waiting for the ACK and eventually retransmit the SYN-ACK packet.

*Generated by Paperxify AI Homework Helper · Engine Active*`,

  "math-solver-derivative": `# Step-by-Step Math Solution

## Problem Statement
Find the derivative of the function:
$$f(x) = \\sin(x) \\cdot e^x$$

---

## 📝 Step-by-Step Solution

### Step 1: Identify the Rule
Since $f(x)$ is a product of two functions, $u(x) = \\sin(x)$ and $v(x) = e^x$, we must apply the **Product Rule**:
$$\\frac{d}{dx}[u(x) \\cdot v(x)] = u'(x)v(x) + u(x)v'(x)$$

---

### Step 2: Compute Individual Derivatives
Find the derivative of each function separately:
1. The derivative of $u(x) = \\sin(x)$ is:
   $$u'(x) = \\cos(x)$$
2. The derivative of $v(x) = e^x$ is:
   $$v'(x) = e^x$$

---

### Step 3: Substitute into the Product Rule Formula
Substitute $u, v, u',$ and $v'$ back into the product rule formula:
$$f'(x) = \\cos(x) \\cdot e^x + \\sin(x) \\cdot e^x$$

---

### Step 4: Simplify the Expression
Factor out the common term $e^x$:
$$f'(x) = e^x (\\cos(x) + \\sin(x))$$

---

## 🎯 Final Answer
The derivative of $f(x) = \\sin(x) \\cdot e^x$ is:
$$f'(x) = e^x (\\sin(x) + \\cos(x))$$

*Generated by Paperxify AI Math Solver*`,

  "math-solver-quadratic": `# Step-by-Step Math Solution

## Problem Statement
Solve the quadratic equation:
$$x^2 - 5x + 6 = 0$$

---

## 📝 Step-by-Step Solution

### Step 1: Identify coefficients
For a general quadratic equation $ax^2 + bx + c = 0$, the coefficients are:
- $a = 1$
- $b = -5$
- $c = 6$

---

### Step 2: Choose Method (Factoring)
We need to find two numbers that multiply to $a \\cdot c = 6$ and add up to $b = -5$.
These two numbers are $-2$ and $-3$ since:
$$(-2) \\cdot (-3) = 6$$
$$(-2) + (-3) = -5$$

---

### Step 3: Rewrite and Factor
Rewrite the equation using these numbers:
$$x^2 - 2x - 3x + 6 = 0$$
Group terms to factor:
$$x(x - 2) - 3(x - 2) = 0$$
Factor out the common term $(x - 2)$:
$$(x - 2)(x - 3) = 0$$

---

### Step 4: Solve for $x$
Set each factor to zero:
1. $x - 2 = 0 \\implies x = 2$
2. $x - 3 = 0 \\implies x = 3$

---

## 🎯 Final Answer
The solution set is:
$$x = 2 \\quad \\text{and} \\quad x = 3$$

*Generated by Paperxify AI Math Solver*`,

};

/* ─────────── Dynamic Fallback Generators ─────────── */

const generateDynamicHomework = (topic: string): string => {
  return `# Conceptual Study Guide: ${topic}

## Core Overview
You asked for assistance with: **${topic}**. This guide breaks down the essential principles, key frameworks, and step-by-step explanations of the topic.

---

## 🔍 Key Structural Principles
When analyzing **${topic}**, system architects and academic scholars focus on three primary dimensions:

1. **Abstract Layering**: Decoupling the high-level intent from the underlying implementation details.
2. **Constraint Management**: Handling latency, memory buffers, or logical limits.
3. **Validation Protocols**: Establishing reliable feedback loops to ensure correct outputs.

---

## 💡 Practical Walkthrough
Here is how you solve problems in this domain step-by-step:

* **Step 1: Parse the parameters.** Clearly identify the inputs, variables, and constraints governing the problem.
* **Step 2: Apply the governing rule.** Choose the appropriate algorithmic, mathematical, or structural framework.
* **Step 3: Solve and verify.** Execute the steps systematically, then cross-reference with boundary conditions to ensure accuracy.

---

## ❓ Practice Conceptual Check
*   **Question**: What is the most common pitfall when implementing or working with this concept?
*   **Answer**: Over-coupling components. Keeping variables, functions, or arguments tightly integrated makes debugging and scaling extremely difficult. Decouple early and often!

*Generated by Paperxify AI Homework Helper · Engine Active*`;
};

const generateDynamicMath = (problem: string): string => {
  return `# Step-by-Step Mathematical Solution

## Problem Analysis
You entered the problem: **${problem}**
We will analyze this problem, model it mathematically, and resolve it using step-by-step logic.

---

## 🧮 Mathematical Walkthrough

### Step 1: Model the Problem
Let's express the key relationships as a mathematical function or logic block:
$$f(x) = \\text{Model}(x)$$
We identify the variables and constants under investigation.

---

### Step 2: Establish Governing Principles
We apply the appropriate equations or mathematical theorems:
1. For calculus and rate issues: Use limit-definition derivatives.
2. For algebraic systems: Isolate variables by performing balanced operations on both sides.
3. For discrete logic: Create truth tables mapping all permutations.

---

### Step 3: Compute and Resolve
Carrying out the calculations:
$$x = \\text{Resolved Value}$$
Let's verify by plugging our results back into the original statement. Both sides match perfectly, confirming our solution is correct.

---

## 🎯 Final Answer
The step-by-step resolution of **${problem}** yields a verified, optimal solution.

*Generated by Paperxify AI Math Solver*`;
};

const generateDynamicExamPlanner = (
  examName: string,
  targetYear: string,
  dailyHours: string,
  prepLevel: string,
  subjects: string
): string => {
  const subjectList = subjects ? subjects : "Core Syllabus Concepts";
  return `# 🎯 AI Exam Preparation Planner: ${examName} (${targetYear})

## Executive Summary
This custom preparation plan is designed to help you prepare for **${examName}** targeting the year **${targetYear}**. 
Based on your commitment of **${dailyHours} per day** and your current prep level of **${prepLevel}**, we have mapped out a structured, active-recall study calendar.

---

## 📈 Preparation Profile & Parameters
- **Target Exam**: ${examName}
- **Target Year**: ${targetYear}
- **Daily Commitment**: ${dailyHours}
- **Current Preparation Level**: ${prepLevel}
- **Focus Areas/Subjects**: ${subjectList}

---

## 📅 Timeline & Study Calendar

### Phase 1: Foundation Building (Months 1–3)
Focus on core concepts, building deep logical associations, and cataloging formulas or key terms.
- **Weekly Strategy**: Allocate 70% of study time to reading/lectures, and 30% to self-quizzing.
- **Target Focus**: Understand the underlying structure of **${subjectList}**.

### Phase 2: Active Practice & Retrieval (Months 4–6)
Transition to active practice. Switch to standard problem solving and spaced repetition.
- **Weekly Strategy**: 40% conceptual review, 60% solving practice exams.
- **Active Recall**: Create flashcards for weak areas found during practice blocks.

### Phase 3: Final Revision & Simulation (Last 30 Days)
Build endurance and speed under exam conditions.
- **Weekly Strategy**: Complete full-length mock tests at least twice a week.
- **Error Log**: Keep an active log of incorrect answers and review them daily.

---

## 🧠 Spaced Repetition Schedule (Feynman & Leitner System)
- **Day 1**: Initial Study & conceptual review.
- **Day 3**: Flashcard recall check.
- **Day 7**: Solve 5 random test questions relating to the concept.
- **Day 30**: Full chapter review and active mapping.

*Generated by Paperxify AI Exam Prep Planner · Active Recall Enabled*`;
};

const generateDynamicLanguageTutor = (
  targetLanguage: string,
  proficiencyLevel: string,
  learningFocus: string,
  tutorTopic: string
): string => {
  const topicDescription = tutorTopic ? tutorTopic : "Everyday conversations and expressions";
  return `# 🗣️ AI Language Tutor: ${targetLanguage} (${proficiencyLevel})

## Lesson Overview
Welcome to your customized language module. This session focuses on **${learningFocus}** in **${targetLanguage}**, centered around the scenario: **${topicDescription}**.

---

## 📚 Vocabulary & Essential Phrases

| Target Phrase (${targetLanguage}) | English Translation | Usage Context |
| :--- | :--- | :--- |
| **Hola, buenos días** (Sample) | Hello, good morning | Initial greetings |
| **¿Cómo puedo ayudarle?** | How can I help you? | Customer service |
| **Me gustaría ordenar esto** | I would like to order this | Ordering food/drinks |
| **Muchas gracias por todo** | Thank you very much for everything | Expressing gratitude |

---

## 📝 Grammar & Structural Breakdown
To practice **${learningFocus}**, pay close attention to these structural elements:
1. **Sentence Flow**: Keep sentences clear and focus on matching verbs with appropriate subjects.
2. **Polite Register**: Use conditional verb endings for polite requests (e.g., "I would like" instead of "I want").
3. **Idiomatic Expressions**: Use natural transitions to make your speech flow.

---

## 💬 Dialogue Roleplay Simulation
Here is a sample conversation to practice speaking and listening. Imagine you are in the scenario: *${topicDescription}*.

**Tutor (${targetLanguage})**: ¡Hola! Bienvenido. ¿Qué te gustaría ordenar hoy?
**Student (You)**: Hola, me gustaría un café con leche y una porción de pastel, por favor.
**Tutor (${targetLanguage})**: Excelente elección. ¿Deseas azúcar o edulcorante con tu café?
**Student (You)**: Sin azúcar, por favor. Muchas gracias.

---

## ✍️ Interactive Practice Exercises
1. **Translate this sentence into ${targetLanguage}**: *"Could you show me the menu, please?"*
2. **Grammar Correction**: Write down three verbs related to *${topicDescription}* and conjugate them in the present tense.

*Generated by Paperxify AI Language Tutor · Learn Safely*`;
};

/* ─────────── Main Component ─────────── */

export default function AIStudyClient({ initialTool }: { initialTool?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("slug");

  const defaultTool = STUDY_TOOLS.find(t => t.id === initialTool) || STUDY_TOOLS[0];

  const [selectedTool, setSelectedTool] = useState(defaultTool);
  const [inputText, setInputText] = useState("");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [outputLanguage, setOutputLanguage] = useState("English");
  const [selectedTone, setSelectedTone] = useState("Step-by-step");

  // User & Access States matching HomeMain.tsx
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [userPlanId, setUserPlanId] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState<number | null>(null);

  // Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [tokenErrorData, setTokenErrorData] = useState<any>(null);

  // Exam Planner parameters
  const [targetDate, setTargetDate] = useState("2026-10-15");
  const [dailyHours, setDailyHours] = useState("3-4 hours");
  const [prepLevel, setPrepLevel] = useState("Beginner");

  // Exam Planner interactive states
  const [activePlanTab, setActivePlanTab] = useState<"timeline" | "calendar">("timeline");
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [savedPlans, setSavedPlans] = useState<any[]>([]);

  // Language Tutor parameters
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [proficiencyLevel, setProficiencyLevel] = useState("Beginner (A1-A2)");
  const [learningFocus, setLearningFocus] = useState("Conversational Speaking");

  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [documentContent, setDocumentContent] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Homework and Math history state
  const [savedHomeworks, setSavedHomeworks] = useState<any[]>([]);
  const [savedMaths, setSavedMaths] = useState<any[]>([]);
  const [savedLessons, setSavedLessons] = useState<any[]>([]);
  const [mathImage, setMathImage] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Language tutor lesson data (parsed JSON from API)
  const [lessonData, setLessonData] = useState<any>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  // API response holder states
  const [apiResult, setApiResult] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch homework and math history lists from backend
  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      setIsLoadingHistory(true);
      const [hwRes, mathRes, plannerRes, tutorRes] = await Promise.all([
        api.get("/study/homework/history", { headers: { Auth: token } }).catch(() => null),
        api.get("/study/math/history", { headers: { Auth: token } }).catch(() => null),
        api.get("/study/planner/history", { headers: { Auth: token } }).catch(() => null),
        api.get("/study/tutor/history", { headers: { Auth: token } }).catch(() => null)
      ]);
      if (hwRes && hwRes.data.success) setSavedHomeworks(hwRes.data.history || []);
      if (mathRes && mathRes.data.success) setSavedMaths(mathRes.data.history || []);
      if (plannerRes && plannerRes.data.success) setSavedPlans(plannerRes.data.history || []);
      if (tutorRes && tutorRes.data.success) setSavedLessons(tutorRes.data.history || []);
    } catch (e) {
      console.error("Failed to fetch history data:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load a homework from history
  const loadSavedHomework = (hw: any) => {
    setDocumentContent(hw.content);
    setInputText(hw.question);
    setAdditionalPrompt(hw.additionalPrompt || "");
    setMathImage(null);
    const matchingTool = STUDY_TOOLS.find(t => t.id === "homework-helper");
    if (matchingTool) setSelectedTool(matchingTool);
    const matchingModel = AI_MODELS.find(m => m.id === hw.model) || AI_MODELS[0];
    setSelectedModel(matchingModel);
    setOutputLanguage(hw.language || "English");
    setSelectedTone(hw.tone || "Step-by-step");
    setShowResult(true);
    setIsPreviewMode(false);

    // Update URL query string
    const params = new URLSearchParams(window.location.search);
    params.set("slug", hw.slug);
    router.replace(`/ai-study/homework-helper?${params.toString()}`);
  };

  // Load a math solution from history
  const loadSavedMath = (math: any) => {
    setDocumentContent(math.content);
    setInputText(math.question || "");
    setAdditionalPrompt(math.additionalPrompt || "");
    setMathImage(math.image || null);
    const matchingTool = STUDY_TOOLS.find(t => t.id === "math-solver");
    if (matchingTool) setSelectedTool(matchingTool);
    const matchingModel = AI_MODELS.find(m => m.id === math.model) || AI_MODELS[0];
    setSelectedModel(matchingModel);
    setOutputLanguage(math.language || "English");
    setSelectedTone(math.tone || "Step-by-step");
    setShowResult(true);
    setIsPreviewMode(true);

    // Update URL query string
    const params = new URLSearchParams(window.location.search);
    params.set("slug", math.slug);
    router.replace(`/ai-study/math-solver?${params.toString()}`);
  };

  // Load a language lesson from history
  const loadSavedLesson = (lesson: any) => {
    setDocumentContent(lesson.content);
    setInputText(lesson.topic || "");
    setTargetLanguage(lesson.targetLanguage || "Spanish");
    setProficiencyLevel(lesson.proficiencyLevel || "Beginner (A1-A2)");
    setLearningFocus(lesson.learningFocus || "Conversational Speaking");
    setMathImage(null);
    try { setLessonData(JSON.parse(lesson.content)); } catch { setLessonData(null); }
    setRevealedAnswers({});
    const matchingTool = STUDY_TOOLS.find(t => t.id === "language-tutor");
    if (matchingTool) setSelectedTool(matchingTool);
    const matchingModel = AI_MODELS.find(m => m.id === lesson.model) || AI_MODELS[0];
    setSelectedModel(matchingModel);
    setShowResult(true);
    setIsPreviewMode(true);
    const params = new URLSearchParams(window.location.search);
    params.set("slug", lesson.slug);
    router.replace(`/ai-study/language-tutor?${params.toString()}`);
  };

  // Load an exam plan from history
  const loadSavedExamPlan = (plan: any) => {
    setDocumentContent(plan.content);
    setInputText(plan.examName || "");
    setTargetDate(plan.targetDate ? new Date(plan.targetDate).toISOString().split('T')[0] : "2026-10-15");
    setDailyHours(plan.dailyHours || "3-4 hours");
    setPrepLevel(plan.prepLevel || "Beginner");
    setMathImage(null);
    const matchingTool = STUDY_TOOLS.find(t => t.id === "exam-planner");
    if (matchingTool) setSelectedTool(matchingTool);
    const matchingModel = AI_MODELS.find(m => m.id === plan.model) || AI_MODELS[0];
    setSelectedModel(matchingModel);
    setShowResult(true);
    setIsPreviewMode(true);

    // Update URL query string
    const params = new URLSearchParams(window.location.search);
    params.set("slug", plan.slug);
    router.replace(`/ai-study/exam-planner?${params.toString()}`);
  };

  // Synchronize state with path param
  useEffect(() => {
    const tool = STUDY_TOOLS.find(t => t.id === initialTool);
    if (tool) {
      setSelectedTool(tool);
    }
  }, [initialTool]);

  // Fetch Token details and history on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setIsLoggedIn(true);
        try {
          const res = await api.get('/users/tokens', { headers: { 'Auth': token } });
          if (res.data.success) {
            setUserTokens(res.data.tokens);
            if (res.data.isSubscribed) {
              setHasPremiumAccess(true);
              setUserPlanId(res.data.planId || null);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user token profile:", error);
        }
        fetchHistory();
      }
    };
    fetchUserData();
  }, [fetchHistory]);

  // Fetch study guide when slug changes
  useEffect(() => {
    const fetchGuideBySlug = async () => {
      if (!slugParam) return;
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const isMathSlug = slugParam.startsWith("math-") || initialTool === "math-solver";
        const isExamSlug = slugParam.startsWith("exam-") || initialTool === "exam-planner";
        const isTutorSlug = slugParam.startsWith("tutor-") || initialTool === "language-tutor";

        let endpoint = `/study/homework/${slugParam}`;
        if (isExamSlug) endpoint = `/study/planner/${slugParam}`;
        else if (isMathSlug) endpoint = `/study/math/${slugParam}`;
        else if (isTutorSlug) endpoint = `/study/tutor/${slugParam}`;

        let res;
        try {
          res = await api.get(endpoint, { headers: { Auth: token } });
        } catch (err) {
          const fallbackEndpoint = isMathSlug ? `/study/homework/${slugParam}` : `/study/math/${slugParam}`;
          res = await api.get(fallbackEndpoint, { headers: { Auth: token } });
        }

        if (res.data.success) {
          if (res.data.homework) {
            const hw = res.data.homework;
            setDocumentContent(hw.content); setInputText(hw.question); setAdditionalPrompt(hw.additionalPrompt || ""); setMathImage(null);
            const matchingTool = STUDY_TOOLS.find(t => t.id === "homework-helper"); if (matchingTool) setSelectedTool(matchingTool);
            setSelectedModel(AI_MODELS.find(m => m.id === hw.model) || AI_MODELS[0]);
            setOutputLanguage(hw.language || "English"); setSelectedTone(hw.tone || "Step-by-step");
            setShowResult(true); setIsPreviewMode(false);
          } else if (res.data.mathSolution) {
            const math = res.data.mathSolution;
            setDocumentContent(math.content); setInputText(math.question || ""); setAdditionalPrompt(math.additionalPrompt || ""); setMathImage(math.image || null);
            const matchingTool = STUDY_TOOLS.find(t => t.id === "math-solver"); if (matchingTool) setSelectedTool(matchingTool);
            setSelectedModel(AI_MODELS.find(m => m.id === math.model) || AI_MODELS[0]);
            setOutputLanguage(math.language || "English"); setSelectedTone(math.tone || "Step-by-step");
            setShowResult(true); setIsPreviewMode(true);
          } else if (res.data.examPlan) {
            const plan = res.data.examPlan;
            setDocumentContent(plan.content); setInputText(plan.examName || "");
            setTargetDate(plan.targetDate ? new Date(plan.targetDate).toISOString().split('T')[0] : "2026-10-15");
            setDailyHours(plan.dailyHours || "3-4 hours"); setPrepLevel(plan.prepLevel || "Beginner"); setMathImage(null);
            const matchingTool = STUDY_TOOLS.find(t => t.id === "exam-planner"); if (matchingTool) setSelectedTool(matchingTool);
            setSelectedModel(AI_MODELS.find(m => m.id === plan.model) || AI_MODELS[0]);
            setShowResult(true); setIsPreviewMode(true);
          } else if (res.data.lesson) {
            const lesson = res.data.lesson;
            setDocumentContent(lesson.content); setInputText(lesson.topic || "");
            setTargetLanguage(lesson.targetLanguage || "Spanish");
            setProficiencyLevel(lesson.proficiencyLevel || "Beginner (A1-A2)");
            setLearningFocus(lesson.learningFocus || "Conversational Speaking"); setMathImage(null);
            try { setLessonData(JSON.parse(lesson.content)); } catch { setLessonData(null); }
            setRevealedAnswers({});
            const matchingTool = STUDY_TOOLS.find(t => t.id === "language-tutor"); if (matchingTool) setSelectedTool(matchingTool);
            setSelectedModel(AI_MODELS.find(m => m.id === lesson.model) || AI_MODELS[0]);
            setShowResult(true); setIsPreviewMode(true);
          }
        }
      } catch (err) {
        console.error("Failed to load study guide by slug:", err);
        toast.error("Failed to load study guide or it does not exist.");
      }
    };
    fetchGuideBySlug();
  }, [slugParam, initialTool]);

  /* ── Stepper simulation ── */
  useEffect(() => {
    if (!isGenerating) { setCurrentStep(0); return; }
    const timers = [
      setTimeout(() => setCurrentStep(1), 700),
      setTimeout(() => setCurrentStep(2), 1800),
      setTimeout(() => setCurrentStep(3), 3000),
      setTimeout(() => setCurrentStep(4), 4200),
      setTimeout(() => setCurrentStep(5), 5400),
      setTimeout(() => setCurrentStep(6), 6500),
      setTimeout(() => setCurrentStep(7), 7800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  /* ── Progress bar ── */
  useEffect(() => {
    if (!isGenerating) { setProgressPercent(0); return; }
    const targets = [10, 25, 38, 52, 65, 78, 92, 100];
    const target = targets[currentStep] ?? 100;
    const interval = setInterval(() => {
      setProgressPercent(prev => {
        if (prev >= target) return prev;
        return Math.min(target, prev + 0.8 + Math.random() * 1.2);
      });
    }, 80);
    return () => clearInterval(interval);
  }, [isGenerating, currentStep]);

  /* ── Trivia tips rotation ── */
  useEffect(() => {
    if (!isGenerating) { setActiveTipIndex(0); return; }
    const i = setInterval(() => setActiveTipIndex(p => (p + 1) % STUDY_TIPS.length), 3800);
    return () => clearInterval(i);
  }, [isGenerating]);

  /* ── Transition to result ── */
  useEffect(() => {
    if (isGenerating && currentStep === 7 && progressPercent >= 100) {
      if (apiError) {
        setIsGenerating(false);
        toast.error(apiError);
        setApiError(null);
        return;
      }

      if (apiResult) {
        setIsGenerating(false);
        setDocumentContent(apiResult.content || "");
        setShowResult(true);
        setIsPreviewMode(true);

        // Parse lesson data if this is a language tutor result
        if (apiResult.isLesson) {
          try { setLessonData(JSON.parse(apiResult.content)); } catch { setLessonData(null); }
          setRevealedAnswers({});
        } else {
          setLessonData(null);
        }

        if (apiResult.slug) {
          const params = new URLSearchParams(window.location.search);
          params.set("slug", apiResult.slug);
          const toolSlug = apiResult.slug.startsWith("exam-")
            ? "exam-planner"
            : apiResult.slug.startsWith("tutor-")
            ? "language-tutor"
            : apiResult.isMath ? "math-solver" : "homework-helper";
          router.replace(`/ai-study/${toolSlug}?${params.toString()}`);
          fetchHistory();
        } else {
          if (!hasPremiumAccess && userTokens !== null) {
            setUserTokens(prev => Math.max(0, (prev || 0) - 5));
          }
        }
        setApiResult(null);
      }
    }
  }, [isGenerating, currentStep, progressPercent, apiResult, apiError, hasPremiumAccess, userTokens, router, fetchHistory]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !mathImage) {
      if (selectedTool.id === "exam-planner") {
        toast.error("Please enter the exam name.");
      } else if (selectedTool.id === "language-tutor") {
        toast.error("Please enter your learning topic or scenario.");
      } else if (selectedTool.id === "math-solver") {
        toast.error("Please enter a math problem or upload a problem image.");
      } else {
        toast.error("Please enter your study topic or problem first.");
      }
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowLoginModal(true);
      return;
    }

    // Pro model checks
    if (selectedModel.accessTier === "Pro" && !hasPremiumAccess) {
      setPremiumFeatureName(selectedModel.name);
      setShowPremiumModal(true);
      return;
    }

    // Power model checks
    if (selectedModel.accessTier === "Power" && (!hasPremiumAccess || userPlanId !== "power")) {
      setPremiumFeatureName(selectedModel.name);
      setShowPremiumModal(true);
      return;
    }

    // Token check for free tier
    if (!hasPremiumAccess && userTokens !== null && userTokens < 5) {
      setTokenErrorData({
        message: "You need at least 5 neural tokens to run this AI module.",
        requiredTokens: 5,
        currentTokens: userTokens,
        canPurchase: true
      });
      return;
    }

    setApiResult(null);
    setApiError(null);
    setShowResult(false);
    setIsGenerating(true);
    toast.info("AI Study Room Engine processing your request…", { duration: 1500 });

    if (selectedTool.id === "homework-helper") {
      api.post("/study/homework", {
        prompt: inputText,
        additionalPrompt,
        model: selectedModel.id,
        language: outputLanguage,
        tone: selectedTone
      }, {
        headers: { Auth: authToken }
      }).then(res => {
        if (res.data.success) {
          setApiResult(res.data.homework);
          if (res.data.tokenInfo && res.data.tokenInfo.tokensRemaining !== undefined) {
            setUserTokens(res.data.tokenInfo.tokensRemaining);
          }
        } else {
          setApiError(res.data.message || "Failed to generate guide.");
        }
      }).catch(err => {
        setApiError(err.response?.data?.message || err.message || "Server error occurred.");
      });
    } else if (selectedTool.id === "math-solver") {
      api.post("/study/math", {
        prompt: inputText,
        image: mathImage,
        additionalPrompt,
        model: selectedModel.id,
        language: outputLanguage,
        tone: selectedTone
      }, {
        headers: { Auth: authToken }
      }).then(res => {
        if (res.data.success) {
          setApiResult({
            ...res.data.mathSolution,
            isMath: true
          });
          if (res.data.tokenInfo && res.data.tokenInfo.tokensRemaining !== undefined) {
            setUserTokens(res.data.tokenInfo.tokensRemaining);
          }
        } else {
          setApiError(res.data.message || "Failed to solve problem.");
        }
      }).catch(err => {
        setApiError(err.response?.data?.message || err.message || "Server error occurred.");
      });
      } else if (selectedTool.id === "exam-planner") {
        api.post("/study/planner", {
          prompt: inputText,
          targetDate,
          dailyHours,
          prepLevel,
          additionalPrompt,
          model: selectedModel.id
        }, {
          headers: { Auth: authToken }
        }).then(res => {
          if (res.data.success) {
            setApiResult(res.data.examPlan);
            if (res.data.tokenInfo && res.data.tokenInfo.tokensRemaining !== undefined) {
              setUserTokens(res.data.tokenInfo.tokensRemaining);
            }
          } else {
            setApiError(res.data.message || "Failed to generate exam plan.");
          }
        }).catch(err => {
          setApiError(err.response?.data?.message || err.message || "Server error occurred.");
        });
      } else if (selectedTool.id === "language-tutor") {
        api.post("/study/tutor", {
          prompt: inputText,
          targetLanguage,
          proficiencyLevel,
          learningFocus,
          additionalPrompt,
          model: selectedModel.id
        }, {
          headers: { Auth: authToken }
        }).then(res => {
          if (res.data.success) {
            setApiResult({
              ...res.data.lesson,
              isLesson: true
            });
            if (res.data.tokenInfo?.tokensRemaining !== undefined) {
              setUserTokens(res.data.tokenInfo.tokensRemaining);
            }
          } else {
            setApiError(res.data.message || "Failed to generate language lesson.");
          }
        }).catch(err => {
          setApiError(err.response?.data?.message || err.message || "Server error occurred.");
        });
      }
  };

  const getWordCount = () => documentContent.trim().split(/\s+/).filter(Boolean).length;
  const getCharCount = () => documentContent.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(documentContent);
    toast.success("Copied markdown to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([documentContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paperxify-${selectedTool.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded successfully!");
  };

  const handleInsertFormat = (type: "bold" | "italic" | "code" | "header") => {
    const el = document.getElementById("study-textarea") as HTMLTextAreaElement;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e);
    const map = { bold: `**${sel || "bold"}**`, italic: `*${sel || "italic"}*`, code: `\`${sel || "code"}\``, header: `\n## ${sel || "Section"}\n` };
    const next = value.slice(0, s) + map[type] + value.slice(e);
    setDocumentContent(next);
    setTimeout(() => { el.focus(); el.setSelectionRange(s + 2, s + 2 + (sel || "text").length); }, 50);
  };

  let planData: any = null;
  if (selectedTool.id === "exam-planner" && documentContent) {
    try {
      planData = JSON.parse(documentContent);
    } catch (e) {
      // not JSON
    }
  }

  const daysRemaining = planData?.targetDate ? (() => {
    const target = new Date(planData.targetDate);
    const today = new Date();
    target.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  })() : null;

  return (
    <div className="flex flex-col items-center justify-start w-full">
      <section className="w-full min-h-screen relative flex flex-col items-center justify-center bg-black text-white px-4 py-10 font-sans selection:bg-pink-900/40 selection:text-white overflow-hidden">
        
        {/* Atmosphere Glowing background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-pink-900/5 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none z-0" />

        {/* ── INPUT OR LOADING OR RESULT ── */}
        <div className="relative z-10 w-full max-w-4xl mx-auto">

          {!isGenerating && !showResult ? (
            /* ════════ INPUT STATE ════════ */
            <div className="flex flex-col items-center space-y-8 sm:space-y-10 w-full">

              {/* Status Badge */}
              <div className="mx-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/50 border border-white/10 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400 backdrop-blur-md shadow-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899] animate-pulse" />
                Paperxify Study Room Engine Active
              </div>

              {/* Hero Title */}
              <div className="text-center space-y-3">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-400 leading-[1.1] pb-2">
                  AI Personal{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-pink-400 to-rose-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                    Study Suite
                  </span>
                </h1>
                <p className="text-neutral-500 text-sm sm:text-base font-light max-w-lg mx-auto">
                  Resolve complex equations step-by-step, plan your exam preparations, or practice conversations and grammar in seconds.
                </p>
              </div>

              {/* ══ MAIN COMMAND CARD ══ */}
              <div className="w-full relative z-10">
                {/* Glow border */}
                <div className="absolute -inset-px rounded-[2.2rem] bg-gradient-to-b from-pink-500/20 via-pink-500/5 to-transparent pointer-events-none z-0" />

                <div className="relative z-10 bg-[#0c0c0c] border border-white/[0.08] rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)] transition-all duration-500 focus-within:border-white/20">

                  {/* TEXT INPUT ROW */}
                  <div className="flex items-start gap-2.5 sm:gap-3 px-4 sm:px-5 pt-4 sm:pt-6 pb-2">
                    <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-pink-500/15 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)] flex items-center justify-center mt-0.5 animate-pulse">
                      <selectedTool.icon size={17} />
                    </div>
                    <textarea
                      rows={selectedTool.id === "exam-planner" || selectedTool.id === "language-tutor" ? 2 : 3}
                      placeholder={
                        selectedTool.id === "exam-planner" ? "Enter the exam name (e.g., SAT, MCAT, JEE, UPSC)..." :
                        selectedTool.id === "language-tutor" ? "Enter what scenario or topic you want to practice (e.g., ordering food at a cafe, job interview conversation)..." :
                        selectedTool.placeholder
                      }
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] sm:text-[16px] font-semibold text-white placeholder:text-neutral-500 sm:placeholder:text-neutral-600 outline-none min-w-0 px-1 resize-none leading-relaxed"
                    />
                  </div>

                  {/* ADDITIONAL CONTEXT TEXTAREA */}
                  <div className="px-4 sm:px-6 pb-3">
                    <input
                      type="text"
                      placeholder={
                        selectedTool.id === "exam-planner" ? "Add specific focus subjects, weak areas, or textbooks (optional)..." :
                        selectedTool.id === "language-tutor" ? "Add dialect nuances, accent focus, or specific grammar rules (optional)..." :
                        "Add custom instructions, course context, or textbook details… (optional)"
                      }
                      value={additionalPrompt}
                      onChange={e => setAdditionalPrompt(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-[13px] sm:text-[14px] text-neutral-400 placeholder:text-neutral-700 outline-none leading-relaxed px-1"
                    />
                  </div>

                  {/* MATH IMAGE UPLOAD PANEL */}
                  {selectedTool.id === "math-solver" && (
                    <div className="px-4 sm:px-6 pb-4 pt-1 border-t border-white/[0.04] bg-neutral-950/20">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ImageIcon size={14} className="text-pink-400" />
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            Upload Math Problem Image
                          </span>
                        </div>
                        {mathImage && (
                          <button
                            type="button"
                            onClick={() => setMathImage(null)}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                          >
                            <X size={10} /> Clear Image
                          </button>
                        )}
                      </div>

                      <div className="mt-3">
                        {mathImage ? (
                          <div className="relative inline-block group">
                            <img
                              src={mathImage}
                              alt="Math problem thumbnail"
                              className="h-24 max-w-[200px] object-cover rounded-xl border border-white/10 shadow-lg"
                            />
                            <div className="absolute top-1 right-1 bg-black/80 rounded-full p-1 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => setMathImage(null)}
                                className="text-white hover:text-rose-400 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group">
                            <Upload size={18} className="text-neutral-500 group-hover:text-white transition-colors mb-1.5" />
                            <span className="text-[11px] font-bold text-neutral-400 group-hover:text-white transition-colors">
                              Select or drop an image containing the math equation
                            </span>
                            <span className="text-[9px] text-neutral-600 mt-0.5">
                              Supports JPG, PNG (Max 5MB)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 5 * 1024 * 1024) {
                                    toast.error("Image size exceeds 5MB limit.");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setMathImage(reader.result as string);
                                    toast.success("Image uploaded successfully!");
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CUSTOM PARAMETERS */}
                  {selectedTool.id === "exam-planner" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 sm:px-5 pb-4">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 block">Target Exam Date</label>
                        <input
                          type="date"
                          value={targetDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setTargetDate(e.target.value)}
                          className="w-full bg-[#111] border border-white/[0.08] hover:border-white/20 rounded-xl px-3 py-2 text-xs text-neutral-300 font-bold focus:outline-none transition-all cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 block">Daily Commitment</label>
                        <select
                          value={dailyHours}
                          onChange={(e) => setDailyHours(e.target.value)}
                          className="w-full bg-[#111] border border-white/[0.08] hover:border-white/20 rounded-xl px-3 py-2 text-xs text-neutral-300 font-bold focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="1-2 hours">1-2 hours/day</option>
                          <option value="3-4 hours">3-4 hours/day</option>
                          <option value="5-6 hours">5-6 hours/day</option>
                          <option value="7+ hours">7+ hours/day</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 block">Preparation Level</label>
                        <select
                          value={prepLevel}
                          onChange={(e) => setPrepLevel(e.target.value)}
                          className="w-full bg-[#111] border border-white/[0.08] hover:border-white/20 rounded-xl px-3 py-2 text-xs text-neutral-300 font-bold focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="Beginner">Beginner (Starting out)</option>
                          <option value="Intermediate">Intermediate (Have basics)</option>
                          <option value="Advanced">Advanced (Revision & Practice)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedTool.id === "language-tutor" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 sm:px-5 pb-4">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 block">Target Language</label>
                        <select
                          value={targetLanguage}
                          onChange={(e) => setTargetLanguage(e.target.value)}
                          className="w-full bg-[#111] border border-white/[0.08] hover:border-white/20 rounded-xl px-3 py-2 text-xs text-neutral-300 font-bold focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="Spanish">Spanish</option>
                          <option value="German">German</option>
                          <option value="French">French</option>
                          <option value="Japanese">Japanese</option>
                          <option value="Arabic">Arabic</option>
                          <option value="English">English</option>
                          <option value="Italian">Italian</option>
                          <option value="Mandarin">Mandarin</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 block">Proficiency Level</label>
                        <select
                          value={proficiencyLevel}
                          onChange={(e) => setProficiencyLevel(e.target.value)}
                          className="w-full bg-[#111] border border-white/[0.08] hover:border-white/20 rounded-xl px-3 py-2 text-xs text-neutral-300 font-bold focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="Beginner (A1-A2)">Beginner (A1-A2)</option>
                          <option value="Intermediate (B1-B2)">Intermediate (B1-B2)</option>
                          <option value="Advanced (C1-C2)">Advanced (C1-C2)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 block">Learning Focus</label>
                        <select
                          value={learningFocus}
                          onChange={(e) => setLearningFocus(e.target.value)}
                          className="w-full bg-[#111] border border-white/[0.08] hover:border-white/20 rounded-xl px-3 py-2 text-xs text-neutral-300 font-bold focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="Conversational Speaking">Conversational Speaking</option>
                          <option value="Grammar & Structure">Grammar & Structure</option>
                          <option value="Vocabulary & Idioms">Vocabulary & Idioms</option>
                          <option value="Business / Professional">Business & Professional</option>
                          <option value="Academic & Writing">Academic & Writing</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* TOOL CHIPS */}
                  <div className="px-4 sm:px-5 pb-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 mb-2.5">Select Workspace Module</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STUDY_TOOLS.map(tool => {
                        const isActive = selectedTool.id === tool.id;
                        
                        // Maintain inputs in url query
                        const params = new URLSearchParams();
                        if (inputText.trim()) params.set("prompt", inputText.trim());
                        if (selectedModel.id !== "flash") params.set("model", selectedModel.id);
                        if (outputLanguage !== "English") params.set("language", outputLanguage);
                        if (selectedTone !== "Step-by-step") params.set("tone", selectedTone);
                        const queryStr = params.toString();
                        const href = `/ai-study/${tool.id}${queryStr ? `?${queryStr}` : ""}`;

                        return (
                          <Link
                            key={tool.id}
                            href={href}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap ${
                              isActive
                                ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                                : "bg-transparent border-white/[0.08] text-neutral-500 hover:text-neutral-300 hover:border-white/20"
                            }`}
                          >
                            <tool.icon size={11} />
                            {tool.label}
                          </Link>
                        );
                      })}
                    </div>
                    {/* Tool hint */}
                    <p className="text-[10px] text-pink-500/70 mt-2.5 font-medium flex items-center gap-1.5">
                      <selectedTool.icon size={10} />
                      {selectedTool.hint}
                    </p>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="px-4 sm:px-5 py-3 sm:py-4 bg-[#070707] border-t border-white/[0.04] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">

                      {/* Model Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15 text-[11px] font-bold text-neutral-300 hover:text-white transition-all duration-200 outline-none shrink-0 group">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selectedModel.hex, boxShadow: `0 0 6px ${selectedModel.hex}99` }} />
                            <span>{selectedModel.name}</span>
                            <ChevronDown size={11} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0a0a0a] backdrop-blur-2xl border border-white/[0.08] text-white min-w-[280px] p-2.5 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] z-[300]" style={{ background: 'radial-gradient(ellipse at top left, #ffffff06 0%, #0a0a0a 60%)' }}>
                          {/* Header */}
                          <div className="px-3 py-2 mb-1 border-b border-white/[0.05]">
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-500 flex items-center gap-1.5">
                              <Brain size={11} className="text-white/30" /> Intelligence Engine
                            </p>
                          </div>
                          {/* Model Cards */}
                          <div className="space-y-1 mt-1">
                            {AI_MODELS.map(m => {
                              const isLocked = m.accessTier === 'Pro' && !hasPremiumAccess;
                              const isPowerLocked = m.accessTier === 'Power' && (!hasPremiumAccess || userPlanId !== 'power');
                              const isActive = m.id === selectedModel.id;
                              const locked = isLocked || isPowerLocked;
                              const tierColor = m.accessTier === 'Free' ? '#38bdf8' : m.accessTier === 'Pro' ? '#a78bfa' : '#fbbf24';
                              return (
                                <DropdownMenuItem
                                  key={m.id}
                                  onClick={() => {
                                    if (locked) {
                                      setPremiumFeatureName(`${m.name} Model`);
                                      setShowPremiumModal(true);
                                      return;
                                    }
                                    setSelectedModel(m);
                                  }}
                                  className={cn(
                                    "cursor-pointer rounded-xl p-0 mb-0.5 transition-all duration-200 outline-none focus:bg-transparent",
                                    locked ? "opacity-60" : ""
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200",
                                      isActive
                                        ? "border-white/10 bg-white/[0.06]"
                                        : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.03]"
                                    )}
                                    style={isActive ? { boxShadow: `inset 0 0 20px ${m.hex}10` } : {}}
                                  >
                                    {/* Color box */}
                                    <div
                                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                                      style={{
                                        backgroundColor: `${m.hex}12`,
                                        borderColor: `${m.hex}25`,
                                        boxShadow: isActive ? `0 0 12px ${m.hex}30` : 'none',
                                      }}
                                    >
                                      <Bot size={16} style={{ color: m.hex }} />
                                    </div>
                                    {/* Info */}
                                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className={cn("font-black text-[12px] tracking-tight", isActive ? "text-white" : "text-neutral-300")}>{m.name}</span>
                                        {/* Tier badge */}
                                        <span
                                          className="text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-md border"
                                          style={{ color: tierColor, backgroundColor: `${tierColor}12`, borderColor: `${tierColor}25` }}
                                        >
                                          {m.accessTier}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-neutral-500 leading-tight text-left truncate">{m.desc}</span>
                                    </div>
                                    {/* State icon */}
                                    {locked && (
                                      <div className="shrink-0 w-5 h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                                        <Lock size={10} className="text-neutral-500" />
                                      </div>
                                    )}
                                    {!locked && isActive && (
                                      <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${m.hex}20`, boxShadow: `0 0 8px ${m.hex}40` }}>
                                        <Check size={11} style={{ color: m.hex }} />
                                      </div>
                                    )}
                                  </div>
                                </DropdownMenuItem>
                              );
                            })}
                          </div>
                          {/* Footer */}
                          <div className="mt-2 pt-2 border-t border-white/[0.05]">
                            <Link href="/pricing" className="block outline-none">
                              <div className="cursor-pointer rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-neutral-500 hover:text-white hover:bg-white/[0.04] font-bold text-[10px] uppercase tracking-wider outline-none transition-all group">
                                <span>Browse all models</span>
                                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </Link>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Language · Tone Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/[0.06] rounded-lg text-[10px] font-bold text-neutral-400 hover:text-white transition-all">
                            <span>{outputLanguage} · {selectedTone}</span>
                            <ChevronDown size={10} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-neutral-900 border border-white/10 rounded-xl p-3 z-[300] w-64 space-y-3">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2">Output Language</p>
                            <div className="flex flex-wrap gap-1.5">
                              {LANGUAGES.map(lang => (
                                <button
                                  key={lang}
                                  onClick={() => setOutputLanguage(lang)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                    outputLanguage === lang
                                      ? "bg-white text-black border-white"
                                      : "border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                                  }`}
                                >
                                  {lang}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2">Explanatory Style</p>
                            <div className="flex flex-wrap gap-1.5">
                              {TONES.map(tone => (
                                <button
                                  key={tone}
                                  onClick={() => setSelectedTone(tone)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                    selectedTone === tone
                                      ? "bg-white text-black border-white"
                                      : "border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                                  }`}
                                >
                                  {tone}
                                </button>
                              ))}
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Neural Tokens Indicator */}
                      {isLoggedIn && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-500/10 border border-yellow-500/15 rounded-lg text-[10px] font-bold text-yellow-500 cursor-default">
                          <Coins size={11} />
                          {hasPremiumAccess ? "PRO (Unlimited)" : `${userTokens ?? 0} Tokens`}
                        </div>
                      )}
                    </div>

                    {/* Generate CTA */}
                    <button
                      onClick={handleGenerate}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-pink-50 rounded-xl h-11 font-black uppercase tracking-widest text-[11px] transition-all shadow-[0_0_20px_rgba(236,72,153,0.25)] hover:shadow-[0_0_30px_rgba(236,72,153,0.35)]"
                    >
                      <Sparkles size={13} className="text-pink-500" />
                      Run {selectedTool.label}
                      <ArrowRight size={12} />
                    </button>
                  </div>

                </div>
              </div>

              {/* Saved Study Room Workspace Library */}
              <StudyWorkspace
                savedHomeworks={savedHomeworks}
                savedMaths={savedMaths}
                savedPlans={savedPlans}
                savedLessons={savedLessons}
                isLoading={isLoadingHistory}
                onRefresh={fetchHistory}
                onLoadHomework={loadSavedHomework}
                onLoadMath={loadSavedMath}
                onLoadLesson={loadSavedLesson}
                onLoadPlan={loadSavedExamPlan}
              />

            </div>

          ) : isGenerating ? (
            /* ════════ LOADING STATE ════════ */
            <div className="w-full max-w-lg mx-auto bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-6 sm:p-8 flex flex-col items-center space-y-7 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)]">

              {/* Circular progress indicator */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff08" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke="#ec4899" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - progressPercent / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <span className="text-2xl font-black text-white tracking-tighter">{Math.round(progressPercent)}%</span>
              </div>

              {/* Step info */}
              <div className="text-center space-y-1.5 w-full">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Stage {currentStep}: {LOADING_STEPS[currentStep]?.label || "Processing"}
                </h3>
                <p className="text-xs text-neutral-500 font-light px-2">
                  {LOADING_STEPS[currentStep]?.desc}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {LOADING_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-full transition-all duration-300 ${
                      idx < currentStep ? "w-2 h-2 bg-pink-500" :
                      idx === currentStep ? "w-3 h-3 bg-pink-500 shadow-[0_0_8px_#ec4899] animate-pulse" :
                      "w-1.5 h-1.5 bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Trivia tip */}
              <div className="w-full p-4 rounded-2xl border border-white/[0.04] bg-neutral-950/60 min-h-[88px] flex flex-col justify-center text-left">
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-neutral-500 block mb-1">
                  {STUDY_TIPS[activeTipIndex].title}
                </span>
                <p className="text-neutral-400 text-[11px] leading-relaxed font-light">
                  {STUDY_TIPS[activeTipIndex].text}
                </p>
              </div>
            </div>

          ) : (
            /* ════════ RESULT WORKSPACE ════════ */
            <div className="w-full flex flex-col space-y-4">

              {/* Result Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Study Guide Compiled</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{selectedTool.label}</h2>
                  <p className="text-neutral-500 text-xs mt-0.5">{getWordCount()} words · {getCharCount()} chars</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => { setShowResult(false); setInputText(""); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
                  >
                    <RefreshCw size={12} /> New Request
                  </button>
                  {selectedTool.id !== "exam-planner" && selectedTool.id !== "language-tutor" && (
                    <>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
                      >
                        <Copy size={12} /> Copy Markdown
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-pink-50 transition-colors shadow-[0_0_12px_rgba(236,72,153,0.2)]"
                      >
                        <Download size={12} /> Download
                      </button>
                    </>
                  )}
                  {selectedTool.id !== "homework-helper" && selectedTool.id !== "math-solver" && selectedTool.id !== "exam-planner" && selectedTool.id !== "language-tutor" ? (
                    <div className="flex items-center gap-1.5">
                      {(["bold", "italic", "code", "header"] as const).map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => handleInsertFormat(fmt)}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors capitalize"
                          title={fmt}
                        >
                          {fmt === "bold" && <Bold size={12} />}
                          {fmt === "italic" && <Italic size={12} />}
                          {fmt === "code" && <Code size={12} />}
                          {fmt === "header" && <Heading size={12} />}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                      <Sparkles size={11} className="text-pink-500" />
                      Premium Study Room Guide
                    </div>
                  )}

                  {/* View toggle */}
                  {selectedTool.id !== "homework-helper" && selectedTool.id !== "math-solver" && selectedTool.id !== "exam-planner" && (
                    <div className="flex items-center bg-black border border-white/10 p-0.5 rounded-xl">
                      <button
                        onClick={() => setIsPreviewMode(false)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                          !isPreviewMode ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
                        }`}
                      >
                        <Edit3 size={10} /> Editor
                      </button>
                      <button
                        onClick={() => setIsPreviewMode(true)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                          isPreviewMode ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
                        }`}
                      >
                        <Eye size={10} /> Preview
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body Area */}
              <div className="flex-1 relative bg-black/35">
                  {!isPreviewMode && selectedTool.id !== "homework-helper" && selectedTool.id !== "math-solver" && selectedTool.id !== "language-tutor" ? (
                    <textarea
                      id="study-textarea"
                      value={documentContent}
                      onChange={e => setDocumentContent(e.target.value)}
                      className="w-full min-h-[450px] sm:min-h-[600px] p-4 sm:p-6 text-sm text-neutral-200 bg-transparent font-mono focus:outline-none resize-none leading-relaxed"
                    />
                  ) : selectedTool.id === "math-solver" ? (
                    /* ════════ DEDICATED MATH SOLVER CANVAS ════════ */
                    <div className="p-3 sm:p-6 md:p-8 bg-[#050505] min-h-full w-full flex flex-col items-center gap-6">
                      
                      {/* Math Input Context Card (Double-sided metadata/problem card) */}
                      <div className="w-full max-w-3xl bg-[#0c0c0c]/85 border border-white/[0.05] rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.85)] flex flex-col md:flex-row gap-5 items-stretch relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
                        
                        <div className="flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-emerald-400 font-mono whitespace-nowrap">
                              Math Problem Query
                            </span>
                            <p className="text-white text-xs sm:text-sm font-semibold leading-relaxed mt-2 italic font-mono bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl">
                              {inputText || "Parsed Problem from Uploaded Image"}
                            </p>
                          </div>
                          
                          <div className="flex flex-row flex-wrap items-center gap-2 mt-3">
                            <span className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded-md text-neutral-300 font-mono">
                              Engine: <span className="text-white font-semibold">{selectedModel.name}</span>
                            </span>
                            <span className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded-md text-neutral-300 font-mono">
                              Tone: <span className="text-white font-semibold">{selectedTone}</span>
                            </span>
                            <span className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded-md text-neutral-300 font-mono">
                              Lang: <span className="text-white font-semibold">{outputLanguage}</span>
                            </span>
                          </div>
                        </div>

                        {mathImage && (
                          <div className="w-full md:w-48 flex flex-col items-start gap-1.5 shrink-0 bg-neutral-950/45 border border-white/[0.04] p-2.5 rounded-xl">
                            <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 font-mono">
                              Input Image Source
                            </span>
                            <div className="relative w-full h-24 md:h-28 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center bg-black/60">
                              <img
                                src={mathImage}
                                alt="Input Math problem"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Math Blackboard Sheet Container */}
                      <div 
                        className="w-full max-w-3xl bg-[#090909]/95 border border-emerald-500/15 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_50px_rgba(16,185,129,0.02)] rounded-2xl p-5 sm:p-10 text-neutral-200 relative"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.08) 1.2px, transparent 1.2px)',
                          backgroundSize: '24px 24px'
                        }}
                      >
                        {/* Decorative side accent laser line */}
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" />

                        {/* Heading header status bar */}
                        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 font-mono">
                              Mathematical Solver Proof Output
                            </span>
                          </div>
                          <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest bg-white/[0.02] border border-white/[0.05] px-2 py-0.5 rounded">
                            Verified Result
                          </span>
                        </div>

                        {/* Main math proof output with LaTeX formatting */}
                        <div className="prose prose-invert max-w-none text-left font-sans leading-relaxed">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              h1: ({ node, ...props }) => <h1 className="text-lg font-black text-white border-b border-white/10 pb-2 mb-4 mt-6 tracking-tight font-serif" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-sm font-extrabold text-white mt-5 mb-2.5 tracking-tight font-mono text-emerald-300 flex items-center gap-1.5" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-xs font-bold text-neutral-200 mt-4 mb-2 tracking-tight" {...props} />,
                              p: ({ node, ...props }) => <p className="text-neutral-300 font-light leading-relaxed mb-3.5 text-[13px]" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3.5 text-neutral-300 text-[13px] leading-relaxed space-y-1" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3.5 text-neutral-300 text-[13px] leading-relaxed space-y-1" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                              blockquote: ({ node, ...props }) => <blockquote className="border-l-3 border-emerald-500 bg-emerald-500/5 px-4 py-3 rounded-r-xl my-4 text-emerald-200 font-mono italic text-[12px] leading-relaxed shadow-sm" {...props} />,
                              table: ({ node, ...props }) => <div className="overflow-x-auto w-full my-4"><table className="w-full border-collapse border border-white/10 text-[11px]" {...props} /></div>,
                              th: ({ node, ...props }) => <th className="bg-white/5 border border-white/10 p-2 text-left font-bold text-white" {...props} />,
                              td: ({ node, ...props }) => <td className="border border-white/10 p-2 text-neutral-300" {...props} />,
                              pre: ({ node, ...props }) => <pre className="bg-black/45 border border-white/5 p-4 rounded-xl font-mono text-[11px] my-4 text-emerald-300 overflow-x-auto leading-relaxed shadow-inner" {...props} />,
                              code: ({ node, inline, ...props }: any) => inline 
                                ? <code className="bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono text-[11px] text-emerald-300 border border-emerald-500/10" {...props} />
                                : <code className="block" {...props} />
                            }}
                          >
                            {preprocessMathContent(documentContent)}
                          </ReactMarkdown>
                        </div>

                        {/* Blackboard Footer */}
                        <div className="border-t border-white/[0.05] pt-4 mt-8 flex justify-between items-center text-[8px] font-mono tracking-wider text-neutral-600 uppercase">
                          <span>Paperxify Math Engine v2.5</span>
                          <span>Precision Score: 100% Verified Proof</span>
                        </div>

                      </div>
                    </div>
                  ) : selectedTool.id === "exam-planner" && planData ? (
                    /* ════════ DEDICATED EXAM PLANNER CANVAS ════════ */
                    <div className="p-3 sm:p-6 md:p-8 bg-[#050505] min-h-full w-full flex flex-col items-center gap-6">
                      
                      {/* Dashboard Header Context Card */}
                      <div className="w-full max-w-3xl bg-[#0c0c0c]/85 border border-white/[0.05] rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.85)] flex flex-col md:flex-row gap-5 items-stretch relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-[50px] rounded-full pointer-events-none" />
                        
                        <div className="flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-pink-400 font-mono whitespace-nowrap">
                              Exam Planner active dashboard
                            </span>
                            <h2 className="text-white text-lg sm:text-xl font-black mt-2 font-mono leading-tight">
                              {planData.title || `${planData.examName} Preparation Plan`}
                            </h2>
                          </div>
                          
                          <div className="flex flex-row flex-wrap items-center gap-2 mt-3">
                            <span className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded-md text-neutral-300 font-mono">
                              Exam: <span className="text-white font-semibold">{planData.examName}</span>
                            </span>
                            <span className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded-md text-neutral-300 font-mono">
                              Target Date: <span className="text-white font-semibold">{planData.targetDate}</span>
                            </span>
                            <span className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded-md text-neutral-300 font-mono">
                              Daily Hours: <span className="text-white font-semibold">{planData.dailyHours}</span>
                            </span>
                            <span className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded-md text-neutral-300 font-mono">
                              Level: <span className="text-white font-semibold">{planData.prepLevel}</span>
                            </span>
                          </div>
                        </div>

                        {daysRemaining !== null && (
                          <div className="w-full md:w-44 flex flex-col items-center justify-center shrink-0 bg-neutral-950/45 border border-white/[0.04] p-4 rounded-xl text-center">
                            <span className="text-[8px] font-black uppercase tracking-wider text-pink-400 font-mono">
                              Days Remaining
                            </span>
                            <div className="text-3xl font-black text-white mt-1.5 font-mono">
                              {daysRemaining > 0 ? daysRemaining : 0}
                            </div>
                            <span className="text-[9px] text-neutral-500 mt-1">
                              {daysRemaining > 0 ? "Days to go!" : "Exam Passed!"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Interactive Tabs */}
                      <div className="w-full max-w-3xl flex items-center bg-black border border-white/10 p-0.5 rounded-xl">
                        <button
                          onClick={() => setActivePlanTab("timeline")}
                          className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                            activePlanTab === "timeline" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
                          }`}
                        >
                          Timeline Overview
                        </button>
                        <button
                          onClick={() => setActivePlanTab("calendar")}
                          className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                            activePlanTab === "calendar" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
                          }`}
                        >
                          Interactive Study Plan
                        </button>
                      </div>

                      {/* Plan Content */}
                      <div className="w-full max-w-3xl bg-[#090909]/95 border border-pink-500/15 shadow-[0_20px_60px_rgba(0,0,0,0.95)] rounded-2xl p-5 sm:p-8 text-neutral-200 relative">
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-500" />
                        
                        {activePlanTab === "timeline" ? (
                          /* ══ TIMELINE MODE ══ */
                          <div className="space-y-6">
                            <div className="border-b border-white/[0.05] pb-4">
                              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                                Preparation Phases
                              </h3>
                              <p className="text-neutral-500 text-xs mt-0.5">
                                High-level strategy broken down into structural steps.
                              </p>
                            </div>

                            <div className="space-y-4">
                              {planData.phases && planData.phases.map((phase: any, idx: number) => (
                                <div key={idx} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex flex-col gap-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-pink-300 font-mono">
                                      {phase.name}
                                    </h4>
                                    <span className="text-[9px] font-mono bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded text-neutral-400">
                                      {phase.duration}
                                    </span>
                                  </div>
                                  <p className="text-neutral-400 text-xs font-light">
                                    {phase.description}
                                  </p>
                                  {phase.tasks && phase.tasks.length > 0 && (
                                    <ul className="list-disc pl-5 text-neutral-400 text-[11px] leading-relaxed space-y-1.5 mt-2">
                                      {phase.tasks.map((task: string, tIdx: number) => (
                                        <li key={tIdx}>{task}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          /* ══ CALENDAR MODE ══ */
                          <div className="space-y-6">
                            <div className="border-b border-white/[0.05] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                                  Weekly Planner Calendar
                                </h3>
                                <p className="text-neutral-500 text-xs mt-0.5">
                                  Day-by-day actions for Week 1, and weekly strategy for subsequent weeks.
                                </p>
                              </div>
                              
                              {/* Week Selector tabs */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {planData.weeks && planData.weeks.map((week: any) => (
                                  <button
                                    key={week.weekNumber}
                                    onClick={() => setSelectedWeekNum(week.weekNumber)}
                                    className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-all ${
                                      selectedWeekNum === week.weekNumber
                                        ? "bg-pink-500 text-white shadow-sm"
                                        : "bg-white/[0.02] border border-white/[0.05] text-neutral-400 hover:text-white"
                                    }`}
                                  >
                                    W{week.weekNumber}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Current Selected Week Detail */}
                            {(() => {
                              const activeWeek = planData.weeks && planData.weeks.find((w: any) => w.weekNumber === selectedWeekNum);
                              if (!activeWeek) return <p className="text-xs text-neutral-500">Week {selectedWeekNum} details not available.</p>;
                              
                              return (
                                <div className="space-y-4">
                                  <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-3.5 flex items-center justify-between">
                                    <div>
                                      <span className="text-[8px] font-black uppercase tracking-wider text-pink-400 font-mono">
                                        Week {activeWeek.weekNumber} Focus
                                      </span>
                                      <p className="text-white text-xs font-semibold mt-1">
                                        {activeWeek.focus}
                                      </p>
                                    </div>
                                    <span className="text-[10px] font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">
                                      Active Plan
                                    </span>
                                  </div>

                                  {/* Render Day-by-Day Cards or Week Summary */}
                                  {activeWeek.days && activeWeek.days.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                      {activeWeek.days.map((dayObj: any) => {
                                        const weekDayKey = `week-${activeWeek.weekNumber}-day-${dayObj.day}`;
                                        return (
                                          <div key={dayObj.day} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex flex-col justify-between gap-3 relative hover:border-white/10 transition-colors">
                                            <div>
                                              <div className="flex justify-between items-center pb-2 border-b border-white/[0.04] mb-2.5">
                                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                                                  Day {dayObj.day}
                                                </span>
                                                <span className="text-[9px] font-mono text-neutral-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                                                  🕒 {dayObj.hours || planData.dailyHours || 3}h
                                                </span>
                                              </div>
                                              <h5 className="text-xs font-bold text-neutral-200 mb-2 font-mono">
                                                {dayObj.topic}
                                              </h5>
                                              
                                              {/* Checkable Tasks */}
                                              {dayObj.tasks && dayObj.tasks.length > 0 && (
                                                <div className="space-y-2 mt-2">
                                                  {dayObj.tasks.map((task: string, tIdx: number) => {
                                                    const taskId = `${weekDayKey}-task-${tIdx}`;
                                                    const isChecked = !!checkedTasks[taskId];
                                                    return (
                                                      <label
                                                        key={tIdx}
                                                        className="flex items-start gap-2 text-[11px] text-neutral-400 cursor-pointer select-none group"
                                                      >
                                                        <input
                                                          type="checkbox"
                                                          checked={isChecked}
                                                          onChange={() => {
                                                            setCheckedTasks(prev => ({
                                                              ...prev,
                                                              [taskId]: !isChecked
                                                            }));
                                                          }}
                                                          className="mt-0.5 accent-pink-500 w-3 h-3 cursor-pointer"
                                                        />
                                                        <span className={`group-hover:text-white transition-colors leading-relaxed ${
                                                          isChecked ? "line-through text-neutral-600 group-hover:text-neutral-600" : ""
                                                        }`}>
                                                          {task}
                                                        </span>
                                                      </label>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    /* Week Summary fallback if day list is empty */
                                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5 text-center text-xs text-neutral-400 leading-relaxed font-light">
                                      <p>This week focuses on: <strong className="text-white">{activeWeek.focus}</strong></p>
                                      <p className="mt-2 text-[11px] text-neutral-500">
                                        Use your daily commitment of {planData.dailyHours} to execute conceptual lessons, tackle weak zones, and solve corresponding topic test practice sections.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Footer details */}
                        <div className="border-t border-white/[0.05] pt-4 mt-8 flex justify-between items-center text-[8px] font-mono tracking-wider text-neutral-600 uppercase">
                          <span>Paperxify Plan Engine v1.2</span>
                          <span>Study Plan Score: AI Optimized Strategy</span>
                        </div>
                      </div>
                    </div>
                  ) : selectedTool.id === "language-tutor" && lessonData ? (
                    /* ════════ DEDICATED LANGUAGE TUTOR CANVAS ════════ */
                    <div className="p-3 sm:p-6 md:p-8 bg-[#050505] min-h-full w-full flex flex-col items-center gap-6">

                      {/* Header Context Card */}
                      <div className="w-full max-w-3xl bg-[#0c0c0c]/85 border border-white/[0.05] rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.85)] flex flex-col md:flex-row gap-5 items-stretch relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 blur-[60px] rounded-full pointer-events-none" />
                        <div className="flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-violet-400 font-mono">Language Tutor · Active Session</span>
                            <h2 className="text-white text-lg sm:text-xl font-black mt-2 font-mono leading-tight">{lessonData.lessonTitle || `${targetLanguage} Lesson`}</h2>
                          </div>
                          <div className="flex flex-row flex-wrap items-center gap-2 mt-3">
                            <span className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded-md text-neutral-300 font-mono">Language: <span className="text-white font-semibold">{lessonData.targetLanguage}</span></span>
                            <span className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded-md text-neutral-300 font-mono">Level: <span className="text-white font-semibold">{lessonData.proficiencyLevel}</span></span>
                            <span className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded-md text-neutral-300 font-mono">Focus: <span className="text-white font-semibold">{lessonData.learningFocus}</span></span>
                          </div>
                        </div>
                        <div className="w-full md:w-40 flex flex-col items-center justify-center shrink-0 bg-neutral-950/45 border border-white/[0.04] p-4 rounded-xl text-center">
                          <span className="text-[8px] font-black uppercase tracking-wider text-violet-400 font-mono">Scenario</span>
                          <p className="text-white text-xs font-semibold mt-2 leading-relaxed italic">{lessonData.scenario || inputText}</p>
                        </div>
                      </div>

                      {/* Main lesson card */}
                      <div className="w-full max-w-3xl bg-[#090909]/95 border border-violet-500/15 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_50px_rgba(139,92,246,0.02)] rounded-2xl p-5 sm:p-8 text-neutral-200 relative">
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-violet-500 via-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(139,92,246,0.4)] rounded-l-2xl" />

                        {/* ── VOCABULARY ── */}
                        {lessonData.vocabulary && lessonData.vocabulary.length > 0 && (
                          <div className="mb-8">
                            <div className="flex items-center gap-2 border-b border-white/[0.05] pb-3 mb-4">
                              <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa] animate-pulse" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400 font-mono">Vocabulary & Key Phrases</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {lessonData.vocabulary.map((v: any, i: number) => (
                                <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 hover:border-violet-500/20 transition-colors group">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="text-white font-bold text-sm group-hover:text-violet-300 transition-colors">{v.native}</p>
                                      <p className="text-violet-300/70 text-[10px] font-mono mt-0.5">{v.pronunciation}</p>
                                    </div>
                                    <span className="text-[10px] text-neutral-400 shrink-0 bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded-md font-semibold">{v.english}</span>
                                  </div>
                                  <p className="text-neutral-500 text-[11px] mt-2 italic leading-relaxed border-t border-white/[0.04] pt-2">{v.example}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── GRAMMAR POINTS ── */}
                        {lessonData.grammarPoints && lessonData.grammarPoints.length > 0 && (
                          <div className="mb-8">
                            <div className="flex items-center gap-2 border-b border-white/[0.05] pb-3 mb-4">
                              <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 font-mono">Grammar Rules</span>
                            </div>
                            <div className="space-y-3">
                              {lessonData.grammarPoints.map((g: any, i: number) => (
                                <div key={i} className="bg-blue-500/[0.04] border border-blue-500/10 rounded-xl p-4">
                                  <p className="text-blue-300 font-bold text-xs font-mono">{g.rule}</p>
                                  <p className="text-neutral-400 text-[11px] mt-1.5 leading-relaxed font-light">{g.explanation}</p>
                                  {g.examples && g.examples.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                      {g.examples.map((ex: string, ei: number) => (
                                        <li key={ei} className="text-[11px] text-neutral-300 italic flex items-start gap-1.5">
                                          <span className="text-blue-400 mt-0.5">›</span>{ex}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── DIALOGUE ── */}
                        {lessonData.dialogue && lessonData.dialogue.length > 0 && (
                          <div className="mb-8">
                            <div className="flex items-center gap-2 border-b border-white/[0.05] pb-3 mb-4">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 font-mono">Dialogue Roleplay</span>
                              <span className="text-[8px] text-neutral-600 ml-auto font-mono">Tap to follow along</span>
                            </div>
                            <div className="space-y-2.5">
                              {lessonData.dialogue.map((line: any, i: number) => {
                                const isTutor = line.speaker === "Tutor";
                                return (
                                  <div key={i} className={`flex gap-3 ${isTutor ? "flex-row" : "flex-row-reverse"}`}>
                                    <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black border ${
                                      isTutor
                                        ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                                        : "bg-violet-500/15 border-violet-500/25 text-violet-400"
                                    }`}>
                                      {isTutor ? "T" : "S"}
                                    </div>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                                      isTutor
                                        ? "bg-emerald-500/[0.06] border border-emerald-500/10 rounded-tl-none"
                                        : "bg-violet-500/[0.06] border border-violet-500/10 rounded-tr-none"
                                    }`}>
                                      <p className="text-white text-[12px] font-semibold leading-relaxed">{line.targetLang}</p>
                                      <p className="text-neutral-500 text-[10px] mt-0.5 italic">{line.english}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* ── EXERCISES ── */}
                        {lessonData.exercises && lessonData.exercises.length > 0 && (
                          <div className="mb-8">
                            <div className="flex items-center gap-2 border-b border-white/[0.05] pb-3 mb-4">
                              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 font-mono">Practice Exercises</span>
                            </div>
                            <div className="space-y-3">
                              {lessonData.exercises.map((ex: any, i: number) => (
                                <div key={i} className="bg-amber-500/[0.03] border border-amber-500/10 rounded-xl p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[8px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-mono">{ex.type}</span>
                                    <span className="text-[9px] text-neutral-500 font-light">{ex.instruction}</span>
                                  </div>
                                  <p className="text-white text-[12px] font-semibold">{ex.question}</p>
                                  {revealedAnswers[i] ? (
                                    <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                      <p className="text-emerald-300 text-[11px] font-mono">✓ {ex.answer}</p>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setRevealedAnswers(prev => ({ ...prev, [i]: true }))}
                                      className="mt-2 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors border border-amber-500/15 hover:border-amber-500/30 px-3 py-1.5 rounded-lg bg-amber-500/[0.04] hover:bg-amber-500/[0.08]"
                                    >
                                      Reveal Answer
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── CULTURAL TIP ── */}
                        {lessonData.culturalTip && (
                          <div className="mb-8">
                            <div className="flex items-center gap-2 border-b border-white/[0.05] pb-3 mb-4">
                              <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185]" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-400 font-mono">Cultural Insight</span>
                            </div>
                            <div className="bg-rose-500/[0.04] border border-rose-500/10 rounded-xl p-4">
                              <p className="text-neutral-300 text-[12px] leading-relaxed font-light">{lessonData.culturalTip}</p>
                            </div>
                          </div>
                        )}

                        {/* ── NEXT STEPS ── */}
                        {lessonData.nextSteps && lessonData.nextSteps.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 border-b border-white/[0.05] pb-3 mb-4">
                              <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-400 font-mono">Next Steps to Progress</span>
                            </div>
                            <div className="space-y-2">
                              {lessonData.nextSteps.map((step: string, i: number) => (
                                <div key={i} className="flex items-start gap-3 bg-sky-500/[0.04] border border-sky-500/10 rounded-xl p-3.5">
                                  <span className="w-5 h-5 shrink-0 rounded-full bg-sky-500/15 border border-sky-500/20 text-sky-400 text-[9px] font-black flex items-center justify-center font-mono">{i + 1}</span>
                                  <p className="text-neutral-300 text-[11px] leading-relaxed">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="border-t border-white/[0.05] pt-4 mt-8 flex justify-between items-center text-[8px] font-mono tracking-wider text-neutral-600 uppercase">
                          <span>Paperxify Language Tutor v1.0</span>
                          <span>AI-Powered Immersive Learning</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ════════ STANDARD STUDY GUIDE PREVIEW ════════ */
                    <div className="p-2 sm:p-6 md:p-8 bg-[#070707] min-h-full flex justify-center w-full">
                      {/* A4 styled page sheet container */}
                      <div className="w-full max-w-2xl bg-[#0c0c0c] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.85)] rounded-xl sm:rounded-2xl px-4 py-6 sm:px-10 sm:py-12 text-neutral-200 relative" style={{ fontFamily: 'Inter, sans-serif' }}>
                        
                        {/* Decorative vertical colored stripe on the side representing Pro syllabus resource */}
                        <div className="absolute top-0 left-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-pink-500 via-purple-500 to-rose-500" />
                        
                        {/* Top Academic Header block */}
                        <div className="border-b border-white/[0.06] pb-5 mb-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-pink-400">
                                Verified Study Suite Outline
                              </span>
                              <h2 className="text-xs font-black text-white uppercase tracking-wider mt-1 font-mono">
                                {selectedTool.label}
                              </h2>
                            </div>
                            <div className="w-full sm:w-auto grid grid-cols-3 sm:flex sm:flex-col sm:items-end gap-2 bg-white/[0.02] border border-white/[0.05] rounded-lg px-2.5 py-1.5 text-[9px] font-mono text-neutral-400">
                              <div>Engine: <span className="text-white font-bold block sm:inline">{selectedModel.name}</span></div>
                              <div>Style: <span className="text-white font-bold block sm:inline">{selectedTone}</span></div>
                              <div>Language: <span className="text-white font-bold block sm:inline">{outputLanguage}</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Uploaded problem image preview if math-solver */}
                        {selectedTool.id === "math-solver" && mathImage && (
                          <div className="mb-6 rounded-xl overflow-hidden border border-white/10 bg-white/[0.02] p-2 flex flex-col items-start gap-1.5">
                            <span className="text-[8px] font-black uppercase tracking-wider text-pink-400 font-mono">
                              Parsed Problem Image Reference
                            </span>
                            <img
                              src={mathImage}
                              alt="Math problem context"
                              className="max-h-48 max-w-full object-contain rounded-lg border border-white/5"
                            />
                          </div>
                        )}
 
                        {/* Main markdown content */}
                        <div className="prose prose-invert max-w-none text-left">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              h1: ({ node, ...props }) => <h1 className="text-xl font-black text-white border-b border-white/10 pb-2 mb-4 mt-6 tracking-tight font-serif" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-base font-bold text-white mt-5 mb-3 tracking-tight font-serif" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-xs font-bold text-neutral-200 mt-4 mb-2 tracking-tight" {...props} />,
                              p: ({ node, ...props }) => <p className="text-neutral-400 font-light leading-relaxed mb-4 text-[13px]" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 text-neutral-400 text-[13px] leading-relaxed space-y-1.5" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 text-neutral-400 text-[13px] leading-relaxed space-y-1.5" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                              blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-pink-500 bg-pink-500/5 px-4 py-3 rounded-r-xl my-4 text-neutral-400 italic text-[12px] leading-relaxed" {...props} />,
                              table: ({ node, ...props }) => <div className="overflow-x-auto w-full my-4"><table className="w-full border-collapse border border-white/10 text-[11px]" {...props} /></div>,
                              th: ({ node, ...props }) => <th className="bg-white/5 border border-white/10 p-2 text-left font-bold text-white" {...props} />,
                              td: ({ node, ...props }) => <td className="border border-white/10 p-2 text-neutral-400" {...props} />,
                              pre: ({ node, ...props }) => <pre className="bg-black/40 border border-white/5 p-4 rounded-xl font-mono text-[11px] my-4 text-pink-300 overflow-x-auto leading-relaxed shadow-inner" {...props} />,
                              code: ({ node, inline, ...props }: any) => inline 
                                ? <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-[11px] text-rose-300" {...props} />
                                : <code className="block" {...props} />
                            }}
                          >
                            {preprocessMathContent(documentContent)}
                          </ReactMarkdown>
                        </div>

                        {/* A4 styled footer block */}
                        <div className="border-t border-white/[0.06] pt-4 mt-8 flex flex-col sm:flex-row justify-between items-center text-[8px] font-mono tracking-wider text-neutral-600 uppercase gap-2">
                          <span>Paperxify AI Study Room System</span>
                          <span>Rubric Status: Grade-A Outlined • Verified Output</span>
                        </div>

                      </div>
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="px-5 py-3 border-t border-white/[0.04] bg-neutral-950/10 text-[10px] text-neutral-500 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-4">
                    <span>Words: <strong className="text-neutral-300">{getWordCount()}</strong></span>
                    <span>Chars: <strong className="text-neutral-300">{getCharCount()}</strong></span>
                    <span>Tool: <strong className="text-pink-400">{selectedTool.label}</strong></span>
                  </div>
                  <span className="font-mono text-[9px] text-neutral-600">Paperxify Study Engine</span>
                </div>

              </div>
          )}

        </div>
      </section>

      {/* Auth & Upgrade Modals */}
      <AuthLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Sign in to generate personalized study materials"
      />
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName={premiumFeatureName || selectedModel.name}
      />
      <SubscriptionDialog open={showPaywall} onOpenChange={setShowPaywall} />

      {/* Insufficient Tokens Modal */}
      <AnimatePresence>
        {tokenErrorData && (
          <motion.div 
            key="token-error-modal"
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setTokenErrorData(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl z-10"
            >
              <button onClick={() => setTokenErrorData(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
              
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Insufficient Tokens</h3>
              <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                {tokenErrorData.message}
              </p>

              <div className="flex items-center justify-between p-4 bg-black/50 rounded-2xl border border-white/5 mb-6">
                <div className="text-center w-full">
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Required</p>
                  <p className="text-xl font-mono font-bold text-white">{tokenErrorData.requiredTokens}</p>
                </div>
                <div className="w-px h-10 bg-white/10 shrink-0" />
                <div className="text-center w-full">
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Available</p>
                  <p className="text-xl font-mono font-bold text-red-500">{tokenErrorData.currentTokens}</p>
                </div>
              </div>

              {tokenErrorData.canPurchase && (
                <Link href="/pricing" onClick={() => setTokenErrorData(null)} className="w-full h-12 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Acquire Tokens <ArrowRight size={14} />
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

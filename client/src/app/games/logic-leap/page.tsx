"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Hash, Trophy, Play, RotateCcw, 
  Zap, Heart, Timer, ShieldCheck, 
  Activity, History, Calendar,
  ChevronRight, Brain, Target,
  Calculator, PieChart, Percent, 
  Clock, TrendingUp, BarChart3,
  Lightbulb, Puzzle, Network,
  BookOpen, Award, Star,
  ShieldAlert, Lock, Crown, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import api from "@/config/api";

// --- Types ---
interface AptitudeQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  tier: number; 
  category: string;
}

type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SYNCING';

const APTITUDE_POOL: AptitudeQuestion[] = [
  // Tier 1: 12th Grade Level (15 questions)
  { 
    question: "If 2x + 5 = 15, what is the value of x?",
    options: ["3", "4", "5", "6"],
    answer: "5",
    explanation: "2x = 15 - 5 = 10, so x = 10/2 = 5",
    tier: 1,
    category: 'quantitative'
  },
  { 
    question: "Find the next number: 2, 4, 6, 8, ?",
    options: ["9", "10", "12", "14"],
    answer: "10",
    explanation: "Even numbers in sequence",
    tier: 1,
    category: 'logical'
  },
  { 
    question: "What is 25% of 200?",
    options: ["25", "50", "75", "100"],
    answer: "50",
    explanation: "25% = 1/4, 200 ÷ 4 = 50",
    tier: 1,
    category: 'quantitative'
  },
  { 
    question: "Which word is different? Apple, Orange, Carrot, Banana",
    options: ["Apple", "Orange", "Carrot", "Banana"],
    answer: "Carrot",
    explanation: "Carrot is a vegetable, others are fruits",
    tier: 1,
    category: 'logical'
  },
  { 
    question: "Simplify: (3² + 4²) ÷ 5",
    options: ["5", "7", "9", "10"],
    answer: "5",
    explanation: "9 + 16 = 25, 25 ÷ 5 = 5",
    tier: 1,
    category: 'quantitative'
  },
  { 
    question: "Find the odd one out: Square, Circle, Triangle, Cube",
    options: ["Square", "Circle", "Triangle", "Cube"],
    answer: "Cube",
    explanation: "Cube is 3D, others are 2D shapes",
    tier: 1,
    category: 'logical'
  },
  { 
    question: "If 1/3 = 0.333..., what is 2/3?",
    options: ["0.666...", "0.5", "0.75", "0.8"],
    answer: "0.666...",
    explanation: "2/3 = 2 × (1/3) = 2 × 0.333... = 0.666...",
    tier: 1,
    category: 'quantitative'
  },
  { 
    question: "Complete the analogy: Dog : Bark :: Cat : ___",
    options: ["Meow", "Purr", "Roar", "Chirp"],
    answer: "Meow",
    explanation: "Characteristic sound of the animal",
    tier: 1,
    category: 'verbal'
  },
  { 
    question: "Find the missing number: 5, 10, 15, 20, ?",
    options: ["25", "30", "35", "40"],
    answer: "25",
    explanation: "Add 5 each time",
    tier: 1,
    category: 'quantitative'
  },
  { 
    question: "Which is the largest? 1/2, 2/3, 3/4, 4/5",
    options: ["1/2", "2/3", "3/4", "4/5"],
    answer: "4/5",
    explanation: "4/5 = 0.8, which is the largest",
    tier: 1,
    category: 'quantitative'
  },
  { 
    question: "Opposite of 'Brave' is:",
    options: ["Cowardly", "Strong", "Fearful", "Timid"],
    answer: "Cowardly",
    explanation: "Brave means courageous, cowardly is the opposite",
    tier: 1,
    category: 'verbal'
  },
  { 
    question: "If A=1, B=2, what is A+B?",
    options: ["2", "3", "4", "5"],
    answer: "3",
    explanation: "A=1, B=2, so 1+2=3",
    tier: 1,
    category: 'logical'
  },
  { 
    question: "Find the next letter: A, C, E, G, ?",
    options: ["H", "I", "J", "K"],
    answer: "I",
    explanation: "Skip one letter each time",
    tier: 1,
    category: 'logical'
  },
  { 
    question: "What is the average of 10, 20, and 30?",
    options: ["15", "20", "25", "30"],
    answer: "20",
    explanation: "(10+20+30) ÷ 3 = 60 ÷ 3 = 20",
    tier: 1,
    category: 'quantitative'
  },
  { 
    question: "Which is not a prime number? 2, 3, 4, 5",
    options: ["2", "3", "4", "5"],
    answer: "4",
    explanation: "4 is divisible by 2",
    tier: 1,
    category: 'quantitative'
  },

  // Tier 2: Competitive Exams (15 questions)
  { 
    question: "A train covers 120km in 2 hours. What is its speed in m/s?",
    options: ["16.67 m/s", "20 m/s", "25 m/s", "30 m/s"],
    answer: "16.67 m/s",
    explanation: "120km = 120,000m, 2 hours = 7200s, Speed = 120000/7200 = 16.67 m/s",
    tier: 2,
    category: 'quantitative'
  },
  { 
    question: "Find the next number: 1, 4, 9, 16, 25, ?",
    options: ["36", "49", "64", "81"],
    answer: "36",
    explanation: "Square numbers: 1², 2², 3², 4², 5², 6²",
    tier: 2,
    category: 'logical'
  },
  { 
    question: "If 20% of x = 50, what is x?",
    options: ["200", "250", "300", "350"],
    answer: "250",
    explanation: "20% = 1/5, so x = 50 × 5 = 250",
    tier: 2,
    category: 'quantitative'
  },
  { 
    question: "Complete series: 2, 6, 12, 20, 30, ?",
    options: ["42", "44", "46", "48"],
    answer: "42",
    explanation: "Differences: 4, 6, 8, 10, 12",
    tier: 2,
    category: 'logical'
  },
  { 
    question: "Find the synonym of 'Meticulous'",
    options: ["Careless", "Thorough", "Quick", "Simple"],
    answer: "Thorough",
    explanation: "Meticulous means showing great attention to detail",
    tier: 2,
    category: 'verbal'
  },
  { 
    question: "A shop gives 20% discount. If final price is $80, what was original?",
    options: ["$90", "$95", "$100", "$110"],
    answer: "$100",
    explanation: "80 = 80% of original, so original = 80/0.8 = 100",
    tier: 2,
    category: 'quantitative'
  },
  { 
    question: "Find missing: Dog : Puppy :: Cat : ___",
    options: ["Kitten", "Cub", "Pup", "Chick"],
    answer: "Kitten",
    explanation: "Young of the animal",
    tier: 2,
    category: 'verbal'
  },
  { 
    question: "What is the probability of getting heads in coin toss?",
    options: ["1/4", "1/2", "3/4", "1"],
    answer: "1/2",
    explanation: "Two equally likely outcomes",
    tier: 2,
    category: 'quantitative'
  },
  { 
    question: "Find the next letter: Z, X, V, T, ?",
    options: ["R", "S", "Q", "P"],
    answer: "R",
    explanation: "Skip one letter backwards",
    tier: 2,
    category: 'logical'
  },
  { 
    question: "If a:b = 2:3 and b:c = 4:5, find a:c",
    options: ["8:15", "2:5", "3:4", "5:8"],
    answer: "8:15",
    explanation: "a:b:c = 8:12:15, so a:c = 8:15",
    tier: 2,
    category: 'quantitative'
  },
  { 
    question: "Antonym of 'Benevolent'",
    options: ["Kind", "Generous", "Malevolent", "Friendly"],
    answer: "Malevolent",
    explanation: "Benevolent means kind, malevolent means wishing harm",
    tier: 2,
    category: 'verbal'
  },
  { 
    question: "Find the missing number: 3, 7, 15, 31, ?",
    options: ["63", "65", "67", "69"],
    answer: "63",
    explanation: "Multiply by 2 and add 1: 3×2+1=7, 7×2+1=15, etc.",
    tier: 2,
    category: 'logical'
  },
  { 
    question: "If 5 workers complete a task in 8 days, how many workers needed to complete in 2 days?",
    options: ["15", "18", "20", "25"],
    answer: "20",
    explanation: "Work = workers × days, so 5×8 = x×2, x=20",
    tier: 2,
    category: 'quantitative'
  },
  { 
    question: "Complete analogy: Book : Library :: Money : ___",
    options: ["Bank", "Wallet", "Store", "Market"],
    answer: "Bank",
    explanation: "Place where items are stored",
    tier: 2,
    category: 'logical'
  },
  { 
    question: "What is 12.5% as fraction?",
    options: ["1/8", "1/4", "1/6", "1/5"],
    answer: "1/8",
    explanation: "12.5% = 125/1000 = 1/8",
    tier: 2,
    category: 'quantitative'
  },

  // Tier 3: GATE Level (15 questions)
  { 
    question: "Find the limit: lim(x→∞) (3x² + 2x + 1) / (x² + 5)",
    options: ["0", "1", "3", "∞"],
    answer: "3",
    explanation: "Divide numerator and denominator by x², as x→∞, lower terms vanish",
    tier: 3,
    category: 'quantitative'
  },
  { 
    question: "What is the time complexity of binary search?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: "O(log n)",
    explanation: "Binary search halves the search space each iteration",
    tier: 3,
    category: 'logical'
  },
  { 
    question: "Integrate: ∫(2x + 3) dx",
    options: ["x² + 3x + C", "x² + 3", "2x² + 3x + C", "x² + 3x"],
    answer: "x² + 3x + C",
    explanation: "∫2x dx = x², ∫3 dx = 3x, plus constant",
    tier: 3,
    category: 'quantitative'
  },
  { 
    question: "What is the determinant of [[1,2],[3,4]]?",
    options: ["-2", "2", "4", "-4"],
    answer: "-2",
    explanation: "det = (1×4) - (2×3) = 4 - 6 = -2",
    tier: 3,
    category: 'quantitative'
  },
  { 
    question: "Find the missing number in hexadecimal: 1F, 2E, 3D, 4C, ?",
    options: ["5B", "5A", "6B", "6A"],
    answer: "5B",
    explanation: "First digit increases by 1, second decreases by 1",
    tier: 3,
    category: 'logical'
  },
  { 
    question: "What is the output of: int x = 5; printf(\"%d\", x++ + ++x);",
    options: ["10", "11", "12", "13"],
    answer: "12",
    explanation: "x++ = 5 (then x=6), ++x = 7 (x=7), sum = 12",
    tier: 3,
    category: 'logical'
  },
  { 
    question: "Solve: dy/dx = y, y(0) = 1",
    options: ["y = e^x", "y = e^{-x}", "y = x", "y = 1"],
    answer: "y = e^x",
    explanation: "Solution to dy/dx = y is y = Ce^x, with C=1 from initial condition",
    tier: 3,
    category: 'quantitative'
  },
  { 
    question: "Which sorting algorithm has worst-case O(n log n)?",
    options: ["Bubble Sort", "Merge Sort", "Quick Sort", "Insertion Sort"],
    answer: "Merge Sort",
    explanation: "Merge sort always has O(n log n) time complexity",
    tier: 3,
    category: 'logical'
  },
  { 
    question: "What is the probability of getting exactly 2 heads in 3 coin tosses?",
    options: ["1/8", "3/8", "1/2", "5/8"],
    answer: "3/8",
    explanation: "Combinations: HHT, HTH, THH out of 8 possible outcomes",
    tier: 3,
    category: 'quantitative'
  },
  { 
    question: "Find eigenvalues of [[2,1],[1,2]]",
    options: ["1,3", "2,2", "1,2", "0,4"],
    answer: "1,3",
    explanation: "Characteristic equation: λ² - 4λ + 3 = 0, roots: 1,3",
    tier: 3,
    category: 'quantitative'
  },
  { 
    question: "What is the Big-O of: for(i=0; i<n; i*=2) for(j=0; j<n; j++)",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
    answer: "O(n log n)",
    explanation: "Outer loop: log n, inner loop: n, so O(n log n)",
    tier: 3,
    category: 'logical'
  },
  { 
    question: "Find the integral: ∫e^x dx",
    options: ["e^x + C", "xe^x + C", "e^{x+1} + C", "ln x + C"],
    answer: "e^x + C",
    explanation: "Derivative of e^x is e^x",
    tier: 3,
    category: 'quantitative'
  },
  { 
    question: "What is the GCD of 48 and 180?",
    options: ["6", "12", "18", "24"],
    answer: "12",
    explanation: "48 = 2⁴×3, 180 = 2²×3²×5, GCD = 2²×3 = 12",
    tier: 3,
    category: 'quantitative'
  },
  { 
    question: "Find the missing: 1011 (binary) = ? (decimal)",
    options: ["11", "12", "13", "14"],
    answer: "11",
    explanation: "1×8 + 0×4 + 1×2 + 1×1 = 11",
    tier: 3,
    category: 'logical'
  },
  { 
    question: "Solve: x² - 5x + 6 = 0",
    options: ["x = 2,3", "x = 1,6", "x = -2,-3", "x = 2,-3"],
    answer: "x = 2,3",
    explanation: "Factor: (x-2)(x-3)=0",
    tier: 3,
    category: 'quantitative'
  },

  // Tier 4: CAT/MBA Level (15 questions)
  { 
    question: "A, B, C invest in ratio 5:6:8. If total profit is $7600, what is B's share?",
    options: ["$2000", "$2400", "$2800", "$3200"],
    answer: "$2400",
    explanation: "Total ratio = 19, B's share = (6/19)×7600 = $2400",
    tier: 4,
    category: 'quantitative'
  },
  { 
    question: "Find the odd one: JLP, SUW, ZBD, QTW",
    options: ["JLP", "SUW", "ZBD", "QTW"],
    answer: "QTW",
    explanation: "Others follow pattern: skip 2 letters, QTW doesn't fit",
    tier: 4,
    category: 'logical'
  },
  { 
    question: "What is the remainder when 7^100 is divided by 5?",
    options: ["0", "1", "2", "3"],
    answer: "1",
    explanation: "Pattern: 7^1 mod5=2, 7^2 mod5=4, 7^3 mod5=3, 7^4 mod5=1, repeats every 4",
    tier: 4,
    category: 'quantitative'
  },
  { 
    question: "Complete the series: 2, 5, 10, 17, 26, ?",
    options: ["35", "37", "39", "41"],
    answer: "37",
    explanation: "Differences: 3, 5, 7, 9, 11",
    tier: 4,
    category: 'logical'
  },
  { 
    question: "In a class, 70% pass in Math, 80% in English. 10% fail in both. What % passed both?",
    options: ["50%", "55%", "60%", "65%"],
    answer: "60%",
    explanation: "Use set theory: A∪B = A + B - A∩B, 90% = 70% + 80% - x, x=60%",
    tier: 4,
    category: 'quantitative'
  },
  { 
    question: "Find the antonym of 'Ephemeral'",
    options: ["Temporary", "Lasting", "Brief", "Momentary"],
    answer: "Lasting",
    explanation: "Ephemeral means short-lived, lasting means enduring",
    tier: 4,
    category: 'verbal'
  },
  { 
    question: "A train 100m long crosses a pole in 10s. What is its speed in km/h?",
    options: ["36 km/h", "40 km/h", "45 km/h", "50 km/h"],
    answer: "36 km/h",
    explanation: "Speed = 100m/10s = 10 m/s = 10 × 3.6 = 36 km/h",
    tier: 4,
    category: 'quantitative'
  },
  { 
    question: "Find the missing: 3, 12, 48, 192, ?",
    options: ["768", "864", "912", "1024"],
    answer: "768",
    explanation: "Multiply by 4 each time",
    tier: 4,
    category: 'logical'
  },
  { 
    question: "What is the sum of first 50 natural numbers?",
    options: ["1250", "1275", "1300", "1325"],
    answer: "1275",
    explanation: "Sum = n(n+1)/2 = 50×51/2 = 1275",
    tier: 4,
    category: 'quantitative'
  },
  { 
    question: "Find the next: AD, EG, IL, MP, ?",
    options: ["QT", "QS", "RT", "RS"],
    answer: "QT",
    explanation: "A→E (+4), D→G (+3), pattern continues",
    tier: 4,
    category: 'logical'
  },
  { 
    question: "If log₂(x) = 5, what is x?",
    options: ["10", "25", "32", "64"],
    answer: "32",
    explanation: "2^5 = 32",
    tier: 4,
    category: 'quantitative'
  },
  { 
    question: "Complete: Doctor : Hospital :: Teacher : ___",
    options: ["School", "College", "Classroom", "Education"],
    answer: "School",
    explanation: "Place of work",
    tier: 4,
    category: 'logical'
  },
  { 
    question: "What is the cube root of 64?",
    options: ["2", "3", "4", "8"],
    answer: "4",
    explanation: "4×4×4 = 64",
    tier: 4,
    category: 'quantitative'
  },
  { 
    question: "Find missing: 1, 1, 2, 3, 5, 8, 13, ?",
    options: ["18", "21", "24", "26"],
    answer: "21",
    explanation: "Fibonacci sequence: each number is sum of previous two",
    tier: 4,
    category: 'logical'
  },
  { 
    question: "What is the area of a circle with radius 7cm? (π=22/7)",
    options: ["154 cm²", "176 cm²", "196 cm²", "224 cm²"],
    answer: "154 cm²",
    explanation: "Area = πr² = (22/7)×49 = 154",
    tier: 4,
    category: 'quantitative'
  },

  // Tier 5: UPSC/Civil Services Level (10+ questions)
  { 
    question: "If a pipe fills a tank in 6 hours and another empties it in 8 hours, how long to fill if both open?",
    options: ["24 hours", "20 hours", "18 hours", "16 hours"],
    answer: "24 hours",
    explanation: "Net rate = 1/6 - 1/8 = 1/24, so 24 hours",
    tier: 5,
    category: 'quantitative'
  },
  { 
    question: "Find the next: 3, 7, 16, 35, 74, ?",
    options: ["153", "155", "157", "159"],
    answer: "153",
    explanation: "Pattern: ×2+1, ×2+2, ×2+3, ×2+4, ×2+5",
    tier: 5,
    category: 'logical'
  },
  { 
    question: "What is the minimum number of straight lines needed to connect 10 points on a circle?",
    options: ["9", "10", "11", "12"],
    answer: "10",
    explanation: "Each point can connect to others, minimum is n-1 for non-intersecting",
    tier: 5,
    category: 'puzzles'
  },
  { 
    question: "Solve: x + 1/x = 3, find x² + 1/x²",
    options: ["7", "8", "9", "10"],
    answer: "7",
    explanation: "Square both sides: (x+1/x)² = x² + 2 + 1/x² = 9, so x²+1/x²=7",
    tier: 5,
    category: 'quantitative'
  },
  { 
    question: "Which number replaces ?: 2, 3, 5, 7, 11, 13, 17, 19, ?",
    options: ["21", "23", "25", "27"],
    answer: "23",
    explanation: "Prime numbers sequence",
    tier: 5,
    category: 'logical'
  },
  { 
    question: "A clock shows 3:15. What is the angle between hour and minute hands?",
    options: ["0°", "7.5°", "15°", "30°"],
    answer: "7.5°",
    explanation: "Hour hand moves 0.5° per minute, at 15 min = 7.5° from 3",
    tier: 5,
    category: 'quantitative'
  },
  { 
    question: "Find the odd one: 28, 45, 65, 82, 102",
    options: ["28", "45", "65", "82"],
    answer: "82",
    explanation: "Others follow pattern: 28=5²+3, 45=6²+9, 65=7²+16, 102=9²+21",
    tier: 5,
    category: 'logical'
  },
  { 
    question: "What is the sum of all angles in a 10-sided polygon?",
    options: ["1440°", "1620°", "1800°", "1980°"],
    answer: "1440°",
    explanation: "Sum = (n-2)×180 = 8×180 = 1440°",
    tier: 5,
    category: 'quantitative'
  },
  { 
    question: "Complete series: ZYX, WVU, TSR, QPO, ?",
    options: ["NML", "MLK", "LKJ", "KJI"],
    answer: "NML",
    explanation: "Reverse alphabetical triplets",
    tier: 5,
    category: 'logical'
  },
  { 
    question: "If 5 men or 7 women can do work in 37 days, how long for 5 men and 7 women together?",
    options: ["18.5 days", "20 days", "21 days", "22.5 days"],
    answer: "18.5 days",
    explanation: "5 men = 7 women, so together = 14 women, time = (7×37)/14 = 18.5",
    tier: 5,
    category: 'quantitative'
  },
  { 
    question: "Find the next: 1, 4, 27, 256, ?",
    options: ["3125", "4096", "6561", "10000"],
    answer: "3125",
    explanation: "1¹, 2², 3³, 4⁴, 5⁵ = 3125",
    tier: 5,
    category: 'logical'
  },
  { 
    question: "What is the probability that a leap year has 53 Sundays?",
    options: ["1/7", "2/7", "3/7", "4/7"],
    answer: "2/7",
    explanation: "Leap year has 366 days = 52 weeks + 2 days, these 2 days could be any combination",
    tier: 5,
    category: 'quantitative'
  },
  { 
    question: "Find missing: 1, 3, 6, 10, 15, 21, ?",
    options: ["27", "28", "29", "30"],
    answer: "28",
    explanation: "Triangular numbers: n(n+1)/2",
    tier: 5,
    category: 'logical'
  },
  { 
    question: "A number when divided by 6 leaves remainder 2, by 8 leaves 4. What is remainder when divided by 48?",
    options: ["20", "26", "32", "38"],
    answer: "20",
    explanation: "Number = 6a+2 = 8b+4, smallest such number is 20, pattern repeats every LCM(6,8)=24",
    tier: 5,
    category: 'quantitative'
  },
  { 
    question: "Complete: 2, 5, 9, 14, 20, 27, ?",
    options: ["34", "35", "36", "37"],
    answer: "35",
    explanation: "Differences: 3,4,5,6,7,8",
    tier: 5,
    category: 'logical'
  }
];


export default function LogicLeap() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [level, setLevel] = useState(1);
  const [currentQ, setCurrentQ] = useState<AptitudeQuestion | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [lastIndices, setLastIndices] = useState<number[]>([]);
  // --- Device Detection Logic ---
  const getDeviceMetadata = () => {
    if (typeof window === "undefined") return { isMobile: false, browser: "Unknown" };
    
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    
    // Detect Browser Name
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Trident")) browser = "Internet Explorer";
    else if (ua.includes("Edge")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    // Detect Mobile via Screen Width + UserAgent
    const isMobile = /Mobi|Android|iPhone/i.test(ua) || window.innerWidth < 768;

    return { isMobile, browser };
  };
  // --- Identity Detection ---
  const getIdentity = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : { id: "guest_node", name: "Guest", email: "anonymous@void.com" };
    } catch { return { id: "guest_node", name: "Guest", email: "anonymous@void.com" }; }
  };

  // --- Telemetry Sync ---
  const pushStats = async (finalScore: number, finalLevel: number) => {
    setGameState('SYNCING');
    const user = getIdentity();
    
    const payload = {
      userId: user.id || user._id,
      name: user.name,
      email: user.email,
      game: "Logic Leap",
      stats: {
        score: finalScore,
        level: finalLevel,
        timestamp: new Date().toISOString()
      },
      device: getDeviceMetadata()
    };

    try {
      await api.post("/general/game-stats", payload);
      toast.success("TELEMETRY_SYNCED");
    } catch (error) {
      toast.error("SYNC_OFFLINE", { description: "Mission data stored locally." });
    } finally {
      setGameState('GAMEOVER');
    }
  };

  useEffect(() => {
    const savedHigh = localStorage.getItem("logic_leap_high");
    if (savedHigh) setHighScore(parseInt(savedHigh));
    const savedHistory = localStorage.getItem("logic_leap_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // --- Intelligence Engine ---
  const generateQuestion = useCallback(() => {
    // HARDER Scaling: Phases determine the Tier pool
    const targetTier = level < 8 ? 1 : level < 18 ? 2 : level < 30 ? 3 : level < 45 ? 4 : 5;
    const pool = APTITUDE_POOL.filter(q => q.tier <= targetTier);
    
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * pool.length);
    } while (lastIndices.includes(nextIdx) && pool.length > 5);

    setLastIndices(prev => [nextIdx, ...prev].slice(0, 5));
    setCurrentQ(pool[nextIdx]);
    
    // Time Decay: Starts at 15s, drops to floor of 6s
    setTimeLeft(Math.max(6.0, 15 - (level * 0.3)));
  }, [level, lastIndices]);

  useEffect(() => {
    let timer: any;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => Math.round((prev - 0.1) * 10) / 10), 100);
    } else if (timeLeft <= 0 && gameState === 'PLAYING') {
      handleWrong();
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const handleAnswer = (choice: string) => {
    if (choice === currentQ?.answer) {
      setScore(s => s + (100 * level));
      setLevel(l => l + 1);
      toast.success("LOGIC_STABLE", { duration: 500 });
      generateQuestion();
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    if (lives > 1) {
      setLives(l => l - 1);
      toast.error("NEURAL_MISMATCH", { description: "Pattern Invalid" });
      generateQuestion();
    } else {
      pushStats(score, level);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-emerald-600/30 overflow-hidden">
      
      {/* --- HUD --- */}
      <div className="w-full max-w-2xl bg-neutral-900/20 border border-white/5 p-6 rounded-[2.5rem] md:rounded-[3rem] backdrop-blur-3xl mb-8 shadow-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Brain size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">IQ_Score</p>
              <p className="text-2xl font-black tabular-nums">{score}</p>
            </div>
          </div>

          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={22} className={cn("transition-all", i < lives ? "text-red-600 fill-red-600" : "text-neutral-950")} />
            ))}
          </div>

          <div className="text-right">
            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Infiltration_Lvl</p>
            <span className={cn("text-xl font-black tabular-nums", timeLeft < 4 ? "text-red-600 animate-pulse" : "text-white")}>
              {timeLeft.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl w-full relative">
        <AnimatePresence mode="wait">
          
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10">
              <div className="space-y-4">
                <div className="inline-flex p-10 bg-emerald-500/5 rounded-[4rem] border border-emerald-500/10 shadow-[0_0_80px_rgba(16,185,129,0.1)]">
                  <Puzzle size={80} className="text-emerald-500" />
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">LOGIC_<span className="text-emerald-500">LEAP</span></h1>
                <p className="text-neutral-600 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] max-w-sm mx-auto">
                  Neural_Aptitude_Testing_Module_v5.0
                </p>
              </div>
              <Button onClick={() => { setScore(0); setLives(3); setLevel(1); setGameState('PLAYING'); generateQuestion(); }} 
                className="w-full h-24 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-3xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all">
                START <Play size={28} className="ml-3 fill-black" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 15) * 100}%` }}
                  className={cn("h-full transition-colors", timeLeft < 4 ? "bg-red-600" : "bg-emerald-500")}
                />
              </div>

              {/* Requirement Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-700" />
                <Card className="bg-neutral-900/40 border-2 border-white/5 rounded-[3rem] p-10 md:p-16 text-center relative z-10 backdrop-blur-xl">
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] mb-6 tracking-[0.4em]">DATA_REQUIREMENT</Badge>
                  <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-tight italic">
                    "{currentQ?.question}"
                  </h2>
                </Card>
              </div>

              {/* Option Matrix: 2x2 Grid optimized for mobile thumbs */}
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                {currentQ?.options.map((opt, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleAnswer(opt)}
                    className="h-24 md:h-32 bg-neutral-900/50 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-xl md:text-3xl font-black rounded-[2rem] transition-all transform active:scale-90"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {(gameState === 'GAMEOVER' || gameState === 'SYNCING') && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
              <div className="text-center bg-neutral-900/50 p-12 rounded-[4rem] border border-red-900/20 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
                 <h2 className="text-6xl md:text-8xl font-black text-red-600 uppercase italic tracking-tighter mb-10 relative z-10">CORE_FAILURE</h2>
                 
                 <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
                   <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Final_IQ</p>
                     <p className="text-5xl font-black text-emerald-500 leading-none">{score}</p>
                   </div>
                   <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Max_Phase</p>
                     <p className="text-5xl font-black text-white leading-none">L{level}</p>
                   </div>
                 </div>

                 {gameState === 'SYNCING' ? (
                   <div className="h-20 flex items-center justify-center gap-3 bg-neutral-950 rounded-2xl text-[10px] font-black text-neutral-700 tracking-[0.4em] uppercase">
                      <Loader2 size={16} className="animate-spin" /> UPLOADING_TELEMETRY...
                   </div>
                 ) : (
                   <Button onClick={() => setGameState('START')} className="w-full h-20 bg-white text-black font-black text-2xl rounded-3xl hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-2xl">
                    RESTART <RotateCcw size={24} className="ml-3" />
                   </Button>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Meta HUD */}
      <div className="mt-16 flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-neutral-900">
        <span className="flex items-center gap-2"><Lock size={14} /> ID: {getIdentity().id.substring(0,10)}...</span>
        <span className="flex items-center gap-2"><Trophy size={14} /> pb_node: {highScore}</span>
        <span className="flex items-center gap-2 italic text-emerald-900"><ShieldCheck size={14} /> Verified_Profile</span>
      </div>
    </div>
  );
}
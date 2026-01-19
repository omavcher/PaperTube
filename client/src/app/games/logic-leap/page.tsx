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
  ShieldAlert, Lock, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

// --- Types ---
interface MatchRecord {
  id: string;
  date: string;
  score: number;
  level: number;
}

interface AptitudeQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  tier: number; // 1: 12th Grade, 2: Competitive Exams, 3: GATE, 4: CAT/MBA, 5: UPSC/Civil Services
  category: 'quantitative' | 'logical' | 'verbal' | 'data-interpretation' | 'puzzles';
}

// --- Comprehensive Aptitude Question Pool (70+ Questions) ---
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

// Helper functions
const getQuestionsByTier = (currentLevel: number): AptitudeQuestion[] => {
  if (currentLevel < 15) return APTITUDE_POOL.filter(q => q.tier === 1);
  if (currentLevel < 30) return APTITUDE_POOL.filter(q => q.tier <= 2);
  if (currentLevel < 45) return APTITUDE_POOL.filter(q => q.tier <= 3);
  if (currentLevel < 60) return APTITUDE_POOL.filter(q => q.tier <= 4);
  return APTITUDE_POOL; // All questions including UPSC level
};

const getTierName = (tier: number): string => {
  switch(tier) {
    case 1: return 'EASY';
    case 2: return 'COMPETITIVE';
    case 3: return 'MODERATE';
    case 4: return 'HARD';
    case 5: return 'HEROIC';
    default: return 'UNKNOWN';
  }
};

const getTierColor = (tier: number): string => {
  switch(tier) {
    case 1: return 'border-green-500';
    case 2: return 'border-blue-500';
    case 3: return 'border-yellow-500';
    case 4: return 'border-orange-500';
    case 5: return 'border-red-500';
    default: return 'border-white/10';
  }
};

const getTierBadgeColor = (tier: number): string => {
  switch(tier) {
    case 1: return 'bg-green-500/20 text-green-500 border-green-500/30';
    case 2: return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
    case 3: return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
    case 4: return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
    case 5: return 'bg-red-500/20 text-red-500 border-red-500/30';
    default: return 'bg-neutral-500/20 text-neutral-500 border-neutral-500/30';
  }
};

const getCategoryIcon = (category: string) => {
  switch(category) {
    case 'quantitative': return <Calculator size={20} />;
    case 'logical': return <Puzzle size={20} />;
    case 'verbal': return <BookOpen size={20} />;
    case 'data-interpretation': return <BarChart3 size={20} />;
    case 'puzzles': return <Lightbulb size={20} />;
    default: return <Brain size={20} />;
  }
};

export default function LogicLeap() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [level, setLevel] = useState(1);
  const [currentQ, setCurrentQ] = useState<AptitudeQuestion | null>(null);
  const [lastIndices, setLastIndices] = useState<number[]>([]);
  const [history, setHistory] = useState<MatchRecord[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  // --- Persistence: Load History ---
  useEffect(() => {
    const saved = localStorage.getItem("logic_leap_history");
    if (saved) setHistory(JSON.parse(saved));
    const savedHigh = localStorage.getItem("logic_leap_high");
    if (savedHigh) setHighScore(parseInt(savedHigh));
  }, []);

  const saveMatch = useCallback((finalScore: number, finalLevel: number) => {
    const newRecord: MatchRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score: finalScore,
      level: finalLevel
    };
    const updated = [newRecord, ...history].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("logic_leap_history", JSON.stringify(updated));
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("logic_leap_high", finalScore.toString());
    }
  }, [history, highScore]);

  // --- Generate Question Based on Level ---
  const generateQuestion = useCallback(() => {
    const questionsByTier = getQuestionsByTier(level);
    
    if (questionsByTier.length === 0) return;

    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * questionsByTier.length);
    } while (lastIndices.includes(nextIdx) && lastIndices.length < questionsByTier.length);

    const selectedQ = questionsByTier[nextIdx];
    const actualIndex = APTITUDE_POOL.findIndex(q => q === selectedQ);

    setLastIndices(prev => [actualIndex, ...prev].slice(0, 5));
    setCurrentQ(selectedQ);
    setShowExplanation(false);
    
    // Adjust time based on difficulty
    const baseTime = 20 - (selectedQ.tier * 2);
    setTimeLeft(Math.max(8, baseTime));
  }, [level, lastIndices]);

  // Timer
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
    if (!currentQ) return;

    if (choice === currentQ.answer) {
      const points = 10 * currentQ.tier * level;
      setScore(s => s + points);
      setLevel(l => l + 1);
      toast.success(`+${points} IQ Points`, { 
        description: `Tier ${getTierName(currentQ.tier)} mastered!` 
      });
      setTimeout(() => generateQuestion(), 800);
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    if (lives > 1) {
      setLives(l => l - 1);
      setShowExplanation(true);
      toast.error("Incorrect Logic", { 
        description: currentQ?.explanation || "Pattern mismatch." 
      });
      setTimeout(() => {
        setShowExplanation(false);
        generateQuestion();
      }, 1500);
    } else {
      setGameState('GAMEOVER');
      saveMatch(score, level);
    }
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setLastIndices([]);
    setGameState('PLAYING');
    generateQuestion();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30 overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* --- HUD --- */}
        <div className="flex justify-between items-center mb-8 bg-black/40 p-6 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
               <Brain size={28} />
             </div>
             <div>
               <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-1">IQ SCORE</p>
               <p className="text-3xl font-black tabular-nums bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{score}</p>
             </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex gap-2 mb-2">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} size={20} className={cn(
                  "transition-all duration-300",
                  i < lives ? "text-red-500 fill-red-500 animate-pulse" : "text-neutral-800"
                )} />
              ))}
            </div>
            <Badge className={cn(
              "text-[10px] font-black px-3 py-1",
              getTierBadgeColor(currentQ?.tier || 1)
            )}>
              {currentQ ? getTierName(currentQ.tier) : 'READY'}
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-1">LOGIC DEPTH</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-16 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-300",
                    level < 15 ? "bg-green-500" :
                    level < 30 ? "bg-blue-500" :
                    level < 45 ? "bg-yellow-500" :
                    level < 60 ? "bg-orange-500" : "bg-red-500"
                  )}
                  style={{ width: `${Math.min(100, (level / 70) * 100)}%` }}
                />
              </div>
              <p className="text-2xl font-black text-white tabular-nums">Lvl {level}</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-center space-y-10 py-10"
            >
              <div className="space-y-6">
                <div className="inline-flex p-8 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-[3rem] border border-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.2)]">
                  <Brain size={80} className="text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-7xl font-black tracking-tighter uppercase italic text-white mb-2">
                    Logic <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Leap</span>
                  </h1>
                  <p className="text-neutral-400 max-w-md mx-auto text-lg">
                    Master aptitude across 70+ levels • 
                  </p>
                </div>
                <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
                  {[1, 2, 3, 4, 5].map(tier => (
                    <div key={tier} className={cn(
                      "p-2 rounded-lg text-center",
                      getTierBadgeColor(tier)
                    )}>
                      <p className="text-[8px] font-black uppercase">{getTierName(tier)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                onClick={startGame} 
                className="w-full h-28 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-3xl rounded-[2.5rem] shadow-[0_25px_60px_rgba(16,185,129,0.4)] transform hover:scale-[1.02] transition-all duration-300"
              >
                ENGAGE NEURAL NET <Play className="ml-4 fill-black" size={28} />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && currentQ && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-8"
            >
              {/* Timer & Difficulty */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(currentQ.category)}
                    <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">
                      {currentQ.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Timer size={16} className="text-neutral-500" />
                    <span className={cn(
                      "text-lg font-black tabular-nums",
                      timeLeft < 5 ? "text-red-500 animate-pulse" : "text-emerald-500"
                    )}>
                      {timeLeft.toFixed(1)}s
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 20) * 100}%` }}
                    className={cn(
                      "h-full transition-colors duration-200",
                      timeLeft < 5 ? "bg-gradient-to-r from-red-500 to-red-700" :
                      timeLeft < 10 ? "bg-gradient-to-r from-orange-500 to-yellow-500" :
                      "bg-gradient-to-r from-emerald-500 to-cyan-500"
                    )}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 blur-xl rounded-[3.5rem]" />
                <Card className={cn(
                  "bg-black/50 border-2 rounded-[3rem] p-10 relative z-10 shadow-2xl backdrop-blur-md",
                  getTierColor(currentQ.tier)
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <Badge className={cn(
                      "text-xs font-black px-4 py-1.5 uppercase tracking-[0.3em]",
                      getTierBadgeColor(currentQ.tier)
                    )}>
                      {getTierName(currentQ.tier)} • Level {level}
                    </Badge>
                    <div className="text-right">
                      <p className="text-[10px] text-neutral-500 font-black">POINTS</p>
                      <p className="text-xl font-black text-emerald-500">{10 * currentQ.tier * level}</p>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed text-center mb-8">
                    {currentQ.question}
                  </h2>

                  {showExplanation && currentQ.explanation && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-6"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb size={16} className="text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-400">Explanation</span>
                      </div>
                      <p className="text-neutral-300 text-sm">{currentQ.explanation}</p>
                    </motion.div>
                  )}
                </Card>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-4">
                {currentQ.options.map((option, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleAnswer(option)}
                    className={cn(
                      "h-24 bg-neutral-900/80 border border-white/10 hover:border-emerald-500 hover:bg-emerald-500/10",
                      "text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02]",
                      "active:scale-95 shadow-lg backdrop-blur-sm"
                    )}
                  >
                    <ChevronRight size={20} className="mr-3 text-emerald-500" />
                    {option}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-10"
            >
              <div className="text-center bg-black/40 p-12 rounded-[4rem] border border-red-500/20 shadow-2xl backdrop-blur-xl">
                 <div className="inline-flex p-6 bg-gradient-to-br from-red-500/10 to-red-700/10 rounded-full mb-6">
                   <Target size={80} className="text-red-500" />
                 </div>
                 <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-6">
                   Neural <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Overload</span>
                 </h2>
                 
                 <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="bg-gradient-to-br from-black/40 to-emerald-500/10 p-10 rounded-[2.5rem] border border-emerald-500/20 text-center">
                     <p className="text-[10px] font-black text-neutral-400 uppercase mb-2 tracking-[0.3em]">Final IQ</p>
                     <p className="text-6xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{score}</p>
                   </div>
                   <div className="bg-gradient-to-br from-black/40 to-blue-500/10 p-10 rounded-[2.5rem] border border-blue-500/20 text-center">
                     <p className="text-[10px] font-black text-neutral-400 uppercase mb-2 tracking-[0.3em]">Logic Depth</p>
                     <p className="text-6xl font-black text-white">LVL {level}</p>
                   </div>
                 </div>

                 <Button 
                   onClick={startGame} 
                   className="w-full h-20 bg-gradient-to-r from-white to-gray-200 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-2xl rounded-[2.5rem] transition-all duration-300 shadow-xl"
                 >
                   REBOOT COGNITION <RotateCcw className="ml-4" size={24} />
                 </Button>
              </div>

              {/* --- Mission History Log --- */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4 text-neutral-500">
                  <History size={18} />
                  <h3 className="text-sm font-black uppercase tracking-[0.4em]">COGNITIVE RECORDS</h3>
                </div>
                <div className="space-y-3">
                  {history.map((match) => (
                    <motion.div 
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gradient-to-r from-black/40 to-neutral-900/40 border border-white/5 p-6 rounded-[2rem] flex justify-between items-center group hover:border-emerald-500/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-5">
                        <div className="p-4 bg-black rounded-2xl text-neutral-500 group-hover:text-emerald-500 transition-colors">
                          <Calendar size={22} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-600 font-bold uppercase">{match.date}</span>
                          <span className="text-lg font-black text-emerald-400 italic">Tier {Math.min(5, Math.ceil(match.level/15))}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-neutral-600 uppercase block mb-1">Score</span>
                        <span className="text-3xl font-black tabular-nums bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{match.score}</span>
                      </div>
                    </motion.div>
                  ))}
                  {history.length === 0 && (
                    <div className="text-center p-8 border border-dashed border-white/10 rounded-[2rem]">
                      <p className="text-sm text-neutral-600 italic">No cognitive records found.</p>
                      <p className="text-xs text-neutral-700 mt-1">Complete your first mission!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="mt-16 flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.5em] text-neutral-700">
        <span className="flex items-center gap-2"><ShieldCheck size={14} /> NEURAL SHIELD 100%</span>
        <span className="flex items-center gap-2"><Activity size={14} /> COGNITIVE LOAD: {Math.min(100, Math.floor(level * 1.5))}%</span>
        <span className="flex items-center gap-2"><Crown size={14} /> HIGH SCORE: {highScore}</span>
        <span className="flex items-center gap-2"><Lock size={14} /> SECURE CONNECTION</span>
      </div>
    </div>
  );
}
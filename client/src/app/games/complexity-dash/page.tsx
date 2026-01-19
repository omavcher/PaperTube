"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Bug, Code2, Zap, Trophy, RotateCcw, 
  Play, Terminal, ShieldAlert, Cpu, 
  ChevronRight, Fingerprint, Activity,
  History, Calendar, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

// --- Types ---
interface MatchRecord {
  id: string;
  date: string;
  score: number;
  level: number;
}

interface Snippet {
  code: string;
  ans: string;
  tier: number; // 1: Easy, 2: Medium, 3: Hard, 4: Expert
}

// --- Expanded Question Pool (70+ Items) ---
const SNIPPET_POOL: Snippet[] = [
  // Tier 1: Basics (10 items)
  { code: "return users[id];", ans: "O(1)", tier: 1 },
  { code: "for(let i=0; i<n; i++) {\n  sum += i;\n}", ans: "O(n)", tier: 1 },
  { code: "while(i < n) {\n  i++;\n}", ans: "O(n)", tier: 1 },
  { code: "let x = 10 + 20;", ans: "O(1)", tier: 1 },
  { code: "arr.push(element);", ans: "O(1)", tier: 1 },
  { code: "if (x > 0) return x;\nelse return -x;", ans: "O(1)", tier: 1 },
  { code: "const result = arr.length;", ans: "O(1)", tier: 1 },
  { code: "for(let i=0; i<100; i++) {\n  process(item);\n}", ans: "O(1)", tier: 1 },
  { code: "arr[Math.floor(n/2)] = value;", ans: "O(1)", tier: 1 },
  { code: "const mid = (start + end) >> 1;", ans: "O(1)", tier: 1 },

  // Tier 2: Intermediate (20 items)
  { code: "for(let i=0; i<n; i++) {\n  for(let j=0; j<n; j++) {\n    count++;\n  }\n}", ans: "O(n²)", tier: 2 },
  { code: "while(n > 1) {\n  n = n / 2;\n}", ans: "O(log n)", tier: 2 },
  { code: "binarySearch(arr, 0, n-1, x);", ans: "O(log n)", tier: 2 },
  { code: "arr.forEach(x => {\n  items.push(x);\n});", ans: "O(n)", tier: 2 },
  { code: "for(let i=0; i<n; i++) {\n  // O(1) op\n}\nfor(let j=0; j<m; j++) {\n  // O(1) op\n}", ans: "O(n)", tier: 2 },
  { code: "for(let i=0; i<n; i+=2) {\n  process(arr[i]);\n}", ans: "O(n)", tier: 2 },
  { code: "for(let i=n; i>0; i--) {\n  console.log(i);\n}", ans: "O(n)", tier: 2 },
  { code: "let i = n;\nwhile(i > 0) {\n  i--;\n}", ans: "O(n)", tier: 2 },
  { code: "for(let i=0; i<n; i++) {\n  if(arr[i] === target) return i;\n}", ans: "O(n)", tier: 2 },
  { code: "arr.sort((a,b) => a-b);", ans: "O(n log n)", tier: 2 },
  { code: "for(let i=0; i<n; i++) {\n  arr.sort();\n}", ans: "O(n² log n)", tier: 2 },
  { code: "for(let i=0; i<n; i++) {\n  for(let j=i+1; j<n; j++) {\n    compare(i,j);\n  }\n}", ans: "O(n²)", tier: 2 },
  { code: "for(let i=1; i<n; i*=2) {\n  console.log(i);\n}", ans: "O(log n)", tier: 2 },
  { code: "for(let i=0; i<n; i++) {\n  for(let j=0; j<10; j++) {\n    process(i,j);\n  }\n}", ans: "O(n)", tier: 2 },
  { code: "for(let i=n; i>1; i/=3) {\n  process(i);\n}", ans: "O(log n)", tier: 2 },
  { code: "let sum = 0;\nfor(let i=0; i<n; i++) {\n  for(let j=0; j<10000; j++) {\n    sum += i*j;\n  }\n}", ans: "O(n)", tier: 2 },
  { code: "const merged = [...arr1, ...arr2];", ans: "O(n)", tier: 2 },
  { code: "arr.map(x => x*2);", ans: "O(n)", tier: 2 },
  { code: "arr.filter(x => x > 0);", ans: "O(n)", tier: 2 },
  { code: "arr.reduce((acc, val) => acc + val, 0);", ans: "O(n)", tier: 2 },

  // Tier 3: Advanced (25 items)
  { code: "for(let i=0; i<n; i++) {\n  for(let j=0; j<1000; j++) {\n    // constant inner\n  }\n}", ans: "O(n)", tier: 3 },
  { code: "function fib(n) {\n  if (n <= 1) return n;\n  return fib(n-1) + fib(n-2);\n}", ans: "O(2^n)", tier: 3 },
  { code: "matrix.forEach(row => {\n  row.sort(); // O(n log n)\n});", ans: "O(n² log n)", tier: 3 },
  { code: "for(let i=1; i<n; i*=2) {\n  for(let j=0; j<n; j++) {\n    // complexity?\n  }\n}", ans: "O(n log n)", tier: 3 },
  { code: "for(let i=0; i<n; i++) {\n  for(let j=0; j<n; j++) {\n    for(let k=0; k<n; k++) {\n      count++;\n    }\n  }\n}", ans: "O(n³)", tier: 3 },
  { code: "function powerSet(arr) {\n  // generate all subsets\n  const subsets = [];\n  for(let i=0; i<(1<<arr.length); i++) {\n    subsets.push([]);\n  }\n}", ans: "O(2^n)", tier: 3 },
  { code: "for(let i=0; i<n; i++) {\n  for(let j=0; j<n*n; j++) {\n    process(i,j);\n  }\n}", ans: "O(n³)", tier: 3 },
  { code: "for(let i=0; i<n; i++) {\n  for(let j=0; j<i; j++) {\n    process(i,j);\n  }\n}", ans: "O(n²)", tier: 3 },
  { code: "function permute(arr) {\n  // generate all permutations\n}", ans: "O(n!)", tier: 3 },
  { code: "for(let i=0; i<n; i++) {\n  binarySearch(arr, 0, n-1, target);\n}", ans: "O(n log n)", tier: 3 },
  { code: "for(let i=0; i<n; i*=2) {\n  for(let j=0; j<i; j++) {\n    process(j);\n  }\n}", ans: "O(n)", tier: 3 },
  { code: "for(let i=1; i<=n; i++) {\n  for(let j=1; j<=n; j+=i) {\n    process(i,j);\n  }\n}", ans: "O(n log n)", tier: 3 },
  { code: "function towerOfHanoi(n) {\n  if(n === 1) return 1;\n  return 2*towerOfHanoi(n-1) + 1;\n}", ans: "O(2^n)", tier: 3 },
  { code: "for(let i=0; i<n; i++) {\n  for(let j=0; j<Math.sqrt(n); j++) {\n    process(i,j);\n  }\n}", ans: "O(n√n)", tier: 3 },
  { code: "for(let i=0; i<n; i++) {\n  for(let j=0; j<Math.log2(n); j++) {\n    process(i,j);\n  }\n}", ans: "O(n log n)", tier: 3 },
  { code: "arr.flat(Infinity); // flatten nested array", ans: "O(n)", tier: 3 },
  { code: "const matrix = new Array(n).fill().map(() => new Array(n));", ans: "O(n²)", tier: 3 },
  { code: "function knapSack(n, W) {\n  if(n==0||W==0) return 0;\n  if(weight[n-1]>W) return knapSack(n-1,W);\n  return max(val[n-1]+knapSack(n-1,W-weight[n-1]), knapSack(n-1,W));\n}", ans: "O(2^n)", tier: 3 },
  { code: "for(let i=0; i<n; i++) {\n  for(let j=0; j<n; j*=2) {\n    process(i,j);\n  }\n}", ans: "O(n log n)", tier: 3 },
  { code: "const dp = new Array(n+1).fill(0);\nfor(let i=1; i<=n; i++) {\n  for(let j=1; j<=n; j++) {\n    dp[j] = Math.max(dp[j], dp[j-1]);\n  }\n}", ans: "O(n²)", tier: 3 },
  { code: "function isPrime(n) {\n  for(let i=2; i*i<=n; i++) {\n    if(n%i===0) return false;\n  }\n  return true;\n}", ans: "O(√n)", tier: 3 },
  { code: "for(let i=0; i<n; i++) {\n  for(let j=0; j<n; j++) {\n    for(let k=0; k<100; k++) {\n      process(i,j,k);\n    }\n  }\n}", ans: "O(n²)", tier: 3 },
  { code: "function mergeSort(arr) {\n  if(arr.length<=1) return arr;\n  const mid = Math.floor(arr.length/2);\n  return merge(mergeSort(left), mergeSort(right));\n}", ans: "O(n log n)", tier: 3 },
  { code: "function quickSort(arr) {\n  if(arr.length<=1) return arr;\n  const pivot = arr[0];\n  return [...quickSort(left), pivot, ...quickSort(right)];\n}", ans: "O(n log n)", tier: 3 },
  { code: "const seen = new Set();\nfor(let i=0; i<n; i++) {\n  for(let j=0; j<n; j++) {\n    seen.add(i*j);\n  }\n}", ans: "O(n²)", tier: 3 },

  // Tier 4: Expert (15 items)
  { code: "function ackermann(m, n) {\n  if(m===0) return n+1;\n  if(n===0) return ackermann(m-1, 1);\n  return ackermann(m-1, ackermann(m, n-1));\n}", ans: "O(A(m,n))", tier: 4 },
  { code: "for(let i=0; i<n; i++) {\n  for(let j=0; j<n; j++) {\n    for(let k=0; k<n; k++) {\n      for(let l=0; l<n; l++) {\n        process(i,j,k,l);\n      }\n    }\n  }\n}", ans: "O(n⁴)", tier: 4 },
  { code: "function collatz(n) {\n  while(n!==1) {\n    n = n%2===0 ? n/2 : 3*n+1;\n  }\n}", ans: "O(?)", tier: 4 },
  { code: "const memo = {};\nfunction strange(n) {\n  if(n<=1) return 1;\n  if(!memo[n]) {\n    memo[n] = strange(Math.floor(n/2)) + strange(Math.floor(n/3));\n  }\n  return memo[n];\n}", ans: "O(log n)", tier: 4 },
  { code: "function matrixChainOrder(p, i, j) {\n  if(i===j) return 0;\n  let min = Infinity;\n  for(let k=i; k<j; k++) {\n    const count = matrixChainOrder(p,i,k) + matrixChainOrder(p,k+1,j) + p[i-1]*p[k]*p[j];\n    min = Math.min(min, count);\n  }\n  return min;\n}", ans: "O(2^n)", tier: 4 },
  { code: "for(let i=1; i<=n; i*=i) {\n  process(i);\n}", ans: "O(log log n)", tier: 4 },
  { code: "function zFunction(s) {\n  const n = s.length;\n  const z = new Array(n).fill(0);\n  for(let i=1, l=0, r=0; i<n; i++) {\n    if(i<=r) z[i] = Math.min(r-i+1, z[i-l]);\n    while(i+z[i]<n && s[z[i]]===s[i+z[i]]) z[i]++;\n    if(i+z[i]-1>r) { l=i; r=i+z[i]-1; }\n  }\n  return z;\n}", ans: "O(n)", tier: 4 },
  { code: "function kmpSearch(text, pattern) {\n  // Knuth-Morris-Pratt algorithm\n  const lps = computeLPS(pattern);\n  let i=0, j=0;\n  while(i<text.length) {\n    if(pattern[j]===text[i]) { i++; j++; }\n    if(j===pattern.length) return i-j;\n    else if(i<text.length && pattern[j]!==text[i]) {\n      if(j!==0) j=lps[j-1];\n      else i++;\n    }\n  }\n  return -1;\n}", ans: "O(n+m)", tier: 4 },
  { code: "function sieveOfEratosthenes(n) {\n  const primes = new Array(n+1).fill(true);\n  for(let p=2; p*p<=n; p++) {\n    if(primes[p]) {\n      for(let i=p*p; i<=n; i+=p) {\n        primes[i]=false;\n      }\n    }\n  }\n}", ans: "O(n log log n)", tier: 4 },
  { code: "function floydWarshall(graph) {\n  const dist = [...graph];\n  const V = graph.length;\n  for(let k=0; k<V; k++) {\n    for(let i=0; i<V; i++) {\n      for(let j=0; j<V; j++) {\n        dist[i][j] = Math.min(dist[i][j], dist[i][k]+dist[k][j]);\n      }\n    }\n  }\n  return dist;\n}", ans: "O(V³)", tier: 4 },
  { code: "function dijkstra(graph, src) {\n  const V = graph.length;\n  const dist = new Array(V).fill(Infinity);\n  const visited = new Array(V).fill(false);\n  dist[src]=0;\n  for(let count=0; count<V-1; count++) {\n    const u = minDistance(dist, visited);\n    visited[u]=true;\n    for(let v=0; v<V; v++) {\n      if(!visited[v] && graph[u][v] && dist[u]!==Infinity && dist[u]+graph[u][v]<dist[v]) {\n        dist[v]=dist[u]+graph[u][v];\n      }\n    }\n  }\n  return dist;\n}", ans: "O(V²)", tier: 4 },
  { code: "function tarjanSCC(graph) {\n  let index = 0;\n  const stack = [];\n  const indices = new Array(V).fill(-1);\n  const lowlink = new Array(V).fill(-1);\n  const onStack = new Array(V).fill(false);\n  const sccs = [];\n  function strongconnect(v) {\n    indices[v]=lowlink[v]=index++;\n    stack.push(v);\n    onStack[v]=true;\n    for(const w of graph[v]) {\n      if(indices[w]===-1) {\n        strongconnect(w);\n        lowlink[v]=Math.min(lowlink[v], lowlink[w]);\n      } else if(onStack[w]) {\n        lowlink[v]=Math.min(lowlink[v], indices[w]);\n      }\n    }\n    if(lowlink[v]===indices[v]) {\n      const scc = [];\n      let w;\n      do {\n        w=stack.pop();\n        onStack[w]=false;\n        scc.push(w);\n      } while(w!==v);\n      sccs.push(scc);\n    }\n  }\n  for(let v=0; v<V; v++) if(indices[v]===-1) strongconnect(v);\n  return sccs;\n}", ans: "O(V+E)", tier: 4 },
  { code: "function kosarajuSCC(graph) {\n  const V = graph.length;\n  const visited = new Array(V).fill(false);\n  const order = [];\n  function dfs1(v) {\n    visited[v]=true;\n    for(const u of graph[v]) if(!visited[u]) dfs1(u);\n    order.push(v);\n  }\n  for(let i=0; i<V; i++) if(!visited[i]) dfs1(i);\n  const reversed = reverseGraph(graph);\n  const visited2 = new Array(V).fill(false);\n  const sccs = [];\n  function dfs2(v, component) {\n    visited2[v]=true;\n    component.push(v);\n    for(const u of reversed[v]) if(!visited2[u]) dfs2(u, component);\n  }\n  for(let i=V-1; i>=0; i--) {\n    const v=order[i];\n    if(!visited2[v]) {\n      const component = [];\n      dfs2(v, component);\n      sccs.push(component);\n    }\n  }\n  return sccs;\n}", ans: "O(V+E)", tier: 4 },
  { code: "function bellmanFord(graph, src) {\n  const V = graph.length;\n  const dist = new Array(V).fill(Infinity);\n  dist[src]=0;\n  for(let i=1; i<V; i++) {\n    for(const [u,v,w] of graph.edges) {\n      if(dist[u]!==Infinity && dist[u]+w<dist[v]) {\n        dist[v]=dist[u]+w;\n      }\n    }\n  }\n  for(const [u,v,w] of graph.edges) {\n    if(dist[u]!==Infinity && dist[u]+w<dist[v]) {\n      throw 'Negative cycle detected';\n    }\n  }\n  return dist;\n}", ans: "O(VE)", tier: 4 },
  { code: "function heapSort(arr) {\n  const n=arr.length;\n  for(let i=Math.floor(n/2)-1; i>=0; i--) heapify(arr,n,i);\n  for(let i=n-1; i>0; i--) {\n    [arr[0],arr[i]]=[arr[i],arr[0]];\n    heapify(arr,i,0);\n  }\n  function heapify(arr,n,i) {\n    let largest=i, l=2*i+1, r=2*i+2;\n    if(l<n && arr[l]>arr[largest]) largest=l;\n    if(r<n && arr[r]>arr[largest]) largest=r;\n    if(largest!==i) {\n      [arr[i],arr[largest]]=[arr[largest],arr[i]];\n      heapify(arr,n,largest);\n    }\n  }\n}", ans: "O(n log n)", tier: 4 },
];

// Helper function to get questions by tier based on level
const getQuestionsByTier = (currentLevel: number): Snippet[] => {
  if (currentLevel < 10) return SNIPPET_POOL.filter(q => q.tier === 1);
  if (currentLevel < 25) return SNIPPET_POOL.filter(q => q.tier <= 2);
  if (currentLevel < 40) return SNIPPET_POOL.filter(q => q.tier <= 3);
  return SNIPPET_POOL; // All questions for expert levels
};

// Helper function for visual difficulty feedback
const getTierColor = (tier: number): string => {
  switch(tier) {
    case 1: return 'border-green-500';
    case 2: return 'border-yellow-500';
    case 3: return 'border-orange-500';
    case 4: return 'border-red-500';
    default: return 'border-white/10';
  }
};

const getTierBadgeColor = (tier: number): string => {
  switch(tier) {
    case 1: return 'bg-green-500/20 text-green-500 border-green-500/30';
    case 2: return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
    case 3: return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
    case 4: return 'bg-red-500/20 text-red-500 border-red-500/30';
    default: return 'bg-neutral-500/20 text-neutral-500 border-neutral-500/30';
  }
};

export default function ComplexityDash() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [bugProximity, setBugProximity] = useState(0); 
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [level, setLevel] = useState(1);
  const [history, setHistory] = useState<MatchRecord[]>([]);
  const [lastIndices, setLastIndices] = useState<number[]>([]);

  const complexities = [
    "O(1)", "O(log n)", "O(√n)", "O(n)", "O(n log n)", 
    "O(n²)", "O(n³)", "O(2^n)", "O(n!)", "O(n log log n)",
    "O(log log n)", "O(n√n)", "O(n⁴)"
  ];

  // --- Persistence: Load History ---
  useEffect(() => {
    const saved = localStorage.getItem("complexity_dash_history");
    if (saved) setHistory(JSON.parse(saved));
    const savedHigh = localStorage.getItem("complexity_dash_high");
    if (savedHigh) setHighScore(parseInt(savedHigh));
  }, []);

  const saveMatch = useCallback((finalScore: number, finalLevel: number) => {
    const newRecord: MatchRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score: finalScore,
      level: Math.floor(finalLevel)
    };
    const updated = [newRecord, ...history].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("complexity_dash_history", JSON.stringify(updated));
    
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("complexity_dash_high", finalScore.toString());
    }
  }, [history, highScore]);

  // --- Progression Engine ---
  const nextQuestion = useCallback(() => {
    const questionsByTier = getQuestionsByTier(level);
    let nextIdx;
    let attempts = 0;
    
    do {
      nextIdx = Math.floor(Math.random() * questionsByTier.length);
      attempts++;
      
      // Fallback if we can't find a non-repeating question after 10 attempts
      if (attempts > 10) {
        const allIndices = questionsByTier.map((_, idx) => idx);
        const availableIndices = allIndices.filter(idx => !lastIndices.includes(idx));
        nextIdx = availableIndices.length > 0 
          ? availableIndices[Math.floor(Math.random() * availableIndices.length)]
          : Math.floor(Math.random() * questionsByTier.length);
        break;
      }
    } while (lastIndices.includes(nextIdx));

    // Find the actual index in SNIPPET_POOL
    const actualSnippet = questionsByTier[nextIdx];
    const actualIndex = SNIPPET_POOL.findIndex(s => s === actualSnippet);

    setLastIndices(prev => [actualIndex, ...prev].slice(0, 4));
    setCurrentIdx(actualIndex);
    
    // Decrease time as level increases
    setTimeLeft(Math.max(2.5, 8 - (level * 0.1)));
    setLevel(l => l + 1);
  }, [lastIndices, level]);

  const currentSnippet = useMemo(() => SNIPPET_POOL[currentIdx], [currentIdx]);

  // --- Game Loop ---
  useEffect(() => {
    let timer: any;
    if (gameState === 'PLAYING') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            handleWrong();
            return 5;
          }
          return prev - 0.1;
        });
        // Bug speed increases with level
        setBugProximity(prev => Math.min(100, prev + (0.15 + (level * 0.02))));
      }, 100);
    }
    return () => clearInterval(timer);
  }, [gameState, level]);

  useEffect(() => {
    if (bugProximity >= 100 && gameState === 'PLAYING') {
      setGameState('GAMEOVER');
      saveMatch(score, level);
    }
  }, [bugProximity, gameState, score, level, saveMatch]);

  const handleAnswer = (choice: string) => {
    if (choice === currentSnippet.ans) {
      setScore(s => s + Math.floor(10 * (level / 2)));
      setBugProximity(prev => Math.max(0, prev - 12));
      toast.success("Optimized!", { duration: 500 });
      nextQuestion();
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    setBugProximity(prev => prev + 20);
    toast.error("Code Smell!", { description: "Bug advanced +20%" });
    nextQuestion();
  };

  const startGame = () => {
    setScore(0);
    setBugProximity(0);
    setLevel(1);
    setLastIndices([]);
    setGameState('PLAYING');
    nextQuestion();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
      
      <div className="max-w-2xl w-full relative">
        {/* --- HUD: Bug Tracker --- */}
        <div className="mb-8 space-y-3">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">
            <span className="flex items-center gap-2"><Bug size={12} className="text-red-500" /> Malicious Bug</span>
            <span className="flex items-center gap-2">Level {Math.floor(level)} <Activity size={12} className="text-emerald-500" /></span>
          </div>
          <div className="h-2 w-full bg-neutral-900 rounded-full border border-white/5 overflow-hidden relative">
             <motion.div 
               animate={{ left: `${bugProximity}%` }}
               className="absolute top-0 bottom-0 w-2 bg-red-500 shadow-[0_0_15px_red] z-20"
             />
             <div className="h-full bg-emerald-500/10" style={{ width: '100%', marginLeft: `${bugProximity}%` }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-10 py-10">
              <div className="space-y-4">
                <div className="inline-flex p-8 bg-emerald-500/10 rounded-[3rem] border border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.1)]">
                  <Terminal size={64} className="text-emerald-500" />
                </div>
                <h1 className="text-6xl font-black tracking-tighter uppercase italic">Complexity <span className="text-emerald-500">Dash</span></h1>
                <p className="text-neutral-400 max-w-sm mx-auto">Scale your performance. Identify Big-O complexity across 70+ levels of code profiling.</p>
              </div>
              <Button onClick={startGame} className="w-full h-24 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-2xl rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
                BOOT ENGINE <Play className="ml-3 fill-black" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <Card className={`bg-neutral-900 border-2 ${getTierColor(currentSnippet.tier)} rounded-[2.5rem] overflow-hidden shadow-2xl`}>
                <div className="bg-black/50 px-8 py-4 border-b border-white/5 flex items-center justify-between">
                   <div className="flex gap-2">
                     <div className="h-3 w-3 rounded-full bg-red-500/40" />
                     <div className="h-3 w-3 rounded-full bg-yellow-500/40" />
                     <div className="h-3 w-3 rounded-full bg-emerald-500/40" />
                   </div>
                   <div className="flex items-center gap-4">
                     <Badge variant="outline" className={`text-[10px] font-black px-4 ${getTierBadgeColor(currentSnippet.tier)}`}>
                       Tier {currentSnippet.tier}
                     </Badge>
                     <Badge variant="outline" className="text-[10px] font-black border-emerald-500/30 text-emerald-500 px-4">
                       {timeLeft.toFixed(1)}s SECURE
                     </Badge>
                   </div>
                </div>
                <CardContent className="p-10">
                  <pre className="font-mono text-xl text-emerald-400 leading-relaxed overflow-x-auto">
                    <code>{currentSnippet.code}</code>
                  </pre>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {complexities.map((comp) => (
                  <Button 
                    key={comp}
                    onClick={() => handleAnswer(comp)}
                    className="h-20 bg-neutral-900 border border-white/10 hover:border-emerald-500 hover:bg-emerald-500/5 text-xl font-black rounded-2xl transition-all"
                  >
                    {comp}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div className="text-center bg-neutral-900 p-12 rounded-[4rem] border border-red-500/20 shadow-2xl backdrop-blur-xl">
                 <ShieldAlert size={80} className="text-red-500 mx-auto mb-6 animate-pulse" />
                 <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-8">System <span className="text-red-500">Compromised</span></h2>
                 
                 <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="bg-black/40 p-8 rounded-[2rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-500 uppercase mb-2">Final Score</p>
                     <p className="text-4xl font-black text-emerald-500">{score}</p>
                   </div>
                   <div className="bg-black/40 p-8 rounded-[2rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-500 uppercase mb-2">Highest Phase</p>
                     <p className="text-4xl font-black text-white">LVL {Math.floor(level)}</p>
                   </div>
                 </div>

                 <Button onClick={startGame} className="w-full h-20 bg-white text-black font-black text-xl rounded-3xl hover:bg-emerald-500 transition-all">
                   REBOOT SESSION <RotateCcw className="ml-3" />
                 </Button>
              </div>

              {/* --- Mission History Log --- */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4 text-neutral-500">
                  <History size={16} />
                  <h3 className="text-xs font-black uppercase tracking-[0.4em]">Mission Log</h3>
                </div>
                <div className="space-y-3">
                  {history.map((match) => (
                    <div key={match.id} className="bg-neutral-900/40 border border-white/5 p-6 rounded-[2rem] flex justify-between items-center group hover:border-emerald-500/40 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="p-4 bg-black rounded-2xl text-neutral-500 group-hover:text-emerald-500 transition-colors">
                          <Calendar size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-600 font-bold uppercase">{match.date}</span>
                          <span className="text-lg font-black text-emerald-400">Phase {match.level} Reach</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-neutral-600 uppercase block mb-1">Score</span>
                        <span className="text-3xl font-black tabular-nums">{match.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-16 flex gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-neutral-800">
        <span className="flex items-center gap-2"><Cpu size={14} /> Algo Engine v5.0</span>
        <span className="flex items-center gap-2"><Fingerprint size={14} /> Secure Auth</span>
        <span className="flex items-center gap-2 font-mono">Personal Best: {highScore}</span>
      </div>
    </div>
  );
}
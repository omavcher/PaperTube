"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Bug, Zap, Trophy, RotateCcw, Play, Terminal, 
  ShieldAlert, Cpu, Activity, History, Calendar, 
  Loader2, ArrowUpRight, ShieldCheck, Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/config/api"; // Ensure your axios/api instance is correctly imported

// --- Question Pool (Snippet data remains untouched as requested) ---
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

type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SYNCING';

export default function ComplexityDash() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [bugProximity, setBugProximity] = useState(0); 
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [level, setLevel] = useState(1);
  const [history, setHistory] = useState<any[]>([]);
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
  // --- Identity & Backend Sync ---
  const getIdentity = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : { id: "guest_node", name: "Guest", email: "anonymous@void.com" };
    } catch { return { id: "guest_node", name: "Guest", email: "anonymous@void.com" }; }
  };

  const pushStatsToBackend = async (finalScore: number, finalLevel: number) => {
    setGameState('SYNCING');
    const user = getIdentity();
    const payload = {
      userId: user.id || user._id, // Handles both mongo _id and standard id
      name: user.name,
      email: user.email,
      game: "Complexity Dash",
      stats: {
        score: finalScore,
        level: Math.floor(finalLevel),
        timestamp: new Date().toISOString()
      },
      device: getDeviceMetadata()
    };

    try {
      await api.post("/general/game-stats", payload);
      toast.success("TELEMETRY_SYNCED", { description: "Mission data stored." });
    } catch (error) {
      toast.error("SYNC_OFFLINE", { description: "Data saved to local cache." });
    } finally {
      setGameState('GAMEOVER');
    }
  };

  // --- Game Mechanics ---
  const nextQuestion = useCallback(() => {
    // Hardcore Scaling: Tier 4 questions appear much earlier (Level 20+)
    const activeTier = level < 8 ? 1 : level < 15 ? 2 : level < 25 ? 3 : 4;
    const questions = SNIPPET_POOL.filter(q => q.tier <= activeTier);
    const nextIdx = Math.floor(Math.random() * questions.length);
    
    // Find absolute index in main pool
    const actualIdx = SNIPPET_POOL.findIndex(s => s.code === questions[nextIdx].code);
    setCurrentIdx(actualIdx);
    
    // Time Pressure: Starts at 7s, floors at 2s
    setTimeLeft(Math.max(2.0, 7 - (level * 0.12)));
    setLevel(l => l + 1);
  }, [level]);

  useEffect(() => {
    let timer: any;
    if (gameState === 'PLAYING') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) { handleWrong(); return 5; }
          return Math.round((prev - 0.1) * 10) / 10;
        });
        // Bug speed scales with level
        setBugProximity(prev => Math.min(100, prev + (0.18 + (level * 0.04))));
      }, 100);
    }
    return () => clearInterval(timer);
  }, [gameState, level]);

  useEffect(() => {
    if (bugProximity >= 100 && gameState === 'PLAYING') {
      pushStatsToBackend(score, level);
    }
  }, [bugProximity, gameState]);

  const handleAnswer = (choice: string) => {
    if (choice === SNIPPET_POOL[currentIdx].ans) {
      setScore(s => s + (10 * SNIPPET_POOL[currentIdx].tier));
      setBugProximity(prev => Math.max(0, prev - 15));
      toast.success("OPTIMIZED", { duration: 500 });
      nextQuestion();
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    setBugProximity(prev => prev + 25);
    toast.error("SYSTEM_LAG", { description: "Bug advanced +25%" });
    nextQuestion();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-red-600/30 overflow-hidden">
      
      {/* --- HUD --- */}
      <div className="w-full max-w-2xl space-y-4 mb-8">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 px-2">
          <span className="flex items-center gap-2"><Bug size={14} className="text-red-600 animate-pulse" /> Bug_Proximity</span>
          <span className="flex items-center gap-2">Node_Status: {Math.floor(level)} <Activity size={12} className="text-emerald-500" /></span>
        </div>
        <div className="h-2 w-full bg-neutral-900/50 rounded-full border border-white/5 overflow-hidden relative">
          <motion.div 
            animate={{ left: `${bugProximity}%` }}
            className="absolute top-0 bottom-0 w-2 bg-red-600 shadow-[0_0_20px_red] z-20"
          />
          <div className="h-full bg-emerald-600/10" style={{ width: '100%', marginLeft: `${bugProximity}%` }} />
        </div>
      </div>

      <div className="max-w-3xl w-full relative z-10">
        <AnimatePresence mode="wait">
          
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10">
              <div className="space-y-4">
                <div className="inline-flex p-10 bg-red-600/5 rounded-[4rem] border border-red-600/10 shadow-[0_0_80px_rgba(220,38,38,0.1)]">
                  <Terminal size={80} className="text-red-600" />
                </div>
                <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-none">
                  COMPLEXITY
                </h1><span className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-none text-red-600">DASH</span>
                <p className="text-neutral-500 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] max-w-xs mx-auto">
                  Neural_Big-O_Analysis // Phase_v5.0
                </p>
              </div>
              <Button onClick={() => { setScore(0); setBugProximity(0); setLevel(1); setGameState('PLAYING'); nextQuestion(); }} 
                className="w-full h-24 bg-red-600 hover:bg-red-500 text-white font-black text-3xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all">
                START <Play size={28} className="ml-3 fill-white" />
              </Button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 md:space-y-10">
              <Card className={cn(
                "bg-neutral-950 border-2 rounded-[3rem] overflow-hidden transition-colors duration-500",
                SNIPPET_POOL[currentIdx].tier === 4 ? "border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.1)]" : "border-white/5"
              )}>
                <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/20" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/20" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-red-600/10 text-red-500 border-none font-black text-[9px]">TIER_{SNIPPET_POOL[currentIdx].tier}</Badge>
                    <span className={cn("text-xs font-black tabular-nums", timeLeft < 2 ? "text-red-600 animate-pulse" : "text-neutral-400")}>
                      {timeLeft.toFixed(1)}s
                    </span>
                  </div>
                </div>
                <CardContent className="p-8 md:p-12">
                  <pre className="font-mono text-lg md:text-2xl text-emerald-400 leading-relaxed overflow-x-auto custom-scrollbar">
                    <code>{SNIPPET_POOL[currentIdx].code}</code>
                  </pre>
                </CardContent>
              </Card>

              {/* Responsive Option Grid: 2 per row on mobile */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2^n)", "O(n!)"].map((comp) => (
                  <Button 
                    key={comp}
                    onClick={() => handleAnswer(comp)}
                    className="h-16 md:h-20 bg-neutral-900/50 border border-white/5 hover:border-red-600/50 hover:bg-red-600/5 text-sm md:text-xl font-black rounded-2xl transition-all active:scale-90"
                  >
                    {comp}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {(gameState === 'GAMEOVER' || gameState === 'SYNCING') && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="text-center bg-neutral-900 border border-red-600/20 p-8 md:p-16 rounded-[4rem] shadow-3xl relative overflow-hidden">
                <ShieldAlert size={80} className="text-red-600 mx-auto mb-6 animate-pulse" />
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
                  SYSTEM
                </h2>
                <span className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none text-red-600">FAILED</span>
                
                <div className="grid grid-cols-2 gap-4 mb-12">
                  <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                    <p className="text-[9px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Final_Score</p>
                    <p className="text-4xl font-black text-red-600 tabular-nums leading-none">{score}</p>
                  </div>
                  <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                    <p className="text-[9px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Max_Phase</p>
                    <p className="text-4xl font-black text-white tabular-nums leading-none">L{Math.floor(level)}</p>
                  </div>
                </div>

                {gameState === 'SYNCING' ? (
                  <div className="h-20 flex items-center justify-center gap-3 bg-neutral-950 rounded-2xl text-[10px] font-black text-neutral-700 tracking-[0.4em] uppercase">
                     <Loader2 size={16} className="animate-spin" /> Transmitting_Telemetry...
                  </div>
                ) : (
                  <Button onClick={() => setGameState('START')} className="w-full h-20 bg-white text-black font-black text-xl rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95">
                    RESTART <RotateCcw size={20} className="ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Meta HUD */}
      <div className="mt-12 flex flex-wrap justify-center gap-x-12 gap-y-4 text-[9px] font-black uppercase tracking-[0.5em] text-neutral-900">
        <span className="flex items-center gap-2"><Fingerprint size={12} /> ID: {getIdentity().id.substring(0, 10)}...</span>
        <span className="flex items-center gap-2"><Cpu size={12} /> Personal_Best: {highScore}</span>
        <span className="flex items-center gap-2 text-red-900"><ShieldCheck size={12} /> Verified_Profile</span>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Database, Trophy, Play, RotateCcw, 
  Zap, Heart, Timer, ShieldCheck, 
  Activity, Table, History, Calendar,
  Terminal, Search, ChevronRight, Loader2,
  Fingerprint, HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/config/api";

// --- SQL Question Pool (Provided by User) ---
interface SQLQuestion {
  question: string;
  ans: string;
  tier: number;
}
const SQL_POOL: SQLQuestion[] = [
  // Tier 1: Beginner - Basic SELECT & WHERE
  { question: "Fetch all users.", ans: "SELECT * FROM users;", tier: 1 },
  { question: "Find users over 18.", ans: "SELECT name FROM users WHERE age > 18;", tier: 1 },
  { question: "Names starting with A.", ans: "SELECT * FROM users WHERE name LIKE 'A%';", tier: 1 },
  { question: "Count total orders.", ans: "SELECT COUNT(*) FROM orders;", tier: 1 },
  { question: "Products under 100.", ans: "SELECT * FROM products WHERE price < 100;", tier: 1 },
  { question: "Employees hired after 2020.", ans: "SELECT * FROM employees WHERE hire_date > '2020-01-01';", tier: 1 },
  { question: "Distinct employee job titles.", ans: "SELECT DISTINCT job_title FROM employees;", tier: 1 },
  { question: "Customers in New York.", ans: "SELECT * FROM customers WHERE city = 'New York';", tier: 1 },
  { question: "Orders placed today.", ans: "SELECT * FROM orders WHERE order_date = CURRENT_DATE;", tier: 1 },
  { question: "Products out of stock.", ans: "SELECT * FROM products WHERE stock_quantity = 0;", tier: 1 },
  { question: "Sort emails alphabetically.", ans: "SELECT email FROM users ORDER BY email ASC;", tier: 1 },
  { question: "Products between 50-100.", ans: "SELECT * FROM products WHERE price BETWEEN 50 AND 100;", tier: 1 },
  { question: "Count active users.", ans: "SELECT COUNT(*) FROM users WHERE status = 'active';", tier: 1 },
  { question: "Products containing Pro.", ans: "SELECT name FROM products WHERE name LIKE '%Pro%';", tier: 1 },
  { question: "Orders quantity over 5.", ans: "SELECT * FROM orders WHERE quantity > 5;", tier: 1 },

  // Tier 2: Intermediate - Joins & Aggregations
  { question: "Join orders and users.", ans: "SELECT orders.*, users.name FROM orders JOIN users ON orders.user_id = users.id;", tier: 2 },
  { question: "Average salary by department.", ans: "SELECT dept, AVG(salary) FROM emp GROUP BY dept;", tier: 2 },
  { question: "Top five expensive products.", ans: "SELECT * FROM products ORDER BY price DESC LIMIT 5;", tier: 2 },
  { question: "Unique customer cities.", ans: "SELECT DISTINCT city FROM customers;", tier: 2 },
  { question: "Total sales per product.", ans: "SELECT product_id, SUM(amount) FROM sales GROUP BY product_id;", tier: 2 },
  { question: "Employees with department names.", ans: "SELECT e.name, d.dept_name FROM employees e JOIN departments d ON e.dept_id = d.id;", tier: 2 },
  { question: "Average rating per product.", ans: "SELECT product_id, AVG(rating) FROM reviews GROUP BY product_id HAVING COUNT(*) >= 10;", tier: 2 },
  { question: "Customers with 3+ orders.", ans: "SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id HAVING COUNT(*) > 3;", tier: 2 },
  { question: "Total revenue by month.", ans: "SELECT EXTRACT(MONTH FROM order_date) as month, SUM(total) FROM orders GROUP BY month;", tier: 2 },
  { question: "Find products never ordered.", ans: "SELECT p.* FROM products p LEFT JOIN order_items o ON p.id = o.product_id WHERE o.product_id IS NULL;", tier: 2 },
  { question: "Employees with manager names.", ans: "SELECT e.name as employee, m.name as manager FROM employees e JOIN employees m ON e.manager_id = m.id;", tier: 2 },
  { question: "Highest department salary.", ans: "SELECT dept_id, MAX(salary) FROM employees GROUP BY dept_id;", tier: 2 },
  { question: "Orders with customer details.", ans: "SELECT o.*, c.email, a.address FROM orders o JOIN customers c ON o.customer_id = c.id JOIN addresses a ON c.id = a.customer_id;", tier: 2 },
  { question: "Low stock product search.", ans: "SELECT * FROM products WHERE stock_quantity < reorder_level;", tier: 2 },
  { question: "Orders count per customer.", ans: "SELECT c.name, COUNT(o.id) FROM customers c LEFT JOIN orders o ON c.id = o.customer_id GROUP BY c.id;", tier: 2 },
  { question: "Average value by type.", ans: "SELECT customer_type, AVG(total_amount) FROM orders GROUP BY customer_type;", tier: 2 },
  { question: "Products with category names.", ans: "SELECT p.name, c.category_name FROM products p JOIN categories c ON p.category_id = c.id;", tier: 2 },
  { question: "Recent thirty day hires.", ans: "SELECT * FROM employees WHERE hire_date >= CURRENT_DATE - INTERVAL '30 days';", tier: 2 },
  { question: "Sales by product category.", ans: "SELECT c.name, SUM(s.amount) FROM sales s JOIN products p ON s.product_id = p.id JOIN categories c ON p.category_id = c.id GROUP BY c.name;", tier: 2 },
  { question: "Find missing phone numbers.", ans: "SELECT * FROM customers WHERE phone IS NULL;", tier: 2 },

  // Tier 3: Advanced - Subqueries & Complex Logic
  { question: "Delete older users.", ans: "DELETE FROM users WHERE last_login < '2020-01-01';", tier: 3 },
  { question: "Add bio column.", ans: "ALTER TABLE profiles ADD bio TEXT;", tier: 3 },
  { question: "Update specific product price.", ans: "UPDATE products SET price = 99 WHERE id = 10;", tier: 3 },
  { question: "Departments with 10+ staff.", ans: "SELECT dept FROM emp GROUP BY dept HAVING COUNT(*) > 10;", tier: 3 },
  { question: "Products above average price.", ans: "SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products);", tier: 3 },
  { question: "Customers ordering all products.", ans: "SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(DISTINCT product_id) = (SELECT COUNT(*) FROM products);", tier: 3 },
  { question: "High earning department staff.", ans: "SELECT e.* FROM employees e WHERE salary > (SELECT AVG(salary) FROM employees WHERE dept_id = e.dept_id);", tier: 3 },
  { question: "Second highest salary.", ans: "SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);", tier: 3 },
  { question: "Rank salaries by department.", ans: "SELECT name, salary, RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) FROM employees;", tier: 3 },
  { question: "Calculate running sales total.", ans: "SELECT date, amount, SUM(amount) OVER (ORDER BY date) as running_total FROM sales;", tier: 3 },
  { question: "Find consecutive customer orders.", ans: "WITH OrderedOrders AS (SELECT customer_id, order_date, LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) as prev_date FROM orders) SELECT DISTINCT customer_id FROM OrderedOrders WHERE order_date = prev_date + INTERVAL '1 day';", tier: 3 },
  { question: "Monthly sales growth percentage.", ans: "SELECT month, sales, ((sales - LAG(sales) OVER (ORDER BY month)) / LAG(sales) OVER (ORDER BY month)) * 100 as growth_pct FROM monthly_sales;", tier: 3 },
  { question: "Find duplicate user emails.", ans: "SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;", tier: 3 },
  { question: "Transaction for stock update.", ans: "BEGIN; UPDATE products SET stock = stock - 10 WHERE id = 5; INSERT INTO order_log (product_id, quantity) VALUES (5, 10); COMMIT;", tier: 3 },
  { question: "Recursive employee hierarchy.", ans: "WITH RECURSIVE EmpHierarchy AS (SELECT id, name, manager_id, 1 as level FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id, eh.level + 1 FROM employees e JOIN EmpHierarchy eh ON e.manager_id = eh.id) SELECT * FROM EmpHierarchy;", tier: 3 },
  { question: "Price increase over 20%.", ans: "SELECT p.id, p.name, (p.current_price - p.old_price) / p.old_price * 100 as increase_pct FROM products p WHERE (p.current_price - p.old_price) / p.old_price * 100 > 20;", tier: 3 },
  { question: "High lifetime value customers.", ans: "SELECT customer_id, SUM(total) as lifetime_value FROM orders GROUP BY customer_id HAVING SUM(total) > 1000;", tier: 3 },
  { question: "Products in multiple categories.", ans: "SELECT p.name FROM products p JOIN product_categories pc ON p.id = pc.product_id GROUP BY p.id HAVING COUNT(DISTINCT pc.category_id) > 1;", tier: 3 },
  { question: "Update inactive user status.", ans: "UPDATE users SET status = 'inactive' WHERE last_login < CURRENT_DATE - INTERVAL '180 days';", tier: 3 },
  { question: "Median salary by department.", ans: "SELECT dept_id, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) as median_salary FROM employees GROUP BY dept_id;", tier: 3 },

  // Tier 4: Expert - Analytics & Performance
  { question: "Longest daily login streak.", ans: "WITH LoginGroups AS (SELECT user_id, login_date, login_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) as grp FROM logins) SELECT user_id, COUNT(*) as streak FROM LoginGroups GROUP BY user_id, grp ORDER BY streak DESC LIMIT 1;", tier: 4 },
  { question: "Moving average of sales.", ans: "SELECT date, amount, AVG(amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as moving_avg FROM daily_sales;", tier: 4 },
  { question: "Find sequence number gaps.", ans: "WITH NumberSeries AS (SELECT generate_series(MIN(id), MAX(id)) as expected FROM table) SELECT expected FROM NumberSeries WHERE expected NOT IN (SELECT id FROM table);", tier: 4 },
  { question: "Top three category products.", ans: "SELECT category_id, product_id, sales, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY sales DESC) as rank FROM product_sales WHERE rank <= 3;", tier: 4 },
  { question: "Find common user followers.", ans: "SELECT f1.follower_id FROM followers f1 JOIN followers f2 ON f1.follower_id = f2.follower_id WHERE f1.user_id = 1 AND f2.user_id = 2;", tier: 4 },
  { question: "Salary cumulative distribution.", ans: "SELECT salary, CUME_DIST() OVER (ORDER BY salary) as cume_dist FROM employees;", tier: 4 },
  { question: "Frequent product purchase pairs.", ans: "SELECT a.product_id as prod1, b.product_id as prod2, COUNT(*) as times_bought_together FROM order_items a JOIN order_items b ON a.order_id = b.order_id AND a.product_id < b.product_id GROUP BY a.product_id, b.product_id HAVING COUNT(*) > 5;", tier: 4 },
  { question: "Salaries above standard deviation.", ans: "SELECT e.* FROM employees e WHERE salary > (SELECT AVG(salary) + 2 * STDDEV(salary) FROM employees WHERE dept_id = e.dept_id);", tier: 4 },
  { question: "Days to first purchase.", ans: "SELECT u.id, MIN(o.order_date) - u.registration_date as days_to_first_purchase FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id, u.registration_date;", tier: 4 },
  { question: "Calculate cohort retention rate.", ans: "WITH FirstMonth AS (SELECT user_id, DATE_TRUNC('month', MIN(activity_date)) as cohort_month FROM activities GROUP BY user_id) SELECT cohort_month, COUNT(DISTINCT user_id) as cohort_size, COUNT(DISTINCT CASE WHEN activity_date >= cohort_month + INTERVAL '1 month' THEN user_id END) * 100.0 / COUNT(DISTINCT user_id) as retention_rate FROM FirstMonth f JOIN activities a ON f.user_id = a.user_id GROUP BY cohort_month;", tier: 4 },
  { question: "Seasonal sales pattern detection.", ans: "SELECT product_id, EXTRACT(MONTH FROM sale_date) as month, AVG(quantity) as avg_sales FROM sales GROUP BY product_id, month HAVING STDDEV(avg_sales) > (SELECT AVG(STDDEV(quantity)) FROM sales GROUP BY product_id);", tier: 4 },
  { question: "Suspicious login pattern detection.", ans: "SELECT user_id, COUNT(DISTINCT location) as unique_locations, MAX(login_time) - MIN(login_time) as time_span FROM logins WHERE login_time > CURRENT_TIMESTAMP - INTERVAL '1 hour' GROUP BY user_id HAVING COUNT(DISTINCT location) > 3 AND MAX(login_time) - MIN(login_time) < INTERVAL '5 minutes';", tier: 4 },
  { question: "Predict customer churn probability.", ans: "WITH UserActivity AS (SELECT user_id, MAX(activity_date) as last_active, CURRENT_DATE - MAX(activity_date) as days_inactive FROM activities GROUP BY user_id) SELECT user_id, 1.0 / (1 + EXP(-(0.1 * days_inactive - 5))) as churn_probability FROM UserActivity;", tier: 4 },
  { question: "Calculate reorder point demand.", ans: "SELECT product_id, AVG(demand) as avg_demand, STDDEV(demand) as std_demand, AVG(lead_time) as avg_lead_time, (AVG(demand) * AVG(lead_time)) + (1.65 * STDDEV(demand) * SQRT(AVG(lead_time))) as reorder_point FROM inventory GROUP BY product_id;", tier: 4 },
  { question: "Predict customer LTV.", ans: "WITH CustomerMetrics AS (SELECT customer_id, COUNT(DISTINCT order_id) as order_count, SUM(total) as total_spent, MAX(order_date) - MIN(order_date) as customer_tenure FROM orders GROUP BY customer_id) SELECT customer_id, 0.5 * order_count + 0.3 * total_spent + 0.2 * EXTRACT(DAY FROM customer_tenure) as predicted_ltv FROM CustomerMetrics;", tier: 4 },
  { question: "Find data quality issues.", ans: "SELECT 'missing_emails' as issue, COUNT(*) as count FROM users WHERE email IS NULL UNION SELECT 'duplicate_phones', COUNT(*) FROM (SELECT phone FROM customers GROUP BY phone HAVING COUNT(*) > 1) dups UNION SELECT 'price_outliers', COUNT(*) FROM products WHERE price > (SELECT AVG(price) + 3 * STDDEV(price) FROM products);", tier: 4 },
  { question: "Create composite order index.", ans: "CREATE INDEX idx_orders_user_date ON orders(user_id, order_date) INCLUDE (total);", tier: 4 },
  { question: "Partition table by date.", ans: "CREATE TABLE orders_partitioned PARTITION BY RANGE (order_date);", tier: 4 },
  { question: "Trigger for soft delete.", ans: "CREATE TRIGGER soft_delete_users INSTEAD OF DELETE ON users FOR EACH ROW EXECUTE FUNCTION archive_user();", tier: 4 },
  { question: "Materialized daily sales view.", ans: "CREATE MATERIALIZED VIEW daily_sales_summary AS SELECT date, SUM(amount) as total_sales, COUNT(DISTINCT customer_id) as unique_customers FROM sales GROUP BY date;", tier: 4 },
];

type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SYNCING';

export default function SqlSniper() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(12);
  const [level, setLevel] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
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
  // --- Identity & Telemetry Sync ---
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
      userId: user.id || user._id,
      name: user.name,
      email: user.email,
      game: "SQL Sniper",
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
      toast.error("SYNC_OFFLINE", { description: "Mission data cached locally." });
    } finally {
      setGameState('GAMEOVER');
    }
  };

  useEffect(() => {
    const savedHigh = localStorage.getItem("sql_sniper_high");
    if (savedHigh) setHighScore(parseInt(savedHigh));
    const savedHistory = localStorage.getItem("sql_sniper_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // --- Core Game Logic ---
  const generateQuestion = useCallback(() => {
    // HARDER SCALING: Introduce T3/T4 queries much earlier
    const targetTier = level < 5 ? 1 : level < 12 ? 2 : level < 20 ? 3 : 4;
    const pool = SQL_POOL.filter(q => q.tier <= targetTier);
    const nextIdx = Math.floor(Math.random() * pool.length);
    
    // Find absolute index in main pool
    const actualIdx = SQL_POOL.findIndex(s => s.question === pool[nextIdx].question);
    setCurrentIdx(actualIdx);

    // Hard Options Generation: Pick similar queries to confuse the user
    const correctAns = pool[nextIdx].ans;
    const opts = new Set<string>();
    opts.add(correctAns);
    while (opts.size < 4) {
      opts.add(SQL_POOL[Math.floor(Math.random() * SQL_POOL.length)].ans);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));

    // Time decay: Starts at 12s, floor at 4s
    setTimeLeft(Math.max(4.0, 12 - (level * 0.35)));
  }, [level]);

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
    if (choice === SQL_POOL[currentIdx].ans) {
      setScore(s => s + (50 * SQL_POOL[currentIdx].tier));
      setLevel(l => l + 1);
      toast.success("QUERY_SUCCESS", { duration: 500 });
      generateQuestion();
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    if (lives > 1) {
      setLives(l => l - 1);
      toast.error("SYNTAX_ERROR", { description: "Connection interrupted." });
      generateQuestion();
    } else {
      pushStatsToBackend(score, level);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-emerald-600/30 overflow-hidden">
      
      {/* --- HUD --- */}
      <div className="w-full max-w-2xl bg-neutral-900/20 border border-white/5 p-6 rounded-[2.5rem] md:rounded-[3rem] backdrop-blur-3xl mb-8 shadow-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Database size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Rows_Fetched</p>
              <p className="text-2xl font-black tabular-nums tracking-tighter">{score}</p>
            </div>
          </div>

          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={22} className={cn("transition-all", i < lives ? "text-red-600 fill-red-600" : "text-neutral-900")} />
            ))}
          </div>

          <div className="text-right">
            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Infiltration_Lvl</p>
            <span className={cn("text-xl font-black tabular-nums", timeLeft < 3 ? "text-red-600 animate-pulse" : "text-white")}>
              {timeLeft.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <AnimatePresence mode="wait">
          
          {/* --- VIEW: START --- */}
          {gameState === 'START' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10 py-12">
              <div className="space-y-4">
                <div className="inline-flex p-10 bg-emerald-500/5 rounded-[4rem] border border-emerald-500/10 shadow-[0_0_80px_rgba(16,185,129,0.1)]">
                  <Terminal size={100} className="text-emerald-500" />
                </div>
                <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-none">
                  SQL_<span className="text-emerald-500">SNIPER</span>
                </h1>
                <p className="text-neutral-500 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">
                  Analyze_Requirement // Inject_Correct_Query // Phase_v4.0
                </p>
              </div>
              <Button onClick={() => { setScore(0); setLives(3); setLevel(1); setGameState('PLAYING'); generateQuestion(); }} 
                className="w-full h-24 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-3xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all">
                START <Play size={28} className="ml-3 fill-black" />
              </Button>
            </motion.div>
          )}

          {/* --- VIEW: PLAYING --- */}
          {gameState === 'PLAYING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 12) * 100}%` }}
                  className={cn("h-full transition-colors", timeLeft < 3 ? "bg-red-600" : "bg-emerald-500")}
                />
              </div>

              {/* Data Requirement Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-700" />
                <Card className="bg-neutral-900/40 border-2 border-white/5 rounded-[4rem] p-10 md:p-16 text-center relative z-10 backdrop-blur-xl">
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] mb-6 tracking-[0.4em]">DATA_SPECIFICATION</Badge>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight italic">
                    "{SQL_POOL[currentIdx].question}"
                  </h2>
                </Card>
              </div>

              {/* Answer Matrix: 1-column for mobile readability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleAnswer(opt)}
                    className="h-auto min-h-[100px] py-6 px-8 bg-neutral-900 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-left justify-start rounded-[2rem] transition-all transform active:scale-95 group"
                  >
                    <div className="flex gap-4 items-start">
                      <ChevronRight size={18} className="text-neutral-700 group-hover:text-emerald-500 mt-1 shrink-0" />
                      <span className="font-mono text-sm md:text-base text-emerald-400 break-all leading-relaxed">{opt}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {(gameState === 'GAMEOVER' || gameState === 'SYNCING') && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
              <div className="text-center bg-neutral-900/50 p-12 rounded-[4rem] border border-red-900/20 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
                 <h2 className="text-6xl md:text-8xl font-black text-red-600 uppercase italic tracking-tighter mb-10 relative z-10">CONNECTION_LOST</h2>
                 
                 <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
                   <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Rows_Secured</p>
                     <p className="text-5xl font-black text-emerald-500 leading-none">{score}</p>
                   </div>
                   <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5">
                     <p className="text-[10px] font-black text-neutral-600 uppercase mb-2 tracking-widest">Max_Depth</p>
                     <p className="text-5xl font-black text-white leading-none">L{level}</p>
                   </div>
                 </div>

                 {gameState === 'SYNCING' ? (
                   <div className="h-20 flex items-center justify-center gap-3 bg-neutral-950 rounded-2xl text-[10px] font-black text-neutral-700 tracking-[0.4em] uppercase">
                      <Loader2 size={16} className="animate-spin" /> UPLOADING_MISSION_STATS...
                   </div>
                 ) : (
                   <Button onClick={() => setGameState('START')} className="w-full h-20 bg-white text-black font-black text-2xl rounded-3xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-2xl">
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
        <span className="flex items-center gap-2"><Fingerprint size={14} /> ID: {getIdentity().id.substring(0,10)}...</span>
        <span className="flex items-center gap-2"><HardDrive size={14} /> pb_node: {highScore}</span>
        <span className="flex items-center gap-2 italic">v2026.VOID-ARCADE</span>
      </div>
    </div>
  );
}
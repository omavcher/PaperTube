"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  RefreshCw, Download, Copy, Check, Code2, Eye, SplitSquareHorizontal,
  Monitor, Tablet, Smartphone, ChevronDown, PanelLeft, Palette,
  RotateCcw, FileCode, FileType, Braces, Terminal, X, AlertTriangle,
  Info, ChevronRight, WrapText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

/* ─────────────────────── DEFAULT CODE ─────────────────────────── */
const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Page</title>
</head>
<body>
  <div class="hero">
    <div class="glow"></div>
    <h1>Hello, World! <span>✨</span></h1>
    <p>Edit the HTML, CSS, and JS panels to see live changes.</p>
    <button onclick="handleClick()">Click Me</button>
    <p class="counter" id="counter">Clicks: 0</p>
  </div>
</body>
</html>`;

const DEFAULT_CSS = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #0a0a0a;
  color: #fff;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero {
  text-align: center;
  padding: 40px 24px;
  position: relative;
}

.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

h1 {
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #fff 0%, #a3a3a3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
}

h1 span { -webkit-text-fill-color: initial; }

p {
  color: #737373;
  font-size: 1rem;
  max-width: 400px;
  margin: 0 auto 28px;
  line-height: 1.6;
}

button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 14px;
}

button:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(220,38,38,0.35);
}

button:active { transform: translateY(0); }

.counter {
  color: #525252;
  font-size: 0.8rem;
  font-family: monospace;
}`;

const DEFAULT_JS = `let count = 0;

function handleClick() {
  count++;
  document.getElementById('counter').textContent = \`Clicks: \${count}\`;
  const btn = document.querySelector('button');
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => btn.style.transform = '', 150);
}

console.log('✅ JavaScript engine ready!');`;

/* ─────────────────────── TEMPLATES ────────────────────────────── */
const TEMPLATES = [
  {
    id: "starter", name: "🚀 Starter", icon: "🚀",
    html: DEFAULT_HTML, css: DEFAULT_CSS, js: DEFAULT_JS,
  },
  {
    id: "blank", name: "📄 Blank HTML", icon: "📄",
    html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>Document</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>`,
    css: `body { font-family: system-ui, sans-serif; margin: 24px; }`,
    js: "",
  },
  {
    id: "animation", name: "🎨 CSS Animation", icon: "🎨",
    html: `<div class="scene">\n  <div class="box"></div>\n  <div class="ring"></div>\n</div>`,
    css: `* { margin:0; padding:0; box-sizing:border-box; }\nbody { background:#111; display:flex; align-items:center; justify-content:center; height:100vh; }\n.scene { position:relative; }\n.box { width:80px; height:80px; border-radius:20px; background:linear-gradient(135deg,#ef4444,#8b5cf6); animation:spin 2s ease-in-out infinite; }\n.ring { position:absolute; inset:-20px; border-radius:50%; border:3px solid rgba(139,92,246,0.4); animation:ring 2s ease-in-out infinite reverse; }\n@keyframes spin { 0%,100%{transform:rotate(0) scale(1)} 50%{transform:rotate(180deg) scale(1.2)} }\n@keyframes ring { 0%,100%{transform:rotate(0) scale(1);opacity:0.4} 50%{transform:rotate(-90deg) scale(1.3);opacity:1} }`,
    js: "",
  },
  {
    id: "counter", name: "🔢 Counter App", icon: "🔢",
    html: `<div class="app">\n  <h1>Counter</h1>\n  <div class="display" id="val">0</div>\n  <div class="controls">\n    <button onclick="change(-1)">−</button>\n    <button onclick="reset()">⟳</button>\n    <button onclick="change(1)">+</button>\n  </div>\n</div>`,
    css: `* {box-sizing:border-box;margin:0;padding:0}\nbody{font-family:system-ui;background:#09090b;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh}\n.app{text-align:center;padding:48px 64px;background:#18181b;border:1px solid #27272a;border-radius:24px;box-shadow:0 25px 60px rgba(0,0,0,0.5)}\nh1{font-size:1rem;font-weight:600;text-transform:uppercase;letter-spacing:.15em;color:#52525b;margin-bottom:32px}\n.display{font-size:7rem;font-weight:800;line-height:1;margin-bottom:32px;transition:all .2s;font-feature-settings:'tnum'}\n.controls{display:flex;gap:12px;justify-content:center}\nbutton{width:56px;height:56px;border-radius:50%;border:2px solid #3f3f46;background:transparent;color:#fff;font-size:1.3rem;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center}\nbutton:hover{background:#3f3f46;border-color:#71717a;transform:scale(1.1)}\nbutton:active{transform:scale(0.95)}`,
    js: `let n = 0;\nfunction change(d) {\n  n += d;\n  const el = document.getElementById('val');\n  el.textContent = n;\n  el.style.color = n > 0 ? '#22c55e' : n < 0 ? '#ef4444' : '#fff';\n  el.style.transform = 'scale(1.1)';\n  setTimeout(() => el.style.transform = '', 150);\n}\nfunction reset() { n = 0; change(0); }`,
  },
  {
    id: "todo", name: "✅ Todo List", icon: "✅",
    html: `<div class="app">\n  <h1>Tasks</h1>\n  <div class="input-row">\n    <input id="inp" placeholder="Add a task..." onkeydown="if(event.key==='Enter')add()" />\n    <button onclick="add()">Add</button>\n  </div>\n  <ul id="list"></ul>\n</div>`,
    css: `* {box-sizing:border-box;margin:0;padding:0}\nbody{font-family:system-ui;background:#09090b;color:#fff;display:flex;justify-content:center;padding:40px 16px}\n.app{width:100%;max-width:480px}\nh1{font-size:2rem;font-weight:800;margin-bottom:24px}\n.input-row{display:flex;gap:8px;margin-bottom:16px}\ninput{flex:1;background:#18181b;border:1px solid #27272a;border-radius:10px;padding:10px 14px;color:#fff;font-size:14px;outline:none}\ninput:focus{border-color:#3b82f6}\nbutton{background:#3b82f6;color:#fff;border:none;border-radius:10px;padding:10px 16px;font-weight:600;cursor:pointer;transition:.2s}\nbutton:hover{background:#2563eb}\nul{list-style:none;display:flex;flex-direction:column;gap:6px}\nli{display:flex;align-items:center;gap:10px;background:#18181b;border:1px solid #27272a;border-radius:10px;padding:12px 14px;cursor:pointer;transition:.2s}\nli:hover{border-color:#3f3f46}\nli.done span{text-decoration:line-through;color:#52525b}\n.check{width:18px;height:18px;border-radius:50%;border:2px solid #3f3f46;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px}\nli.done .check{background:#22c55e;border-color:#22c55e}\n.del{margin-left:auto;background:none;border:none;color:#52525b;cursor:pointer;padding:2px 6px;border-radius:6px}\n.del:hover{color:#ef4444;background:#27272a}`,
    js: `let tasks = [];\nfunction add() {\n  const inp = document.getElementById('inp');\n  const text = inp.value.trim();\n  if (!text) return;\n  tasks.push({ text, done: false });\n  inp.value = '';\n  render();\n}\nfunction toggle(i) { tasks[i].done = !tasks[i].done; render(); }\nfunction remove(i) { tasks.splice(i, 1); render(); }\nfunction render() {\n  const list = document.getElementById('list');\n  list.innerHTML = tasks.map((t, i) => \`<li class="\${t.done ? 'done' : ''}" onclick="toggle(\${i})">\n    <div class="check">\${t.done ? '✓' : ''}</div>\n    <span>\${t.text}</span>\n    <button class="del" onclick="event.stopPropagation();remove(\${i})">✕</button>\n  </li>\`).join('');\n}`,
  },
  {
    id: "clock", name: "🕐 Digital Clock", icon: "🕐",
    html: `<div class="clock">\n  <div class="time" id="time">00:00:00</div>\n  <div class="date" id="date"></div>\n</div>`,
    css: `* {margin:0;padding:0;box-sizing:border-box}\nbody{background:#09090b;display:flex;align-items:center;justify-content:center;height:100vh;font-family:'Courier New',monospace}\n.clock{text-align:center}\n.time{font-size:clamp(3rem,12vw,8rem);font-weight:700;color:#fff;letter-spacing:0.05em;text-shadow:0 0 30px rgba(59,130,246,.5)}\n.date{font-size:1rem;color:#52525b;margin-top:12px;letter-spacing:.2em;text-transform:uppercase}`,
    js: `function tick() {\n  const now = new Date();\n  document.getElementById('time').textContent = now.toLocaleTimeString('en-US', {hour12:false});\n  document.getElementById('date').textContent = now.toLocaleDateString('en-US', {weekday:'long',year:'numeric',month:'long',day:'numeric'});\n}\ntick();\nsetInterval(tick, 1000);`,
  },
];

/* ─────────────────────── TYPES ─────────────────────────────────── */
type Tab = "html" | "css" | "js";
type ViewMode = "split" | "editor" | "preview";
type Viewport = "desktop" | "tablet" | "mobile";
interface ConsoleLine { type: "log" | "warn" | "error" | "info"; text: string; }

/* ─────────────────────── BUILD PREVIEW DOC ─────────────────────── */
function buildDoc(html: string, css: string, js: string): string {
  // Intercept console.* to relay back to parent
  const consoleInterceptor = `
<script>
(function() {
  var _log = console.log, _warn = console.warn, _error = console.error, _info = console.info;
  function relay(type, args) {
    try {
      window.parent.postMessage({ __type: 'console', level: type, text: Array.from(args).map(function(a){
        try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); } catch(e) { return String(a); }
      }).join(' ') }, '*');
    } catch(e) {}
  }
  console.log = function() { relay('log', arguments); _log.apply(console, arguments); };
  console.warn = function() { relay('warn', arguments); _warn.apply(console, arguments); };
  console.error = function() { relay('error', arguments); _error.apply(console, arguments); };
  console.info = function() { relay('info', arguments); _info.apply(console, arguments); };
  window.onerror = function(msg, src, line, col) {
    relay('error', ['❌ ' + msg + ' (line ' + line + ')']);
    return false;
  };
})();
<\/script>`;

  let doc = html.trim();

  // Wrap bare fragments in full HTML boilerplate
  if (!/<html/i.test(doc)) {
    doc = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${doc}</body></html>`;
  }

  const styleTag = css.trim() ? `<style>\n${css}\n</style>` : "";
  const scriptTag = js.trim()
    ? `<script>\ntry {\n${js}\n} catch(e) { console.error(e.message || e); }\n<\/script>`
    : "";

  // Inject console interceptor right after <head>
  if (/<head>/i.test(doc)) {
    doc = doc.replace(/<head>/i, `<head>${consoleInterceptor}`);
  } else if (/<html/i.test(doc)) {
    doc = doc.replace(/<html[^>]*>/i, (m) => `${m}<head>${consoleInterceptor}</head>`);
  }

  // Inject style before </head>
  if (styleTag) {
    if (/<\/head>/i.test(doc)) {
      doc = doc.replace(/<\/head>/i, `${styleTag}\n</head>`);
    } else {
      doc = doc.replace(/<body/i, `${styleTag}\n<body`);
    }
  }

  // Inject script before </body>
  if (scriptTag) {
    if (/<\/body>/i.test(doc)) {
      doc = doc.replace(/<\/body>/i, `${scriptTag}\n</body>`);
    } else {
      doc += scriptTag;
    }
  }

  return doc;
}

/* ─────────────────────── CODE EDITOR ───────────────────────────── */
function CodeEditor({ value, onChange, language, wordWrap }: {
  value: string;
  onChange: (v: string) => void;
  language: Tab;
  wordWrap: boolean;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const lnRef = useRef<HTMLDivElement>(null);

  const lineCount = useMemo(() => value.split("\n").length, [value]);

  // Sync scroll between line numbers and textarea
  const handleScroll = () => {
    if (lnRef.current && taRef.current) {
      lnRef.current.scrollTop = taRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = taRef.current!;
    const { selectionStart: ss, selectionEnd: se } = ta;
    const val = value;

    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: remove indent
        const before = val.slice(0, ss);
        const lineStart = before.lastIndexOf("\n") + 1;
        if (val.slice(lineStart, lineStart + 2) === "  ") {
          const next = val.slice(0, lineStart) + val.slice(lineStart + 2);
          onChange(next);
          requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = ss - 2; });
        }
      } else {
        const next = val.slice(0, ss) + "  " + val.slice(se);
        onChange(next);
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = ss + 2; });
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const before = val.slice(0, ss);
      const currentLine = before.split("\n").pop() || "";
      const indent = currentLine.match(/^(\s*)/)?.[1] ?? "";
      const extra = /[{([<]$/.test(currentLine.trimEnd()) ? "  " : "";
      const next = val.slice(0, ss) + "\n" + indent + extra + val.slice(se);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = ss + 1 + indent.length + extra.length;
      });
      return;
    }

    // Auto-close pairs
    const closingMap: Record<string, string> = { "{": "}", "(": ")", "[": "]", '"': '"', "`": "`", "'": "'" };
    if (closingMap[e.key] && ss === se) {
      // Skip if next char already has the closing bracket
      const nextChar = val[ss];
      if (nextChar === closingMap[e.key]) {
        e.preventDefault();
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = ss + 1; });
        return;
      }
      e.preventDefault();
      const next = val.slice(0, ss) + e.key + closingMap[e.key] + val.slice(se);
      onChange(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = ss + 1; });
      return;
    }

    // Skip over closing bracket
    if (["}",")","]"].includes(e.key) && val[ss] === e.key && ss === se) {
      e.preventDefault();
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = ss + 1; });
      return;
    }

    // Ctrl+/ → toggle line comment
    if ((e.ctrlKey || e.metaKey) && e.key === "/") {
      e.preventDefault();
      const before = val.slice(0, ss);
      const lineStart = before.lastIndexOf("\n") + 1;
      const lineEnd = val.indexOf("\n", ss) === -1 ? val.length : val.indexOf("\n", ss);
      const line = val.slice(lineStart, lineEnd);
      const commentChar = language === "html" ? null : "//";
      if (!commentChar) return;
      let next: string;
      if (line.trimStart().startsWith(commentChar)) {
        next = val.slice(0, lineStart) + line.replace(/^(\s*)\/\/\s?/, "$1") + val.slice(lineEnd);
      } else {
        const leading = line.match(/^(\s*)/)?.[1] ?? "";
        next = val.slice(0, lineStart) + leading + commentChar + " " + line.slice(leading.length) + val.slice(lineEnd);
      }
      onChange(next);
      return;
    }
  };

  const bgColor: Record<Tab, string> = { html: "#1e1e1e", css: "#1e1e1e", js: "#1e1e1e" };

  return (
    <div className="relative flex h-full overflow-hidden" style={{ background: bgColor[language] }}>
      {/* Line numbers */}
      <div
        ref={lnRef}
        className="shrink-0 overflow-hidden select-none"
        style={{
          minWidth: 48,
          background: "#1e1e1e",
          color: "#495565",
          fontSize: 12,
          lineHeight: "1.625rem",
          paddingTop: 12,
          paddingRight: 12,
          paddingLeft: 8,
          textAlign: "right",
          userSelect: "none",
          overflowY: "hidden",
        }}
        aria-hidden
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: "#333", flexShrink: 0 }} />

      {/* Code textarea */}
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        spellCheck={false}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        style={{
          flex: 1,
          background: "#1e1e1e",
          color: "#d4d4d4",
          resize: "none",
          outline: "none",
          border: "none",
          fontSize: 13,
          lineHeight: "1.625rem",
          paddingTop: 12,
          paddingLeft: 12,
          paddingRight: 16,
          paddingBottom: 12,
          fontFamily: "'Cascadia Code','Fira Code','JetBrains Mono','Consolas',monospace",
          caretColor: "white",
          whiteSpace: wordWrap ? "pre-wrap" : "pre",
          overflowWrap: wordWrap ? "break-word" : "normal",
          overflowX: wordWrap ? "hidden" : "auto",
          tabSize: 2,
        }}
      />
    </div>
  );
}

/* ─────────────────────── LIVE PREVIEW ──────────────────────────── */
function LivePreview({ html, css, js, viewport, onConsole }: {
  html: string; css: string; js: string;
  viewport: Viewport;
  onConsole: (line: ConsoleLine) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const srcdoc = useMemo(() => buildDoc(html, css, js), [html, css, js]);

  // Listen for console messages from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.__type === "console") {
        onConsole({ type: e.data.level as ConsoleLine["type"], text: e.data.text });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onConsole]);

  const wrapperClass = {
    desktop: "w-full h-full",
    tablet: "w-[768px] max-w-full h-full",
    mobile: "w-[375px] max-w-full h-full",
  }[viewport];

  return (
    <div className="flex justify-center h-full w-full overflow-auto bg-[#1a1a1a]"
      style={{ padding: viewport === "desktop" ? 0 : "8px 0" }}
    >
      <div
        className={cn(
          "bg-white shadow-2xl overflow-hidden transition-all duration-300",
          wrapperClass,
          viewport !== "desktop" && "rounded-xl border border-white/10 mt-1"
        )}
      >
        <iframe
          ref={iframeRef}
          title="Live Preview"
          srcDoc={srcdoc}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          className="w-full h-full border-none block"
        />
      </div>
    </div>
  );
}

/* ─────────────────────── CONSOLE PANEL ─────────────────────────── */
function ConsolePanel({ lines, onClear }: { lines: ConsoleLine[]; onClear: () => void }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const icons: Record<ConsoleLine["type"], React.ReactNode> = {
    log: <ChevronRight size={10} className="text-[#858585]" />,
    info: <Info size={10} className="text-[#3b82f6]" />,
    warn: <AlertTriangle size={10} className="text-[#f59e0b]" />,
    error: <X size={10} className="text-[#ef4444]" />,
  };
  const colors: Record<ConsoleLine["type"], string> = {
    log: "text-[#d4d4d4]",
    info: "text-[#3b82f6]",
    warn: "text-[#f59e0b]",
    error: "text-[#ef4444]",
  };
  const bgs: Record<ConsoleLine["type"], string> = {
    log: "",
    info: "bg-[#1d3461]/30",
    warn: "bg-[#422006]/40",
    error: "bg-[#450a0a]/40",
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-[#333] shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#858585] flex items-center gap-1.5">
          <Terminal size={10} /> Console
          {lines.length > 0 && (
            <span className="bg-[#3f3f46] text-[#d4d4d4] px-1.5 rounded-full text-[8px]">{lines.length}</span>
          )}
        </span>
        <button onClick={onClear} className="text-[9px] text-[#858585] hover:text-white transition px-2 py-0.5 rounded hover:bg-[#3a3a3a]">
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-6">
        {lines.length === 0 ? (
          <p className="text-[#525252] text-center py-8 text-[11px]">No console output</p>
        ) : (
          lines.map((line, i) => (
            <div key={i} className={cn("flex items-start gap-2 px-3 py-0.5 border-b border-[#2d2d2d]", bgs[line.type])}>
              <span className="mt-1.5 shrink-0">{icons[line.type]}</span>
              <pre className={cn("whitespace-pre-wrap break-all", colors[line.type])}>{line.text}</pre>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

/* ─────────────────────── MAIN COMPONENT ─────────────────────────── */
export default function HtmlPreviewClient() {
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [js, setJs] = useState(DEFAULT_JS);

  const [activeTab, setActiveTab] = useState<Tab>("html");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [wordWrap, setWordWrap] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [splitPos, setSplitPos] = useState(50); // percent

  // Draggable divider
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPos(Math.max(20, Math.min(80, pct)));
    };
    const up = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, []);

  const handleConsole = useCallback((line: ConsoleLine) => {
    setConsoleLines((prev) => [...prev.slice(-199), line]);
  }, []);

  const tabConfig = [
    { id: "html" as Tab, label: "index.html", icon: <FileCode size={12} />, color: "text-orange-400", accent: "border-orange-500", ext: "HTML" },
    { id: "css" as Tab, label: "style.css", icon: <FileType size={12} />, color: "text-blue-400", accent: "border-blue-400", ext: "CSS" },
    { id: "js" as Tab, label: "script.js", icon: <Braces size={12} />, color: "text-yellow-400", accent: "border-yellow-400", ext: "JS" },
  ];

  const tabValues: Record<Tab, { value: string; set: (v: string) => void }> = {
    html: { value: html, set: setHtml },
    css: { value: css, set: setCss },
    js: { value: js, set: setJs },
  };

  const handleCopyAll = async () => {
    const out = `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}\n\n// JavaScript\n${js}`;
    try {
      await navigator.clipboard.writeText(out);
      setCopied(true);
      toast.success("All code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard access denied");
    }
  };

  const handleCopyCurrent = async () => {
    try {
      await navigator.clipboard.writeText(tabValues[activeTab].value);
      toast.success(`${activeTab.toUpperCase()} copied!`);
    } catch {
      toast.error("Clipboard access denied");
    }
  };

  const handleDownload = () => {
    const doc = buildDoc(html, css, js);
    const blob = new Blob([doc], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Downloaded index.html");
  };

  const handleReset = () => {
    setHtml(DEFAULT_HTML); setCss(DEFAULT_CSS); setJs(DEFAULT_JS);
    setConsoleLines([]);
    toast.success("Reset to default starter code");
  };

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setHtml(t.html); setCss(t.css); setJs(t.js);
    setConsoleLines([]);
    setShowTemplates(false);
    toast.success(`"${t.name}" template applied`);
  };

  const currentTab = tabConfig.find((t) => t.id === activeTab)!;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState("600px");

  useEffect(() => {
    const measure = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      // On mobile there's also a bottom dock of ~80px
      const isMobile = window.innerWidth < 1024;
      const bottomPad = isMobile ? 80 : 0;
      setEditorHeight(`${window.innerHeight - top - bottomPad}px`);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col bg-[#1e1e1e] text-white font-mono overflow-hidden relative z-[50]"
      style={{ height: editorHeight }}
    >
      {/* ── Title Bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#323233] border-b border-[#1a1a1a] shrink-0 relative z-[60]">
        {/* Left: dots + title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Code2 size={14} className="text-[#569cd6] shrink-0" />
            <span className="text-[11px] font-semibold text-[#cccccc] hidden sm:block truncate">
              HTML · CSS · JS — Live Editor
            </span>
            <span className="text-[11px] font-semibold text-[#cccccc] sm:hidden">HTML Editor</span>
          </div>
        </div>

       

        {/* Right: actions */}
        <div className="flex items-center gap-0.5">
          {/* Templates */}
          <div className="relative">
            <button
              id="templates-btn"
              onClick={(e) => {
                setShowTemplates(!showTemplates);
              }}
              className="flex items-center gap-1 px-2 py-1.5 text-[10px] rounded hover:bg-[#3a3a3a] text-[#858585] hover:text-white transition"
            >
              <Palette size={12} />
              <span className="hidden sm:inline">Templates</span>
              <ChevronDown size={10} className={cn("transition-transform", showTemplates && "rotate-180")} />
            </button>
            <AnimatePresence>
              {showTemplates && (
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setShowTemplates(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    className="fixed z-[9999] bg-[#252526] border border-[#555] rounded-xl overflow-hidden shadow-2xl"
                    style={{
                      width: 210,
                      top: (document.getElementById("templates-btn")?.getBoundingClientRect().bottom ?? 40) + 4,
                      right: window.innerWidth - (document.getElementById("templates-btn")?.getBoundingClientRect().right ?? 200),
                    }}
                  >
                    <div className="px-3 py-2 border-b border-[#333]">
                      <p className="text-[9px] uppercase tracking-widest text-[#525252] font-bold">Choose Template</p>
                    </div>
                    {TEMPLATES.map((t) => (
                      <button key={t.id} onClick={() => applyTemplate(t)}
                        className="w-full text-left px-3 py-2.5 text-[11px] text-[#cccccc] hover:bg-[#094771] hover:text-white transition flex items-center gap-2.5"
                      >
                        <span className="text-sm">{t.icon}</span>
                        <span>{t.name.replace(/^[^\s]+ /, "")}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>


          <button onClick={() => setWordWrap(!wordWrap)} title="Toggle Word Wrap (Alt+Z)"
            className={cn("p-1.5 rounded transition", wordWrap ? "bg-[#094771] text-white" : "text-[#858585] hover:text-white hover:bg-[#3a3a3a]")}
          >
            <WrapText size={13} />
          </button>
          <button onClick={handleCopyCurrent} title="Copy Current Tab"
            className="p-1.5 hover:bg-[#3a3a3a] rounded text-[#858585] hover:text-[#9cdcfe] transition"
          >
            <Copy size={13} />
          </button>
          <button onClick={handleDownload} title="Download as index.html"
            className="p-1.5 hover:bg-[#3a3a3a] rounded text-[#858585] hover:text-[#ce9178] transition"
          >
            <Download size={13} />
          </button>
          <button onClick={handleReset} title="Reset to Default"
            className="p-1.5 hover:bg-[#3a3a3a] rounded text-[#858585] hover:text-red-400 transition"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* ── File Tabs ───────────────────────────────────────────── */}
      {viewMode !== "preview" && (
        <div className="flex items-center bg-[#252526] border-b border-[#1a1a1a] shrink-0 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}>
          {tabConfig.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-[11px] whitespace-nowrap border-b-2 transition-all shrink-0 group",
                activeTab === tab.id
                  ? `bg-[#1e1e1e] text-white border-${tab.accent.replace("border-", "")} ${tab.color}`
                  : "border-transparent text-[#858585] hover:text-[#cccccc] bg-[#2d2d2d] hover:bg-[#252526]"
              )}
              style={{ borderBottomColor: activeTab === tab.id ? (tab.id === "html" ? "#f97316" : tab.id === "css" ? "#60a5fa" : "#facc15") : "transparent" }}
            >
              <span className={activeTab === tab.id ? tab.color : "text-[#858585] group-hover:text-[#cccccc]"}>
                {tab.icon}
              </span>
              {tab.label}
              {tabValues[tab.id].value !== (tab.id === "html" ? DEFAULT_HTML : tab.id === "css" ? DEFAULT_CSS : DEFAULT_JS) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#e2c08d] ml-0.5" title="Modified" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Main Workspace ──────────────────────────────────────── */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden relative">

        {/* Editor Pane */}
        {viewMode !== "preview" && (
          <div
            className="flex flex-col overflow-hidden"
            style={{ width: viewMode === "split" ? `${splitPos}%` : "100%" }}
          >
            {/* Language + stats bar */}
            <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-[#2d2d2d] shrink-0">
              <span className="text-[9px] uppercase tracking-widest text-[#569cd6] font-semibold">
                {currentTab.ext}
              </span>
              <span className="text-[9px] text-[#525252]">
                {tabValues[activeTab].value.split("\n").length} lines ·{" "}
                {tabValues[activeTab].value.length} chars
              </span>
            </div>

            <div className="flex-1 overflow-hidden">
              {tabConfig.map((tab) => (
                <div key={tab.id} className={cn("h-full", activeTab !== tab.id && "hidden")}>
                  <CodeEditor
                    value={tabValues[tab.id].value}
                    onChange={tabValues[tab.id].set}
                    language={tab.id}
                    wordWrap={wordWrap}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Draggable Divider */}
        {viewMode === "split" && (
          <div
            onMouseDown={handleDividerMouseDown}
            className="w-1 shrink-0 bg-[#333] hover:bg-[#007acc] cursor-col-resize transition-colors z-10 flex items-center justify-center group"
            title="Drag to resize"
          >
            <div className="w-1 h-8 rounded-full bg-[#555] group-hover:bg-[#007acc] transition-colors" />
          </div>
        )}

        {/* Preview Pane */}
        {viewMode !== "editor" && (
          <div
            className="flex flex-col overflow-hidden"
            style={{ width: viewMode === "split" ? `${100 - splitPos}%` : "100%" }}
          >
            {/* Preview toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#2d2d2d] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e] animate-pulse" />
                <span className="text-[9px] uppercase tracking-widest text-[#858585] font-semibold">Live Preview</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Viewport */}
                <div className="flex items-center gap-0.5 bg-[#2d2d2d] rounded p-0.5 border border-[#3f3f46]">
                  {[
                    { id: "desktop" as Viewport, icon: <Monitor size={11} />, tip: "Desktop" },
                    { id: "tablet" as Viewport, icon: <Tablet size={11} />, tip: "Tablet (768px)" },
                    { id: "mobile" as Viewport, icon: <Smartphone size={11} />, tip: "Mobile (375px)" },
                  ].map((v) => (
                    <button key={v.id} onClick={() => setViewport(v.id)} title={v.tip}
                      className={cn("p-1 rounded transition",
                        viewport === v.id ? "bg-[#094771] text-white" : "text-[#858585] hover:text-white"
                      )}
                    >
                      {v.icon}
                    </button>
                  ))}
                </div>

                {/* Console toggle */}
                <button
                  onClick={() => setShowConsole(!showConsole)}
                  title="Toggle Console"
                  className={cn("flex items-center gap-1 px-2 py-1 rounded text-[10px] transition",
                    showConsole ? "bg-[#094771] text-white" : "text-[#858585] hover:text-white hover:bg-[#3a3a3a]"
                  )}
                >
                  <Terminal size={11} />
                  {consoleLines.filter((l) => l.type === "error").length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                  <span className="hidden sm:inline text-[9px]">
                    {consoleLines.length > 0 ? `(${consoleLines.length})` : "Console"}
                  </span>
                </button>
              </div>
            </div>

            {/* Preview / Console split */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className={cn("overflow-hidden", showConsole ? "flex-1" : "h-full")}>
                <LivePreview
                  html={html} css={css} js={js}
                  viewport={viewport}
                  onConsole={handleConsole}
                />
              </div>
              {showConsole && (
                <div className="h-40 border-t border-[#333] shrink-0">
                  <ConsolePanel lines={consoleLines} onClear={() => setConsoleLines([])} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── VS Code Status Bar ───────────────────────────────── */}
      <footer className="flex items-center justify-between px-3 py-1 bg-[#007acc] shrink-0 text-white text-[10px] font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Code2 size={10} /> HTML · CSS · JS Live Editor
          </span>
          <button onClick={handleCopyAll} className="hover:underline opacity-80 hover:opacity-100 flex items-center gap-1 transition">
            {copied ? <Check size={10} /> : <Copy size={10} />}
            <span className="hidden sm:inline">Copy All</span>
          </button>
        </div>
        <div className="flex items-center gap-3 opacity-90">
          <span>UTF-8</span>
          <span className="hidden sm:block">Tab Size: 2</span>
          <span className={cn(consoleLines.filter((l) => l.type === "error").length > 0 ? "text-red-300" : "")}>
            {consoleLines.filter((l) => l.type === "error").length > 0
              ? `⚠ ${consoleLines.filter((l) => l.type === "error").length} error(s)`
              : "✓ No errors"
            }
          </span>
        </div>
      </footer>
    </div>
  );
}

import { useState, useRef, useEffect, createContext, useContext, useCallback } from "react";
import { Send, Sun, Moon, X, RotateCcw, AlertCircle, Loader2, FileText, ChevronDown, Paperclip, Trash2, Copy, Check, MoreHorizontal, Zap, ArrowUpRight, Command, Hash } from "lucide-react";

const BASE = "http://127.0.0.1:8000";

/* ============================ THEME: RAW CONCRETE ============================ */

const ThemeContext = createContext(null);
const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }) {
  const [mode, setMode] = useState("dark"); // "dark" | "light" | "terminal" | "paper"
  const [accent, setAccent] = useState("blood"); // "blood" | "slime" | "gold" | "ice"

  const cycleMode = useCallback(() => {
    setMode((m) => (m === "dark" ? "light" : m === "light" ? "terminal" : m === "terminal" ? "paper" : "dark"));
  }, []);

  const cycleAccent = useCallback(() => {
    setAccent((a) => (a === "blood" ? "slime" : a === "slime" ? "gold" : a === "gold" ? "ice" : "blood"));
  }, []);

  const palettes = {
    dark: {
      bg: "#0a0a0a",
      surface: "#141414",
      surfaceHover: "#1a1a1a",
      border: "#2a2a2a",
      text: "#e8e6e3",
      textMuted: "#6b6b6b",
      textFaint: "#3a3a3a",
      userBg: "#1a1a1a",
      botBg: "#0f0f0f",
      inputBg: "#141414",
      shadow: "0 4px 20px rgba(0,0,0,0.8)",
    },
    light: {
      bg: "#f5f2ed",
      surface: "#ffffff",
      surfaceHover: "#f0ece6",
      border: "#d4cfc7",
      text: "#1a1a1a",
      textMuted: "#7a756e",
      textFaint: "#b5b0a8",
      userBg: "#1a1a1a",
      botBg: "#ffffff",
      inputBg: "#ffffff",
      shadow: "0 4px 20px rgba(0,0,0,0.08)",
    },
    terminal: {
      bg: "#001100",
      surface: "#002200",
      surfaceHover: "#003300",
      border: "#004400",
      text: "#00ff41",
      textMuted: "#008800",
      textFaint: "#004400",
      userBg: "#003300",
      botBg: "#001a00",
      inputBg: "#002200",
      shadow: "0 0 20px rgba(0,255,65,0.1)",
    },
    paper: {
      bg: "#f4f1ea",
      surface: "#fffef8",
      surfaceHover: "#eae7e0",
      border: "#c8c4bc",
      text: "#2c241b",
      textMuted: "#8a8279",
      textFaint: "#b8b2a8",
      userBg: "#2c241b",
      botBg: "#fffef8",
      inputBg: "#fffef8",
      shadow: "0 2px 12px rgba(44,36,27,0.06)",
    },
  };

  const accents = {
    blood: "#dc2626",
    slime: "#84cc16",
    gold: "#f59e0b",
    ice: "#06b6d4",
  };

  const p = palettes[mode];
  const a = accents[accent];

  const palette = {
    ...p,
    accent: a,
    accentMuted: a + "40",
    accentFaint: a + "15",
    isDark: mode === "dark" || mode === "terminal",
    mode,
    accentName: accent,
  };

  return (
    <ThemeContext.Provider value={{ mode, accent, cycleMode, cycleAccent, palette }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ============================ UTILITIES ============================ */

const uid = () => Math.random().toString(36).slice(2, 10);

const SUGGESTIONS = [
  "Summarize this document",
  "What are the key points?",
  "Any action items or dates?",
  "Explain the main concepts",
];

const MODE_ICONS = { dark: Moon, light: Sun, terminal: Command, paper: FileText };
const ACCENT_NAMES = { blood: "Blood", slime: "Slime", gold: "Gold", ice: "Ice" };

/* ============================ GLITCH TEXT ============================ */

function GlitchText({ text, className = "" }) {
  const [glitch, setGlitch] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.92) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 150);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!glitch) return <span className={className}>{text}</span>;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const glitched = text.split("").map((c, i) => 
    Math.random() > 0.7 ? chars[Math.floor(Math.random() * chars.length)] : c
  ).join("");

  return (
    <span className={`${className} relative`}>
      <span className="opacity-0">{text}</span>
      <span className="absolute inset-0 text-red-500 animate-pulse" style={{ clipPath: "inset(0 30% 0 0)" }}>
        {glitched}
      </span>
      <span className="absolute inset-0 text-cyan-500 animate-pulse" style={{ clipPath: "inset(0 0 0 30%)", animationDelay: "0.05s" }}>
        {glitched}
      </span>
    </span>
  );
}

/* ============================ NOISE OVERLAY ============================ */

function NoiseOverlay() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
      }}
    />
  );
}

/* ============================ SCANLINES ============================ */

function Scanlines() {
  const { palette } = useTheme();
  if (palette.mode !== "terminal") return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[99] opacity-10"
      style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.03) 2px, rgba(0,255,65,0.03) 4px)",
      }}
    />
  );
}

/* ============================ CURSOR TRAIL ============================ */

function CursorTrail() {
  const [trail, setTrail] = useState([]);
  const { palette } = useTheme();

  useEffect(() => {
    const handleMove = (e) => {
      setTrail((prev) => [...prev.slice(-8), { x: e.clientX, y: e.clientY, id: Date.now() }]);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  if (palette.mode !== "terminal") return null;

  return (
    <>
      {trail.map((point, i) => (
        <div
          key={point.id}
          className="fixed pointer-events-none z-[98] rounded-full"
          style={{
            left: point.x - 2,
            top: point.y - 2,
            width: 4,
            height: 4,
            background: palette.accent,
            opacity: (i + 1) / trail.length * 0.5,
            transition: "opacity 0.3s",
          }}
        />
      ))}
    </>
  );
}

/* ============================ MESSAGE BUBBLE ============================ */

function MessageBubble({ message, onRetry, accent }) {
  const { palette } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const isSystem = message.role === "system";

  const copyText = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div 
          className="px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-mono border"
          style={{ 
            borderColor: palette.border, 
            color: palette.textMuted,
            background: palette.surface,
          }}
        >
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-end gap-3 my-5 ${isUser ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!isUser && !isError && (
        <div 
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-mono text-xs font-bold border"
          style={{ 
            borderColor: palette.accent, 
            color: palette.accent,
            background: palette.mode === "terminal" ? palette.accent + "20" : "transparent",
          }}
        >
          {palette.mode === "terminal" ? ">" : "AI"}
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-[75%] sm:max-w-[65%]">
        <div
          className="relative px-5 py-3.5 text-[14px] leading-relaxed whitespace-pre-wrap break-words transition-all duration-200"
          style={{
            background: isUser ? palette.userBg : isError ? "#450a0a" : palette.botBg,
            color: isUser ? "#ffffff" : isError ? "#fca5a5" : palette.text,
            border: isUser ? "none" : `1px solid ${isError ? "#7f1d1d" : palette.border}`,
            borderRadius: isUser ? "2px 16px 16px 16px" : "16px 16px 2px 16px",
            boxShadow: hovered && !isUser ? palette.shadow : "none",
          }}
        >
          {isError ? (
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: "#ef4444" }} />
              <div>
                <p className="font-mono text-xs mb-1 opacity-70">ERROR_0x{Math.floor(Math.random()*9999).toString(16).toUpperCase()}</p>
                <p>{message.text}</p>
                <button
                  onClick={() => onRetry(message.id)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider hover:underline"
                  style={{ color: palette.accent }}
                >
                  <RotateCcw size={12} /> RETRY
                </button>
              </div>
            </div>
          ) : (
            <>
              {palette.mode === "terminal" && !isUser && (
                <span style={{ color: palette.accent }} className="mr-2 font-mono">$</span>
              )}
              {message.text}
              {!isUser && !isError && hovered && (
                <button
                  onClick={copyText}
                  className="absolute -right-8 top-2 p-1.5 transition-opacity"
                  style={{ color: palette.textMuted }}
                  title="Copy"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}
            </>
          )}
        </div>
        
        <span 
          className="text-[9px] font-mono uppercase tracking-wider"
          style={{ color: palette.textFaint, textAlign: isUser ? "right" : "left" }}
        >
          {message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {isUser && (
        <div 
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-mono text-xs font-bold"
          style={{ 
            background: palette.accent, 
            color: "#000",
            borderRadius: "50%",
          }}
        >
          U
        </div>
      )}
    </div>
  );
}

/* ============================ TYPING INDICATOR ============================ */

function TypingIndicator({ palette }) {
  return (
    <div className="flex items-end gap-3 my-5">
      <div 
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-mono text-xs font-bold border animate-pulse"
        style={{ borderColor: palette.accent, color: palette.accent }}
      >
        {palette.mode === "terminal" ? ">" : "AI"}
      </div>
      <div 
        className="px-5 py-3.5 border"
        style={{ 
          borderColor: palette.border, 
          background: palette.botBg,
          borderRadius: "16px 16px 2px 16px",
        }}
      >
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-2 h-2"
              style={{
                background: palette.accent,
                opacity: 0.4,
                animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                clipPath: palette.mode === "terminal" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" : "none",
                borderRadius: palette.mode === "terminal" ? "0" : "50%",
              }}
            />
          ))}
          <span className="text-[10px] font-mono ml-1" style={{ color: palette.textFaint }}>
            {palette.mode === "terminal" ? "PROCESSING..." : "reading"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================ EMPTY STATE ============================ */

function EmptyState({ hasPdf, onPick, onUploadClick, palette }) {
  if (!hasPdf) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 gap-8">
        <div className="relative">
          <div 
            className="text-[120px] font-black leading-none select-none"
            style={{ 
              color: "transparent",
              WebkitTextStroke: `1px ${palette.textFaint}`,
              opacity: 0.3,
            }}
          >
            PDF
          </div>
          <div 
            className="absolute inset-0 flex items-center justify-center"
          >
            <div 
              className="w-16 h-16 border-2 flex items-center justify-center"
              style={{ borderColor: palette.accent, transform: "rotate(45deg)" }}
            >
              <div 
                className="w-8 h-8"
                style={{ background: palette.accent, transform: "rotate(-45deg)" }}
              />
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black tracking-tighter" style={{ color: palette.text }}>
            <GlitchText text="FOLIO" />
          </h1>
          <p className="text-sm font-mono" style={{ color: palette.textMuted }}>
            Upload a document. Interrogate it.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
          {[
            { label: "RESEARCH", desc: "Extract insights" },
            { label: "LEGAL", desc: "Find clauses" },
            { label: "REPORTS", desc: "Summarize data" },
            { label: "ANYTHING", desc: "Ask questions" },
          ].map((item) => (
            <div 
              key={item.label}
              className="p-3 border text-center group cursor-default transition-colors"
              style={{ 
                borderColor: palette.border,
                background: palette.surface,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = palette.accent;
                e.currentTarget.style.background = palette.accentFaint;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = palette.border;
                e.currentTarget.style.background = palette.surface;
              }}
            >
              <p className="text-xs font-black tracking-wider" style={{ color: palette.text }}>{item.label}</p>
              <p className="text-[10px] font-mono mt-1" style={{ color: palette.textMuted }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onUploadClick}
          className="group relative px-8 py-3 font-mono text-sm font-bold tracking-wider uppercase overflow-hidden transition-all"
          style={{ 
            background: palette.accent,
            color: "#000",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 8px 30px ${palette.accentMuted}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            <Paperclip size={14} /> UPLOAD PDF
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 gap-6">
      <div 
        className="w-20 h-20 border-2 flex items-center justify-center"
        style={{ borderColor: palette.accent }}
      >
        <div 
          className="w-10 h-10 animate-pulse"
          style={{ background: palette.accent }}
        />
      </div>
      
      <div className="text-center">
        <h2 className="text-xl font-black tracking-tighter" style={{ color: palette.text }}>
          DOCUMENT LOADED
        </h2>
        <p className="text-xs font-mono mt-2 uppercase tracking-widest" style={{ color: palette.textMuted }}>
          {palette.mode === "terminal" ? "READY FOR INTERROGATION" : "Ask anything"}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-md">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="px-4 py-2 text-xs font-mono border transition-all duration-150 uppercase tracking-wider"
            style={{ 
              borderColor: palette.border,
              color: palette.textMuted,
              background: palette.surface,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = palette.accent;
              e.currentTarget.style.color = palette.accent;
              e.currentTarget.style.background = palette.accentFaint;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = palette.border;
              e.currentTarget.style.color = palette.textMuted;
              e.currentTarget.style.background = palette.surface;
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================ HEADER ============================ */

function Header({ pdfName, uploading, onUploadFile, onClearPdf, onNewChat }) {
  const { palette, mode, accent, cycleMode, cycleAccent } = useTheme();
  const fileRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const ModeIcon = MODE_ICONS[mode];

  return (
    <header 
      className="sticky top-0 z-50 border-b"
      style={{ 
        borderColor: palette.border, 
        background: palette.mode === "terminal" ? palette.bg + "ee" : palette.bg + "dd",
        backdropFilter: palette.mode === "terminal" ? "none" : "blur(20px)",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 flex items-center justify-center font-black text-sm border"
              style={{ borderColor: palette.accent, color: palette.accent }}
            >
              F
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-tighter leading-none" style={{ color: palette.text }}>
                FOLIO
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5" style={{ background: palette.accent }} />
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: palette.textMuted }}>
                  {pdfName || "NO DOCUMENT"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pdfName && (
              <>
                <div 
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 border text-xs font-mono"
                  style={{ borderColor: palette.border, color: palette.textMuted }}
                >
                  <FileText size={12} style={{ color: palette.accent }} />
                  <span className="max-w-[120px] truncate">{pdfName}</span>
                  <button onClick={onClearPdf} style={{ color: palette.textFaint }}>
                    <X size={12} />
                  </button>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 border transition-colors"
                    style={{ borderColor: palette.border, color: palette.textMuted }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = palette.accent}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = palette.border}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  
                  {menuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 border z-50"
                      style={{ 
                        borderColor: palette.border, 
                        background: palette.surface,
                        boxShadow: palette.shadow,
                      }}
                    >
                      <button
                        onClick={() => { onNewChat(); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase hover:bg-white/5 transition-colors"
                        style={{ color: palette.textSecondary }}
                      >
                        <Zap size={14} /> New Chat
                      </button>
                      <button
                        onClick={() => { onClearPdf(); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase hover:bg-red-500/10 transition-colors"
                        style={{ color: "#ef4444" }}
                      >
                        <Trash2 size={14} /> Remove PDF
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {!pdfName && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider"
                style={{ 
                  background: palette.accent,
                  color: "#000",
                  opacity: uploading ? 0.5 : 1,
                }}
              >
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Paperclip size={12} />}
                {uploading ? "UPLOADING..." : "UPLOAD"}
              </button>
            )}

            <button
              onClick={cycleMode}
              className="p-2 border transition-colors"
              style={{ borderColor: palette.border, color: palette.textMuted }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = palette.accent}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = palette.border}
              title={`Mode: ${mode}`}
            >
              <ModeIcon size={16} />
            </button>

            <button
              onClick={cycleAccent}
              className="w-6 h-6 border transition-all"
              style={{ 
                borderColor: palette.border,
                background: palette.accent,
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              title={`Accent: ${ACCENT_NAMES[accent]}`}
            />

            <input ref={fileRef} type="file" accept=".pdf" onChange={onUploadFile} className="hidden" />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ============================ COMPOSER ============================ */

function Composer({ value, onChange, onSend, disabled, placeholder, onUploadClick }) {
  const { palette } = useTheme();
  const taRef = useRef(null);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [value]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const hasContent = value.trim().length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-4 pt-2">
      <div 
        className="flex items-end gap-2 border p-3 transition-all"
        style={{ 
          borderColor: disabled ? palette.border : hasContent ? palette.accent : palette.border,
          background: palette.inputBg,
        }}
      >
        <button
          onClick={onUploadClick}
          className="p-2 transition-colors shrink-0"
          style={{ color: palette.textFaint }}
          onMouseEnter={(e) => e.currentTarget.style.color = palette.accent}
          onMouseLeave={(e) => e.currentTarget.style.color = palette.textFaint}
        >
          <Paperclip size={18} />
        </button>

        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent outline-none text-[14px] leading-relaxed py-1 max-h-28 font-mono"
          style={{ color: palette.text }}
        />
        
        <button
          onClick={onSend}
          disabled={disabled || !hasContent}
          className="shrink-0 w-9 h-9 flex items-center justify-center transition-all"
          style={{
            background: hasContent && !disabled ? palette.accent : "transparent",
            color: hasContent && !disabled ? "#000" : palette.textFaint,
            border: hasContent && !disabled ? "none" : `1px solid ${palette.border}`,
            opacity: disabled ? 0.3 : 1,
          }}
          onMouseEnter={(e) => {
            if (hasContent && !disabled) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 4px 15px ${palette.accentMuted}`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <ArrowUpRight size={18} />
        </button>
      </div>
      
      <p className="text-[9px] font-mono text-center mt-2 uppercase tracking-widest" style={{ color: palette.textFaint }}>
        {palette.mode === "terminal" ? "SHIFT+ENTER FOR NEW LINE // ENTER TO EXECUTE" : "Shift+Enter for new line • Enter to send"}
      </p>
    </div>
  );
}

/* ============================ MAIN CHAT ============================ */

function ChatWindow() {
  const { palette } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [pdfName, setPdfName] = useState(null);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking]);

  const uploadPdf = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    setMessages((m) => [...m, { 
      id: uid(), 
      role: "system", 
      text: `UPLOADING "${file.name.toUpperCase()}"...`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }]);
    try {
      const res = await fetch(`${BASE}/upload`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("upload failed");
      setPdfName(file.name);
      setMessages((m) => [...m, { 
        id: uid(), 
        role: "system", 
        text: `"${file.name.toUpperCase()}" LOADED. READY.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }]);
    } catch {
      setMessages((m) => [
        ...m,
        { 
          id: uid(), 
          role: "error", 
          text: "UPLOAD FAILED. CHECK BACKEND AT 127.0.0.1:8000",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        },
      ]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, []);

  const clearPdf = useCallback(() => {
    setPdfName(null);
    setMessages([]);
  }, []);

  const newChat = useCallback(() => {
    setMessages([]);
  }, []);

  const askBackend = useCallback(async (q) => {
    setAsking(true);
    try {
      const res = await fetch(`${BASE}/ask?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("ask failed");
      const data = await res.json();
      setMessages((m) => [...m, { 
        id: uid(), 
        role: "assistant", 
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }]);
    } catch {
      setMessages((m) => [
        ...m,
        { 
          id: uid(), 
          role: "error", 
          text: "CONNECTION LOST. BACKEND UNREACHABLE.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        },
      ]);
    } finally {
      setAsking(false);
    }
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const q = (text ?? input).trim();
      if (!q || asking || !pdfName) return;
      setInput("");
      setMessages((m) => [...m, { 
        id: uid(), 
        role: "user", 
        text: q,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }]);
      askBackend(q);
    },
    [input, asking, pdfName, askBackend]
  );

  const retry = useCallback(
    (errorId) => {
      setMessages((m) => m.filter((msg) => msg.id !== errorId));
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      if (lastUser) askBackend(lastUser.text);
    },
    [messages, askBackend]
  );

  return (
    <div 
      className="flex flex-col h-full relative overflow-hidden"
      style={{ background: palette.bg, color: palette.text }}
    >
      <NoiseOverlay />
      <Scanlines />
      <CursorTrail />

      <Header 
        pdfName={pdfName} 
        uploading={uploading} 
        onUploadFile={uploadPdf} 
        onClearPdf={clearPdf}
        onNewChat={newChat}
      />

      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 min-h-full">
          {messages.length === 0 ? (
            <EmptyState
              hasPdf={!!pdfName}
              onPick={sendMessage}
              onUploadClick={() => fileRef.current?.click()}
              palette={palette}
            />
          ) : (
            <div className="flex flex-col">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} onRetry={retry} accent={palette.accent} />
              ))}
              {asking && <TypingIndicator palette={palette} />}
              <div ref={bottomRef} className="h-4" />
            </div>
          )}
        </div>
      </div>

      <input ref={fileRef} type="file" accept=".pdf" onChange={uploadPdf} className="hidden" />

      <div className="relative z-10 border-t" style={{ borderColor: palette.border, background: palette.bg }}>
        <Composer
          value={input}
          onChange={setInput}
          onSend={() => sendMessage()}
          disabled={asking || !pdfName}
          placeholder={pdfName ? (palette.mode === "terminal" ? "ENTER COMMAND..." : "Ask about your PDF...") : "Upload a PDF first..."}
          onUploadClick={() => fileRef.current?.click()}
        />
      </div>
    </div>
  );
}

/* ============================ EXPORT ============================ */

export default function FolioPdfChat() {
  return (
    <ThemeProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@400;600;800;900&display=swap');
        
        * { 
          font-family: 'Inter', sans-serif;
          scrollbar-width: thin;
          scrollbar-color: rgba(128,128,128,0.3) transparent;
        }
        
        .font-mono { font-family: 'JetBrains Mono', monospace !important; }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
          background: rgba(128,128,128,0.2); 
          border-radius: 0; 
        }
        ::-webkit-scrollbar-thumb:hover { 
          background: rgba(128,128,128,0.4); 
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        
        ::selection {
          background: rgba(220, 38, 38, 0.3);
          color: inherit;
        }
      `}</style>
      <div className="w-full h-screen antialiased overflow-hidden">
        <ChatWindow />
      </div>
    </ThemeProvider>
  );
}
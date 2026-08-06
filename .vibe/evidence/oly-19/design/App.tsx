import { useState } from "react"
import { translations, type Lang, type T } from "./i18n"
import { GRADE_FIVE_BANK } from "./grade5Bank"
import { darkTheme, lightTheme, type Theme, type ThemeMode } from "./theme"

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "landing" | "auth" | "topics" | "problem" | "profile" | "summary"

type TopicCategory = "all" | "numbers" | "logic" | "word"

interface Topic {
  id: string; name: Record<Lang, string>; nameEn: string
  accent: string; gradient: string; problems: Problem[]
  category: TopicCategory
}
interface Problem {
  id: string
  title: Record<Lang, string>
  statement: Record<Lang, string>
  answerType: "numeric" | "multiple_choice"
  acceptedAnswers: string[]
  choices?: Record<Lang, string[]>
  difficulty: 1|2|3
  solution: Record<Lang, string>
  hints: [Record<Lang, string>, Record<Lang, string>, Record<Lang, string>]
}
interface UserProfile {
  name: string; streak: number; problemsSolved: number; accuracy: number
  topicMastery: Record<string, number>
  lastSession: { attempted: number; solved: number; hintsUsed: number; hintsByTier: [number,number,number] }
}

// ─── Topic data ───────────────────────────────────────────────────────────────
const TOPIC_META: Record<string, Omit<Topic, "id" | "problems">> = {
  numbers: { name:{ uz:"Sonlar va amallar", ru:"Числа и операции", en:"Numbers and operations" }, nameEn:"Numbers and operations", category:"numbers", accent:"#60a5fa", gradient:"linear-gradient(135deg,#1d4ed8,#38bdf8)" },
  fractions: { name:{ uz:"Kasrlar", ru:"Дроби", en:"Fractions" }, nameEn:"Fractions", category:"logic", accent:"#a78bfa", gradient:"linear-gradient(135deg,#6d28d9,#a78bfa)" },
  decimals: { name:{ uz:"O'nli kasrlar", ru:"Десятичные дроби", en:"Decimals" }, nameEn:"Decimals", category:"numbers", accent:"#2dd4bf", gradient:"linear-gradient(135deg,#0f766e,#2dd4bf)" },
  measurement: { name:{ uz:"O'lchash va ma'lumotlar", ru:"Измерения и данные", en:"Measurement and data" }, nameEn:"Measurement and data", category:"word", accent:"#fbbf24", gradient:"linear-gradient(135deg,#b45309,#fbbf24)" },
  geometry: { name:{ uz:"O'lchash va geometriya", ru:"Измерения и геометрия", en:"Measurement and geometry" }, nameEn:"Measurement and geometry", category:"word", accent:"#fb923c", gradient:"linear-gradient(135deg,#c2410c,#fb923c)" },
  algebra: { name:{ uz:"Amallar va algebraik fikrlash", ru:"Операции и алгебраическое мышление", en:"Operations and algebraic thinking" }, nameEn:"Operations and algebraic thinking", category:"logic", accent:"#f472b6", gradient:"linear-gradient(135deg,#be185d,#f472b6)" },
  percentages: { name:{ uz:"Foizlar", ru:"Проценты", en:"Percentages" }, nameEn:"Percentages", category:"numbers", accent:"#34d399", gradient:"linear-gradient(135deg,#047857,#34d399)" },
}

const TOPICS: Topic[] = GRADE_FIVE_BANK.map(bankTopic => ({
  ...TOPIC_META[bankTopic.id],
  id: bankTopic.id,
  problems: bankTopic.problems.map(problem => ({ ...problem, answerType:"numeric" })),
}))

const PROFILE: UserProfile = {
  name:"Alisher", streak:7, problemsSolved:34, accuracy:72,
  topicMastery:{ arithmetic:80, logic:45, combinatorics:60, number_theory:30, word_problems:55 },
  lastSession:{ attempted:5, solved:4, hintsUsed:2, hintsByTier:[1,0,1] },
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function OALogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
      </defs>
      {/* Hexagon background */}
      <path d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z" fill="url(#logoGrad)"/>
      {/* Summit / peak — stylised Δ (math delta = change, growth) */}
      <path d="M16 8 L23 22 H9 Z" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
      {/* Inner dot — the answer */}
      <circle cx="16" cy="18" r="1.6" fill="white"/>
    </svg>
  )
}

// ─── Theme Toggle Button ──────────────────────────────────────────────────────
function ThemeToggle({ themeMode, onToggle, th }: { themeMode: ThemeMode; onToggle: () => void; th: Theme }) {
  return (
    <button onClick={onToggle} title="Toggle theme"
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
      style={{ background: th.surface, border:`1px solid ${th.border}`, color: th.textSubtle }}>
      {themeMode === "dark"
        ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v1M7 12v1M1 7H2M12 7h1M2.93 2.93l.7.7M10.37 10.37l.7.7M2.93 11.07l.7-.7M10.37 3.63l.7-.7M9.5 7a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
        : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.5 7.5A4.5 4.5 0 017 12a4.5 4.5 0 010-9c.3 0 .6.03.88.08A3.5 3.5 0 009.5 7c0 1.16.56 2.18 1.42 2.83.37-.74.58-1.59.58-2.33z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      }
    </button>
  )
}

// ─── Lang + Theme bar (reused in navs) ───────────────────────────────────────
function LangSwitcher({ lang, onChange, th }: { lang: Lang; onChange: (l: Lang) => void; th: Theme }) {
  return (
    <div className="flex rounded-lg overflow-hidden" style={{ border:`1px solid ${th.langBorder}` }}>
      {(["uz","ru","en"] as Lang[]).map(l => (
        <button key={l} onClick={() => onChange(l)}
          className="px-2.5 py-1 text-xs font-bold uppercase transition-all duration-200"
          style={{ fontFamily:"var(--font-display)", background: lang===l ? th.langActiveBg : "transparent", color: lang===l ? th.text : th.langInactiveColor }}>
          {l}
        </button>
      ))}
    </div>
  )
}

// ─── Landing ──────────────────────────────────────────────────────────────────
function LandingScreen({ t, lang, onLangChange, th, themeMode, onThemeToggle, onSignup, onLogin }: {
  t:T; lang:Lang; onLangChange:(l:Lang)=>void; th:Theme; themeMode:ThemeMode; onThemeToggle:()=>void
  onSignup:()=>void; onLogin:()=>void
}) {
  const steps = [
    { n:"01", title:t.step1Title, desc:t.step1Desc, icon:"🗂" },
    { n:"02", title:t.step2Title, desc:t.step2Desc, icon:"✏️" },
    { n:"03", title:t.step3Title, desc:t.step3Desc, icon:"✦" },
  ]
  const features = [
    { icon:"💡", title:t.feat1Title, desc:t.feat1Desc },
    { icon:"🤔", title:t.feat2Title, desc:t.feat2Desc },
    { icon:"📈", title:t.feat3Title, desc:t.feat3Desc },
  ]
  const pick = (uz:string, ru:string, en:string) => lang==="uz" ? uz : lang==="ru" ? ru : en
  const tutorChat: { from:"student"|"tutor"; text:string }[] = [
    { from:"student", text: pick("1 dan 50 gacha qo'shdim, lekin adashib ketdim.", "Складываю от 1 до 50 и всё время сбиваюсь.", "I'm adding 1 to 50 and keep losing track.") },
    { from:"tutor", text: pick("Tushunarli. Eng chekkadagi ikki sonni — 1 va 50 ni qo'shsang, nima chiqadi?", "Понимаю. А что получится, если сложить два крайних числа — 1 и 50?", "I see. What do you get if you add the two outer numbers, 1 and 50?") },
    { from:"student", text: "51" },
    { from:"tutor", text: pick("Endi 2 va 49 ni qo'sh. Nimani sezyapsan?", "Теперь сложи 2 и 49. Что замечаешь?", "Now add 2 and 49. Notice anything?") },
    { from:"student", text: pick("Yana 51! Demak juftliklar bir xil.", "Тоже 51! Значит, пары одинаковые.", "Also 51! So every pair is the same.") },
    { from:"tutor", text: pick("Aynan shu. Endi o'zing hisoblab ko'r: nechta juftlik bor?", "Именно. Дальше сам: сколько всего таких пар?", "Exactly. Your turn: how many such pairs are there?") },
  ]
  const isLight = th.mode === "light"

  return (
    <div className="theme-root" style={{ background:th.bg, color:th.text, fontFamily:"var(--font-body)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50" style={{ background:th.navBg, backdropFilter:"blur(16px)", borderBottom:`1px solid ${th.border2}` }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <button className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <OALogo size={32}/>
            <span className="font-black text-base tracking-tight" style={{ fontFamily:"var(--font-display)" }}>Olympiad Academy</span>
          </button>
          <div className="flex items-center gap-2">
            <LangSwitcher lang={lang} onChange={onLangChange} th={th}/>
            <ThemeToggle themeMode={themeMode} onToggle={onThemeToggle} th={th}/>
            <button onClick={onLogin} className="text-sm font-bold px-4 py-2 rounded-xl transition-all hover:opacity-70"
              style={{ color:th.textSubtle }}>{t.landingLogin}</button>
            <button onClick={onSignup} className="text-sm font-black px-5 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background:th.primaryGradient, color:th.textOnAccent, fontFamily:"var(--font-display)" }}>
              {t.landingCTA}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
            style={{ background: isLight ? "radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)" }}/>
          {["∑","π","∞","√","∫","≈","Δ","ℤ","n!","⟳"].map((s,i) => (
            <span key={i} className="absolute select-none pointer-events-none font-black"
              style={{ color: isLight ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.07)", left:`${5+i*10}%`, top:`${10+Math.sin(i*1.3)*55}%`, fontSize:`${1.2+i*0.25}rem`, transform:`rotate(${i*19-40}deg)` }}>
              {s}
            </span>
          ))}
        </div>
        <div className="relative max-w-5xl mx-auto px-5 pt-24 pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)", color:"#6366f1" }}>
            🇺🇿 {t.gradeLabel}
          </div>
          <h1 className="font-black leading-tight mb-6" style={{ fontFamily:"var(--font-display)", fontSize:"clamp(2.4rem,5vw,4rem)", whiteSpace:"pre-line" }}>
            {t.landingHero}
          </h1>
          <p className="text-lg mb-10 mx-auto max-w-xl leading-relaxed" style={{ color:th.textMuted }}>
            {t.landingHeroSub}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button onClick={onSignup}
              className="px-8 py-4 rounded-2xl font-black text-base transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background:th.primaryGradient, color:th.textOnAccent, fontFamily:"var(--font-display)", boxShadow: isLight ? "0 8px 32px rgba(99,102,241,0.25)" : "0 0 40px rgba(99,102,241,0.35)" }}>
              {t.landingCTA} →
            </button>
            <button onClick={onLogin} className="px-8 py-4 rounded-2xl font-bold text-base transition-all hover:opacity-80"
              style={{ color:th.textSubtle, border:`1px solid ${th.border}` }}>
              {t.landingLogin}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-14">
            {TOPICS.map(topic => (
              <span key={topic.id} className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background:`${topic.accent}15`, border:`1px solid ${topic.accent}30`, color:topic.accent }}>
                {topic.name[lang]}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ borderTop:`1px solid ${th.border2}` }}>
        <div className="max-w-5xl mx-auto px-5 py-20">
          <div className="text-xs font-black uppercase tracking-widest mb-10 text-center" style={{ color:th.textFaint }}>{t.howItWorks}</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {steps.map(s => (
              <div key={s.n} className="rounded-2xl p-6" style={{ background:th.surface, border:`1px solid ${th.border}` }}>
                <div className="text-5xl font-black mb-4 leading-none" style={{ color:th.textFaint, fontFamily:"var(--font-display)" }}>{s.n}</div>
                <div className="text-2xl mb-3">{s.icon}</div>
                <div className="font-black text-base mb-2" style={{ fontFamily:"var(--font-display)" }}>{s.title}</div>
                <p className="text-sm leading-relaxed" style={{ color:th.textMuted }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tutor */}
      <section style={{ borderTop:`1px solid ${th.border2}` }}>
        <div className="max-w-5xl mx-auto px-5 py-20 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-6"
              style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.3)", color:"#818cf8" }}>
              ✦ {t.aiTutorKicker}
            </div>
            <h2 className="font-black leading-tight mb-5" style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.8rem,3.2vw,2.5rem)" }}>
              {t.aiTutorTitle}
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color:th.textMuted }}>{t.aiTutorDesc}</p>
            <div className="space-y-5">
              {[
                { icon:"🔍", title:t.aiTutorF1Title, desc:t.aiTutorF1Desc },
                { icon:"🪜", title:t.aiTutorF2Title, desc:t.aiTutorF2Desc },
                { icon:"🤔", title:t.aiTutorF3Title, desc:t.aiTutorF3Desc },
              ].map(f => (
                <div key={f.title} className="flex gap-3.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background:th.surface2, border:`1px solid ${th.border}` }}>{f.icon}</div>
                  <div className="min-w-0">
                    <div className="font-black text-sm mb-1" style={{ fontFamily:"var(--font-display)" }}>{f.title}</div>
                    <p className="text-sm leading-relaxed" style={{ color:th.textMuted }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat mock */}
          <div className="rounded-3xl p-4 sm:p-5" style={{ background:th.surface, border:`1px solid ${th.border}`, boxShadow: isLight ? "0 12px 40px rgba(15,23,42,0.07)" : "0 0 60px rgba(99,102,241,0.09)" }}>
            <div className="flex items-center gap-2.5 pb-4 mb-4" style={{ borderBottom:`1px solid ${th.border2}` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background:th.primaryGradient, color:th.textOnAccent, fontFamily:"var(--font-display)" }}>✦</div>
              <span className="font-black text-sm" style={{ fontFamily:"var(--font-display)" }}>{t.aiTutorKicker}</span>
              <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ background:th.surface2, color:th.textFaint }}>1 + 2 + … + 50</span>
            </div>
            <div className="space-y-2.5">
              {tutorChat.map((m,i) => (
                <div key={i} className={`flex ${m.from==="student" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={ m.from==="student"
                      ? { background:th.surface2, border:`1px solid ${th.border}`, color:th.text, borderBottomRightRadius:"0.4rem" }
                      : { background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.28)", color:th.text, borderBottomLeftRadius:"0.4rem" } }>
                    {m.text}
                  </div>
                </div>
              ))}
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 flex gap-1.5"
                  style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.28)", borderBottomLeftRadius:"0.4rem" }}>
                  {[0,1,2].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background:"#818cf8", animationDelay:`${d*0.18}s` }}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ borderTop:`1px solid ${th.border2}` }}>
        <div className="max-w-5xl mx-auto px-5 py-20">
          <div className="text-xs font-black uppercase tracking-widest mb-10 text-center" style={{ color:th.textFaint }}>{t.featuresTitle}</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {features.map(f => (
              <div key={f.title} className="rounded-2xl p-6" style={{ background:th.surface, border:`1px solid ${th.border}` }}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <div className="font-black text-base mb-2" style={{ fontFamily:"var(--font-display)" }}>{f.title}</div>
                <p className="text-sm leading-relaxed" style={{ color:th.textMuted }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target */}
      <section style={{ borderTop:`1px solid ${th.border2}` }}>
        <div className="max-w-3xl mx-auto px-5 py-20 text-center">
          <div className="text-xs font-black uppercase tracking-widest mb-6" style={{ color:th.textFaint }}>{t.targetTitle}</div>
          <p className="text-xl leading-relaxed" style={{ color:th.textMuted }}>{t.targetDesc}</p>
        </div>
      </section>

      {/* CTA block */}
      <section style={{ borderTop:`1px solid ${th.border2}` }}>
        <div className="max-w-5xl mx-auto px-5 py-20 text-center">
          <div className="inline-block rounded-3xl px-12 py-12"
            style={{ background: isLight ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.1)", border:`1px solid rgba(99,102,241,0.2)` }}>
            <h2 className="text-3xl font-black mb-4" style={{ fontFamily:"var(--font-display)" }}>{t.landingHero.split("\n")[0]}</h2>
            <p className="mb-8 text-sm" style={{ color:th.textSubtle }}>{t.footerNote}</p>
            <button onClick={onSignup}
              className="px-8 py-4 rounded-2xl font-black text-base transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background:th.primaryGradient, color:th.textOnAccent, fontFamily:"var(--font-display)" }}>
              {t.landingCTA} →
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5 py-6 flex items-center justify-between" style={{ borderTop:`1px solid ${th.border2}` }}>
        <span className="text-xs" style={{ color:th.textFaint }}>© 2026 Olympiad Academy</span>
        <span className="text-xs" style={{ color:th.textFaint }}>{t.gradeLabel}</span>
      </div>
    </div>
  )
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function AuthScreen({ t, lang, onLangChange, th, themeMode, onThemeToggle, onAuth, onBack, initialMode }: {
  t:T; lang:Lang; onLangChange:(l:Lang)=>void; th:Theme; themeMode:ThemeMode; onThemeToggle:()=>void
  onAuth:(name:string)=>void; onBack:()=>void; initialMode?:"signup"|"login"
}) {
  const [mode, setMode] = useState<"signup"|"login"|"forgot">(initialMode ?? "signup")
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [password, setPassword] = useState("")
  const [parent, setParent] = useState("")
  const [resetContact, setResetContact] = useState("")
  const [resetSent, setResetSent] = useState(false)
  const [error, setError] = useState("")

  const field = { background:th.inputBg, border:`1px solid ${th.inputBorder}`, color:th.text, fontFamily:"var(--font-body)", outline:"none" }
  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = th.inputBorderFocus
  const blurBorder  = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = th.inputBorder

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode==="signup" && !name.trim()) { setError(t.errorName); return }
    if (!contact.trim()) { setError(t.errorContact); return }
    if (password.length < 4) { setError(t.errorPassword); return }
    onAuth(mode==="signup" ? name.trim() : "Alisher")
  }
  const sendReset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetContact.trim()) { setError(t.errorContact); return }
    setResetSent(true); setError("")
  }

  return (
    <div className="theme-root min-h-screen flex flex-col" style={{ background:th.bg, color:th.text }}>
      <div className="flex items-center justify-between px-5 py-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm transition-all hover:opacity-70"
          style={{ color:th.textSubtle }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Olympiad Academy
        </button>
        <div className="flex items-center gap-2">
          <LangSwitcher lang={lang} onChange={onLangChange} th={th}/>
          <ThemeToggle themeMode={themeMode} onToggle={onThemeToggle} th={th}/>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {mode==="forgot" ? (
            <>
              <button onClick={() => { setMode("login"); setResetSent(false); setError("") }}
                className="text-sm mb-6 transition-all hover:opacity-70"
                style={{ color:th.textSubtle }}>{t.resetBack}</button>
              <h1 className="text-3xl font-black mb-2" style={{ fontFamily:"var(--font-display)" }}>{t.resetPassword}</h1>
              <p className="text-sm mb-8" style={{ color:th.textSubtle }}>{t.appSubtitle}</p>
              {resetSent ? (
                <div className="rounded-2xl p-5 text-sm" style={{ background:th.correctBg, border:`1px solid ${th.correctBorder}`, color:th.correctText }}>
                  {t.resetSent}
                </div>
              ) : (
                <form onSubmit={sendReset} className="space-y-3">
                  <input type="text" placeholder={t.contactPlaceholder} value={resetContact}
                    onChange={e=>setResetContact(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm placeholder:opacity-30"
                    style={field} onFocus={focusBorder} onBlur={blurBorder}/>
                  {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ color:th.wrongText, background:th.wrongBg }}>{error}</p>}
                  <button type="submit" className="w-full py-3.5 rounded-xl font-black text-sm hover:opacity-90 active:scale-[0.98] transition-all"
                    style={{ background:th.primaryGradient, color:th.textOnAccent, fontFamily:"var(--font-display)" }}>
                    {t.resetSend}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <h1 className="text-3xl font-black mb-2" style={{ fontFamily:"var(--font-display)" }}>
                {mode==="signup" ? t.signup : t.login}
              </h1>
              <p className="text-sm mb-8" style={{ color:th.textSubtle }}>{t.appSubtitle}</p>
              <form onSubmit={submit} className="space-y-3">
                {mode==="signup" && (
                  <input type="text" placeholder={t.namePlaceholder} value={name} onChange={e=>setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm placeholder:opacity-30"
                    style={field} onFocus={focusBorder} onBlur={blurBorder}/>
                )}
                <div className="space-y-1.5">
                  <label htmlFor="auth-contact" className="block text-xs font-bold px-1" style={{ color:th.textMuted }}>
                    {t.contact}
                  </label>
                  <input id="auth-contact" type="text" autoComplete="username" placeholder={t.contactPlaceholder} value={contact} onChange={e=>setContact(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm placeholder:opacity-30"
                    style={field} onFocus={focusBorder} onBlur={blurBorder}/>
                  <p className="px-1 text-[11px] leading-relaxed" style={{ color:th.textFaint }}>{t.contactHint}</p>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="auth-password" className="block text-xs font-bold px-1" style={{ color:th.textMuted }}>
                    {t.password}
                  </label>
                  <input id="auth-password" type="password" autoComplete={mode==="signup" ? "new-password" : "current-password"} placeholder={t.passwordPlaceholder} value={password} onChange={e=>setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm placeholder:opacity-30"
                    style={field} onFocus={focusBorder} onBlur={blurBorder}/>
                </div>
                {mode==="signup" && (
                  <div className="space-y-1.5 pt-1">
                    <label htmlFor="parent-contact" className="block text-xs font-bold px-1" style={{ color:th.textMuted }}>
                      {t.parentContact}
                    </label>
                    <input id="parent-contact" type="tel" autoComplete="tel" placeholder={t.parentContactPlaceholder} value={parent} onChange={e=>setParent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm placeholder:opacity-30"
                      style={field} onFocus={focusBorder} onBlur={blurBorder}/>
                    <p className="px-1 text-[11px] leading-relaxed" style={{ color:th.textFaint }}>{t.parentContactHint}</p>
                  </div>
                )}
                {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ color:th.wrongText, background:th.wrongBg }}>{error}</p>}
                <button type="submit" className="w-full py-3.5 rounded-xl font-black text-sm hover:opacity-90 active:scale-[0.98] transition-all mt-1"
                  style={{ background:th.primaryGradient, color:th.textOnAccent, fontFamily:"var(--font-display)" }}>
                  {mode==="signup" ? t.startPractising : t.login} →
                </button>
              </form>
              <div className="flex items-center justify-between mt-5">
                {mode==="login" ? (
                  <>
                    <button onClick={() => { setMode("forgot"); setError("") }}
                      className="text-sm transition-all hover:opacity-80"
                      style={{ color:th.textSubtle, textDecoration:"underline", textUnderlineOffset:"3px" }}>
                      {t.forgotPassword}
                    </button>
                    <button onClick={() => { setMode("signup"); setError("") }}
                      className="text-sm transition-all hover:opacity-80"
                      style={{ color:th.textSubtle, textDecoration:"underline", textUnderlineOffset:"3px" }}>
                      {t.signup} →
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setMode("login"); setError("") }}
                    className="text-sm transition-all hover:opacity-80 mx-auto"
                    style={{ color:th.textSubtle, textDecoration:"underline", textUnderlineOffset:"3px" }}>
                    {t.alreadyHaveAccount}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Topics ───────────────────────────────────────────────────────────────────
const CATEGORIES: { id: TopicCategory; label: Record<Lang, string>; icon: string }[] = [
  { id:"all",     icon:"⚡", label:{ uz:"Barchasi", ru:"Все", en:"All" } },
  { id:"numbers", icon:"🔢", label:{ uz:"Sonlar",   ru:"Числа",  en:"Numbers" } },
  { id:"logic",   icon:"🔮", label:{ uz:"Mantiq",   ru:"Логика", en:"Logic" } },
  { id:"word",    icon:"📝", label:{ uz:"Masalalar", ru:"Задачи", en:"Word problems" } },
]
const GRADE_FIVE_TOPICS = [
  { key:"topicNumbers", id:"numbers", icon:"×", count:2, solved:2, solo:2, accent:"#60a5fa", gradient:"linear-gradient(135deg,#1d4ed8,#38bdf8)" },
  { key:"topicFractions", id:"fractions", icon:"½", count:4, solved:2, solo:1, accent:"#a78bfa", gradient:"linear-gradient(135deg,#6d28d9,#a78bfa)" },
  { key:"topicDecimals", id:"decimals", icon:"0.5", count:4, solved:1, solo:1, accent:"#2dd4bf", gradient:"linear-gradient(135deg,#0f766e,#2dd4bf)" },
  { key:"topicMeasurementData", id:"measurement", icon:"↔", count:3, solved:0, solo:0, accent:"#fbbf24", gradient:"linear-gradient(135deg,#b45309,#fbbf24)" },
  { key:"topicGeometry", id:"geometry", icon:"△", count:2, solved:0, solo:0, accent:"#fb923c", gradient:"linear-gradient(135deg,#c2410c,#fb923c)" },
  { key:"topicAlgebra", id:"algebra", icon:"( )", count:1, solved:0, solo:0, accent:"#f472b6", gradient:"linear-gradient(135deg,#be185d,#f472b6)" },
  { key:"topicPercentages", id:"percentages", icon:"%", count:2, solved:0, solo:0, accent:"#34d399", gradient:"linear-gradient(135deg,#047857,#34d399)" },
] as const

function TopicsScreen({ t, lang, onLangChange, th, themeMode, onThemeToggle, userName, profile, onTopic, onMix, onProfile, onGoHome }: {
  t:T; lang:Lang; onLangChange:(l:Lang)=>void; th:Theme; themeMode:ThemeMode; onThemeToggle:()=>void
  userName:string; profile:UserProfile; onTopic:(id:string)=>void; onMix:()=>void; onProfile:()=>void; onGoHome:()=>void
}) {
  const [programme, setProgramme] = useState<"grade5"|"olympiad">("grade5")
  const topicLabel = (key: typeof GRADE_FIVE_TOPICS[number]["key"]) => t[key]

  return (
    <div className="theme-root min-h-screen" style={{ background:th.bg, color:th.text }}>
      <div style={{ background:th.navBg, backdropFilter:"blur(12px)", borderBottom:`1px solid ${th.border2}` }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onGoHome} className="hover:opacity-80 transition-opacity" aria-label="Olympiad Academy home"><OALogo size={32}/></button>
            <div>
              <div className="text-sm font-black" style={{ fontFamily:"var(--font-display)" }}>Olympiad Academy</div>
              <div className="text-xs" style={{ color:th.textSubtle }}>{t.hello} {userName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitcher lang={lang} onChange={onLangChange} th={th}/>
            <ThemeToggle themeMode={themeMode} onToggle={onThemeToggle} th={th}/>
            <button onClick={onProfile} className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:opacity-80"
              style={{ background:th.surfaceHover, border:`1px solid ${th.border}` }}>
              <span>🔥</span><span className="font-black text-sm" style={{ fontFamily:"var(--font-display)" }}>{profile.streak}</span>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{ background:th.primaryGradient, color:th.textOnAccent }}>{userName[0]}</div>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
        <section className="grid grid-cols-3 rounded-2xl overflow-hidden mb-7" style={{ background:th.surface, border:`1px solid ${th.border}` }} aria-label={t.yourProgress}>
          <div className="p-3.5 sm:p-4 min-w-0">
            <div className="text-[11px] sm:text-xs leading-tight font-bold" style={{ color:th.textMuted }}>{t.streakDays}</div>
            <div className="font-black text-base sm:text-lg mt-1 whitespace-nowrap" style={{ fontFamily:"var(--font-display)" }}>{profile.streak} 🔥</div>
          </div>
          <div className="p-3.5 sm:p-4 min-w-0 border-l" style={{ borderColor:th.border }}>
            <div className="text-[11px] sm:text-xs leading-tight font-bold" style={{ color:th.textMuted }}>{t.problemsSolved}</div>
            <div className="font-black text-base sm:text-lg mt-1 whitespace-nowrap" style={{ fontFamily:"var(--font-display)" }}>5 / 18</div>
          </div>
          <div className="p-3.5 sm:p-4 min-w-0 border-l" style={{ borderColor:th.border }}>
            <div className="text-[11px] sm:text-xs leading-tight font-bold" style={{ color:th.textMuted }}>{t.solvedWithoutHints}</div>
            <div className="font-black text-base sm:text-lg mt-1 whitespace-nowrap" style={{ fontFamily:"var(--font-display)" }}>4</div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-2 mb-7">
          <div className="inline-flex max-w-full p-1 rounded-xl" style={{ background:th.surface2, border:`1px solid ${th.border}` }}>
          <button onClick={() => setProgramme("grade5")} className="px-4 sm:px-5 py-2 rounded-lg text-sm font-black transition-all" style={{ fontFamily:"var(--font-display)", background:programme==="grade5" ? th.surfaceHover : "transparent", color:programme==="grade5" ? th.text : th.textSubtle, boxShadow:programme==="grade5" ? `inset 0 0 0 1px ${th.border}` : "none" }}>
            {t.grade5Maths}
          </button>
          <button onClick={() => setProgramme("olympiad")} className="px-4 sm:px-5 py-2 rounded-lg text-sm font-bold transition-all" style={{ color:programme==="olympiad" ? th.textSubtle : th.textFaint }}>
            {t.olympiadProblemsSoon}
          </button>
          </div>
          {programme === "grade5" && <span className="text-xs px-2.5 py-1 rounded-full" style={{ color:th.textSubtle, background:th.surface2, border:`1px solid ${th.border}` }}>{t.contentAvailableUzbek}</span>}
        </div>

        {programme === "olympiad" ? (
          <section className="rounded-2xl p-8 sm:p-10 text-center" style={{ background:th.surface2, border:`1px dashed ${th.border}` }}>
            <div className="text-3xl mb-4">✦</div>
            <h2 className="font-black text-lg" style={{ fontFamily:"var(--font-display)" }}>{t.olympiadProblemsSoon}</h2>
            <p className="text-sm max-w-sm mx-auto mt-2 leading-relaxed" style={{ color:th.textSubtle }}>{t.contentAvailableUzbek}</p>
          </section>
        ) : (
          <>
            <button onClick={onMix} className="group w-full rounded-2xl p-5 sm:p-6 text-left mb-8 transition-all hover:-translate-y-0.5 active:translate-y-0" style={{ background:"linear-gradient(135deg, rgba(99,102,241,0.16), rgba(168,85,247,0.09))", border:"1px solid rgba(129,140,248,0.28)", boxShadow:themeMode === "dark" ? "0 18px 50px rgba(79,70,229,0.12)" : "0 12px 30px rgba(79,70,229,0.08)" }}>
              <div className="flex items-start justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-xl" style={{ background:th.primaryGradient, color:th.textOnAccent }}>✦</div>
                  <div>
                    <h2 className="font-black text-lg" style={{ fontFamily:"var(--font-display)" }}>{t.curriculumMixTitle}</h2>
                    <p className="text-sm mt-1" style={{ color:th.textMuted }}>{t.curriculumMixDesc}</p>
                    <p className="text-xs font-bold mt-3" style={{ color:"#a5b4fc" }}>{t.curriculumOverallProgress}</p>
                  </div>
                </div>
                <span className="mt-1 text-xl group-hover:translate-x-1 transition-transform" style={{ color:"#a5b4fc" }}>→</span>
              </div>
            </button>

            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-black uppercase tracking-[0.16em]" style={{ color:th.textFaint }}>{t.chooseTopicHeading}</h2>
              <div className="h-px flex-1" style={{ background:th.divider }}/>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background:th.surface, border:`1px solid ${th.border}` }}>
              {GRADE_FIVE_TOPICS
                .filter(topic => TOPICS.some(availableTopic => availableTopic.id === topic.id && availableTopic.problems.length > 0))
                .map((topic, index) => {
                const availableCount = TOPICS.find(availableTopic => availableTopic.id === topic.id)?.problems.length ?? 0
                const solved = Math.min(topic.solved, availableCount)
                const progress = solved / availableCount * 100
                const solvedWithoutHintsPercent = solved > 0 ? Math.round(topic.solo / solved * 100) : 0
                const status = solved === availableCount ? t.mastered : solved === 0 ? t.notStarted : t.developing
                return (
                  <button key={topic.key} onClick={() => onTopic(topic.id)} className={`group w-full text-left px-4 py-4 sm:px-5 sm:py-4.5 transition-colors hover:bg-white/[0.025] active:bg-white/[0.04] ${index > 0 ? "border-t" : ""}`} style={index > 0 ? { borderColor:th.divider } : undefined}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg mt-0.5 shrink-0 flex items-center justify-center text-xs font-black" style={{ background:`${topic.accent}15`, color:topic.accent, fontFamily:"var(--font-display)" }}>{topic.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-black text-sm sm:text-base leading-snug" style={{ fontFamily:"var(--font-display)" }}>{topicLabel(topic.key)}</h3>
                          <div className="shrink-0 text-right">
                            <div className="text-sm font-black tracking-tight" style={{ color:topic.accent, textShadow:themeMode === "dark" ? `0 0 14px ${topic.accent}55` : "none" }}>{solved} / {availableCount} {t.solved}</div>
                            <div className="text-[11px] mt-0.5 font-medium" style={{ color:th.textSubtle }}>{solved > 0 ? `${solvedWithoutHintsPercent}% ${t.solvedWithoutHints}` : t.notStarted}</div>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full mt-2.5 overflow-hidden" style={{ background:th.progressBg }}>
                          <div className="h-full rounded-full" style={{ width:`${progress}%`, minWidth:progress > 0 ? "8px" : undefined, background:topic.gradient }}/>
                        </div>
                        <div className="text-[11px] mt-1.5 font-medium" style={{ color:th.textFaint }}>{status}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// ─── Problem ──────────────────────────────────────────────────────────────────
function ProblemScreen({ t, lang, th, themeMode, onThemeToggle, topic, problemIndex, onNext, onBack, onBankExhausted }: {
  t:T; lang:Lang; th:Theme; themeMode:ThemeMode; onThemeToggle:()=>void
  topic:Topic; problemIndex:number; onNext:()=>void; onBack:()=>void; onBankExhausted:()=>void
}) {
  const problem = topic.problems[problemIndex]
  const [answer, setAnswer] = useState("")
  const [selectedChoice, setSelectedChoice] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [lastWrongAnswer, setLastWrongAnswer] = useState("")
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const [showAskWhy, setShowAskWhy] = useState(false)
  const [askInput, setAskInput] = useState("")
  const [askHistory, setAskHistory] = useState<{q:string;a:string}[]>([])

  const currentAnswer = problem.answerType==="multiple_choice" ? selectedChoice : answer
  const problemDone = isCorrect || hintsRevealed === 3
  const isWrong = submitted && !isCorrect
  const retryBlocked = isWrong && currentAnswer.trim() === lastWrongAnswer
  const hintColors = ["#f59e0b","#f97316","#a78bfa"]
  const hintLabels = [t.hintTier1, t.hintTier2, t.hintTier3]

  const handleSubmit = () => {
    if (!currentAnswer.trim() || retryBlocked) return
    const normalizeAnswer = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, " ").replace(/,/g, ".")
    const ok = problem.answerType==="multiple_choice"
      ? problem.choices![lang].indexOf(currentAnswer) === problem.choices!.en.indexOf(problem.acceptedAnswers[0])
      : problem.acceptedAnswers.some(accepted => normalizeAnswer(accepted) === normalizeAnswer(currentAnswer))
    setSubmitted(true)
    setIsCorrect(ok)
    if (!ok) setLastWrongAnswer(currentAnswer.trim())
  }

  const handleAsk = () => {
    if (!askInput.trim() || askHistory.length > 0) return
    setAskHistory([{ q:askInput.trim(), a:problem.solution[lang] }])
    setAskInput("")
  }

  const isLastProblem = problemIndex + 1 >= topic.problems.length

  return (
    <div className="theme-root min-h-screen" style={{ background:th.bg, color:th.text }}>
      {/* Nav */}
      <div className="sticky top-0 z-20" style={{ background:th.navBg, backdropFilter:"blur(12px)", borderBottom:`1px solid ${th.border2}` }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg transition-colors" style={{ color:th.textSubtle }}
            onMouseEnter={e=>(e.currentTarget.style.background=th.surfaceHover)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black truncate" style={{ color:topic.accent, fontFamily:"var(--font-display)" }} title={topic.name[lang]}>{topic.name[lang]}</div>
            <div className="text-[10px] mt-0.5 truncate font-medium" style={{ color:th.textSubtle }} title={problem.title[lang]}>{problem.title[lang]}</div>
          </div>
          <ThemeToggle themeMode={themeMode} onToggle={onThemeToggle} th={th}/>
          <div className="shrink-0 px-2.5 py-1 rounded-full text-xs font-black" style={{ background:`${topic.accent}16`, border:`1px solid ${topic.accent}32`, color:topic.accent, fontFamily:"var(--font-display)" }}>
            {t.problem} {problemIndex+1} {t.of} {topic.problems.length}
          </div>
          <div className="flex gap-1">
            {Array.from({length:5}).map((_,i)=>(
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i<problem.difficulty ? topic.accent : th.progressBg }}/>
            ))}
          </div>
        </div>
        <div className="h-0.5" style={{ background:th.progressBg }}>
          <div className="h-full transition-all duration-500" style={{ width:`${((problemIndex+(isCorrect?1:0))/topic.problems.length)*100}%`, background:topic.gradient }}/>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Statement */}
        <div className="rounded-2xl p-6" style={{ background:th.surface, border:`1px solid ${th.border}` }}>
          <h1 className="text-lg sm:text-xl leading-snug font-black mb-4" style={{ fontFamily:"var(--font-display)" }}>{problem.title[lang]}</h1>
          <p className="text-base leading-relaxed font-bold" style={{ fontFamily:"var(--font-display)" }}>{problem.statement[lang]}</p>
        </div>

        {/* Answer input — hidden once problem is done */}
        {!problemDone && (
          <div className="rounded-2xl p-5 space-y-4" style={{ background:th.surface2, border:`1px solid ${isWrong ? th.wrongBorder : th.border}` }}>
            <div className="text-xs font-black uppercase tracking-widest" style={{ color:th.textFaint }}>
              {problem.answerType==="multiple_choice" ? t.chooseAnswer : t.yourAnswer}
            </div>
            {problem.answerType==="multiple_choice" ? (
              <div className="space-y-2">
                {problem.choices![lang].map(c => (
                  <label key={c} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                    style={{ background: selectedChoice===c ? `${topic.accent}12` : th.surface, border:`1px solid ${selectedChoice===c ? topic.accent+"50" : th.border}` }}>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ border:`1.5px solid ${selectedChoice===c ? topic.accent : th.textFaint}`, background: selectedChoice===c ? topic.accent : "transparent" }}>
                      {selectedChoice===c && <div className="w-1.5 h-1.5 rounded-full bg-white"/>}
                    </div>
                    <input type="radio" className="sr-only" checked={selectedChoice===c} onChange={()=>{ setSelectedChoice(c); setSubmitted(false) }}/>
                    <span className="text-sm font-bold" style={{ fontFamily:"var(--font-display)", color:selectedChoice===c ? topic.accent : th.text }}>{c}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input type="text" inputMode="numeric" placeholder={t.answerPlaceholder} value={answer}
                onChange={e=>{ setAnswer(e.target.value); if(submitted) setSubmitted(false) }}
                onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                className="w-full px-4 py-3 rounded-xl text-xl font-black placeholder:opacity-20"
                style={{ background:th.inputBg, border:`1.5px solid ${isWrong ? "#f59e0b" : th.inputBorder}`, fontFamily:"var(--font-display)", color:th.text, outline:"none" }}
                onFocus={e=>{ if(!isWrong) e.target.style.borderColor=th.inputBorderFocus }}
                onBlur={e=>{ if(!isWrong) e.target.style.borderColor=th.inputBorder }}/>
            )}

            {/* Submit row — shown only when not yet wrong, or in retry state */}
            {!isWrong && (
              <div className="pt-1">
                <button onClick={handleSubmit} disabled={!currentAnswer.trim()}
                  className="w-full py-3 rounded-xl font-black text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-25"
                  style={{ background:topic.gradient, fontFamily:"var(--font-display)" }}>
                  {t.check}
                </button>
                {!submitted && <p className="text-xs text-center mt-2" style={{ color:th.textFaint }}>{t.hintNote}</p>}
              </div>
            )}
          </div>
        )}

        {/* Verdict: wrong answer */}
        {isWrong && !problemDone && (
          <div className="rounded-2xl p-5 space-y-3" style={{ background:th.wrongBg, border:`1px solid ${th.wrongBorder}` }}>
            <div className="font-black text-sm" style={{ color:th.wrongText }}>{t.notQuite}</div>
            <div className="flex gap-2">
              <button onClick={handleSubmit} disabled={retryBlocked || !currentAnswer.trim()}
                className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                style={{ background:th.surface, border:`1px solid ${th.border}`, color:th.text, fontFamily:"var(--font-display)" }}>
                {t.retry}
              </button>
              {hintsRevealed < 3 && (
                <button onClick={()=>setHintsRevealed(n=>n+1)}
                  className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all hover:opacity-90"
                  style={{ background:th.hintBg(hintColors[hintsRevealed]), border:`1px solid ${th.hintBorder(hintColors[hintsRevealed])}`, color:hintColors[hintsRevealed], fontFamily:"var(--font-display)" }}>
                  {t.getHint}
                </button>
              )}
            </div>
            {retryBlocked && (
              <p className="text-xs" style={{ color:th.wrongText }}>{t.changeAnswer}</p>
            )}
          </div>
        )}

        {/* Hints stack — always visible once revealed */}
        {hintsRevealed > 0 && (
          <div className="space-y-2">
            {Array.from({length:hintsRevealed},(_,i)=>(
              <div key={i} className="rounded-2xl p-5" style={{ background:th.hintBg(hintColors[i]), border:`1px solid ${th.hintBorder(hintColors[i])}` }}>
                <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color:hintColors[i] }}>{hintLabels[i]}</div>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color:th.textMuted }}>{problem.hints[i][lang]}</p>
              </div>
            ))}
            {hintsRevealed < 3 && !isCorrect && (
              <button onClick={()=>setHintsRevealed(n=>n+1)}
                className="w-full py-3 rounded-xl font-black text-sm transition-all hover:opacity-90"
                style={{ background:th.hintBg(hintColors[hintsRevealed]), border:`1px solid ${th.hintBorder(hintColors[hintsRevealed])}`, color:hintColors[hintsRevealed], fontFamily:"var(--font-display)" }}>
                {t.iAmStillStuck}
              </button>
            )}
          </div>
        )}

        {/* Tier 3 reached: explanation + Next */}
        {hintsRevealed === 3 && !isCorrect && (
          <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid ${th.border}` }}>
            <div className="px-5 py-4 text-xs font-black uppercase tracking-widest" style={{ background:th.surface2, color:th.textFaint }}>
              {t.fullSolution}
            </div>
            <div className="px-5 py-4" style={{ background:th.surface }}>
              <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color:th.textFaint }}>{t.whyThisWorks}</div>
              <p className="text-sm leading-relaxed" style={{ color:th.textMuted }}>{problem.solution[lang]}</p>
            </div>
            <div className="px-5 py-4" style={{ borderTop:`1px solid ${th.border2}`, background:th.surface }}>
              <button onClick={isLastProblem ? onBankExhausted : onNext}
                className="w-full py-2.5 rounded-xl text-sm font-black transition-all hover:opacity-90"
                style={{ background:th.primaryGradient, color:th.textOnAccent, fontFamily:"var(--font-display)" }}>
                {isLastProblem ? t.backToTopics : t.nextProblemFinal}
              </button>
            </div>
          </div>
        )}

        {/* Correct verdict */}
        {isCorrect && (
          <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid ${th.correctBorder}` }}>
            <div className="px-5 py-4" style={{ background:th.correctBg }}>
              <div className="font-black mb-1" style={{ color:th.correctText }}>{t.correct}</div>
              <div className="text-xs" style={{ color:th.correctSubText }}>
                {hintsRevealed===0 ? t.solvedAlone : `${hintsRevealed} ${t.hintsUsed}`}
              </div>
            </div>
            <div className="px-5 py-4" style={{ background:th.surface }}>
              <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color:th.textFaint }}>{t.whyThisWorks}</div>
              <p className="text-sm leading-relaxed" style={{ color:th.textMuted }}>{problem.solution[lang]}</p>
            </div>
            <div className="px-5 py-4" style={{ borderTop:`1px solid ${th.border2}`, background:th.surface }}>
              <button onClick={isLastProblem ? onBankExhausted : onNext}
                className="w-full py-2.5 rounded-xl text-sm font-black transition-all hover:opacity-90"
                style={{ background:th.primaryGradient, color:th.textOnAccent, fontFamily:"var(--font-display)" }}>
                {isLastProblem ? t.backToTopics : t.nextProblemFinal}
              </button>
            </div>
          </div>
        )}

        {/* Ask Why — only after problem is done */}
        {problemDone && (
          <div>
            {!showAskWhy ? (
              <button onClick={()=>setShowAskWhy(true)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                style={{ background:th.askWhyBg, border:`1px solid ${th.askWhyBorder}`, color:th.askWhyText, fontFamily:"var(--font-display)" }}>
                {t.askWhy}
              </button>
            ) : (
              <div className="rounded-2xl p-5 space-y-3" style={{ background:th.askWhyBg, border:`1px solid ${th.askWhyBorder}` }}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm" style={{ color:th.askWhyText }}>{t.askWhy}</span>
                  <button onClick={()=>setShowAskWhy(false)} className="text-xs hover:opacity-70 transition-opacity" style={{ color:th.textFaint }}>✕</button>
                </div>
                <p className="text-xs" style={{ color:th.textFaint }}>{t.askWhySub}</p>
                {askHistory.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm font-bold px-4 py-2.5 rounded-xl" style={{ background:`${th.askWhyBorder}22`, color:th.askWhyText }}>{askHistory[0].q}</div>
                    <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background:th.surface, color:th.textMuted }}>{askHistory[0].a}</div>
                    <div className="text-[11px] px-1" style={{ color:th.textFaint }}>{t.askWhyUsed}</div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" placeholder={t.askWhyPlaceholder} value={askInput}
                      onChange={e=>setAskInput(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&handleAsk()}
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm placeholder:opacity-25"
                      style={{ background:th.askWhyInputBg, border:`1px solid ${th.border}`, color:th.text, outline:"none", fontFamily:"var(--font-body)" }}/>
                    <button onClick={handleAsk} disabled={!askInput.trim()}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-30 transition-all"
                      style={{ background:th.primaryStrong, color:th.textOnAccent, fontFamily:"var(--font-display)" }}>
                      {t.ask}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Bank Exhausted / Session Summary ─────────────────────────────────────────
function BankExhaustedScreen({ t, lang, th, themeMode, onThemeToggle, topic, sessionStats, onTopics, onGoHome }: {
  t:T; lang:Lang; th:Theme; themeMode:ThemeMode; onThemeToggle:()=>void
  topic:Topic
  sessionStats:{ attempted:number; solved:number; solvedWithoutHints:number; hintsByTier:[number,number,number] }
  onTopics:()=>void; onGoHome:()=>void
}) {
  const callout = (() => {
    if (sessionStats.solvedWithoutHints > 0) return t.calloutSolvedAlone.replace("{n}", String(sessionStats.solvedWithoutHints))
    if (sessionStats.solved > 0) return t.calloutWithHint
    return t.calloutNeutral
  })()

  const hintColors:[string,string,string] = ["#f59e0b","#f97316","#a78bfa"]

  return (
    <div className="theme-root min-h-screen" style={{ background:th.bg, color:th.text }}>
      <div style={{ background:th.navBg, backdropFilter:"blur(12px)", borderBottom:`1px solid ${th.border2}` }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onGoHome} className="hover:opacity-80 transition-opacity"><OALogo size={28}/></button>
          <span className="flex-1 font-black text-base" style={{ fontFamily:"var(--font-display)" }}>{t.sessionSummaryTitle}</span>
          <ThemeToggle themeMode={themeMode} onToggle={onThemeToggle} th={th}/>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Topic badge */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background:topic.gradient }}/>
          <div>
            <div className="font-black text-lg" style={{ fontFamily:"var(--font-display)" }}>{topic.name[lang]}</div>
            <div className="text-xs" style={{ color:th.textSubtle }}>{topic.nameEn}</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {([
            [t.problemsAttempted, sessionStats.attempted],
            [t.problemsSolvedStat, sessionStats.solved],
            [t.solvedWithoutHintsStat, sessionStats.solvedWithoutHints],
          ] as [string,number][]).map(([label, value])=>(
            <div key={label} className="rounded-2xl p-4 text-center" style={{ background:th.surface, border:`1px solid ${th.border}` }}>
              <div className="text-3xl font-black mb-1" style={{ fontFamily:"var(--font-display)" }}>{value}</div>
              <div className="text-xs leading-tight" style={{ color:th.textSubtle }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Hints used breakdown */}
        <div className="rounded-2xl p-5" style={{ background:th.surface, border:`1px solid ${th.border}` }}>
          <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color:th.textFaint }}>{t.hintsBreakdown}</div>
          <div className="grid grid-cols-3 gap-2">
            {(["hintTier1","hintTier2","hintTier3"] as const).map((key,i)=>(
              <div key={i} className="rounded-xl p-3 text-center" style={{ background:th.hintBg(hintColors[i]), border:`1px solid ${th.hintBorder(hintColors[i])}` }}>
                <div className="text-2xl font-black mb-1" style={{ fontFamily:"var(--font-display)", color:hintColors[i] }}>{sessionStats.hintsByTier[i]}</div>
                <div className="text-[10px] leading-tight" style={{ color:hintColors[i] }}>{t[key].split("·")[0].trim()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bank exhausted notice */}
        <div className="rounded-2xl p-5" style={{ background:th.surface2, border:`1px solid ${th.border}` }}>
          <p className="text-sm" style={{ color:th.textMuted }}>{t.bankExhausted}</p>
        </div>

        {/* Callout */}
        <div className="rounded-xl px-4 py-3 text-sm font-semibold"
          style={{ background:th.askWhyBg, border:`1px solid ${th.askWhyBorder}`, color:th.askWhyText }}>
          {callout}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onTopics}
            className="flex-1 py-3 rounded-xl font-black text-sm transition-all hover:opacity-90"
            style={{ background:th.surface, border:`1px solid ${th.border}`, color:th.text, fontFamily:"var(--font-display)" }}>
            {t.backToTopics}
          </button>
          <button onClick={onTopics}
            className="flex-1 py-3 rounded-xl font-black text-sm transition-all hover:opacity-90"
            style={{ background:th.primaryGradient, color:th.textOnAccent, fontFamily:"var(--font-display)" }}>
            {t.finishForToday}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Achievements data ────────────────────────────────────────────────────────
interface Achievement {
  id: string; icon: string
  title: Record<Lang, string>
  desc: Record<Lang, string>
  unlocked: boolean
  color: string
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id:"first_solve", icon:"🎯", unlocked:true, color:"#818cf8",
    title:{ uz:"Birinchi qadam", ru:"Первый шаг", en:"First step" },
    desc:{ uz:"Birinchi masalani yechdingiz", ru:"Решили первую задачу", en:"Solved your first problem" },
  },
  {
    id:"streak7", icon:"🔥", unlocked:true, color:"#f97316",
    title:{ uz:"7 kun ketma-ket", ru:"7 дней подряд", en:"7-day streak" },
    desc:{ uz:"7 kun to'xtovsiz mashq qildingiz", ru:"7 дней без пропусков", en:"7 days without missing a day" },
  },
  {
    id:"no_hints", icon:"🧠", unlocked:true, color:"#34d399",
    title:{ uz:"Mustaqil!", ru:"Самостоятельно!", en:"No help needed!" },
    desc:{ uz:"Maslahatisiz 5 ta masala yechdingiz", ru:"5 задач без подсказок", en:"5 problems solved without hints" },
  },
  {
    id:"perfectionist", icon:"💯", unlocked:false, color:"#fbbf24",
    title:{ uz:"Perfeksionist", ru:"Перфекционист", en:"Perfectionist" },
    desc:{ uz:"10 ta masalani ketma-ket maslahatisiz yeching", ru:"10 задач подряд без подсказок", en:"10 problems in a row without hints" },
  },
  {
    id:"marathon", icon:"🏃", unlocked:false, color:"#f472b6",
    title:{ uz:"Marafonchi", ru:"Марафонец", en:"Marathon runner" },
    desc:{ uz:"Jami 50 ta masala yeching", ru:"Решите 50 задач всего", en:"Solve 50 problems total" },
  },
  {
    id:"logician", icon:"🔮", unlocked:false, color:"#a78bfa",
    title:{ uz:"Mantiqchi", ru:"Логик", en:"Logician" },
    desc:{ uz:"Mantiqdan barcha masalalarni yeching", ru:"Решите все задачи по логике", en:"Complete all logic problems" },
  },
  {
    id:"speed", icon:"⚡", unlocked:false, color:"#fcd34d",
    title:{ uz:"Tez fikrlovchi", ru:"Быстрый ум", en:"Speed thinker" },
    desc:{ uz:"1 daqiqada 3 ta masala yeching", ru:"3 задачи за 1 минуту", en:"Solve 3 problems in 1 minute" },
  },
  {
    id:"allTopics", icon:"🏆", unlocked:false, color:"#f59e0b",
    title:{ uz:"Har tomonlama", ru:"Универсал", en:"All-rounder" },
    desc:{ uz:"Barcha 5 ta mavzuni o'zlashtiring", ru:"Освойте все 5 тем", en:"Master all 5 topics" },
  },
  {
    id:"gauss", icon:"∑", unlocked:false, color:"#6366f1",
    title:{ uz:"Gauss usuli", ru:"Метод Гаусса", en:"Gauss method" },
    desc:{ uz:"Arifmetik seriyaning barcha masalalarini yeching", ru:"Решите все задачи по арифметике", en:"Complete all arithmetic problems" },
  },
]

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfileScreen({ t, lang, onLangChange, th, themeMode, onThemeToggle, profile, userName, onBack, onGoHome, onLogout }: {
  t:T; lang:Lang; onLangChange:(l:Lang)=>void; th:Theme; themeMode:ThemeMode; onThemeToggle:()=>void
  profile:UserProfile; userName:string; onBack:()=>void; onGoHome:()=>void; onLogout:()=>void
}) {
  const [activeCategory, setActiveCategory] = useState<TopicCategory>("all")
  const filteredTopics = activeCategory === "all" ? TOPICS : TOPICS.filter(t => t.category === activeCategory)

  const [editing, setEditing] = useState(false)
  const [fields, setFields] = useState({ name:userName, phone:"+998 90 123 45 67", parent:"+998 90 000 00 00" })
  const [draft, setDraft] = useState(fields)
  const openEdit = () => { setDraft(fields); setEditing(true) }
  const saveEdit = () => { setFields(draft); setEditing(false) }

  const inputStyle = {
    background:th.surface2, border:`1.5px solid ${th.border}`, color:th.text,
  } as const

  return (
    <div className="theme-root min-h-screen" style={{ background:th.bg, color:th.text }}>
      <div style={{ background:th.navBg, backdropFilter:"blur(12px)", borderBottom:`1px solid ${th.border2}` }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg transition-colors" style={{ color:th.textSubtle }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={onGoHome} className="hover:opacity-80 transition-opacity"><OALogo size={28}/></button>
          <span className="flex-1 font-black text-base" style={{ fontFamily:"var(--font-display)" }}>{t.profile}</span>
          <LangSwitcher lang={lang} onChange={onLangChange} th={th}/>
          <ThemeToggle themeMode={themeMode} onToggle={onThemeToggle} th={th}/>
          <button onClick={onLogout} title={t.logout} aria-label={t.logout}
            className="p-2 rounded-lg transition-colors hover:opacity-70" style={{ color:th.wrongText }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 15H4a1 1 0 01-1-1V4a1 1 0 011-1h3M11.5 12L15 9l-3.5-3M15 9H7"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Personal info — chromeless header */}
        <div className="flex items-center gap-3.5 pt-1 pb-1">
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-black flex-shrink-0"
            style={{ background:th.primaryGradient, color:th.textOnAccent, fontFamily:"var(--font-display)", fontSize:"1.05rem" }}>
            {fields.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-lg leading-tight truncate" style={{ fontFamily:"var(--font-display)" }}>{fields.name}</div>
            <div className="text-xs mt-1 flex items-center gap-1.5 flex-wrap" style={{ color:th.textSubtle }}>
              <span>{t.gradeLabel}</span>
              <span style={{ color:th.textFaint }}>·</span>
              <span>{fields.phone}</span>
              <span style={{ color:th.textFaint }}>·</span>
              <span title={t.parentContact}>👨‍👩‍👧 {fields.parent}</span>
            </div>
          </div>
          <button onClick={openEdit}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-80"
            style={{ background:"rgba(99,102,241,0.15)", border:"1.5px solid rgba(99,102,241,0.5)", color:"#818cf8", fontFamily:"var(--font-display)" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8.2 1.6l2.2 2.2-6 6L2 10.5l.7-2.4 5.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            {t.edit}
          </button>
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }} onClick={()=>setEditing(false)}>
            <div className="w-full max-w-sm rounded-2xl p-5" onClick={e=>e.stopPropagation()}
              style={{ background:th.surface, border:`1px solid ${th.border}` }}>
              <div className="font-black text-base mb-4" style={{ fontFamily:"var(--font-display)" }}>{t.editProfile}</div>
              <div className="space-y-3">
                {([["name", t.name], ["phone", t.contact], ["parent", t.parentContact]] as const).map(([key, label]) => (
                  <label key={key} className="block">
                    <div className="text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color:th.textFaint }}>{label}</div>
                    <input value={draft[key]} onChange={e=>setDraft(d=>({ ...d, [key]:e.target.value }))}
                      className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-indigo-400 transition-colors"
                      style={inputStyle}/>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={()=>setEditing(false)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all hover:opacity-80"
                  style={{ background:th.surface2, border:`1.5px solid ${th.border}`, color:th.textSubtle }}>
                  {t.cancel}
                </button>
                <button onClick={saveEdit}
                  className="flex-1 rounded-xl py-2.5 text-sm font-black transition-all hover:opacity-90"
                  style={{ background:th.primaryGradient, color:th.textOnAccent, fontFamily:"var(--font-display)" }}>
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="rounded-2xl p-5" style={{ background:th.surface, border:`1px solid ${th.border}` }}>
          <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color:th.textFaint }}>{t.yourProgress}</div>
          <div className="font-black text-xl mb-4" style={{ fontFamily:"var(--font-display)" }}>
            {profile.streak > 0 ? `${profile.streak} ${t.streakDays} 🔥` : t.noStreak}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ label:t.problemsSolved, value:profile.problemsSolved }, { label:t.accuracy, value:`${profile.accuracy}%` }].map(s=>(
              <div key={s.label} className="rounded-xl p-3" style={{ background:th.statCardBg }}>
                <div className="text-xl font-black" style={{ fontFamily:"var(--font-display)" }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color:th.textSubtle }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="rounded-2xl p-5" style={{ background:th.surface, border:`1px solid ${th.border}` }}>
          <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color:th.textFaint }}>{t.topicMastery}</div>
          <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1">
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200"
                  style={{
                    background: isActive ? "rgba(99,102,241,0.15)" : th.surface2,
                    border: `1.5px solid ${isActive ? "rgba(99,102,241,0.5)" : th.border}`,
                    color: isActive ? "#818cf8" : th.textSubtle,
                    fontFamily: "var(--font-display)",
                  }}>
                  {cat.icon} {cat.label[lang]}
                </button>
              )
            })}
          </div>
          <div className="space-y-5">
            {filteredTopics.map(topic=>{
              const m = profile.topicMastery[topic.id]??0
              const solved = Math.round(m/100*topic.problems.length)
              return (
                <div key={topic.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-bold" style={{ fontFamily:"var(--font-display)" }}>{topic.name[lang]}</div>
                      <div className="text-xs" style={{ color:th.textSubtle }}>{topic.nameEn}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color:topic.accent }}>{solved} of {topic.problems.length} {t.solved}</div>
                      <div className="text-xs" style={{ color:th.textFaint }}>{Math.round(m*0.6)}% {t.solvedWithoutHints}</div>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background:th.progressBg }}>
                    <div className="h-full rounded-full" style={{ width:`${m}%`, background:topic.gradient }}/>
                  </div>
                  <div className="text-xs mt-1" style={{ color:th.textFaint }}>{m<40?t.beginner:m<70?t.developing:t.mastered}</div>
                </div>
              )
            })}
            {filteredTopics.length === 0 && (
              <div className="text-sm text-center py-4" style={{ color:th.textFaint }}>—</div>
            )}
          </div>
        </div>

        {/* Last session */}
        <div className="rounded-2xl p-5" style={{ background:th.surface, border:`1px solid ${th.border}` }}>
          <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color:th.textFaint }}>{t.lastSession}</div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[{ label:t.attempted, value:profile.lastSession.attempted }, { label:t.solvedStat, value:profile.lastSession.solved }, { label:t.hintsUsedStat, value:profile.lastSession.hintsUsed }].map(s=>(
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background:th.statCardBg }}>
                <div className="text-xl font-black" style={{ fontFamily:"var(--font-display)" }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color:th.textSubtle }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {([["#f59e0b", t.hintTier1], ["#f97316", t.hintTier2], ["#a78bfa", t.hintTier3]] as [string,string][]).map(([color, label], i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background:th.hintBg(color), border:`1px solid ${th.hintBorder(color)}` }}>
                <div className="text-xl font-black mb-0.5" style={{ fontFamily:"var(--font-display)", color }}>{profile.lastSession.hintsByTier[i]}</div>
                <div className="text-[10px] leading-tight" style={{ color }}>{label.split("·")[0].trim()}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl px-4 py-3 text-sm font-semibold"
            style={{ background:th.askWhyBg, border:`1px solid ${th.askWhyBorder}`, color:th.askWhyText }}>
            ⭐ {t.standout}
          </div>
        </div>

        {/* Achievements */}
        <div className="rounded-2xl p-5" style={{ background:th.surface, border:`1px solid ${th.border}` }}>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-black uppercase tracking-widest" style={{ color:th.textFaint }}>{t.achievements}</div>
            <div className="text-xs font-bold" style={{ color:th.textFaint }}>
              {ACHIEVEMENTS.filter(a=>a.unlocked).length}/{ACHIEVEMENTS.length}
            </div>
          </div>
          <p className="text-xs mb-5" style={{ color:th.textSubtle }}>{t.achievementsDesc}</p>
          <div className="grid grid-cols-3 gap-2.5">
            {ACHIEVEMENTS.map(a => (
              <div key={a.id}
                className="rounded-2xl p-3 flex flex-col items-center text-center gap-2 transition-all"
                style={{
                  background: a.unlocked ? `${a.color}10` : th.surface2,
                  border: `1.5px solid ${a.unlocked ? a.color+"55" : th.border}`,
                  opacity: a.unlocked ? 1 : 0.45,
                }}>
                <div className="text-3xl leading-none mt-1 font-black"
                  style={ a.id==="gauss" ? { fontFamily:"var(--font-display)", color:a.color, fontSize:"1.6rem" } : undefined }>
                  {a.icon}
                </div>
                <div className="text-xs font-black leading-tight" style={{ fontFamily:"var(--font-display)", color: a.unlocked ? a.color : th.textSubtle }}>
                  {a.title[lang]}
                </div>
                <div className="text-[10px] leading-tight" style={{ color:th.textFaint }}>{a.desc[lang]}</div>
                {a.unlocked && (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background:a.color }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark")
  const [lang, setLang] = useState<Lang>("uz")
  const [screen, setScreen] = useState<Screen>("landing")
  const [authInitialMode, setAuthInitialMode] = useState<"signup"|"login">("signup")
  const [userName, setUserName] = useState("O'quvchi")
  const [topicId, setTopicId] = useState<string|null>(null)
  const [probIdx, setProbIdx] = useState(0)
  const [profile] = useState<UserProfile>(PROFILE)
  const [sessionStats, setSessionStats] = useState<{ attempted:number; solved:number; solvedWithoutHints:number; hintsByTier:[number,number,number] }>({ attempted:0, solved:0, solvedWithoutHints:0, hintsByTier:[0,0,0] })

  const th = themeMode === "dark" ? darkTheme : lightTheme
  const t = translations[lang]
  const topic = TOPICS.find(tp => tp.id === topicId) ?? null
  const toggleTheme = () => setThemeMode(m => m === "dark" ? "light" : "dark")

  const goTopic = (id: string) => { setTopicId(id); setProbIdx(0); setSessionStats({ attempted:0, solved:0, solvedWithoutHints:0, hintsByTier:[0,0,0] }); setScreen("problem") }
  const goMix   = () => { const r = TOPICS[Math.floor(Math.random()*TOPICS.length)]; setTopicId(r.id); setProbIdx(0); setSessionStats({ attempted:0, solved:0, solvedWithoutHints:0, hintsByTier:[0,0,0] }); setScreen("problem") }
  const goNext  = () => { if(topic && probIdx+1<topic.problems.length) setProbIdx(i=>i+1); else setScreen("topics") }
  const goBankExhausted = () => setScreen("summary")

  const shared = { t, lang, onLangChange:setLang, th, themeMode, onThemeToggle:toggleTheme }

  if (screen==="landing") return <LandingScreen {...shared} onSignup={()=>{setAuthInitialMode("signup");setScreen("auth")}} onLogin={()=>{setAuthInitialMode("login");setScreen("auth")}}/>
  if (screen==="auth")    return <AuthScreen {...shared} initialMode={authInitialMode} onAuth={n=>{setUserName(n);setScreen("topics")}} onBack={()=>setScreen("landing")}/>
  if (screen==="topics")  return <TopicsScreen {...shared} userName={userName} profile={profile} onTopic={goTopic} onMix={goMix} onProfile={()=>setScreen("profile")} onGoHome={()=>setScreen("landing")}/>
  if (screen==="problem"&&topic) return <ProblemScreen key={`${topicId}-${probIdx}`} {...shared} topic={topic} problemIndex={probIdx} onNext={goNext} onBack={()=>setScreen("topics")} onBankExhausted={goBankExhausted}/>
  if (screen==="summary"&&topic) return <BankExhaustedScreen {...shared} topic={topic} sessionStats={sessionStats} onTopics={()=>setScreen("topics")} onGoHome={()=>setScreen("landing")}/>
  if (screen==="profile") return <ProfileScreen {...shared} profile={profile} userName={userName} onBack={()=>setScreen("topics")} onGoHome={()=>setScreen("landing")} onLogout={()=>{ setScreen("landing"); setUserName("O'quvchi") }}/>
  return null
}

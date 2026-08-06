export const en = {
  app: {
    name: "Olympiad Academy",
  },
  nav: {
    home: "Home",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
  },
  languageSwitcher: {
    label: "Language",
    uz: "O'zbekcha",
    ru: "Русский",
    en: "English",
  },
  themeToggle: {
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
  },
  // Routing-skeleton stubs (D2/D8): i18n'ed placeholders until the real
  // screens land. Copy is ours (stubs are not in the design of record).
  stubs: {
    signupTitle: "Sign up",
    loginTitle: "Log in",
    topicsTitle: "Topics",
    authNote: "The full form arrives with OLY-40 — the route is already reserved.",
    topicsNote:
      "The full Topic List screen is a separate task. Below — a preview in the spirit of the design.",
  },
  // Landing copy — transcribed from the design of record (D11-A1 snapshot
  // i18n.ts). This is the approved text, not placeholder.
  landing: {
    gradeLabel: "Grade 5 • Math Olympiad",
    hero: "Master olympiad math\non your own",
    heroSub:
      "An AI tutor for Grade 5 students in Uzbekistan. No expensive tutors needed — a smart hint system guides you step by step.",
    cta: "Start for free",
    login: "Log in",
    howItWorks: "How it works",
    step1Title: "Pick a topic",
    step1Desc: "Arithmetic, logic, combinatorics — 5 olympiad topics or a mixed practice session.",
    step2Title: "Solve a problem",
    step2Desc: "Real olympiad problems. Enter your answer and get instant feedback.",
    step3Title: "Ask the AI tutor",
    step3Desc:
      "Stuck? Message the tutor. It won't hand over the answer — it leads you there with the next question.",
    featuresTitle: "Why Olympiad Academy?",
    feat1Title: "3-tier hint system",
    feat1Desc: "Nudge → First step → Full walkthrough. Exactly as much help as you need.",
    feat2Title: "Ask Why",
    feat2Desc:
      "Don't understand something? Ask. The AI answers strictly in the context of your problem.",
    feat3Title: "Track your progress",
    feat3Desc: "Streak, accuracy, growth per topic — all in one place.",
    targetTitle: "Who is it for?",
    targetDesc:
      "Grade 5 students in Uzbekistan preparing for olympiads without access to specialised schools or private tutors.",
    footerNote: "Math only for now. Physics, chemistry, and informatics coming later.",
    // CTA block title — own key, not hero.split("\n")[0]; see uz.ts comment.
    ctaTitle: "Master olympiad math",
    aiTutorKicker: "AI tutor",
    aiTutorTitle: "An AI tutor that never hands over the answer",
    aiTutorDesc:
      'The tutor follows your reasoning, sees exactly where you got stuck, and replies with the next question instead of the solution. Once you\'re right, ask "Why?" and it unpacks the idea in full.',
    aiTutorF1Title: "Reads your reasoning",
    aiTutorF1Desc:
      "It looks at your working, not just the final answer, and finds the real source of the mistake.",
    aiTutorF2Title: "Help in steps",
    aiTutorF2Desc:
      "From a nudge to a full walkthrough — only when needed, and only as much as needed.",
    aiTutorF3Title: 'The "Why?" chat',
    aiTutorF3Desc:
      "After a correct answer, ask about the method — the tutor explains it patiently.",
    chat1: "I'm adding 1 to 50 and keep losing track.",
    chat2: "I see. What do you get if you add the two outer numbers, 1 and 50?",
    chat3: "51",
    chat4: "Now add 2 and 49. Notice anything?",
    chat5: "Also 51! So every pair is the same.",
    chat6: "Exactly. Your turn: how many such pairs are there?",
    chatTag: "1 + 2 + … + 50",
    topics: {
      numbers: "Numbers and operations",
      fractions: "Fractions",
      decimals: "Decimals",
      measurement: "Measurement and data",
      geometry: "Measurement and geometry",
      algebra: "Operations and algebraic thinking",
      percentages: "Percentages",
    },
  },
} as const;

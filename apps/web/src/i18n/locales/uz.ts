export const uz = {
  languageSwitcher: {
    label: "Til",
    uz: "O'zbekcha",
    ru: "Русский",
    en: "English",
  },
  themeToggle: {
    toLight: "Yorug' rejimga o'tish",
    toDark: "Qorong'i rejimga o'tish",
  },
  // Routing-skeleton stubs (D2/D8): i18n'ed placeholders until the real
  // screens land. Copy is ours (stubs are not in the design of record).
  stubs: {
    topicsTitle: "Mavzular",
    topicsNote: "To'liq mavzular ekrani — alohida vazifa. Quyida dizayn ruhidagi ko'rik.",
    profileTitle: "Profil",
    profileNote: "Profil sahifasi — alohida vazifa, marshrut allaqachon band qilingan.",
    profileLogout: "Chiqish",
  },
  // Signup/login forms (OLY-40, D9). Copy transcribed from the design of
  // record (D11-A1 snapshot i18n.ts) except errorPassword: the snapshot says
  // "4 belgidan" but the contract requires 8 (contract.signup.body), and D9
  // requires error copy to match the contract, never the snapshot.
  auth: {
    appSubtitle: "5-sinf olimpiada matematikasi",
    signup: "Ro'yxatdan o'tish",
    login: "Kirish",
    name: "Ism",
    namePlaceholder: "Ismingiz",
    contact: "Telefon yoki Email",
    contactPlaceholder: "+998 90 123 45 67 yoki ism@email.com",
    contactHint: "Hisobingizga kirish uchun telefon yoki emailingizni kiriting.",
    password: "Parol",
    passwordPlaceholder: "••••••",
    startPractising: "Mashqni boshlash",
    alreadyHaveAccount: "Hisobim bor",
    errorName: "Ismingizni kiriting.",
    errorContact: "Telefon raqam yoki elektron pochta manzilini kiriting.",
    errorContactInvalid: "Email manzilini to'g'ri kiriting.",
    errorPassword: "Parol kamida 8 belgidan iborat bo'lishi kerak.",
    errorPasswordRequired: "Parolingizni kiriting.",
    errorGeneric: "Nimadir xato ketdi. Qaytadan urinib ko'ring.",
  },
  // Landing copy — transcribed from the design of record (D11-A1 snapshot
  // i18n.ts). This is the approved text, not placeholder.
  landing: {
    gradeLabel: "Grade 5 • Matematika olimpiadasi",
    hero: "Olimpiada matematikasini\nmustaqil o'rgan",
    heroSub:
      "5-sinf o'quvchilari uchun AI tutor. Qimmat repetitor kerak emas — aqlli maslahat tizimi sizni to'g'ri yo'naltirib boradi.",
    cta: "Bepul boshlash",
    login: "Kirish",
    howItWorks: "Qanday ishlaydi",
    flowStep1Title: "Mavzu tanla",
    flowStep1Desc:
      "Arifmetika, mantiq, kombinatorika — 5 ta olimpiada mavzusidan birini tanlang yoki aralash mashq qiling.",
    flowStep2Title: "Masala yech",
    flowStep2Desc: "Haqiqiy olimpiada masalalari. Javob kiritasiz, tizim darhol tekshiradi.",
    flowStep3Title: "AI tutordan so'ra",
    flowStep3Desc:
      "Qotib qolsangiz — AI tutorga yozing. U javobni bermaydi, balki keyingi savol bilan yo'l ko'rsatadi.",
    featuresTitle: "Nima uchun Olympiad Academy?",
    feat1Title: "3 bosqichli maslahat",
    feat1Desc:
      "Yo'naltirish → Birinchi qadam → To'liq yechim. Har safar faqat kerakli miqdordagi yordam.",
    feat2Title: '"Nima uchun?" savoli',
    feat2Desc: "Tushunmagan joyingizni so'rang. AI tutor masalaga bog'langan holda javob beradi.",
    feat3Title: "Natijalarni kuzating",
    feat3Desc: "Ketma-ketlik, aniqlik, har bir mavzudagi o'sish — hamma narsa bir joyda.",
    targetTitle: "Kim uchun?",
    targetDesc:
      "O'zbekistondagi 5-sinf o'quvchilari uchun. Olimpiadaga tayyorgarlik ko'rayotgan, lekin maxsus maktab yoki repetitor imkoniyati bo'lmagan bolalar.",
    footerNote: "Hozircha faqat matematika. Keyinchalik fizika, kimyo, informatika.",
    // CTA block title — same words as hero line 1, but an own key: deriving it
    // by splitting hero on "\n" would silently break if a translator drops the
    // newline (independent review, 2026-08-06).
    ctaTitle: "Olimpiada matematikasini",
    aiTutorKicker: "AI tutor",
    aiTutorTitle: "Javobni bermaydigan AI tutor",
    aiTutorDesc:
      "AI tutor har bir qadamingizni kuzatadi, qayerda qotib qolganingizni tushunadi va yechimni emas — keyingi savolni beradi. Javob to'g'ri bo'lgach, «Nega?» deb so'rang va u fikringizni oxirigacha ochib beradi.",
    aiTutorF1Title: "Sizning yechimingizni o'qiydi",
    aiTutorF1Desc:
      "Faqat javobni emas, mulohaza yo'lini tahlil qiladi va xatoning asl sababini topadi.",
    aiTutorF2Title: "Bosqichma-bosqich yordam",
    aiTutorF2Desc:
      "Yo'naltiruvchi savoldan to'liq tahlilgacha — faqat kerak bo'lganda va faqat kerakli darajada.",
    aiTutorF3Title: "«Nega?» suhbati",
    aiTutorF3Desc:
      "To'g'ri javobdan keyin usulning mohiyatini so'rang — AI tutor sabrsizlanmay tushuntiradi.",
    chat1: "1 dan 50 gacha qo'shdim, lekin adashib ketdim.",
    chat2: "Tushunarli. Eng chekkadagi ikki sonni — 1 va 50 ni qo'shsang, nima chiqadi?",
    chat3: "51",
    chat4: "Endi 2 va 49 ni qo'sh. Nimani sezyapsan?",
    chat5: "Yana 51! Demak juftliklar bir xil.",
    chat6: "Aynan shu. Endi o'zing hisoblab ko'r: nechta juftlik bor?",
    chatTag: "1 + 2 + … + 50",
    topics: {
      numbers: "Sonlar va amallar",
      fractions: "Kasrlar",
      decimals: "O'nli kasrlar",
      measurement: "O'lchash va ma'lumotlar",
      geometry: "O'lchash va geometriya",
      algebra: "Amallar va algebraik fikrlash",
      percentages: "Foizlar",
    },
  },
} as const;

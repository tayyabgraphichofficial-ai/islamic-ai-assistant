import { IslamicBook, PresetQuestion } from "./types";

export const ISLAMIC_BOOKS: IslamicBook[] = [
  {
    id: "quran",
    titleUrdu: "القرآن الکریم",
    titleEnglish: "The Holy Quran",
    category: "Quran",
    authorUrdu: "کلام اللہ (اللہ تعالی کا کلام)",
    authorEnglish: "Word of Allah SWT",
    descriptionUrdu: "اللہ تعالیٰ کی آخری نازل کردہ کتاب جو ہمارے پیارے رسول حضرت محمد مصطفیٰ صلی اللہ علیہ وسلم پر نازل کی گئی۔ یہ تمام انسانیت کے لیے ہدایت کا سرچشمہ ہے۔",
    descriptionEnglish: "The final revealed scripture of Allah, sent down to our beloved Prophet Muhammad (PBUH) as an eternal guidance for all of humanity.",
    chaptersCount: 114
  },
  {
    id: "bukhari",
    titleUrdu: "صحیح البخاری",
    titleEnglish: "Sahih al-Bukhari",
    category: "Hadith",
    authorUrdu: "امام محمد بن اسماعیل البخاریؒ",
    authorEnglish: "Imam Muhammad al-Bukhari",
    descriptionUrdu: "حدیثِ مبارکہ کا سب سے مستند ترین مجموعہ، جس میں رسول اللہ صلی اللہ علیہ وسلم کے اقوال، افعال اور تقریرات کو انتہائی سخت پرکھنے کے بعد جمع کیا گیا ہے۔",
    descriptionEnglish: "The most authentic compilation of Hadith, containing verified sayings, actions, and approvals of the Prophet Muhammad (PBUH).",
    chaptersCount: 97
  },
  {
    id: "muslim",
    titleUrdu: "صحیح مسلم",
    titleEnglish: "Sahih Muslim",
    category: "Hadith",
    authorUrdu: "امام مسلم بن الحجاج القشیریؒ",
    authorEnglish: "Imam Muslim ibn al-Hajjaj",
    descriptionUrdu: "حدیث مبارکہ کی دوسری مستند ترین کتاب، جو کہ صحیح بخاری کے ساتھ مل کر 'صحیحین' کہلاتی ہے۔ اس میں احادیث کا ترتیب وار اور اچھے انداز سے احاطہ کیا گیا ہے۔",
    descriptionEnglish: "The second highly authoritative book of Hadith containing thousands of sahih narrations structured with clear topical chapters.",
    chaptersCount: 56
  },
  {
    id: "tirmidhi",
    titleUrdu: "جامع الترمذی",
    titleEnglish: "Jami` at-Tirmidhi",
    category: "Hadith",
    authorUrdu: "امام ابو عیسیٰ محمد الترمذیؒ",
    authorEnglish: "Imam Abu Isa at-Tirmidhi",
    descriptionUrdu: "صحاح ستہ میں شامل ایک اہم کتاب جو فقہی ابواب کی ترتیب سے ترتیب دی گئی ہے اور اس میں احادیث کے درجات (حسن، صحیح، ضعیف) کی نشاندہی بھی کی گئی ہے۔",
    descriptionEnglish: "One of the six major books of Hadith. It is famous for its legal categorization and for stating the gradings of narrations.",
    chaptersCount: 49
  },
  {
    id: "abudawud",
    titleUrdu: "سنن ابی داؤد",
    titleEnglish: "Sunan Abi Dawud",
    category: "Hadith",
    authorUrdu: "امام ابو داؤد سلیمان السجستانیؒ",
    authorEnglish: "Imam Abu Dawud al-Sijistani",
    descriptionUrdu: "صحاح ستہ کا حصہ، جس میں بنیادی طور پر احکام اور فقہی موضوعات کے متعلق احادیث جمع کی گئی ہیں۔ یہ فقہاء کے درمیان بہت مقبول ہے۔",
    descriptionEnglish: "A primary compilation of legal hadiths concerning rules, acts of worship, and jurisprudence, widely consulted by Islamic jurists.",
    chaptersCount: 43
  },
  {
    id: "riyadh",
    titleUrdu: "ریاض الصالحین",
    titleEnglish: "Riyadh-us-Saliheen",
    category: "Hadith",
    authorUrdu: "امام یحییٰ بن شرف النوویؒ",
    authorEnglish: "Imam Yahya ibn Sharaf an-Nawawi",
    descriptionUrdu: "نیک لوگوں کا باغ۔ اخلاقیات، آدابِ زندگی، تزکیہ نفس اور روزمرہ کے معاملات کے لیے منتخب قرآنی آیات اور مستند احادیث کا ایک بہترین مجموعہ۔",
    descriptionEnglish: "The Meadow of the Righteous. A collection of verses from the Quran and authentic Hadiths compiled to address morality, character, and spiritual purity.",
    chaptersCount: 20
  },
  {
    id: "ibnkathir",
    titleUrdu: "تفسیر ابن کثیر",
    titleEnglish: "Tafseer Ibn Kathir",
    category: "Tafseer",
    authorUrdu: "حافظ عماد الدین ابن کثیرؒ",
    authorEnglish: "Hafiz Imad-ud-Din Ibn Kathir",
    descriptionUrdu: "قرآن مجید کی سب سے مقبول اور جلیل القدر تفسیر، جس میں قرآن کی تفسیر خود قرآن سے، احادیث اور صحابہ کرام کے اقوال سے کی گئی ہے۔",
    descriptionEnglish: "One of the most trusted and comprehensive commentaries of the Quran, explaining verses through other Quranic verses, Hadith, and teachings of Companions.",
    chaptersCount: 114
  },
  {
    id: "seerah",
    titleUrdu: "سیرت ابن ہشام",
    titleEnglish: "Seerah Ibn Hisham",
    category: "Seerah",
    authorUrdu: "امام عبد الملک بن ہشامؒ",
    authorEnglish: "Imam Ibn Hisham",
    descriptionUrdu: "ہمارے پیارے نبی حضرت محمد صلی اللہ علیہ وسلم کی زندگی کے حالات (سیرت) کا سب سے مستند اور قدیم ترین جامع تاریخی ماخذ۔",
    descriptionEnglish: "The oldest and most respected biography documenting the noble life, character, and early struggles of Prophet Muhammad (PBUH).",
    chaptersCount: 1
  }
];

export const PRESET_QUESTIONS: PresetQuestion[] = [
  {
    id: "q_tayammum",
    questionUrdu: "تیمم کرنے کا صحیح شرعی طریقہ کیا ہے؟",
    questionEnglish: "What is the correct Islamic method of performing Tayammum?",
    category: "Fiqh & Masail"
  },
  {
    id: "q_salah_importance",
    questionUrdu: "نماز کی اہمیت اور فوائد پر قرآنی آیات کیا کہتی ہیں؟",
    questionEnglish: "What do Quranic verses say about the importance and benefits of Salah?",
    category: "Quranic Knowledge"
  },
  {
    id: "q_patience",
    questionUrdu: "صبر کے فضائل کے متعلق کوئی مشہور حدیث بتائیں۔",
    questionEnglish: "Tell me a famous Hadith about the virtues of patience (Sabr).",
    category: "Hadith Rules"
  },
  {
    id: "q_rights_parents",
    questionUrdu: "اسلام میں والدین کے کیا حقوق بیان کیے گئے ہیں؟",
    questionEnglish: "What rights of parents are described in Islam?",
    category: "Islamic Ethics"
  },
  {
    id: "q_seerah_charity",
    questionUrdu: "نبی کریم ﷺ کی سخاوت اور اچھے اخلاق کے بارے میں سیرت سے کوئی واقعہ بتائیں۔",
    questionEnglish: "Tell an incident from the Prophet's biography highlighting his generosity.",
    category: "Prophet's Life (Seerah)"
  },
  {
    id: "q_dua_forgiveness",
    questionUrdu: "مغفرت اور توبہ کی اہم مسنون دعائیں کون سی ہیں؟",
    questionEnglish: "What are the key supplicated prayers for forgiveness and repentance?",
    category: "Daily Supplications"
  }
];

export const REFUSAL_SAMPLES: string[] = [
  "آئی ٹی یا ویب سائٹ بنانے کا طریقہ کار بتائیں؟",
  "پائیٹھن میں کوڈ کیسے لکھتے ہیں؟",
  "آج کا کرکٹ میچ کون جیتے گا؟",
  "دنیا کا بہترین سمارٹ فون کون سا ہے؟",
  "مجھے کوئی پاپ میوزک گانا سنائیں۔"
];

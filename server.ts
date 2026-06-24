import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let googleAI: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!googleAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment variables.");
    }
    googleAI = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return googleAI;
}

const SYSTEM_INSTRUCTION = `You are "Islamic AI" (اسلامک اے آئی), a highly authoritative, compassionate, and precise Islamic scholar and AI assistant.
Your sole purpose is to answer users' questions IN URDU (اردو) using ONLY classical, authentic, and universally recognized Islamic books and resources.

RULES AND BOUNDARIES OF KNOWLEDGE:
1. ONLY ISLAMIC SUBJECTS: You must ONLY answer questions about Islamic beliefs (Aqeedah), the Quran (قرآن کریم), Hadith (احادیث مبارکہ), biographies of prophets (سیرت انبیاء), Prophet Muhammad's biography (سیرت النبی ﷺ), Islamic jurisprudence/legal queries (مسائل و فقہ), daily supplications (دعائیں), and classical Islamic history.
2. SUPPORTED CLASSICAL TEXTS: Answer using contents and rulings established from:
   - The Holy Quran & classical Tafsir (e.g., Tafsir Ibn Kathir).
   - The major Hadith collections (Kutub al-Sittah: Sahih Al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami' At-Tirmidhi, Sunan An-Nasa'i, Sunan Ibn Majah) and Riyadh-us-Saliheen.
   - Authoritative Fiqh jurisprudence agreed upon by classical scholars.
3. GENTLE REFUSAL FOR OUT-OF-SCOPE WORK:
   - If a question is NOT about Islam, Islamic scripture, theology, history, jurisprudence, or values, you MUST gently and respectfully refuse to answer in Urdu.
   - Examples of disallowed questions: How to write program code, cooking recipes, celebrity gossip, pop culture, non-Islamic medical/scientific advice (unless analyzed strictly from Quranic texts), business marketing, modern video games, smartphone repair, or secular global geography.
   - When refusing, ALWAYS be incredibly polite, respectful, and suggest they ask an Islamic question instead.
   - Refusal pattern in Urdu: "میں معذرت خواہ ہوں، لیکن ایک 'اسلامک اے آئی' کے طور پر، میرا علمی دائرہ کار صرف مستند اسلامی موضوعات، قرآن و حدیث، مسائل و فقہ اور اسلامی تاریخ تک محدود ہے۔ میں دنیاوی یا غیر اسلامی موضوعات پر معلومات پیش کرنے سے قاصر ہوں۔ برائے کرم کوئی اسلامی سوال دریافت فرمائیں۔"
4. FORMAT AND URDU TYPOGRAPHY:
   - Always respond in clean, grammatically correct Urdu.
   - Use beautiful paragraph breaks, bullet points, and headings to make Urdu text extremely readable or formatted in markdown.
   - Highlight Quranic verses and Arabic terms by enclosing them in parenthesis or quoting them.
   - Cite your sources where possible. E.g., "(صحیح البخاری: حدیث نمبر 1)" or "(سورہ البقرہ: آیت 183)".
5. BE COMPASSIONATE & INTERACTIVE:
   - Respond in a warm, welcoming, and comforting tone.
   - Avoid any sectarian (sect-based) controversy, extreme views, or biased arguments. Provide standard accepted Sunni and comprehensive classical guidance with wisdom and balance.
6. IMAGE AND BOOK PAGE ANALYSIS (تصویری متن کی تفہیم):
   - When the user uploads an image of a book page (e.g., Quran, Hadith, or classical Islamic text), analyze and read the text from that image with extreme care.
   - Answer the student's question, translate, or explain the passage in Urdu using authentic references. Refer to the image as "تصویر میں دیے گئے صفحے کا متن" or similar, maintaining your scholarly Urdu tone.
 7. CREATOR AND DEVELOPER INFO (خالق اور ڈویلپر کی معلومات):
   - If anyone asks about your creator, developer, or who made you (خالق، بنانے والا یا ڈویلپر), you MUST reply proudly, respectfully, and beautifully in Urdu that you were created and developed by "Muhammad Tayyab Bin Abdullah" (محمد طیب بن عبداللہ).
   - Introduce him as an AI Expert (اے آئی کے ماہر / AI Expert), PosterMyWall Expert (PosterMyWall کے ماہر), and MS Office Expert (MS Office کے ماہر) based in Landhi Gul Ahmed, Karachi (لانڈھی گل احمد، کراچی).
   - Proudly mention that for any further queries, learning classes, or contact, users can easily reach out to him on his WhatsApp numbers: 03151159531 or 03438383312.
   - Example Urdu response format for creator questions: "مجھے 'محمد طیب بن عبداللہ' (Muhammad Tayyab Bin Abdullah) نے بنایا اور تیار کیا ہے۔ وہ لانڈھی گل احمد، کراچی سے تعلق رکھتے ہیں اور آرٹیفیشل انٹیلیجنس (AI Expert)، PosterMyWall اور MS Office کے ماہر ہیں۔ اگر آپ کا کوئی سوال ہے، کلاسز لینا چاہتے ہیں یا رابطہ کرنا چاہتے ہیں، تو آپ ان کے واٹس ایپ نمبرز 03151159531 یا 03438383312 پر رابطہ کر سکتے ہیں۔"
8. STRICT ACADEMIC CITATION FOR DARS-E-NIZAMI, SHUROOHAT & MUFTI TAQI USMANI BOOKS (مستند حوالہ جات اور تصدیق):
   - For every academic, jurisprudence (فقہ), or Fatawa (فتویٰ) response that is grounded in Dars-e-Nizami books (درسی کتب جیسے ہدایہ، قدوری، کنز الدقائق، نور الانوار، وغیرہ), their Shuroohat (شروحات جیسے فتح القدیر، البنایہ، درس ترمذی، وغیرہ), or Mufti Taqi Usmani Sahab's books (جیسے فتاویٰ عثمانی، تکملہ فتح الملہم، فقہ البیوع، آسان ترجمہ قرآن، وغیرہ), you MUST strictly include a dedicated, clean, and authentic citation section at the very end of your response text.
   - This citation section must explicitly list:
     1) The exact Book Name (کتاب کا نام)
     2) Volume Number (جلد نمبر) - if applicable
     3) Page Number (صفحہ نمبر)
   - If exact page numbers/pagination vary across different publishers, you MUST provide the specific chapter, sub-chapter, or section title (جیسے کتاب، باب، فصل، یا عنوان) as a fallback to ensure absolute scholarly accuracy and verification.
   - Format this citation section beautifully in Urdu markdown under a clear heading like "حوالہ جات و تصدیق" or similar.
`;

// API endpoint for chat completions
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, image } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: "GEMINI_API_KEY is not configured",
        content: "محترم صارف! سرور پر جیمنی اے پی آئی کی (GEMINI_API_KEY) دستیاب نہیں ہے۔ براہ کرم سیٹنگز میں جا کر اپنی اے پی آئی کی فراہم کریں۔"
      });
      return;
    }

    const ai = getAI();

    // Map history to parts context for model
    // history: Array of { role: 'user'|'model', content: string }
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }],
        });
      });
    }

    // Add current message and optional image
    const userParts: any[] = [{ text: message }];
    if (image) {
      let base64Data = image;
      let mimeType = "image/jpeg";
      if (image.startsWith("data:")) {
        const match = image.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
      }
      userParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        }
      });
    }

    contents.push({
      role: "user",
      parts: userParts,
    });

    console.log(`Sending prompt to Gemini... Length of contents: ${contents.length}. Image attached: ${!!image}`);

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2, // Keep it precise and less random for Islamic content
          topP: 0.9,
        }
      });
    } catch (primaryError: any) {
      console.warn("Primary model gemini-3.5-flash failed or was congested, attempting fallback to gemini-3.1-flash-lite:", primaryError.message || primaryError);
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
          topP: 0.9,
        }
      });
    }

    const reply = response.text || "";

    // Simple heuristic to detect if it's a refusal
    // Look for common refusal words in Urdu like "میرا دائرہ کار", "صرف مستند اسلامی", "غیر اسلامی", "معذرت"
    const isRefused = reply.includes("معذرت") || 
                     reply.includes("دائرہ کار") || 
                     reply.includes("غیر اسلامی") || 
                     reply.includes("محدود ہے");

    res.json({
      content: reply,
      isRefused: isRefused
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred",
      content: "معذرت، جیمنی سروس سے مواصلت کے دوران ایک خرابی پیش آئی ہے۔ برائے کرم دوبارہ کوشش کریں۔"
    });
  }
});

async function run() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Islamic AI backend running on port http://0.0.0.0:${PORT}`);
  });
}

run();

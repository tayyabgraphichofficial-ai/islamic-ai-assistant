import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, 
  MessageSquare, 
  Send, 
  History, 
  Keyboard, 
  Sparkles, 
  AlertTriangle, 
  HelpCircle, 
  Bookmark, 
  BookmarkCheck, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Info, 
  Smartphone, 
  Scaling, 
  Search, 
  RotateCcw,
  BookOpen,
  Volume1,
  FileText,
  Image,
  X
} from 'lucide-react';
import { ISLAMIC_BOOKS, PRESET_QUESTIONS, REFUSAL_SAMPLES } from './data';
import { Message, IslamicBook } from './types';
import UrduKeyboard from './components/UrduKeyboard';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'السلام علیکم ورحمۃ اللہ وبرکاتہ! اسلامک اے آئی (Islamic AI) میں خوش آمدید۔\n\nمیں ایک مستند علمی معاون ہوں جو صرف سچی اور خالص اسلامی تعلیمات، مستند کتب (قرآنِ کریم، صحیح البخاری، صحیح مسلم وغیرہ) کی مدد سے آپ کے سوالات کا جواب دینے کے لیے تیار کیا گیا ہے۔\n\nبرائے کرم اپنا شرعی یا اسلامی سوال اردو میں دریافت کریں۔ غیر اسلامی، دنیاوی یا غیر متعلقہ سوالات پر میں معذرت کروں گا۔',
      timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'web'>('mobile');
  const [selectedBook, setSelectedBook] = useState<IslamicBook | null>(null);
  const [savedBookmarks, setSavedBookmarks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'books' | 'bookmarks'>('chat');
  const [searchBookQuery, setSearchBookQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [simulatedRefusalCount, setSimulatedRefusalCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
    // Load bookmarks from local storage
    const stored = localStorage.getItem('islamic_ai_bookmarks');
    if (stored) {
      try {
        setSavedBookmarks(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    let rawVal = textToSend !== undefined ? textToSend : input;
    
    // Auto-fill a polite Urdu query if there is an image but no text typed
    if (!rawVal.trim() && selectedImage) {
      rawVal = "برائے مہربانی کتاب کے اس صفحے کا متن پڑھیں اور اس کی تشریح فرمائیں۔";
    }

    if (!rawVal.trim() || loading) return;

    const userMsgId = 'msg-' + Date.now();
    const newUserMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: rawVal.trim(),
      timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
      image: selectedImage || undefined,
    };

    setMessages(prev => [...prev, newUserMsg]);
    if (textToSend === undefined) {
      setInput('');
    }
    
    const activeImage = selectedImage;
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newUserMsg.content,
          image: activeImage || undefined,
          history: messages
            .filter(m => m.id !== 'welcome')
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        let errorMsg = 'سرور نے کام کرنا بند کر دیا ہے۔';
        try {
          const errData = await response.json();
          errorMsg = errData.content || errData.error || errorMsg;
        } catch (jsonErr) {
          errorMsg = `خرابی کی تفصیلات: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      const replyMsg: Message = {
        id: 'reply-' + Date.now(),
        role: 'model',
        content: data.content || 'معذرت، کوئی جواب حاصل نہیں ہو سکا۔',
        timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
        isRefused: data.isRefused
      };

      if (data.isRefused) {
        setSimulatedRefusalCount(c => c + 1);
      }

      setMessages(prev => [...prev, replyMsg]);
    } catch (error: any) {
      console.error("Chat API Error:", error);
      setMessages(prev => [...prev, {
        id: 'reply-err-' + Date.now(),
        role: 'model',
        content: error.message || 'معذرت، نیٹ ورک مواصلت میں رکاوٹ پیش آئی ہے۔ برائے کرم اپنی انٹرنیٹ رسائی یا سرور کنکشن کو چیک کریں۔',
        timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
        isRefused: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleKeyPress = (char: string) => {
    setInput(prev => prev + char);
  };

  const handleBackspace = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInput('');
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeak = (text: string, id: string) => {
    if (!synthRef.current) return;

    if (speakingId === id) {
      synthRef.current.cancel();
      setSpeakingId(null);
      return;
    }

    synthRef.current.cancel();
    
    // Attempt parsing Urdu text from markdown headings or citations
    const cleanText = text.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Look for an Urdu/Arabic compatible voice
    const voices = synthRef.current.getVoices();
    const urduVoice = voices.find(v => v.lang.includes('ur') || v.lang.includes('ar'));
    if (urduVoice) {
      utterance.voice = urduVoice;
    }
    
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    
    setSpeakingId(id);
    synthRef.current.speak(utterance);
  };

  const toggleBookmark = (msg: Message) => {
    const exists = savedBookmarks.find(b => b.id === msg.id);
    let updated;
    if (exists) {
      updated = savedBookmarks.filter(b => b.id !== msg.id);
    } else {
      updated = [
        ...savedBookmarks,
        {
          id: msg.id,
          content: msg.content,
          timestamp: msg.timestamp,
        }
      ];
    }
    setSavedBookmarks(updated);
    localStorage.setItem('islamic_ai_bookmarks', JSON.stringify(updated));
  };

  const handleResetChat = () => {
    if (window.confirm('کیا آپ بات چیت کی تاریخ کو صاف کرنا چاہتے ہیں؟')) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: 'السلام علیکم ورحمۃ اللہ وبرکاتہ! اسلامک اے آئی (Islamic AI) میں خوش آمدید۔\n\nمیرا علمی دائرہ کار صرف مستند اسلامی موضوعات، قرآن و حدیث، مسائل و فقہ اور اسلامی تاریخ تک محدود ہے۔ آپ اب نیا سوال پوچھ سکتے ہیں۔',
          timestamp: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
      setSimulatedRefusalCount(0);
    }
  };

  const filteredBooks = ISLAMIC_BOOKS.filter(book => 
    book.titleUrdu.includes(searchBookQuery) || 
    book.titleEnglish.toLowerCase().includes(searchBookQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchBookQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050c09] text-[#e0e7e1] font-sans flex flex-col items-center justify-start relative overflow-x-hidden pt-4 pb-8 px-2 md:px-4">
      {/* Decorative background glow elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1a4d3a 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#103d2e] rounded-full blur-[140px] opacity-35 pointer-events-none"></div>
      <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-[#0a2b21] rounded-full blur-[120px] opacity-25 pointer-events-none"></div>

      {/* Main control navigation panel */}
      <div className="w-full max-w-6xl z-10 flex flex-col md:flex-row justify-between items-center gap-4 mb-4 border-b border-[#1a4d3a]/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#aa831b] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            <span className="font-urdu text-2xl font-bold text-[#050c09] pt-1">ع</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-[#f0f4f1]">Islamic AI</h1>
              <span className="bg-[#1a4d3a] text-[#d4af37] text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-[#d4af37]/20">Urdu Scholar</span>
            </div>
            <p className="text-[10px] tracking-wider text-[#d4af37] font-semibold uppercase">مستند کتب و مصادرِ شریعہ کا امین</p>
          </div>
        </div>

        {/* Navigation & view settings */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="bg-[#0a1a14]/60 p-1.5 rounded-lg border border-[#1a4d3a]/30 flex gap-1">
            <button 
              id="tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 text-xs rounded transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'chat' ? 'bg-[#d4af37] text-[#050c09] font-semibold' : 'text-[#8da596] hover:text-[#d4af37]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>بات چیت (Chat)</span>
            </button>
            <button 
              id="tab-books"
              onClick={() => setActiveTab('books')}
              className={`px-3 py-1 text-xs rounded transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'books' ? 'bg-[#d4af37] text-[#050c09] font-semibold' : 'text-[#8da596] hover:text-[#d4af37]'
              }`}
            >
              <Book className="w-3.5 h-3.5" />
              <span>کتب خانہ (Books)</span>
            </button>
            <button 
              id="tab-bookmarks"
              onClick={() => setActiveTab('bookmarks')}
              className={`px-3 py-1 text-xs rounded transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'bookmarks' ? 'bg-[#d4af37] text-[#050c09] font-semibold' : 'text-[#8da596] hover:text-[#d4af37]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>محفوظات ({savedBookmarks.length})</span>
            </button>
          </div>

          <div className="flex gap-1">
            <button
              id="btn-toggle-device"
              onClick={() => setDeviceMode(prev => prev === 'mobile' ? 'web' : 'mobile')}
              className="p-1.5 bg-[#0a1a14] hover:bg-[#1a4d3a]/60 text-[#d4af37] border border-[#1a4d3a]/40 rounded-lg transition-all"
              title="Toggle Device Layout"
            >
              {deviceMode === 'mobile' ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold">
                  <Scaling className="w-3.5 h-3.5" />
                  <span>ٹیبلٹ آؤٹ لائن</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>موبائل فریم</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Sidebar containing Book catalog/Limits information */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Authentic Boundary Guideline block */}
          <div className="p-5 rounded-2xl bg-[#091b14]/90 border border-[#1a4d3a]/60 shadow-xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#d4af37]"></div>
            <div className="flex items-center gap-2 text-[#d4af37] mb-2">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <h3 className="font-bold text-sm tracking-wide uppercase font-serif">شرعی دائرہ کار اور ضوابط</h3>
            </div>
            
            <p className="text-xs text-[#c2d1c7] leading-relaxed mb-4 text-right font-urdu" dir="rtl">
              یہ ایپ خاص طور پر صرف <strong className="text-[#d4af37]">اسلامی موضوعات</strong> کے جوابات دینے کے لیے بنائی گئی ہے۔ بیرونی، دنیاوی یا فالتو سوالات کا جواب دینے سے جیمنی گریز کرے گا۔
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-emerald-950/40 border border-[#1a4d3a]/30">
                <span className="text-[#a1bcae] font-semibold">✓ قرآنِ کریم اور مستند تفاسیر</span>
                <span className="text-xs bg-[#1a4d3a] text-white px-2 py-0.5 rounded">مسموح</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-emerald-950/40 border border-[#1a4d3a]/30">
                <span className="text-[#a1bcae] font-semibold">✓ کتبِ ستہ (بخاری، مسلم، ترمذی وغیرہ)</span>
                <span className="text-xs bg-[#1a4d3a] text-white px-2 py-0.5 rounded">مسموح</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-rose-950/20 border border-rose-500/20">
                <span className="text-rose-300 font-semibold">✗ ریاضی، فزکس یا کمپیوٹر پروگرامنگ</span>
                <span className="text-xs bg-rose-900/60 text-rose-200 px-2 py-0.5 rounded">ممنوع</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-rose-950/20 border border-rose-500/20">
                <span className="text-rose-300 font-semibold">✗ تفریح، گانے، فلمیں یا ڈرامے</span>
                <span className="text-xs bg-rose-900/60 text-rose-200 px-2 py-0.5 rounded">ممنوع</span>
              </div>
            </div>

            {/* Simulated interactive proof list */}
            <div className="mt-4 pt-3 border-t border-[#1a4d3a]/30">
              <span className="text-[10px] text-[#869f91] uppercase tracking-wider block mb-2 text-right">غیر متعلقہ سوالات کی جانچ کریں (ٹیسٹ کریں):</span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {REFUSAL_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(sample);
                      setActiveTab('chat');
                    }}
                    className="text-[11px] bg-[#0c241b] text-[#c2d1c7] hover:border-[#d4af37] border border-[#1a4d3a]/40 px-2.5 py-1 rounded-lg transition-all text-right font-urdu"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick references / Stats card */}
          {activeTab === 'chat' && (
            <div className="p-5 rounded-2xl bg-[#091b14]/70 border border-[#1a4d3a]/30 shadow-md backdrop-blur-md">
              <h3 className="text-[#d4af37] text-xs font-bold uppercase tracking-wider mb-3 text-right">سوالات کے لیے فوری تجاویز</h3>
              <div className="space-y-2">
                {PRESET_QUESTIONS.map(q => (
                  <button
                    key={q.id}
                    onClick={() => handleSend(q.questionUrdu)}
                    className="w-full text-right p-3 rounded-xl bg-[#050c09] hover:bg-[#102a20] border border-[#1a4d3a]/30 text-xs text-[#e0e7e1] transition-all hover:border-[#d4af37] leading-relaxed group"
                  >
                    <span className="text-[#d4af37] block text-[9px] uppercase font-mono tracking-tight mb-0.5">{q.category}</span>
                    <span className="font-urdu group-hover:text-white transition-colors">{q.questionUrdu}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Refusal tracker statistic */}
          <div className="bg-gradient-to-br from-[#102d21] to-[#0a1f16] p-4 rounded-xl border border-[#1a4d3a]/40 flex justify-between items-center text-xs">
            <div>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase">محفوظ دائرہ کار فعال</p>
              <h4 className="font-bold text-[#e0e7e1] mt-0.5">صرف مستند کتابیں</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#869f91]">مسترد شدہ غیر شرعی سوالات:</span>
              <p className="font-bold text-rose-400 text-lg mt-0.5">{simulatedRefusalCount}</p>
            </div>
          </div>

        </div>

        {/* Right column: Chat/Device Interface OR Book Drawer */}
        <div className="lg:col-span-8">
          
          {activeTab === 'chat' && (
            <div className="flex flex-col items-center">
              
              {/* Optional Android Phone Frame wrapper */}
              <div className={`w-full transition-all duration-300 ${
                deviceMode === 'mobile' 
                  ? 'max-w-[480px] bg-black p-3.5 rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-slate-800 relative' 
                  : 'max-w-full'
              }`}>
                
                {/* Android Status Bar details if in mobile mode */}
                {deviceMode === 'mobile' && (
                  <div className="flex justify-between items-center px-6 pt-1 pb-3 text-[10px] font-mono text-emerald-300/80 tracking-widest select-none">
                    <div className="flex items-center gap-1.5">
                      <span>10:28</span>
                      <span className="w-2 h-2 rounded-full bg-[#d4af37] inline-block animate-pulse"></span>
                    </div>
                    {/* Simulated Notch */}
                    <div className="w-24 h-4 bg-slate-900 absolute left-1/2 -translate-x-1/2 top-4 rounded-b-xl z-20"></div>
                    <div className="flex items-center gap-2">
                      <span>4G LTE</span>
                      <span className="text-[#d4af37]">🔋 98%</span>
                    </div>
                  </div>
                )}
                
                {/* Core App Container */}
                <div id="islamic-app-core" className="w-full min-h-[580px] md:min-h-[640px] max-h-[700px] flex flex-col justify-between rounded-3xl bg-[#0a1a14]/90 border border-[#1a4d3a]/40 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                  
                  {/* Subtle inner pattern inside screen */}
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-color-dodge bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80")' }}></div>

                  {/* App Header Bar */}
                  <div className="sticky top-0 bg-[#0d251d] border-b border-[#1a4d3a]/40 p-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#d4af37] flex items-center justify-center font-bold text-[#050c09] text-xs">AI</div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">اسلامک برین اے آئی</h4>
                        <span className="text-[9px] text-[#d4af37] flex items-center gap-1 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                          جیمنی سے مربوط (Gemini Powered)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Font-size modifier button */}
                      <div className="flex bg-[#050c09] rounded-lg border border-[#1a4d3a]/40 p-0.5">
                        {(['sm', 'base', 'lg', 'xl'] as const).map(sz => (
                          <button
                            key={sz}
                            onClick={() => setFontSize(sz)}
                            className={`w-6 h-6 text-[10px] uppercase font-bold rounded flex items-center justify-center transition-all ${
                              fontSize === sz ? 'bg-[#d4af37] text-black font-extrabold' : 'text-emerald-400/80 hover:text-white'
                            }`}
                            title={`Font size: ${sz}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>

                      {/* Reset chat button */}
                      <button
                        id="btn-new-chat"
                        onClick={handleResetChat}
                        className="p-1.5 rounded-lg bg-[#050c09] text-amber-500 hover:text-amber-400 hover:bg-[#1a4d3a]/30 transition-all border border-[#1a4d3a]/30"
                        title="صاف کریں"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Feed Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ direction: 'ltr' }}>
                    {messages.map((msg) => {
                      const isModel = msg.role === 'model';
                      const isRefused = msg.isRefused;
                      
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex ${isModel ? 'justify-start' : 'justify-end'} items-start gap-2.5`}
                        >
                          {isModel && (
                            <div className="w-8 h-8 rounded-full bg-[#d4af37] flex-shrink-0 flex items-center justify-center text-[#050c09] font-bold text-[10px] shadow-[0_0_10px_rgba(212,175,55,0.4)] mt-1">
                              AI
                            </div>
                          )}

                          <div 
                            className={`message-bubble max-w-[85%] p-4 rounded-2xl relative ${
                              isModel 
                                ? isRefused 
                                  ? 'bg-[#291717]/95 border-r-4 border-rose-600 border border-[#4d1a1a]/40 rounded-tl-none text-[#fca5a5]'
                                  : 'bg-[#0d251d]/95 border border-[#1a4d3a]/30 rounded-tl-none text-[#e0e7e1]'
                                : 'bg-[#1a4d3a] rounded-tr-none text-white text-right font-medium'
                            }`}
                            style={{ direction: 'rtl' }}
                          >
                            {/* Refusal warning badge if applicable */}
                            {isModel && isRefused && (
                              <div className="flex items-center gap-1.5 text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded text-[10px] font-bold w-fit mb-2">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>غیر متعلقہ موضوع (معذرت)</span>
                              </div>
                            )}

                            {/* Attached image display inside user message bubble */}
                            {!isModel && msg.image && (
                              <div className="mb-2 max-w-xs overflow-hidden rounded-lg border border-[#d4af37]/30">
                                <img 
                                  src={msg.image} 
                                  alt="Uploaded Book Page" 
                                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-200"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            {/* Main urdu text */}
                            <p className={`whitespace-pre-line leading-relaxed ${
                              fontSize === 'sm' ? 'text-xs' : fontSize === 'base' ? 'text-sm' : fontSize === 'lg' ? 'text-base' : 'text-lg md:text-xl'
                            } font-urdu text-right select-all`}>
                              {msg.content}
                            </p>

                            {/* Custom metadata action footer */}
                            {isModel && (
                              <div className="pt-3 mt-3 border-t border-[#1a4d3a]/30 flex flex-wrap justify-between items-center gap-2">
                                <span className="text-[9px] text-[#5a7c68] font-mono tracking-wider">
                                  {msg.id === 'welcome' ? 'Islamic AI System' : 'Verified Scholars Database'}
                                </span>

                                <div className="flex items-center gap-2">
                                  {/* Speech synthesizer action */}
                                  <button
                                    onClick={() => handleToggleSpeak(msg.content, msg.id)}
                                    className={`p-1 rounded bg-[#102a20] hover:bg-[#1a4d3a]/50 text-xs text-[#d4af37] border border-[#d4af37]/10 transition-colors flex items-center gap-1 ${
                                      speakingId === msg.id ? 'animate-bounce border-emerald-400' : ''
                                    }`}
                                    title="آواز میں سنیں"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                    <span className="text-[9px]">{speakingId === msg.id ? 'رکیں' : 'آواز'}</span>
                                  </button>

                                  {/* Copy text action */}
                                  <button
                                    onClick={() => handleCopyText(msg.content, msg.id)}
                                    className="p-1 rounded bg-[#102a20] hover:bg-[#1a4d3a]/50 text-xs text-[#d4af37] border border-[#d4af37]/10 transition-colors flex items-center gap-1"
                                    title="کاپی کریں"
                                  >
                                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    <span className="text-[9px]">{copiedId === msg.id ? 'کاپی ہوا' : 'کاپی'}</span>
                                  </button>

                                  {/* Save landmark block */}
                                  <button
                                    onClick={() => toggleBookmark(msg)}
                                    className="p-1 rounded bg-[#102a20] hover:bg-[#1a4d3a]/50 text-xs text-[#d4af37] border border-[#d4af37]/10 transition-colors flex items-center gap-1"
                                    title="محفوظ کریں"
                                  >
                                    {savedBookmarks.find(b => b.id === msg.id) ? (
                                      <>
                                        <BookmarkCheck className="w-3 h-3 text-amber-400" />
                                        <span className="text-[9px] text-amber-400 font-semibold">محفوظ</span>
                                      </>
                                    ) : (
                                      <>
                                        <Bookmark className="w-3 h-3" />
                                        <span className="text-[9px]">حفظ کریں</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Small time indicators */}
                            <span className="block text-[8px] text-[#556e5e] text-left mt-1.5" style={{ direction: 'ltr' }}>
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {loading && (
                      <div className="flex justify-start items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-[#d4af37] text-xs">
                          AI
                        </div>
                        <div className="bg-[#0c241b] py-3.5 px-6 rounded-2xl rounded-tl-none border border-[#1a4d3a]/40 text-xs text-[#d4af37] flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping"></span>
                          <span className="font-urdu leading-none pt-0.5">اسلامک برین حوالہ تلاش کر رہا ہے...</span>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input form panel */}
                  <div className="p-4 bg-[#0d251d] border-t border-[#1a4d3a]/40 space-y-2">
                    
                    {/* Selected Image Preview Panel */}
                    {selectedImage && (
                      <div className="flex items-center justify-end gap-3 p-2 bg-[#050c09] border border-[#1a4d3a]/40 rounded-xl mb-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="p-1 rounded-md bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all flex items-center gap-1 text-[10px]"
                        >
                          <X className="w-3 h-3" />
                          <span className="font-urdu">حذف کریں</span>
                        </button>
                        <div className="flex items-center gap-2" dir="rtl">
                          <img 
                            src={selectedImage} 
                            alt="Book Page Preview" 
                            className="w-10 h-10 object-cover rounded-lg border border-[#d4af37]/30"
                          />
                          <div className="text-right">
                            <p className="text-[11px] text-white font-semibold font-urdu">صفحہ منسلک ہے</p>
                            <p className="text-[9px] text-[#869f91]">جیمنی اس صفحے کو پڑھ کر جواب دے گا</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                      }}
                      className="relative block"
                    >
                      {/* Hidden image input file upload */}
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />

                      <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="اپنا اسلامی یا شرعی سوال یہاں ٹائپ کریں..." 
                        dir="rtl" 
                        id="user-input-field"
                        className="w-full bg-[#050c09] border border-[#1a4d3a]/80 rounded-2xl py-4 pl-24 pr-12 text-right text-[#e0e7e1] placeholder-[#5a7c68] focus:outline-none focus:border-[#d4af37] transition-all text-sm font-urdu leading-relaxed focus:ring-1 focus:ring-[#d4af37]/30"
                      />
                      
                      {/* Keyboard trigger button */}
                      <button
                        type="button"
                        id="btn-toggle-keyboard"
                        onClick={() => setShowKeyboard(prev => !prev)}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg border transition-all ${
                          showKeyboard 
                            ? 'bg-[#d4af37] text-[#050c09] border-transparent' 
                            : 'bg-[#102a20] text-[#d4af37] border-[#1a4d3a]/30 hover:bg-[#1a4d3a]'
                        }`}
                        title="Urdu Onscreen Typing Companion"
                      >
                        <Keyboard className="w-4 h-4" />
                      </button>

                      {/* Photo upload button */}
                      <button
                        type="button"
                        id="btn-upload-photo"
                        onClick={() => fileInputRef.current?.click()}
                        className={`absolute left-12 top-1/2 -translate-y-1/2 p-1.5 rounded-lg border transition-all ${
                          selectedImage 
                            ? 'bg-amber-500 text-[#050c09] border-transparent' 
                            : 'bg-[#102a20] text-[#d4af37] border-[#1a4d3a]/30 hover:bg-[#1a4d3a]'
                        }`}
                        title="کتاب کے صفحے کی تصویر اپلوڈ کریں"
                      >
                        <Image className="w-4 h-4" />
                      </button>

                      {/* Submit action bubble */}
                      <button 
                        type="submit"
                        disabled={loading || (!input.trim() && !selectedImage)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#d4af37] hover:bg-[#aa831b] disabled:bg-emerald-950/60 disabled:text-[#3a5a48] rounded-xl flex items-center justify-center text-[#050c09] shadow-lg cursor-pointer hover:scale-105 disabled:hover:scale-100 transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                    {/* Keyboard popup panel */}
                    {showKeyboard && (
                      <div className="pt-2">
                        <UrduKeyboard 
                          onKeyPress={handleKeyPress}
                          onBackspace={handleBackspace}
                          onClear={handleClear}
                          onEnter={() => {
                            setShowKeyboard(false);
                            handleSend();
                          }}
                        />
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* Book Catalog Tab Content */}
          {activeTab === 'books' && (
            <div className="bg-[#0a1a14]/90 p-6 rounded-3xl border border-[#1a4d3a]/40 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#d4af37] font-serif flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#d4af37]" />
                    <span>مستند اسلامی مصادر لائبریری</span>
                  </h3>
                  <p className="text-xs text-[#a1bcae] mt-0.5">ہماری مصنوعی ذہانت درج ذیل مستند کتب کی بنیادی رہنمائی پر جوابات تیار کرتی ہے</p>
                </div>
                
                <div className="relative">
                  <input 
                    type="text"
                    value={searchBookQuery}
                    onChange={(e) => setSearchBookQuery(e.target.value)}
                    placeholder="کتاب کا نام تلاش کریں..."
                    dir="rtl"
                    className="bg-[#050c09] border border-[#1a4d3a] rounded-xl px-4 py-2 text-xs text-right w-full md:w-64 focus:outline-none focus:border-[#d4af37]"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBooks.map((book) => (
                  <div 
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className="p-4 rounded-2xl bg-[#091b14] hover:bg-[#102d21] border border-[#1a4d3a]/30 hover:border-[#d4af37] cursor-pointer transition-all flex flex-col justify-between text-right gap-3"
                  >
                    <div>
                      <div className="flex justify-between items-center gap-2 mb-2">
                        <span className="text-[10px] bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 px-2 py-0.5 rounded-full font-serif font-semibold">{book.category}</span>
                        <h4 className="font-bold text-lg text-white font-urdu">{book.titleUrdu}</h4>
                      </div>
                      <p className="text-xs text-[#c2d1c7] line-clamp-2 leading-relaxed font-urdu" dir="rtl">{book.descriptionUrdu}</p>
                    </div>

                    <div className="pt-3 border-t border-[#1a4d3a]/20 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-mono text-left">{book.titleEnglish}</span>
                      <span className="text-[#d4af37] font-semibold">{book.authorUrdu}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Book description detail popup modal */}
              {selectedBook && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-[#0a1a14] border border-[#d4af37]/40 max-w-lg w-full rounded-2xl p-6 relative shadow-2xl space-y-4">
                    <button 
                      onClick={() => setSelectedBook(null)}
                      className="absolute left-4 top-4 text-slate-500 hover:text-white font-bold text-base bg-slate-900 border border-slate-800 w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      ✕
                    </button>
                    
                    <div className="text-right border-b border-[#1a4d3a] pb-3" dir="rtl">
                      <span className="text-xs bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 px-2.5 py-0.5 rounded-full inline-block mb-2 font-semibold">
                        {selectedBook.category}
                      </span>
                      <h3 className="text-2xl font-bold font-urdu text-white">{selectedBook.titleUrdu}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-1" style={{ direction: 'ltr' }}>{selectedBook.titleEnglish}</p>
                    </div>

                    <div className="space-y-3 text-right text-sm leading-relaxed" dir="rtl">
                      <div>
                        <strong className="text-[#d4af37] font-serif">مصنف / مولف:</strong>
                        <p className="text-slate-200 mt-0.5 font-urdu">{selectedBook.authorUrdu}</p>
                      </div>
                      
                      <div>
                        <strong className="text-[#d4af37] font-serif">تفصیلی جائزہ:</strong>
                        <p className="text-slate-300 mt-1 font-urdu leading-loose text-justify">{selectedBook.descriptionUrdu}</p>
                      </div>

                      {selectedBook.chaptersCount && (
                        <div className="pt-2 flex justify-between items-center text-xs bg-[#0c241b] p-3 rounded-lg border border-[#1a4d3a]/40">
                          <span className="font-bold text-white">{selectedBook.chaptersCount}</span>
                          <span className="text-[#a1bcae]">ابواب / ابحاث کی تعداد:</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        onClick={() => {
                          setInput(`مجھے ${selectedBook.titleUrdu} کی روشنی میں کوئی پیارا شرعی حکم بتائیں۔`);
                          setSelectedBook(null);
                          setActiveTab('chat');
                        }}
                        className="bg-[#d4af37] text-[#050c09] font-bold text-xs py-2 px-6 rounded-lg hover:bg-white transition-all font-urdu"
                      >
                        اس کتاب سے متعلق سوال کریں
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* Bookmarks Tab Content */}
          {activeTab === 'bookmarks' && (
            <div className="bg-[#0a1a14]/90 p-6 rounded-3xl border border-[#1a4d3a]/40 shadow-xl space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#d4af37] font-serif flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-[#d4af37]" />
                  <span>محفوظ کردہ اسلامی معلومات و فتاویٰ</span>
                </h3>
                <p className="text-xs text-[#a1bcae]">آپ کی محفوظ کردہ علمی یادداشتیں یہاں دکھائی دیتی ہیں</p>
              </div>

              {savedBookmarks.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-[#1a4d3a]/40 rounded-2xl">
                  <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-urdu" dir="rtl">ابھی تک کوئی معلومات محفوظ نہیں کی گئیں۔ آپ اہم جوابات کو چھیڑنے (بک مارک) کے لیے "حفظ کریں" دبا سکتے ہیں۔</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedBookmarks.map((bookmark) => (
                    <div 
                      key={bookmark.id}
                      className="p-4 rounded-xl bg-[#091b14] border border-[#1a4d3a]/40 flex flex-col justify-between text-right gap-3 relative"
                    >
                      <button
                        onClick={() => {
                          const updated = savedBookmarks.filter(b => b.id !== bookmark.id);
                          setSavedBookmarks(updated);
                          localStorage.setItem('islamic_ai_bookmarks', JSON.stringify(updated));
                        }}
                        className="absolute left-4 top-4 text-xs text-rose-400 hover:text-rose-300 font-semibold bg-rose-950/20 px-2 py-1 rounded border border-rose-500/20"
                      >
                        حذف کریں
                      </button>

                      <div className="pr-4 border-r-2 border-[#d4af37]">
                        <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-line font-urdu" dir="rtl">
                          {bookmark.content}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1a4d3a]/10 flex justify-between items-center text-[10px] text-[#5a7c68]">
                        <span className="font-mono">{bookmark.timestamp}</span>
                        <span className="font-serif">دستیاب کلام محفوظ</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Decorative footer details */}
      <footer className="w-full max-w-6xl mt-12 pt-6 border-t border-[#1a4d3a]/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-[#3a5d4a] tracking-widest uppercase bg-[#050c09]/80 mb-2">
        <div>© 2026 Islamic AI | Multi-modal Urdu Language Assistant</div>
        <div className="flex gap-4">
          <span className="hover:text-[#d4af37] cursor-pointer">شروطِ استعمال</span>
          <span className="hover:text-[#d4af37] cursor-pointer">حفاظتی معلومات</span>
          <span className="text-[#d4af37] font-semibold">مستند علمی اور شرعی مصادر</span>
        </div>
      </footer>

    </div>
  );
}

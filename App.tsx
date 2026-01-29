
import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Message, Language, Difficulty } from './types';
import { 
  generateDailyTip, 
  createTutorChat, 
  generateDetailedLessonStream, 
  generateLessonImage, 
  generateWordOfTheDay,
  speakText
} from './services/geminiService';

const TRANSLATIONS: Record<Language, any> = {
  so: {
    navLessons: 'Dukumiintiyada',
    navCreate: 'AI Laboratoriga',
    navReviews: 'Bulshada',
    heroBadge: 'Mustaqbalka Barashada Luqadaha ✨',
    heroTitle: 'Baro Ingiriiska',
    heroSubtitle: 'Si Fudud.',
    heroDesc: 'ADE waxay isticmaashaa AI-ga ugu horreeya si ay u dhisto casharro gaar u ah ardayda Soomaaliyeed. Baro luqadda meel kasta oo aad joogto.',
    heroBtn: 'Bilow Barashada',
    createTitle: 'Warshadda Casharrada',
    createDesc: 'Qor mowduuc kasta. AI-geena ayaa kuu diyaarin doona cashar dhamaystiran dhowr ilbiriqsi gudahood.',
    createPlaceholder: 'Tusaale: Wada hadalka ganacsiga...',
    createBtn: 'Diyaari Casharka',
    lessonsTitle: 'Xirmooyinka la xushay',
    wordOfTheDay: 'Erayga Maalinta',
    dailyTip: 'Talada Maalinta',
    difficulty: { Beginner: 'Bilaabe', Intermediate: 'Dhexdhexaad', Advanced: 'Sare' },
    listen: 'Dhageyso',
    finish: 'Calaamadi inuu dhamaaday',
    preparing: 'Diyaarinta Aqoonta...',
  },
  en: {
    navLessons: 'Decks',
    navCreate: 'AI Lab',
    navReviews: 'Community',
    heroBadge: 'The Future of Learning is Here ✨',
    heroTitle: 'Master English',
    heroSubtitle: 'Effortlessly.',
    heroDesc: 'ADE uses advanced AI to create a personalized learning journey for Somali speakers. High-impact lessons, available everywhere.',
    heroBtn: 'Start Learning Now',
    createTitle: 'The AI Factory',
    createDesc: 'Input any topic. Our AI generates a world-class educational deck in seconds.',
    createPlaceholder: 'E.g. Business Negotiations in English...',
    createBtn: 'Generate Deck',
    lessonsTitle: 'Curated Decks',
    wordOfTheDay: 'Word of the Day',
    dailyTip: 'Daily Learning Tip',
    difficulty: { Beginner: 'Beginner', Intermediate: 'Intermediate', Advanced: 'Advanced' },
    listen: 'Listen',
    finish: 'Mark as Finished',
    preparing: 'Assembling Knowledge...',
  },
  ar: {
    navLessons: 'المجموعات',
    navCreate: 'مختبر الذكاء الاصطناعي',
    navReviews: 'المجتمع',
    heroBadge: 'مستقبل التعلم هنا ✨',
    heroTitle: 'أتقن الإنجليزية',
    heroSubtitle: 'بسهولة.',
    heroDesc: 'يستخدم ADE الذكاء الاصطناعي المتقدم لإنشاء رحلة تعليمية مخصصة للمتحدثين بالصومالية والعربية.',
    heroBtn: 'ابدأ التعلم الآن',
    createTitle: 'مصنع الذكاء الاصطناعي',
    createDesc: 'أدخل أي موضوع. يقوم ذكاؤنا الاصطناعي بإنشاء مجموعة تعليمية عالمية المستوى في ثوانٍ.',
    createPlaceholder: 'مثلاً: مفاوضات العمل باللغة الإنجليزية...',
    createBtn: 'إنشاء مجموعة',
    lessonsTitle: 'مجموعات مختارة',
    wordOfTheDay: 'كلمة اليوم',
    dailyTip: 'نصيحة اليوم',
    difficulty: { Beginner: 'مبتدئ', Intermediate: 'متوسط', Advanced: 'متقدم' },
    listen: 'استمع',
    finish: 'تم الانتهاء',
    preparing: 'جاري تحضير المعلومات...',
  }
};

const SAMPLE_LESSONS: Lesson[] = [
  { id: '1', title: 'Daily Conversational Verbs', description: '20 high-frequency verbs you will use every single day in English.', category: 'Vocabulary', duration: '20 Cards', difficulty: 'Beginner' },
  { id: '2', title: 'The Professional Interview', description: 'Advanced strategies and vocabulary for landing your dream job.', category: 'Speaking', duration: '15 Cards', difficulty: 'Advanced' },
  { id: '3', title: 'Grammar: Past Tense Mastery', description: 'Stop making mistakes when talking about the past with this deck.', category: 'Grammar', duration: '25 Cards', difficulty: 'Intermediate' },
  { id: '4', title: 'Ordering at a Restaurant', description: 'Essential phrases for dining out, tipping, and menu reading.', category: 'Speaking', duration: '12 Cards', difficulty: 'Beginner' },
  { id: '5', title: 'Technology & Startups', description: 'The lingo of the modern tech world and how to sound like a founder.', category: 'Vocabulary', duration: '18 Cards', difficulty: 'Advanced' },
  { id: '6', title: 'Doctor Visit Essentials', description: 'Communicate your symptoms and understand medical advice clearly.', category: 'Vocabulary', duration: '15 Cards', difficulty: 'Intermediate' },
];

/** 
 * Enhanced renderer for AI generated Markdown.
 * Correctly parses and renders Markdown tables as beautiful, responsive HTML tables.
 */
const FormattedText = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentTableRows: string[][] = [];
  let isInTable = false;

  const flushTable = (index: number) => {
    if (currentTableRows.length > 1) {
      const headerRow = currentTableRows[0];
      const dataRows = currentTableRows.slice(2); // Skip header and separator line
      
      elements.push(
        <div key={`table-${index}`} className="my-8 overflow-hidden rounded-3xl border border-slate-100 dark:border-white/5 shadow-spatial bg-white dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  {headerRow.map((cell, i) => (
                    <th key={i} className="p-5 font-black uppercase text-[10px] tracking-widest text-primary border-b border-slate-100 dark:border-white/10">{cell.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    {row.map((cell, j) => (
                      <td key={j} className="p-5 text-sm md:text-base font-medium">{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    currentTableRows = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|');
    
    if (isTableRow) {
      isInTable = true;
      const cells = trimmed.split('|').slice(1, -1);
      currentTableRows.push(cells);
    } else {
      if (isInTable) {
        flushTable(i);
        isInTable = false;
      }

      if (trimmed.startsWith('# ')) {
        elements.push(<h1 key={i} className="text-4xl md:text-6xl font-black font-display tracking-tight mt-12 mb-8 leading-tight">{trimmed.replace('# ', '')}</h1>);
      } else if (trimmed.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-2xl md:text-3xl font-bold mt-10 mb-6 border-b pb-2 border-primary/20">{trimmed.replace('## ', '')}</h2>);
      } else if (trimmed.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-xl md:text-2xl font-bold mt-8 mb-4">{trimmed.replace('### ', '')}</h3>);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(<li key={i} className="ml-6 list-disc mb-3 marker:text-primary font-medium text-lg">{trimmed.substring(2)}</li>);
      } else if (trimmed !== '') {
        elements.push(<p key={i} className="mb-6 leading-relaxed opacity-80 text-lg md:text-xl font-medium">{trimmed}</p>);
      } else {
        elements.push(<div key={i} className="h-6" />);
      }
    }
  });

  if (isInTable) flushTable(lines.length);

  return <div className="animate-reveal">{elements}</div>;
};

export default function App() {
  const [lang, setLang] = useState<Language>('so'); // Default to Somali
  const [dailyTip, setDailyTip] = useState<string>('');
  const [wordOfTheDay, setWordOfTheDay] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Asc! Magacaygu waa Abdis. Sideen kuu caawin karaa maanta? 💡' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [generatedLesson, setGeneratedLesson] = useState<{ content: string; image: string | null } | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<any>(null);

  useEffect(() => {
    const initData = async () => {
      const [tip, word] = await Promise.all([generateDailyTip(lang), generateWordOfTheDay(lang)]);
      setDailyTip(tip);
      setWordOfTheDay(word);
    };
    initData();
  }, [lang]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    try {
      if (!chatInstance.current) chatInstance.current = createTutorChat(lang);
      const stream = await chatInstance.current.sendMessageStream({ message: inputValue });
      let fullContent = '';
      const streamMsg: Message = { role: 'model', text: '', isStreaming: true };
      setMessages(prev => [...prev, streamMsg]);
      for await (const chunk of stream) {
        fullContent += chunk.text;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = fullContent;
          return updated;
        });
      }
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].isStreaming = false;
        return updated;
      });
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Qalad baa dhacay. Fadlan dib isku day. 😅' }]);
    }
  };

  const startLessonGeneration = async (topic: string, diff: Difficulty = 'Intermediate') => {
    setDifficulty(diff);
    setIsGenerating(true);
    setGeneratedLesson({ content: '', image: null });
    setActiveLesson({ id: 'gen-' + Date.now(), title: topic, description: '', category: 'Vocabulary', duration: 'AI Deck', difficulty: diff });
    try {
      const imagePromise = generateLessonImage(topic);
      const streamResponse = await generateDetailedLessonStream(topic, diff, lang);
      let fullText = '';
      for await (const chunk of streamResponse) {
        fullText += chunk.text;
        setGeneratedLesson(prev => ({ ...prev!, content: fullText }));
      }
      const image = await imagePromise;
      setGeneratedLesson(prev => ({ ...prev!, image }));
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  return (
    <div className="min-h-screen selection:bg-primary selection:text-slate-900">
      {/* Floating Glass Pill Navigation */}
      <nav className="fixed top-8 inset-x-0 z-[100] px-6">
        <div className="max-w-5xl mx-auto glass-pill h-16 md:h-20 rounded-full px-8 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/40 rotate-12 transition-transform hover:rotate-0">
              <span className="material-symbols-outlined text-white text-2xl font-bold">school</span>
            </div>
            <span className="text-2xl font-black font-display tracking-tighter">ADE<span className="text-primary">.</span></span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            <a href="#decks" className="hover:text-primary transition-all">Decks</a>
            <a href="#lab" className="hover:text-primary transition-all">AI Lab</a>
            <a href="#word" className="hover:text-primary transition-all">Daily</a>
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-transparent border-none text-[10px] font-black tracking-[0.2em] focus:ring-0 cursor-pointer p-0"
            >
              <option value="so">SOMALI</option>
              <option value="en">ENGLISH</option>
              <option value="ar">ARABIC</option>
            </select>
            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden md:block"></div>
            <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary transition-colors group">
               <span className="material-symbols-outlined text-xl group-hover:text-white transition-colors">account_circle</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Optimized for Somali Language */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[120%] bg-gradient-to-b from-primary/10 via-transparent to-transparent -z-10 blur-[120px] rounded-full animate-slow-spin"></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left space-y-10 animate-reveal">
            <div className="inline-block px-4 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              {t.heroBadge}
            </div>
            <h1 className="text-7xl md:text-9xl font-black font-display leading-[0.85] tracking-tighter">
              {t.heroTitle}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">{t.heroSubtitle}</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {t.heroDesc}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-8 justify-center lg:justify-start">
              <a href="#lab" className="px-12 py-6 bg-slate-900 dark:bg-primary dark:text-slate-900 text-white font-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all text-lg group flex items-center gap-4">
                {t.heroBtn}
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </a>
            </div>
          </div>

          <div className="hidden lg:block relative animate-float">
             <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full"></div>
             <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] p-4 shadow-spatial border border-slate-200 dark:border-slate-800">
                <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" className="w-full aspect-[4/5] object-cover rounded-[2.5rem]" alt="Education" />
                <div className="absolute -bottom-10 -left-10 bg-primary p-10 rounded-[2.5rem] shadow-4xl text-slate-900 max-w-[300px] border-8 border-white dark:border-slate-900">
                   <span className="material-symbols-outlined text-4xl mb-4 font-black">tips_and_updates</span>
                   <p className="text-xl font-black leading-tight italic">"Barashada Ingiriisku hadda waa safar xiiso leh oo ADE kuu fududaysay."</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Today Section */}
      <section id="word" className="py-24 px-6 relative">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bento-card bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden group">
               <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]"></div>
               <div className="relative z-10 space-y-12">
                  <div className="flex items-center justify-between">
                     <span className="px-5 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">{t.wordOfTheDay}</span>
                     <button onClick={() => speakText(wordOfTheDay?.word)} className="w-14 h-14 bg-white/10 hover:bg-primary rounded-2xl flex items-center justify-center transition-all group-hover:scale-110">
                        <span className="material-symbols-outlined text-white">volume_up</span>
                     </button>
                  </div>
                  {wordOfTheDay ? (
                    <div className="space-y-6">
                       <h2 className="text-7xl md:text-[8rem] font-black font-display tracking-tighter leading-none">{wordOfTheDay.word}</h2>
                       <div className="flex items-center gap-6">
                          <p className="text-3xl font-black text-primary underline decoration-primary/30 underline-offset-8">{wordOfTheDay.somali}</p>
                          <p className="text-lg font-medium opacity-50 italic">/{wordOfTheDay.pronunciation}/</p>
                       </div>
                       <p className="text-2xl opacity-70 font-medium max-w-2xl leading-relaxed italic">"{wordOfTheDay.definition}"</p>
                    </div>
                  ) : (
                    <div className="h-64 animate-pulse bg-white/5 rounded-3xl"></div>
                  )}
               </div>
            </div>

            <div className="bento-card bg-primary rounded-[3.5rem] p-12 text-slate-900 flex flex-col justify-between group">
               <div className="space-y-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{t.dailyTip}</span>
                  <div className="relative">
                    <span className="absolute -top-12 -left-6 text-9xl font-black opacity-10 select-none">"</span>
                    <p className="text-3xl font-black leading-tight italic relative z-10">"{dailyTip || 'Barashadu waa joogteyn...'}"</p>
                  </div>
               </div>
               <div className="pt-10 border-t border-black/5 flex justify-end">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg">
                     <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* AI Laboratory */}
      <section id="lab" className="py-32 px-6 bg-slate-50 dark:bg-slate-950/50">
         <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-5xl md:text-7xl font-black font-display tracking-tight">{t.createTitle}</h2>
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-medium">{t.createDesc}</p>
            
            <div className="relative group max-w-3xl mx-auto mt-12">
               <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-100 transition duration-500"></div>
               <form 
                 onSubmit={(e) => { e.preventDefault(); startLessonGeneration(customTopic, difficulty); }} 
                 className="relative flex items-center bg-white dark:bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl border border-slate-100 dark:border-white/5"
               >
                  <input 
                    type="text" 
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder={t.createPlaceholder}
                    className="flex-1 bg-transparent border-none py-6 px-8 text-xl focus:ring-0 placeholder:opacity-30 font-black tracking-tight"
                  />
                  <button 
                    disabled={isGenerating || !customTopic.trim()}
                    className="bg-slate-900 dark:bg-primary text-white dark:text-slate-900 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-20 flex items-center gap-2 shadow-xl"
                  >
                    {isGenerating ? <span className="animate-spin material-symbols-outlined">sync</span> : t.createBtn}
                  </button>
               </form>
            </div>
         </div>
      </section>

      {/* Curated Decks with 3D Stack Effect */}
      <section id="decks" className="py-32 px-6">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black font-display tracking-tight mb-24">{t.lessonsTitle}</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-20">
               {SAMPLE_LESSONS.map(lesson => (
                 <div 
                   key={lesson.id} 
                   onClick={() => startLessonGeneration(lesson.title, lesson.difficulty)}
                   className="group relative cursor-pointer"
                 >
                    {/* Layered Stack Visuals */}
                    <div className="absolute inset-x-6 top-6 -bottom-6 bg-primary/10 rounded-[3.5rem] translate-y-4 group-hover:translate-y-8 transition-all duration-500"></div>
                    <div className="absolute inset-x-3 top-3 -bottom-3 bg-secondary/10 rounded-[3.5rem] translate-y-2 group-hover:translate-y-4 transition-all duration-500"></div>
                    
                    <div className="relative bg-white dark:bg-slate-800 rounded-[3.5rem] p-10 space-y-8 border border-slate-100 dark:border-white/5 shadow-spatial transform transition-all duration-500 group-hover:-translate-y-4">
                       <div className="flex items-center justify-between">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            lesson.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' : 
                            lesson.difficulty === 'Intermediate' ? 'bg-orange-100 text-orange-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {lesson.difficulty}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{lesson.duration}</span>
                       </div>
                       <div className="space-y-4 min-h-[140px]">
                          <h3 className="text-3xl font-black font-display tracking-tight leading-tight group-hover:text-primary transition-colors">{lesson.title}</h3>
                          <p className="text-lg opacity-50 font-medium leading-relaxed">{lesson.description}</p>
                       </div>
                       <div className="pt-6 border-t dark:border-white/5 flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">{lesson.category}</span>
                          <div className="w-12 h-12 bg-slate-900 dark:bg-primary text-white dark:text-slate-900 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
                             <span className="material-symbols-outlined font-black">arrow_forward</span>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Lesson Reader Modal with Enhanced Table Rendering */}
      {activeLesson && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-10 bg-slate-950/90 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="relative w-full max-w-5xl h-full bg-white dark:bg-slate-900 md:rounded-[4rem] shadow-5xl overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto px-8 md:px-20 py-24 scroll-smooth">
                 <button onClick={() => setActiveLesson(null)} className="fixed top-10 right-10 w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center hover:rotate-90 transition-all z-[210] shadow-xl">
                    <span className="material-symbols-outlined text-3xl font-black">close</span>
                 </button>
                 
                 {isGenerating && !generatedLesson?.content ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-10">
                       <div className="relative">
                          <div className="w-24 h-24 border-8 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                             <span className="material-symbols-outlined text-primary font-black animate-pulse">auto_awesome</span>
                          </div>
                       </div>
                       <h2 className="text-4xl font-black font-display tracking-tight">{t.preparing}</h2>
                    </div>
                 ) : (
                    <div className="max-w-4xl mx-auto space-y-16">
                       {generatedLesson?.image && (
                         <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group">
                           <img src={generatedLesson.image} className="w-full aspect-video object-cover transition-transform duration-[10s] group-hover:scale-110" alt="" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                           <div className="absolute bottom-10 left-10 flex items-center gap-4">
                              <span className="px-6 py-2 bg-primary text-slate-900 text-xs font-black uppercase tracking-[0.4em] rounded-full shadow-lg">Casharka Cusub</span>
                              <button onClick={() => speakText(activeLesson.title)} className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                                 <span className="material-symbols-outlined text-white text-xl">volume_up</span>
                              </button>
                           </div>
                         </div>
                       )}
                       <FormattedText text={generatedLesson?.content || ''} />
                    </div>
                 )}
              </div>
              <div className="p-8 bg-slate-50 dark:bg-white/5 flex items-center justify-center border-t dark:border-white/10">
                 <button 
                   onClick={() => setActiveLesson(null)}
                   className="px-20 py-6 bg-slate-900 dark:bg-primary text-white dark:text-slate-900 font-black rounded-full uppercase tracking-[0.3em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl"
                 >
                    {t.finish}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* AI Tutor Chat - Optimized Assistant */}
      <div className={`fixed bottom-10 right-10 z-[150] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isChatOpen ? 'w-[calc(100%-5rem)] md:w-[450px] h-[700px] max-h-[85vh]' : 'w-24 h-24'}`}>
         {isChatOpen ? (
           <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-5xl flex flex-col border border-slate-100 dark:border-white/10 overflow-hidden">
              <div className="p-10 bg-slate-900 text-white flex items-center justify-between">
                 <div className="flex items-center gap-5">
                    <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Abdis" className="w-14 h-14 rounded-2xl bg-white/10 p-2" alt="" />
                    <div>
                       <h4 className="text-xl font-bold tracking-tight">Macalin Abdis AI</h4>
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Diyaar baan kuu ahay</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setIsChatOpen(false)} className="opacity-40 hover:opacity-100 transition-all">
                    <span className="material-symbols-outlined text-4xl">keyboard_arrow_down</span>
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-slate-50 dark:bg-slate-900/50">
                 {messages.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-8 py-5 rounded-[2rem] text-lg font-medium shadow-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-primary text-slate-900 font-black rounded-br-none' 
                          : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-bl-none'
                      }`}>
                         {msg.text}
                      </div>
                   </div>
                 ))}
                 <div ref={chatEndRef} />
              </div>

              <div className="p-8 border-t dark:border-white/10 bg-white dark:bg-slate-900">
                 <div className="relative">
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="I weydii wax kasta..."
                      className="w-full pl-8 pr-20 py-6 bg-slate-100 dark:bg-white/5 border-none rounded-full focus:ring-8 focus:ring-primary/10 text-lg font-medium transition-all"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="absolute right-3 top-3 bottom-3 w-14 bg-slate-900 dark:bg-primary text-white dark:text-slate-900 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl disabled:opacity-20"
                    >
                       <span className="material-symbols-outlined font-black">send</span>
                    </button>
                 </div>
              </div>
           </div>
         ) : (
           <button 
             onClick={() => setIsChatOpen(true)}
             className="w-full h-full bg-slate-900 dark:bg-primary text-white dark:text-slate-900 rounded-full shadow-spatial flex items-center justify-center hover:scale-110 active:scale-90 transition-all group overflow-hidden"
           >
              <span className="material-symbols-outlined text-4xl font-bold group-hover:scale-125 transition-all duration-500">forum</span>
           </button>
         )}
      </div>

      {/* Cinematic Footer */}
      <footer className="py-32 bg-slate-950 text-white px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-24 border-b border-white/5 pb-24 mb-24">
            <div className="md:col-span-2 space-y-12">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-slate-950 text-3xl font-bold">school</span>
                  </div>
                  <span className="text-4xl font-black font-display tracking-tighter">ADE<span className="text-primary">.</span></span>
               </div>
               <p className="text-white/40 max-w-md text-2xl font-medium leading-relaxed">
                 U fududaynta ardayda Soomaaliyeed inay bartaan luqadda Ingiriisiga iyadoo la isticmaalayo tignoolajiyada AI ee ugu casrisan.
               </p>
               <div className="flex gap-6">
                 {['facebook', 'youtube', 'instagram', 'tiktok'].map(s => (
                   <a 
                     key={s} 
                     href={s === 'tiktok' ? 'https://www.tiktok.com/@abdisdailyenglish' : '#'} 
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-14 h-14 bg-white/5 hover:bg-primary transition-all duration-500 rounded-2xl flex items-center justify-center group border border-white/5 hover:border-primary"
                   >
                      <img src={`https://cdn.simpleicons.org/${s}/white`} className="w-6 h-6 group-hover:scale-125 transition-transform" alt={s} />
                   </a>
                 ))}
               </div>
            </div>
            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Akadamiyadda</h4>
               <ul className="space-y-4 text-white/30 font-black uppercase tracking-widest text-[10px]">
                  <li><a href="#decks" className="hover:text-white transition-all">Dukumiintiyada</a></li>
                  <li><a href="#lab" className="hover:text-white transition-all">Warshadda AI</a></li>
                  <li><a href="#word" className="hover:text-white transition-all">Erayga Maalinta</a></li>
               </ul>
            </div>
            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Ku saabsan</h4>
               <ul className="space-y-4 text-white/30 font-black uppercase tracking-widest text-[10px]">
                  <li><a href="#" className="hover:text-white transition-all">Abdis Daily English</a></li>
                  <li><a href="#" className="hover:text-white transition-all">Xogta Shakhsiga</a></li>
                  <li><a href="#" className="hover:text-white transition-all">Nala soo xiriir</a></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto text-center text-white/10 text-[10px] font-black uppercase tracking-[0.6em]">
           &copy; {new Date().getFullYear()} ABDI'S DAILY ENGLISH (ADE). MUSTAQBALKU WAA DHICIS.
         </div>
      </footer>
    </div>
  );
}

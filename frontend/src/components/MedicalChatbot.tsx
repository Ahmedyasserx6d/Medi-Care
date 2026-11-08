import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const MedicalChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'أهلاً بك في ميدي كير! أنا مساعدك الذكي، كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callAI = async (userText: string) => {
    setIsLoading(true);
    try {
      // Prepare history for Gemini (excluding the initial greeting)
      const history = messages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await api.post("/ai/chat", { 
        message: userText, 
        history: history 
      });

      if (response.data?.reply) {
        setMessages(prev => [...prev, { role: 'assistant', text: response.data.reply }]);
      } else {
         throw new Error("لم أستطع الحصول على رد.");
      }
    } catch (error: any) {
      const serverError = error.response?.data?.message || "حدث خطأ في الاتصال.";
      setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ خطأ: ${serverError}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    callAI(text);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl shadow-inner">
                <span>🤖</span>
              </div>
              <div>
                <h4 className="font-black text-sm">مساعد ميدي كير</h4>
                <p className="text-[10px] text-blue-100 font-bold">متصل الآن</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">✕</button>
          </div>
          
          <div className="flex-1 h-96 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold leading-relaxed shadow-sm ${
                  m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}>
                  {m.text}
                  {m.role === 'assistant' && i === 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                       <button onClick={() => { setInput("ما هي الخدمات المتاحة؟"); }} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">الخدمات</button>
                       <button onClick={() => { setInput("من هم الأطباء؟"); }} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">الأطباء</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-50 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="كيف يمكنني مساعدتك؟"
              className="flex-1 p-4 bg-gray-50 rounded-2xl border-none outline-none text-sm font-bold focus:ring-2 focus:ring-blue-600"
            />
            <button onClick={handleSend} className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-blue-700 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-blue-600 rounded-2xl shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95 group relative"
      >
        <div className="absolute -top-1 right-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white"></div>
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>
    </div>
  );
};

export default MedicalChatbot;

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Language, ChatMessage } from '../types';
import { getTranslation } from '../translations';

interface AIAssistantViewProps {
  language: Language;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ language }) => {
  const t = getTranslation(language);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text:
        language === 'bn'
          ? 'স্বাগতম! আমি তামিমমেট এআই সহকারী (Gemini 3.8 Flash দ্বারা চালিত)। মিডিয়া ফরম্যাট, প্লেয়ার সমস্যা সমাধান, ফাইল কনভার্সন অথবা অ্যাপ ব্যবহারের যেকোনো বিষয়ে আমাকে প্রশ্ন করতে পারেন!'
          : 'Hello! I am Tamimmate AI Assistant, powered by Google Gemini 3.8 Flash. How can I help you today with media formats, player troubleshooting, file management, or PWA setup?',
      timestamp: Date.now(),
    },
  ]);

  const quickPrompts = [
    language === 'bn'
      ? 'MP4 এবং WebM ভিডিওর মধ্যে পার্থক্য কী?'
      : 'What is the difference between MP4 and WebM?',
    language === 'bn'
      ? 'আইফোনে তামিমমেট কীভাবে পিডব্লিউএ হিসেবে ইনস্টল করব?'
      : 'How do I install Tamimmate as a PWA on iOS?',
    language === 'bn'
      ? 'আমার ভিডিও ফাইল চলছে না কেন? সমস্যা সমাধান কীভাবে করব?'
      : 'Why is my media file not playing? How to troubleshoot?',
    language === 'bn'
      ? 'তামিমমেটে কীভাবে সরাসরি ভিডিও ডাউনলোড করব?'
      : 'How do direct media downloads work in Tamimmate?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputVal.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.fallbackReply || data.error || 'Failed to contact Gemini AI service');
      }

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'model',
        text: data.reply || data.fallbackReply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const errorText =
        err instanceof Error ? err.message : 'AI service temporarily unavailable';
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-err-' + Date.now(),
          role: 'model',
          text: errorText,
          timestamp: Date.now(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-cleared',
        role: 'model',
        text:
          language === 'bn'
            ? 'কথোপকথন পরিষ্কার করা হয়েছে। নতুন প্রশ্ন জিজ্ঞাসা করতে পারেন!'
            : 'Conversation cleared. How can I assist you?',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
            {t.ai.title}
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">{t.ai.subtitle}</p>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
          title="Clear Conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Security & Consent Notice */}
      <div className="my-3 px-3 py-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{t.ai.consentNotice}</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-[#99000A] text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed relative group ${
                msg.role === 'user'
                  ? 'bg-red-600 text-white rounded-br-none shadow-md shadow-red-900/30'
                  : msg.error
                  ? 'bg-red-950/40 border border-red-800 text-red-200 rounded-bl-none'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {msg.role === 'model' && !msg.error && (
                <button
                  onClick={() => handleCopy(msg.id, msg.text)}
                  className="absolute top-2 right-2 p-1 rounded bg-neutral-800/80 text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600/30 text-red-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Tamimmate AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="pt-2 pb-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white whitespace-nowrap shrink-0 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={t.ai.placeholder}
          className="flex-1 px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-700/80 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 shadow-inner"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || loading}
          className="p-3 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white shadow-lg shadow-red-900/30 transition-all shrink-0 active:scale-95"
          title={t.ai.send}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

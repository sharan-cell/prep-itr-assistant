import React, { useState } from 'react';
import { X, Sparkles, Send, HelpCircle, Bot, User } from 'lucide-react';
import { LanguageCode } from '../types';

interface TaxAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
  contextData?: any;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const defaultPromptChips = [
  'What is the Section 87A rebate for AY 2025-26 under New vs Old Regime?',
  'How does Section 44ADA help software freelancers and medical consultants?',
  'What is the difference between Form 16, Form 26AS, and AIS?',
  'Do I need to file Schedule FA if I hold US company RSUs or ESPP?',
  'Can a salaried employee switch between New and Old Tax Regimes every year?',
  'How are stock mutual funds and shares taxed in AY 2025-26?',
];

export const TaxAiAssistantModal: React.FC<TaxAiAssistantModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  contextData,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Namaste! I am your AI Citizen Tax Assistant. Ask me anything about Indian Income Tax Returns (ITR-1 to ITR-4), Form 16 line items, Annual Information Statement (AIS), deductions under Chapter VI-A, or capital gains rules for AY 2025-26.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery.trim();
    if (!text || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/ask-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          lang: currentLang,
          context: contextData ? JSON.stringify(contextData) : undefined,
        }),
      });

      const data = await response.json();
      if (data.answer) {
        setMessages([...newMessages, { role: 'assistant', content: data.answer }]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: 'I could not generate an answer at this moment. Please check your connection or try again.',
          },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Unable to reach the tax intelligence service. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="modal-ai-overlay"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-100"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ai-title"
    >
      <div className="bg-white rounded-xl max-w-2xl w-full h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#1F2430] text-white p-4 flex items-center justify-between shrink-0 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#4A2BC2] text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-ai-title" className="text-base font-bold flex items-center gap-2">
                <span>Tax Intelligence Assistant</span>
                <span className="ux4g-badge ux4g-badge-primary text-[10px]">
                  AY 2025-26
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Plain-language explanations for citizen tax queries
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {(messages || []).map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#4A2BC2] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#4A2BC2] text-white rounded-br-xs font-medium shadow-2xs'
                    : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200 shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#4A2BC2] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white text-slate-600 rounded-xl rounded-tl-xs p-3.5 border border-slate-200 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4A2BC2] animate-spin" />
                <span>Consulting tax regulations & rules...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-[#4A2BC2]" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(defaultPromptChips || []).map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#4A2BC2] border border-slate-200 transition-colors shrink-0 disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask any question about Form 16, AIS, deductions, capital gains..."
              disabled={isLoading}
              className="ux4g-input flex-1"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="ux4g-btn ux4g-btn-md ux4g-btn-primary shrink-0"
            >
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

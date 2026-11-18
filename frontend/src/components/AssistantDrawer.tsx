import React, { useState } from 'react';
import { askAssistant, AssistantResponse, Cluster } from '../services/api';
import { PerspectiveBadge } from './PerspectiveBadge';
import { X, Bot, Send, Sparkles, BookOpen, ExternalLink, CheckCircle } from 'lucide-react';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCluster?: Cluster | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: any[];
  consensus_note?: string;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  activeCluster
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am NYNK Assistant. Ask me anything about current news stories, how different editorial perspectives frame the debate, or where media blindspots are occurring.',
      citations: []
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const sampleQueries = [
    'How do Left vs Right outlets frame the Semiconductor Mission?',
    'What did PIB state regarding the 200 GW renewable energy milestone?',
    'Why is there an electoral reform coverage blindspot?'
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isSubmitting) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSubmitting(true);

    try {
      const response: AssistantResponse = await askAssistant(textToSend, activeCluster?.cluster_id);
      const assistantMsg: Message = {
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        consensus_note: response.consensus_note
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an issue querying the news intelligence engine. Please try again.',
          citations: []
        }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-cream-50 border-l-2 border-slate-900 shadow-retro-lg flex flex-col justify-between animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-900/10 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FDE2E4] border border-rose-300 flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-rose-950" />
          </div>
          <div>
            <h3 className="font-serif font-black text-base text-slate-900 flex items-center gap-1.5">
              <span>NYNK AI News Assistant</span>
            </h3>
            <p className="text-[11px] font-medium text-slate-600">
              {activeCluster ? `Focusing on: ${activeCluster.title.substring(0, 32)}...` : 'Multi-Perspective Contextual RAG'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full border border-slate-300 hover:border-slate-900 text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white rounded-br-none shadow-retro-sm'
                  : 'bg-white text-slate-900 border-2 border-slate-900/15 rounded-bl-none shadow-retro-sm'
              }`}
            >
              <p className="font-medium">{m.content}</p>

              {/* Citations List */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-900" />
                    Cited Media Perspectives
                  </div>
                  {m.citations.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-cream-100 border border-slate-200 text-xs"
                    >
                      <span className="truncate font-bold text-slate-800">
                        {c.source_name}
                      </span>
                      {c.perspective && (
                        <PerspectiveBadge perspective={c.perspective} showIcon={false} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Consensus Note */}
              {m.consensus_note && (
                <div className="mt-2 text-[11px] text-emerald-800 flex items-center gap-1 font-bold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  {m.consensus_note}
                </div>
              )}
            </div>
          </div>
        ))}

        {isSubmitting && (
          <div className="flex items-center gap-2 p-3.5 rounded-3xl bg-white border border-slate-900/15 text-xs text-slate-700 max-w-[80%] shadow-sm">
            <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
            Synthesizing across multi-perspective news sources...
          </div>
        )}
      </div>

      {/* Suggested Inquiries & Chat Input */}
      <div className="p-4 border-t border-slate-900/10 bg-white space-y-3">
        {messages.length <= 2 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500">Popular Inquiries:</span>
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-left text-xs p-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-slate-800 border border-slate-300 transition truncate font-medium"
              >
                💬 {q}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about viewpoints, framing, or facts..."
            className="flex-1 px-4 py-2.5 rounded-full bg-cream-100 border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-900"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSubmitting}
            className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 transition shadow-retro-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

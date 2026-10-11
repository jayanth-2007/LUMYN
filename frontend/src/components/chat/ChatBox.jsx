import React, { useState, useRef, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import ChartCard from '../dashboard/ChartCard';
import { Send, Sparkles, Bot, User, Table, CheckCircle2 } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

export default function ChatBox({
  suggestedQuestions = [],
  onSendMessage,
  messages = [],
  loading = false,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleSuggestedClick = (q) => {
    onSendMessage(q);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-5 mb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#22D3EE]/10 border border-[#8B5CF6]/25 flex items-center justify-center mb-5 shadow-glow-violet">
              <Bot className="w-8 h-8 text-[#22D3EE]" />
            </div>
            <h3 className="text-lg font-bold text-[#F4F4F8] mb-2">Ask LUMYN Anything</h3>
            <p className="text-sm text-[#717187] max-w-md mb-6 leading-relaxed">
              Query your data in plain English. Calculations are processed natively using our
              deterministic analytics engine — zero hallucinations, verifiable results.
            </p>

            {/* Suggested prompts */}
            {suggestedQuestions.length > 0 && (
              <div className="w-full max-w-2xl">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#717187] mb-3 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#8B5CF6]" />
                  <span>Suggested Explorations</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {suggestedQuestions.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestedClick(sq)}
                      className="p-3 rounded-xl bg-[#191927] hover:bg-[#8B5CF6]/10 border border-[#232334] hover:border-[#8B5CF6]/35 text-xs text-[#A1A1B5] hover:text-[#F4F4F8] transition-all text-left flex items-start gap-2 group"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#717187] group-hover:text-[#8B5CF6] shrink-0 mt-0.5" />
                      <span>{sq}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shrink-0 shadow-glow-violet">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-tr-sm shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                      : 'bg-[#191927] border border-[#232334] text-[#F4F4F8] rounded-tl-sm shadow-card-dark'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Engine Source Badge */}
                  {!isUser && msg.source && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#11111B] border border-[#232334] text-[#22D3EE] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {msg.source === 'deterministic_engine'
                          ? 'Deterministic Engine — Zero Hallucination'
                          : 'AI Enhanced'}
                      </span>
                    </div>
                  )}

                  {/* Render Table Data */}
                  {msg.tableData && msg.tableData.length > 0 && (
                    <div className="mt-3 overflow-x-auto rounded-xl border border-[#232334] bg-[#11111B]">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-[#232334]">
                        <span className="text-[11px] font-bold text-[#717187] uppercase tracking-wider flex items-center gap-1">
                          <Table className="w-3 h-3 text-[#8B5CF6]" /> Data Breakdown
                        </span>
                        <button
                          onClick={() => exportToCSV(msg.tableData, 'lumyn_chat_query_result.csv')}
                          className="text-[10px] text-[#22D3EE] hover:underline"
                        >
                          Export CSV
                        </button>
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-[#232334] text-[#717187] text-[10px] uppercase tracking-wider">
                            {Object.keys(msg.tableData[0]).map((k) => (
                              <th key={k} className="px-3 py-2 font-semibold">
                                {k}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {msg.tableData.slice(0, 10).map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-[#232334]/40 hover:bg-[#191927]">
                              {Object.values(row).map((val, cIdx) => (
                                <td key={cIdx} className="px-3 py-2 font-mono text-[11px] text-[#A1A1B5]">
                                  {val !== null && val !== undefined ? String(val) : '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Chart suggestion */}
                  {msg.chartSuggestion && (
                    <div className="mt-4">
                      <ChartCard chart={msg.chartSuggestion} />
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#191927] border border-[#232334] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-[#A1A1B5]" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3.5 items-center text-[#717187] text-xs">
            <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4 text-[#22D3EE]" />
            </div>
            <div className="bg-[#191927] border border-[#232334] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2.5">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-bounce" />
              </span>
              <span>Analyzing dataset & calculating results...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this dataset (e.g. 'Compare sales by category', 'What is the average price?')..."
          className="w-full bg-[#191927] border border-[#232334] rounded-2xl pl-4 pr-28 py-3.5 text-sm text-[#F4F4F8] placeholder-[#717187] focus:outline-none focus:border-[#8B5CF6]/60 focus:ring-1 focus:ring-[#8B5CF6]/30 shadow-card-dark transition-colors"
        />
        <div className="absolute right-2 top-2">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!input.trim() || loading}
            icon={Send}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import ChatBox from '../components/chat/ChatBox';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { MessageSquareText, ShieldCheck } from 'lucide-react';

export default function ChatPage() {
  const { currentDataset, showToast } = useApp();
  const [messages, setMessages] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentDataset?.id) {
      loadInsights(currentDataset.id);
      setMessages([]);
    }
  }, [currentDataset?.id]);

  const loadInsights = async (datasetId) => {
    try {
      const res = await api.getDatasetInsights(datasetId);
      if (res.data.suggested_questions) setSuggestedQuestions(res.data.suggested_questions);
    } catch (err) {
      console.error('Failed to load insights:', err);
    }
  };

  const handleSendMessage = async (text) => {
    if (!currentDataset?.id) {
      showToast('Please select or upload a dataset first.', 'error');
      return;
    }

    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.chatAnalytics(currentDataset.id, text);
      const data = res.data;
      const botMsg = {
        sender: 'bot',
        text: data.answer,
        source: data.source,
        tableData: data.table_data,
        chartSuggestion: data.chart_suggestion,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg = {
        sender: 'bot',
        text: 'Sorry, I encountered an error while processing that question. Please try asking about specific columns or totals.',
        source: 'error',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!currentDataset) {
    return (
      <div className="text-center py-24 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[#191927] border border-[#232334] flex items-center justify-center mx-auto mb-4">
          <MessageSquareText className="w-8 h-8 text-[#717187]" />
        </div>
        <h2 className="text-lg font-bold text-[#F4F4F8]">No Dataset Active</h2>
        <p className="text-xs text-[#717187] mt-2">
          Select an active dataset or upload a file to start asking analytical questions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F8] tracking-tight">
              AI Data Chat
            </h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20 font-mono font-semibold">
              Deterministic Mode
            </span>
          </div>
          <p className="text-sm text-[#717187] mt-1">
            Ask questions on{' '}
            <span className="text-[#A78BFA] font-semibold">{currentDataset.name}</span>.
            Verifiable calculations by Pandas.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#717187] bg-[#191927] border border-[#232334] px-3 py-2 rounded-xl shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#34D399]" />
          <span>Zero Hallucination Guaranteed</span>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="p-6">
        <ChatBox
          suggestedQuestions={suggestedQuestions}
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loading}
        />
      </Card>
    </div>
  );
}

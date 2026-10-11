import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import KPICard from '../components/dashboard/KPICard';
import ChartCard from '../components/dashboard/ChartCard';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  BarChart2,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  LayoutDashboard,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loadDemoData, loading } = useApp();

  const handleExploreDemo = async () => {
    try {
      const d = await loadDemoData();
      if (d) navigate('/app/dashboard');
    } catch (e) {
      console.warn('Explore demo failed:', e);
    }
  };

  const previewSalesChart = {
    id: 'preview-sales',
    title: 'Monthly Revenue Velocity',
    description: 'Automated trend extraction across 6-month window',
    type: 'line',
    x_key: 'label',
    y_keys: ['value'],
    data: [
      { label: 'Jan', value: 18400 },
      { label: 'Feb', value: 24200 },
      { label: 'Mar', value: 31500 },
      { label: 'Apr', value: 28900 },
      { label: 'May', value: 42100 },
      { label: 'Jun', value: 53800 },
    ],
  };

  const previewCategoryChart = {
    id: 'preview-cat',
    title: 'Revenue by Category',
    description: 'Automated categorical ranking and contribution',
    type: 'bar',
    x_key: 'label',
    y_keys: ['value'],
    data: [
      { label: 'Electronics', value: 78500 },
      { label: 'Furniture', value: 43200 },
      { label: 'Office', value: 24100 },
      { label: 'Apparel', value: 31200 },
    ],
  };

  return (
    <div className="min-h-screen bg-[#08080D] text-[#F4F4F8] flex flex-col selection:bg-[#8B5CF6]/30 selection:text-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[420px] bg-gradient-to-tr from-[#8B5CF6]/15 via-[#6D28D9]/10 to-[#22D3EE]/12 blur-[140px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-xs font-bold text-[#A78BFA] mb-8 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Next-Gen AI Analytics</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F4F4F8] max-w-5xl leading-[1.08] mb-6">
            Turn Raw Data Into{' '}
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#22D3EE] bg-clip-text text-transparent">
              Clear Decisions.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[#A1A1B5] max-w-3xl mb-10 leading-relaxed font-normal">
            Upload your data, uncover meaningful insights, generate interactive dashboards, and explore your data using natural language.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/app/upload')}
              icon={ArrowRight}
              className="w-full sm:w-auto"
            >
              Start Analyzing Free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleExploreDemo}
              loading={loading}
              icon={Sparkles}
              className="w-full sm:w-auto"
            >
              Explore Live Demo
            </Button>
          </div>

          {/* Product feature highlights */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-[#717187]">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#22D3EE]" />
              <span className="text-[#A1A1B5]">Instant File-Based Analysis</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-[#A1A1B5]">Intelligent Data Insights</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              <span className="text-[#A1A1B5]">Interactive Dashboards</span>
            </div>
          </div>
        </div>

        {/* Hero Dashboard Preview */}
        <div className="relative mt-16 max-w-5xl mx-auto">
          {/* Outer frame */}
          <div className="rounded-3xl p-px bg-gradient-to-b from-[#232334] via-[#232334]/60 to-transparent shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
            <div className="rounded-3xl bg-[#11111B] border border-[#232334] p-6 text-left">
              {/* Window chrome */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-5 border-b border-[#232334]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FB7185]/70" />
                  <span className="w-3 h-3 rounded-full bg-[#FBBF24]/70" />
                  <span className="w-3 h-3 rounded-full bg-[#34D399]/70" />
                  <span className="text-xs font-semibold text-[#717187] font-mono ml-2">
                    LUMYN Intelligent Dashboard Preview
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/20 font-mono font-medium">
                    300 Rows Analyzed
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20 font-mono font-medium">
                    Quality: 98/100
                  </span>
                </div>
              </div>

              {/* KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <KPICard title="Total Revenue" value="$177,000" subtitle="300 orders analyzed" icon="TrendingUp" trend="+18.4% YoY" />
                <KPICard title="Average Order" value="$590.00" subtitle="Median: $450.00" icon="Gauge" />
                <KPICard title="Top Category" value="Electronics" subtitle="44.3% revenue share" icon="Star" />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ChartCard chart={previewSalesChart} />
                <ChartCard chart={previewCategoryChart} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 border-t border-[#232334] bg-[#0B0B12]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6] block mb-3">
              Simple Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F4F4F8] tracking-tight">
              From Spreadsheet to Dashboard in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                bg: 'bg-[#8B5CF6]/10',
                border: 'border-[#8B5CF6]/25',
                text: 'text-[#8B5CF6]',
                title: 'Upload Any File',
                body: 'Drop your CSV or Excel file (up to 25 MB). LUMYN automatically parses columns, detects schemas, and prepares instant statistical profiles.',
              },
              {
                step: '02',
                bg: 'bg-[#6D28D9]/10',
                border: 'border-[#6D28D9]/25',
                text: 'text-[#A78BFA]',
                title: 'Auto-Generate Charts',
                body: 'Our smart profiling heuristic detects numerical measures, dates, and categories to construct KPI cards, trends, and distribution charts automatically.',
              },
              {
                step: '03',
                bg: 'bg-[#22D3EE]/10',
                border: 'border-[#22D3EE]/25',
                text: 'text-[#22D3EE]',
                title: 'Ask Questions & Export',
                body: 'Chat with your dataset in natural language. Get calculated averages, rankings, and trends instantly, then export to CSV or print cleanly.',
              },
            ].map((item) => (
              <Card key={item.step} hover className="relative p-8">
                <div className={`w-12 h-12 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center ${item.text} mb-6 font-bold text-lg font-mono`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-[#F4F4F8] mb-3">{item.title}</h3>
                <p className="text-sm text-[#717187] leading-relaxed">{item.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#22D3EE] block mb-3">
            Powerful Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F4F4F8] tracking-tight">
            Engineered for Modern Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover className="p-6">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <h3 className="text-base font-bold text-[#F4F4F8] mb-2">Deterministic NLP Engine</h3>
            <p className="text-xs text-[#717187] leading-relaxed">
              Ask questions like "Which category has the highest sales?" and receive verifiable
              calculations from Pandas without hallucinations or arbitrary code execution risks.
            </p>
          </Card>

          <Card hover className="p-6">
            <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center mb-4">
              <BarChart2 className="w-5 h-5 text-[#22D3EE]" />
            </div>
            <h3 className="text-base font-bold text-[#F4F4F8] mb-2">Deep Data Profiling</h3>
            <p className="text-xs text-[#717187] leading-relaxed">
              Automatic IQR outlier detection, skewness computation, Pearson correlation matrices,
              and completeness scoring for every uploaded dataset.
            </p>
          </Card>

          <Card hover className="p-6">
            <div className="w-10 h-10 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-[#34D399]" />
            </div>
            <h3 className="text-base font-bold text-[#F4F4F8] mb-2">Intelligent Data Insights</h3>
            <p className="text-xs text-[#717187] leading-relaxed">
              Automatic metric aggregation, trend extraction, correlation analysis, and narrative
              takeaway generation tailored for every analyzed dataset.
            </p>
          </Card>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section id="use-cases" className="py-20 border-t border-[#232334] bg-[#0B0B12]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A78BFA] block mb-3">
              Versatile Applications
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F4F4F8] tracking-tight">
              Built for Fast-Moving Teams
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { tag: 'Sales Analytics', tagColor: 'text-[#22D3EE]', title: 'Revenue & Quotas', body: 'Track rep performance, regional volumes, deal sizes, and monthly closing velocities.' },
              { tag: 'Finance & Ops', tagColor: 'text-[#8B5CF6]', title: 'Expense & Margins', body: 'Profile cash burns, cost line distributions, and identify spending anomalies quickly.' },
              { tag: 'Customer Success', tagColor: 'text-[#34D399]', title: 'Churn & Cohorts', body: 'Segment accounts by usage frequency, retention periods, and satisfaction metrics.' },
              { tag: 'Product & Inventory', tagColor: 'text-[#FBBF24]', title: 'SKUs & Stock Velocity', body: 'Monitor fast-moving items, turnover ratios, and warehouse reorder timings.' },
            ].map((uc) => (
              <Card key={uc.title} hover className="p-5">
                <span className={`text-xs font-bold font-mono ${uc.tagColor} block mb-2`}>{uc.tag}</span>
                <h4 className="text-sm font-bold text-[#F4F4F8] mb-2">{uc.title}</h4>
                <p className="text-xs text-[#717187] leading-relaxed">{uc.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-[#232334] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#717187]">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-[#A1A1B5] tracking-wide">LUMYN</span>
          <span>·</span>
          <span>AI Analytics SaaS Platform</span>
        </div>
        <div className="flex items-center gap-6">
          <span>Enterprise Data Privacy</span>
          <span>Fast Interactive Dashboards</span>
          <span>© 2026 LUMYN</span>
        </div>
      </footer>
    </div>
  );
}

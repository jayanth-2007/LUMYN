import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Button from './Button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { loadDemoData, loading } = useApp();

  const handleExploreDemo = async () => {
    try {
      const d = await loadDemoData();
      if (d) {
        navigate('/app/dashboard');
      }
    } catch (e) {
      console.warn('Explore demo failed:', e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#08080D]/85 border-b border-[#232334]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo showTagline={true} />

        {/* Public Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A1A1B5]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 text-xs text-[#A78BFA] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
            AI-Powered Analytics
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExploreDemo}
            loading={loading}
            icon={Sparkles}
          >
            Explore Demo
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/upload')}
            icon={ArrowRight}
          >
            Start Analyzing
          </Button>
        </div>
      </div>
    </header>
  );
}

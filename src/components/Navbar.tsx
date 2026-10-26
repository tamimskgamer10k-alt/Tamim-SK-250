import React, { useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Download,
  Wifi,
  WifiOff,
  Menu,
  X,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Language, Theme } from '../types';
import { getTranslation } from '../translations';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface NavbarProps {
  currentTab: string;
  theme: Theme;
  onToggleTheme: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onSearch: (query: string) => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onOpenAI: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  language,
  onSelectLanguage,
  onSearch,
  mobileMenuOpen,
  onToggleMobileMenu,
  onOpenAI,
}) => {
  const t = getTranslation(language);
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch(searchVal.trim());
    }
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tamimmate — All in One Place',
          text: 'Check out Tamimmate, the universal media hub, downloader, and entertainment web app!',
          url: window.location.href,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-colors duration-200 bg-[#0B0C10]/90 border-neutral-800/70 text-white">
      <div className="flex h-16 items-center justify-between px-3 md:px-6 gap-3">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/70 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => onSearch('')}>
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-[#99000A] shadow-md shadow-red-600/30">
              <span className="font-extrabold text-white text-lg tracking-tighter">T</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-400 animate-ping" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Tamimmate
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-red-600/30 text-red-400 border border-red-500/40">
                  Universal
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-none truncate max-w-[190px]">
                {t.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-2">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={t.common.search}
              className="w-full pl-10 pr-10 py-2 rounded-full text-xs md:text-sm bg-neutral-900/80 border border-neutral-700/60 placeholder:text-neutral-500 text-neutral-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
            />
            {searchVal && (
              <button
                type="button"
                onClick={() => {
                  setSearchVal('');
                  onSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Right: Actions, PWA Install, Language, Theme, Status */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* AI Quick Assistant Trigger */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600/20 to-purple-600/20 hover:from-red-600/30 hover:to-purple-600/30 border border-red-500/30 text-red-400 text-xs font-semibold shadow-sm transition-all"
            title="Ask Tamimmate AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="hidden lg:inline">AI Help</span>
          </button>

          {/* PWA Install Button */}
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.common.installApp}</span>
            </button>
          )}

          {!isInstalled && isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800/80 text-neutral-200 text-xs font-medium hover:bg-neutral-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.common.installIOS}</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-700/60 p-0.5 text-xs font-medium">
            <button
              onClick={() => onSelectLanguage('en')}
              className={`px-2 py-1 rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onSelectLanguage('bn')}
              className={`px-2 py-1 rounded-lg transition-all font-bangla ${
                language === 'bn'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              বাং
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-400" />}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShareApp}
            className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Share Tamimmate"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Online/Offline Status Indicator */}
          <div
            className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${
              isOnline
                ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                : 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
            }`}
            title={isOnline ? t.common.online : t.common.offline}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 animate-pulse" />}
            <span className="hidden xl:inline">{isOnline ? t.common.online : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* iOS Install Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-700 p-6 shadow-2xl text-white">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-red-500" />
              Install Tamimmate on iPhone / iPad
            </h3>
            <div className="mt-3 text-xs text-neutral-300 space-y-2 leading-relaxed">
              <p>1. Tap the <span className="font-semibold text-white">Share</span> icon (square with arrow up) in Safari's bottom toolbar.</p>
              <p>2. Scroll down and tap <span className="font-semibold text-white">"Add to Home Screen"</span>.</p>
              <p>3. Tap <span className="font-semibold text-white">"Add"</span> in the top right corner.</p>
              <p className="text-[11px] text-neutral-400 pt-1">
                You can then launch Tamimmate anytime directly from your home screen with offline capabilities!
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-red-600 hover:bg-red-700 py-2.5 text-xs font-bold text-white transition-all shadow-md"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      )}

      {/* Copied Toast */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-medium shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {t.common.copied}
        </div>
      )}
    </header>
  );
};

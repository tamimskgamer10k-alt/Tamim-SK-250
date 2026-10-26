import React, { useState } from 'react';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Bookmark,
  History,
  ExternalLink,
  ShieldAlert,
  Search,
  Plus,
  X,
  Download,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../translations';
import { DEFAULT_BOOKMARKS } from '../sampleData';

interface BrowserViewProps {
  language: Language;
  onInspectMediaUrl: (url: string) => void;
}

interface BrowserTab {
  id: string;
  title: string;
  url: string;
}

export const BrowserView: React.FC<BrowserViewProps> = ({
  language,
  onInspectMediaUrl,
}) => {
  const t = getTranslation(language);

  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'Wikipedia Main Page',
      url: 'https://en.wikipedia.org/wiki/Main_Page',
    },
    {
      id: 'tab-2',
      title: 'Internet Archive',
      url: 'https://archive.org',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [inputUrl, setInputUrl] = useState('https://en.wikipedia.org/wiki/Main_Page');
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<Array<{ title: string; url: string; time: string }>>([
    { title: 'Wikipedia Main Page', url: 'https://en.wikipedia.org/wiki/Main_Page', time: 'Just now' },
    { title: 'Internet Archive', url: 'https://archive.org', time: '5m ago' },
    { title: 'Project Gutenberg', url: 'https://www.gutenberg.org', time: '1h ago' },
  ]);
  const [iframeKey, setIframeKey] = useState(0);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target) return;

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = 'https://' + target;
      } else {
        // Search query
        target = `https://duckduckgo.com/?q=${encodeURIComponent(target)}`;
      }
    }

    setTabs(
      tabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, url: target, title: target } : tab
      )
    );
    setInputUrl(target);
    setIframeKey((prev) => prev + 1);

    // Record history
    setHistoryList([
      { title: target, url: target, time: new Date().toLocaleTimeString() },
      ...historyList,
    ]);
  };

  const handleAddTab = () => {
    const newTab: BrowserTab = {
      id: 'tab-' + Date.now(),
      title: 'New Tab',
      url: 'https://en.wikipedia.org',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setInputUrl(newTab.url);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[0].id);
      setInputUrl(remaining[0].url);
    }
  };

  const handleBookmarkClick = (url: string) => {
    setInputUrl(url);
    setTabs(
      tabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, url, title: url } : tab
      )
    );
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-red-500" />
            {t.browser.title}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">{t.browser.safeNotice}</p>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white"
        >
          <History className="w-3.5 h-3.5" />
          <span>{t.browser.history}</span>
        </button>
      </div>

      {/* Browser Window Wrapper */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0F1015] overflow-hidden shadow-2xl flex flex-col min-h-[640px]">
        {/* Tab Strip */}
        <div className="flex items-center bg-[#0B0C10] px-2 pt-2 border-b border-neutral-800 overflow-x-auto gap-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setInputUrl(tab.url);
                }}
                className={`flex items-center gap-2 max-w-[200px] px-3 py-1.5 rounded-t-xl text-xs cursor-pointer border-t border-x transition-colors ${
                  isActive
                    ? 'bg-[#0F1015] border-neutral-700 text-white font-semibold'
                    : 'bg-neutral-950 border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Globe className="w-3 h-3 text-red-500 shrink-0" />
                <span className="truncate flex-1">{tab.title}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="p-0.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={handleAddTab}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 ml-1"
            title={t.browser.newTab}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Browser Nav Toolbar */}
        <div className="p-2.5 bg-[#0F1015] border-b border-neutral-800 flex items-center gap-2">
          <div className="flex items-center gap-1 text-neutral-400">
            <button
              onClick={() => {}}
              className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {}}
              className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white"
              title="Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white"
              title="Reload"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleBookmarkClick('https://en.wikipedia.org')}
              className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white"
              title="Home"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* Omnibox URL Bar */}
          <form onSubmit={handleNavigate} className="flex-1 flex items-center">
            <div className="relative flex-1 flex items-center">
              <Lock className="absolute left-3 w-3.5 h-3.5 text-emerald-400" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder={t.browser.addressPlaceholder}
                className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700/80 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </form>

          {/* Media Detector Button */}
          <button
            onClick={() => onInspectMediaUrl(activeTab.url)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-900/30 transition-all shrink-0"
            title="Inspect media files on this URL"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.browser.extractMedia}</span>
          </button>

          {/* Open Native External */}
          <a
            href={activeTab.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
            title={t.browser.openExternal}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Bookmarks Bar */}
        <div className="px-3 py-1.5 bg-neutral-950/60 border-b border-neutral-850 flex items-center gap-2 overflow-x-auto text-xs text-neutral-400">
          <Bookmark className="w-3 h-3 text-neutral-500 shrink-0" />
          {DEFAULT_BOOKMARKS.map((bm) => (
            <button
              key={bm.id}
              onClick={() => handleBookmarkClick(bm.url)}
              className="px-2 py-0.5 rounded-md hover:bg-neutral-800 hover:text-neutral-200 shrink-0 truncate max-w-[140px]"
            >
              {bm.title}
            </button>
          ))}
        </div>

        {/* Browser Viewport Frame */}
        <div className="relative flex-1 bg-neutral-950 flex flex-col">
          <iframe
            key={iframeKey}
            src={activeTab.url}
            title={activeTab.title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            className="w-full flex-1 min-h-[520px] border-0"
          />

          {/* Informational Banner about X-Frame-Options */}
          <div className="p-2.5 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 px-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>
                Note: Websites with strict <code className="text-neutral-300">X-Frame-Options</code> may require opening directly.
              </span>
            </div>
            <a
              href={activeTab.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              Open External Tab
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 bg-neutral-900 border-l border-neutral-800 p-5 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-red-500" />
              {t.browser.history}
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-2">
            {historyList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  handleBookmarkClick(item.url);
                  setShowHistory(false);
                }}
                className="p-2.5 rounded-xl hover:bg-neutral-800 cursor-pointer border border-neutral-800/60"
              >
                <h5 className="text-xs font-semibold text-white truncate">{item.title}</h5>
                <p className="text-[10px] text-neutral-400 truncate">{item.url}</p>
                <span className="text-[9px] text-neutral-500 mt-1 block">{item.time}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setHistoryList([])}
            className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-red-400 hover:text-red-300"
          >
            Clear Browsing History
          </button>
        </div>
      )}
    </div>
  );
};

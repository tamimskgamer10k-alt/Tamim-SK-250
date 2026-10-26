import React from 'react';
import {
  Home,
  Compass,
  Film,
  Music2,
  DownloadCloud,
  FolderKanban,
  Sparkles,
  Settings,
  Info,
  Globe,
  Clapperboard,
  Gamepad2,
  X,
} from 'lucide-react';
import { NavigationTab, Language } from '../types';
import { getTranslation } from '../translations';

interface MobileNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  language: Language;
  activeDownloadsCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  language,
  activeDownloadsCount,
  isOpen,
  onClose,
}) => {
  const t = getTranslation(language);

  const allItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    isAi?: boolean;
  }> = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'discover', label: t.nav.discover, icon: Compass },
    { id: 'browser', label: t.nav.browser, icon: Globe },
    { id: 'video', label: t.nav.video, icon: Film },
    { id: 'music', label: t.nav.music, icon: Music2 },
    { id: 'movies', label: t.nav.movies, icon: Clapperboard },
    { id: 'apps', label: t.nav.apps, icon: Gamepad2 },
    {
      id: 'downloads',
      label: t.nav.downloads,
      icon: DownloadCloud,
      badge: activeDownloadsCount > 0 ? activeDownloadsCount : undefined,
    },
    { id: 'files', label: t.nav.files, icon: FolderKanban },
    { id: 'ai', label: t.nav.ai, icon: Sparkles, isAi: true },
    { id: 'settings', label: t.nav.settings, icon: Settings },
    { id: 'about', label: t.nav.about, icon: Info },
  ];

  // Primary bottom bar items (5 quick touch points)
  const bottomBarItems: Array<{ id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'discover', label: t.nav.discover, icon: Compass },
    { id: 'video', label: t.nav.video, icon: Film },
    { id: 'music', label: t.nav.music, icon: Music2 },
    { id: 'downloads', label: t.nav.downloads, icon: DownloadCloud },
  ];

  return (
    <>
      {/* Bottom Sticky Mobile Dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F1015]/95 border-t border-neutral-800/80 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
        {bottomBarItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive ? 'text-red-500 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-red-500' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {item.id === 'downloads' && activeDownloadsCount > 0 && (
                <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Slide-out Full Mobile Menu Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#0F1015]">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-600 text-white font-extrabold text-sm">
                T
              </div>
              <span className="font-extrabold text-sm text-white">Tamimmate Modules</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
            <div className="grid grid-cols-2 gap-2.5">
              {allItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/30'
                        : 'bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.isAi ? 'text-red-400' : 'text-neutral-400'}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{item.label}</div>
                      {item.badge !== undefined && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white text-red-600">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

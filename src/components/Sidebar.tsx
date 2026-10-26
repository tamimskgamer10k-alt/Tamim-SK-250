import React from 'react';
import {
  Home,
  Compass,
  Globe,
  Film,
  Music2,
  Clapperboard,
  Gamepad2,
  DownloadCloud,
  FolderKanban,
  Sparkles,
  Settings,
  Info,
} from 'lucide-react';
import { NavigationTab, Language } from '../types';
import { getTranslation } from '../translations';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  language: Language;
  activeDownloadsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  language,
  activeDownloadsCount,
}) => {
  const t = getTranslation(language);

  const navItems: Array<{
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

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-neutral-800/80 bg-[#0F1015] p-3 text-neutral-300 select-none">
      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Main Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-red-600 text-white font-semibold shadow-md shadow-red-900/30'
                  : 'hover:bg-neutral-800/60 hover:text-white text-neutral-400'
              } ${item.isAi && !isActive ? 'text-red-400 hover:text-red-300' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'scale-110 text-white' : item.isAi ? 'text-red-400' : 'text-neutral-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-red-600">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Branding Info */}
      <div className="pt-3 border-t border-neutral-800/70 px-2 text-[11px] text-neutral-500">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-400">Tamimmate v1.0</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="System Operational" />
        </div>
        <p className="text-[10px] text-neutral-500 mt-0.5 truncate">
          Universal All-In-One Hub
        </p>
      </div>
    </aside>
  );
};

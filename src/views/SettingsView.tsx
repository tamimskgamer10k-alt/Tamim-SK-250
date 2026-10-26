import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Globe,
  DownloadCloud,
  HardDrive,
  Shield,
  Trash2,
  CheckCircle2,
  Smartphone,
  Info,
} from 'lucide-react';
import { Language, Theme, UserSettings } from '../types';
import { getTranslation } from '../translations';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClearStorage: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearStorage,
}) => {
  const t = getTranslation(settings.language);
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your local cache, downloads history, and saved preferences?')) {
      onClearStorage();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-red-500" />
          {t.settings.title}
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Customize themes, languages, storage limits, and download behavior.
        </p>
      </div>

      {clearedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{t.settings.clearedSuccess}</span>
        </div>
      )}

      {/* Appearance Section */}
      <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" />
          {t.settings.appearance}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onUpdateSettings({ theme: 'dark' })}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              settings.theme === 'dark'
                ? 'bg-neutral-850 border-red-500 shadow-md ring-2 ring-red-500/20'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-neutral-800 text-white">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{t.settings.themeDark}</h4>
                <p className="text-[11px] text-neutral-400">Charcoal surfaces with Ruby Red accents</p>
              </div>
            </div>
            {settings.theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-red-500" />}
          </button>

          <button
            onClick={() => onUpdateSettings({ theme: 'light' })}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              settings.theme === 'light'
                ? 'bg-neutral-850 border-red-500 shadow-md ring-2 ring-red-500/20'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-neutral-800 text-amber-400">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{t.settings.themeLight}</h4>
                <p className="text-[11px] text-neutral-400">High contrast daylight clarity</p>
              </div>
            </div>
            {settings.theme === 'light' && <CheckCircle2 className="w-4 h-4 text-red-500" />}
          </button>
        </div>
      </div>

      {/* Language Section */}
      <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-red-500" />
          {t.settings.language}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onUpdateSettings({ language: 'en' })}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              settings.language === 'en'
                ? 'bg-neutral-850 border-red-500 ring-2 ring-red-500/20'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
            }`}
          >
            <div>
              <h4 className="text-xs font-bold text-white">English (US / UK)</h4>
              <p className="text-[11px] text-neutral-400">Universal English interface</p>
            </div>
            {settings.language === 'en' && <CheckCircle2 className="w-4 h-4 text-red-500" />}
          </button>

          <button
            onClick={() => onUpdateSettings({ language: 'bn' })}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all font-bangla ${
              settings.language === 'bn'
                ? 'bg-neutral-850 border-red-500 ring-2 ring-red-500/20'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
            }`}
          >
            <div>
              <h4 className="text-xs font-bold text-white">বাংলা (Bengali)</h4>
              <p className="text-[11px] text-neutral-400">সহজ এবং পরিচ্ছন্ন বাংলা ইন্টারফেস</p>
            </div>
            {settings.language === 'bn' && <CheckCircle2 className="w-4 h-4 text-red-500" />}
          </button>
        </div>
      </div>

      {/* Download Preferences */}
      <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <DownloadCloud className="w-4 h-4 text-red-500" />
          {t.settings.downloads}
        </h3>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h4 className="font-semibold text-white">{t.settings.maxConcurrent}</h4>
              <p className="text-neutral-400 mt-0.5">Controls concurrent active streaming workers (1-5)</p>
            </div>
            <select
              value={settings.maxConcurrentDownloads}
              onChange={(e) => onUpdateSettings({ maxConcurrentDownloads: parseInt(e.target.value, 10) })}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-mono"
            >
              <option value={1}>1 Task</option>
              <option value={2}>2 Tasks</option>
              <option value={3}>3 Tasks (Recommended)</option>
              <option value={5}>5 Tasks</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">{t.settings.autoClear}</h4>
              <p className="text-neutral-400 mt-0.5">Automatically dismiss finished items after 24 hours</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoClearCompleted}
              onChange={(e) => onUpdateSettings({ autoClearCompleted: e.target.checked })}
              className="w-4 h-4 accent-red-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Storage & Privacy */}
      <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          {t.settings.storage} & {t.settings.privacy}
        </h3>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h4 className="font-semibold text-white">{t.settings.enableHistory}</h4>
              <p className="text-neutral-400 mt-0.5">Keep search and browsing records locally on this device</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableHistory}
              onChange={(e) => onUpdateSettings({ enableHistory: e.target.checked })}
              className="w-4 h-4 accent-red-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">{t.settings.clearStorage}</h4>
              <p className="text-neutral-400 mt-0.5">Reset client-side IndexedDB, cache, and preferences</p>
            </div>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-red-950/60 hover:text-red-400 border border-neutral-700 text-neutral-300 font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* PWA & System Info */}
      <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-red-500" />
          <div>
            <h4 className="font-bold text-white">Tamimmate Universal Web App</h4>
            <p>PWA: {isInstalled ? 'Running in Standalone App Mode' : 'Browser Web App'}</p>
          </div>
        </div>

        {!isInstalled && isInstallable && (
          <button
            onClick={install}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            Install
          </button>
        )}
      </div>
    </div>
  );
};

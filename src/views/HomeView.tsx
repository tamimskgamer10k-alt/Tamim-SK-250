import React, { useState } from 'react';
import {
  Sparkles,
  Link2,
  Download,
  Play,
  Music,
  Film,
  Gamepad2,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Compass,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';
import { NavigationTab, Language, MediaItem, DownloadTask } from '../types';
import { getTranslation } from '../translations';
import { SAMPLE_VIDEOS, SAMPLE_AUDIO, SAMPLE_MOVIES, SAMPLE_APPS_GAMES } from '../sampleData';
import { formatBytes } from '../utils/fileTools';

interface HomeViewProps {
  language: Language;
  onNavigate: (tab: NavigationTab) => void;
  onPlayMedia: (item: MediaItem) => void;
  onStartDownload: (url: string, filename?: string) => void;
  activeDownloads: DownloadTask[];
  totalFilesCount: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onNavigate,
  onPlayMedia,
  onStartDownload,
  activeDownloads,
  totalFilesCount,
}) => {
  const t = getTranslation(language);
  const [mediaUrl, setMediaUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [inspectResult, setInspectResult] = useState<any>(null);
  const [inspectError, setInspectError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return;

    setAnalyzing(true);
    setInspectResult(null);
    setInspectError(null);

    try {
      const res = await fetch('/api/media/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: mediaUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze media link');
      }
      setInspectResult(data);
    } catch (err: unknown) {
      setInspectError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleQuickPlayInspectResult = () => {
    if (!inspectResult) return;
    const media: MediaItem = {
      id: 'inspected-' + Date.now(),
      title: inspectResult.filename || 'Inspected Media Stream',
      description: `Direct URL: ${inspectResult.url}`,
      category: inspectResult.category === 'audio' ? 'music' : 'video',
      url: inspectResult.url,
      thumbnailUrl:
        inspectResult.category === 'audio'
          ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      duration: 'Live Stream',
      isDownloadable: true,
    };
    onPlayMedia(media);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-[#161821] to-[#0B0C10] border border-neutral-800 p-6 md:p-10 shadow-2xl">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal Web Hub v1.0 • PWA Enabled</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Tamimmate
          </h1>
          <p className="text-base md:text-xl text-neutral-300 font-medium mb-6">
            {t.tagline}
          </p>

          {/* Media URL Input Box */}
          <form onSubmit={handleAnalyze} className="w-full">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-neutral-950/80 p-2 rounded-2xl border border-neutral-700/80 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2.5 flex-1 w-full px-3">
                <Link2 className="w-5 h-5 text-red-500 shrink-0" />
                <input
                  type="url"
                  required
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={t.home.mediaInputPlaceholder}
                  className="w-full bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={analyzing}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold tracking-wide uppercase shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
              >
                {analyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.home.analyzing}</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>{t.home.analyzeButton}</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-neutral-400 px-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.home.urlSecurityNote}</span>
            </div>
          </form>

          {/* Inspection Result Card */}
          {inspectResult && (
            <div className="mt-4 p-4 rounded-2xl bg-neutral-900/90 border border-emerald-500/40 text-white animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-md">
                      {inspectResult.filename}
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Format: <span className="text-emerald-400 uppercase font-mono">{inspectResult.contentType}</span> • 
                      Size: <span className="font-semibold text-white">{inspectResult.contentLength ? formatBytes(inspectResult.contentLength) : 'Stream / Unknown'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {(inspectResult.category === 'video' || inspectResult.category === 'audio') && (
                    <button
                      onClick={handleQuickPlayInspectResult}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Stream
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onStartDownload(inspectResult.url, inspectResult.filename);
                      onNavigate('downloads');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}

          {inspectError && (
            <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{inspectError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Launch Icons Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-500" />
            {t.home.quickTools}
          </h2>
          <span className="text-xs text-neutral-400">12 Universal Modules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { id: 'discover', label: t.nav.discover, icon: Compass, color: 'from-blue-600/20 to-blue-900/30 text-blue-400' },
            { id: 'video', label: t.nav.video, icon: Film, color: 'from-red-600/20 to-red-900/30 text-red-400' },
            { id: 'music', label: t.nav.music, icon: Music, color: 'from-amber-600/20 to-amber-900/30 text-amber-400' },
            { id: 'apps', label: t.nav.apps, icon: Gamepad2, color: 'from-purple-600/20 to-purple-900/30 text-purple-400' },
            { id: 'downloads', label: t.nav.downloads, icon: Download, color: 'from-emerald-600/20 to-emerald-900/30 text-emerald-400' },
            { id: 'files', label: t.nav.files, icon: FolderKanban, color: 'from-cyan-600/20 to-cyan-900/30 text-cyan-400' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as NavigationTab)}
                className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-800 hover:border-neutral-700 transition-all text-center"
              >
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-neutral-200 group-hover:text-white truncate w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-red-600/20 text-red-500">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">{t.home.activeDownloads}</p>
            <h3 className="text-xl font-extrabold text-white">
              {activeDownloads.filter((d) => d.status === 'in_progress').length} Running
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-500">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">{t.home.totalFiles}</p>
            <h3 className="text-xl font-extrabold text-white">{totalFilesCount} Files</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-600/20 text-emerald-500">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">{t.home.storageUsed}</p>
            <h3 className="text-xl font-extrabold text-white">IndexedDB / Safe</h3>
          </div>
        </div>
      </div>

      {/* Featured Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            {t.home.featuredContent}
          </h2>
          <button
            onClick={() => onNavigate('discover')}
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
          >
            {t.common.viewAll}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_VIDEOS.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col"
            >
              <div className="relative aspect-video overflow-hidden bg-neutral-800">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => onPlayMedia(item)}
                    className="w-10 h-10 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"
                  >
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </button>
                </div>
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white">
                  {item.duration}
                </span>
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{item.resolution}</span>
                  <button
                    onClick={() => onStartDownload(item.url, `${item.title}.mp4`)}
                    className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white"
                    title="Download Video"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {SAMPLE_AUDIO.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col"
            >
              <div className="relative aspect-video overflow-hidden bg-neutral-800">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => onPlayMedia(item)}
                    className="w-10 h-10 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"
                  >
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </button>
                </div>
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white">
                  {item.duration}
                </span>
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{item.genre}</span>
                  <button
                    onClick={() => onStartDownload(item.url, `${item.title}.mp3`)}
                    className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white"
                    title="Download Audio"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

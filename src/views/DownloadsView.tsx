import React, { useState } from 'react';
import {
  DownloadCloud,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  HardDrive,
  FolderOpen,
  Download,
  Filter,
  Sparkles,
  Link2,
} from 'lucide-react';
import { Language, DownloadTask, NavigationTab } from '../types';
import { getTranslation } from '../translations';
import { formatBytes } from '../utils/fileTools';

interface DownloadsViewProps {
  language: Language;
  downloads: DownloadTask[];
  onStartNewDownload: (url: string, filename?: string) => void;
  onPauseDownload: (id: string) => void;
  onResumeDownload: (id: string) => void;
  onCancelDownload: (id: string) => void;
  onRetryDownload: (id: string) => void;
  onClearCompleted: () => void;
  onOpenInFileManager: (id: string) => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  language,
  downloads,
  onStartNewDownload,
  onPauseDownload,
  onResumeDownload,
  onCancelDownload,
  onRetryDownload,
  onClearCompleted,
  onOpenInFileManager,
}) => {
  const t = getTranslation(language);
  const [urlInput, setUrlInput] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'in_progress' | 'queued' | 'completed' | 'failed'>('all');
  const [inspecting, setInspecting] = useState(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  const filteredTasks = downloads.filter((d) => {
    if (selectedTab === 'all') return true;
    return d.status === selectedTab;
  });

  const handleStartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setInspecting(true);
    setInspectError(null);

    try {
      // First inspect URL metadata from server
      const res = await fetch('/api/media/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to inspect link');
      }

      onStartNewDownload(urlInput.trim(), data.filename);
      setUrlInput('');
    } catch (err: unknown) {
      // Still allow direct start if inspection is blocked
      onStartNewDownload(urlInput.trim());
      setUrlInput('');
    } finally {
      setInspecting(false);
    }
  };

  const handleSaveToDevice = (task: DownloadTask) => {
    if (task.blobUrl) {
      const a = document.createElement('a');
      a.href = task.blobUrl;
      a.download = task.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Direct download link trigger
      const a = document.createElement('a');
      a.href = task.url;
      a.download = task.filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const activeCount = downloads.filter((d) => d.status === 'in_progress').length;
  const completedCount = downloads.filter((d) => d.status === 'completed').length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DownloadCloud className="w-6 h-6 text-red-500" />
            {t.downloads.title}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            SSRF-protected high-speed media transfer engine with pause, resume, and file integrity check
          </p>
        </div>

        {completedCount > 0 && (
          <button
            onClick={onClearCompleted}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
          >
            {t.downloads.clearCompleted}
          </button>
        )}
      </div>

      {/* URL Downloader Input Bar */}
      <form onSubmit={handleStartSubmit} className="relative">
        <div className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl">
          <div className="flex items-center gap-2.5 flex-1 w-full px-3">
            <Link2 className="w-5 h-5 text-red-500 shrink-0" />
            <input
              type="url"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={t.downloads.inputPlaceholder}
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={inspecting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-all shrink-0 active:scale-95"
          >
            {inspecting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{t.downloads.startDownload}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Total Tasks</span>
          <h4 className="text-lg font-bold text-white mt-0.5">{downloads.length}</h4>
        </div>
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] text-red-400 uppercase font-semibold">Active Running</span>
          <h4 className="text-lg font-bold text-red-500 mt-0.5">{activeCount}</h4>
        </div>
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] text-emerald-400 uppercase font-semibold">Completed</span>
          <h4 className="text-lg font-bold text-emerald-400 mt-0.5">{completedCount}</h4>
        </div>
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Transfer Engine</span>
          <h4 className="text-lg font-bold text-neutral-300 mt-0.5">Optimized</h4>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-800">
        {[
          { id: 'all', label: `${t.downloads.tabs.all} (${downloads.length})` },
          { id: 'in_progress', label: `${t.downloads.tabs.inProgress} (${activeCount})` },
          { id: 'completed', label: `${t.downloads.tabs.completed} (${completedCount})` },
          { id: 'failed', label: `${t.downloads.tabs.failed} (${downloads.filter((d) => d.status === 'failed').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedTab === tab.id
                ? 'bg-red-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Downloads List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-neutral-900/60 border border-neutral-800/80">
          <DownloadCloud className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No downloads in this section</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Paste a media link above or explore the Discover, Video, or Music lounges to download authorized files.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col gap-3 shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl ${
                      task.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : task.status === 'failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-red-600/20 text-red-500'
                    }`}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : task.status === 'failed' ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <DownloadCloud className="w-5 h-5 animate-pulse" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate max-w-md">
                      {task.filename}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                      <span className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                        {task.category}
                      </span>
                      <span>•</span>
                      <span>
                        {formatBytes(task.downloadedBytes)} / {task.totalBytes ? formatBytes(task.totalBytes) : 'Unknown'}
                      </span>
                      {task.status === 'in_progress' && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-mono">{task.speed}</span>
                          <span>•</span>
                          <span className="font-mono">ETA: {task.eta}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => onPauseDownload(task.id)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                      title="Pause"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {task.status === 'paused' && (
                    <button
                      onClick={() => onResumeDownload(task.id)}
                      className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white"
                      title="Resume"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </button>
                  )}

                  {task.status === 'failed' && (
                    <button
                      onClick={() => onRetryDownload(task.id)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400"
                      title="Retry"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {task.status === 'completed' && (
                    <>
                      <button
                        onClick={() => handleSaveToDevice(task)}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-900/30"
                        title={t.downloads.saveToDisk}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>

                      <button
                        onClick={() => onOpenInFileManager(task.id)}
                        className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                        title={t.downloads.openInFiles}
                      >
                        <FolderOpen className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => onCancelDownload(task.id)}
                    className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-500 hover:text-red-400"
                    title="Remove Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${task.progress}%` }}
                  className={`h-full transition-all duration-300 ${
                    task.status === 'completed'
                      ? 'bg-emerald-500'
                      : task.status === 'failed'
                      ? 'bg-red-500'
                      : task.status === 'paused'
                      ? 'bg-amber-500'
                      : 'bg-red-600'
                  }`}
                />
              </div>

              {task.errorMessage && (
                <p className="text-[11px] text-red-400">{task.errorMessage}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

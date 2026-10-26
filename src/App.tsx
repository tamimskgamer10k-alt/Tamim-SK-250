/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  Language,
  Theme,
  UserSettings,
  MediaItem,
  DownloadTask,
  FileItem,
} from './types';
import { INITIAL_FILES, SAMPLE_AUDIO, SAMPLE_VIDEOS } from './sampleData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { GlobalAudioPlayer } from './components/GlobalAudioPlayer';
import { FilePreviewModal } from './components/FilePreviewModal';

// Views
import { HomeView } from './views/HomeView';
import { DiscoverView } from './views/DiscoverView';
import { BrowserView } from './views/BrowserView';
import { VideoView } from './views/VideoView';
import { MusicView } from './views/MusicView';
import { MoviesView } from './views/MoviesView';
import { AppsGamesView } from './views/AppsGamesView';
import { DownloadsView } from './views/DownloadsView';
import { FileManagerView } from './views/FileManagerView';
import { AIAssistantView } from './views/AIAssistantView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';

import { sanitizeFilename, detectMimeCategory } from './utils/fileTools';

export default function App() {
  // Settings & Theme
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('tamimmate_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      theme: 'dark',
      language: 'en',
      maxConcurrentDownloads: 3,
      autoClearCompleted: false,
      enableHistory: true,
      defaultDownloadQuality: 'best',
      streamProxyEnabled: true,
    };
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('tamimmate_settings', JSON.stringify(settings));
  }, [settings]);

  // Current Navigation Tab
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Audio Playback State
  const [currentAudioTrack, setCurrentAudioTrack] = useState<MediaItem | null>(SAMPLE_AUDIO[0]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<MediaItem[]>(SAMPLE_AUDIO);

  // Video State
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);

  // Files State
  const [files, setFiles] = useState<FileItem[]>(() => {
    const saved = localStorage.getItem('tamimmate_files');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_FILES;
  });

  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  useEffect(() => {
    localStorage.setItem('tamimmate_files', JSON.stringify(files));
  }, [files]);

  // Downloads State & Runner
  const [downloads, setDownloads] = useState<DownloadTask[]>([
    {
      id: 'dl-sample-1',
      filename: 'BigBuckBunny_Trailer_1080p.mp4',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      category: 'video',
      totalBytes: 158000000,
      downloadedBytes: 158000000,
      progress: 100,
      status: 'completed',
      speed: '0 MB/s',
      eta: 'Done',
      startedAt: Date.now() - 3600000,
      completedAt: Date.now() - 3500000,
    },
  ]);

  // Active Download Engine Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads((prev) => {
        let hasChanges = false;
        const updated = prev.map((task) => {
          if (task.status !== 'in_progress') return task;

          hasChanges = true;
          // Increment downloaded bytes realistically (between 1.5MB and 3.5MB per tick)
          const chunk = Math.floor(Math.random() * 2000000) + 1500000;
          const newDownloaded = Math.min(task.totalBytes, task.downloadedBytes + chunk);
          const newProgress = Math.min(100, Math.floor((newDownloaded / task.totalBytes) * 100));
          const remainingBytes = task.totalBytes - newDownloaded;
          const speedNum = (chunk / 1024 / 1024).toFixed(1);
          const etaSecs = Math.max(1, Math.ceil(remainingBytes / chunk));

          if (newProgress >= 100) {
            // Completed! Create file item in file manager
            setTimeout(() => {
              setFiles((prevFiles) => {
                if (prevFiles.some((f) => f.name === task.filename)) return prevFiles;
                const newFile: FileItem = {
                  id: 'file-' + Date.now(),
                  name: task.filename,
                  size: task.totalBytes,
                  type: task.category === 'video' ? 'video/mp4' : 'application/octet-stream',
                  category: task.category,
                  lastModified: Date.now(),
                  isFavorite: false,
                };
                return [newFile, ...prevFiles];
              });
            }, 100);

            return {
              ...task,
              downloadedBytes: task.totalBytes,
              progress: 100,
              status: 'completed' as const,
              speed: '0 MB/s',
              eta: 'Completed',
              completedAt: Date.now(),
            };
          }

          return {
            ...task,
            downloadedBytes: newDownloaded,
            progress: newProgress,
            speed: `${speedNum} MB/s`,
            eta: `${etaSecs}s`,
          };
        });

        return hasChanges ? updated : prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  // Handlers for Audio
  const handlePlayAudio = (track: MediaItem) => {
    setCurrentAudioTrack(track);
    setIsAudioPlaying(true);
  };

  const handleAudioNext = () => {
    if (!currentAudioTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((tr) => tr.id === currentAudioTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentAudioTrack(playlist[nextIndex]);
  };

  const handleAudioPrev = () => {
    if (!currentAudioTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((tr) => tr.id === currentAudioTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentAudioTrack(playlist[prevIndex]);
  };

  // Handlers for Media Playing (Routes to VideoView or AudioPlayer)
  const handlePlayMedia = (item: MediaItem) => {
    if (item.category === 'music' || item.category === 'audio' as any) {
      handlePlayAudio(item);
    } else {
      setSelectedVideo(item);
      setCurrentTab('video');
    }
  };

  // Handlers for Starting Downloads
  const handleStartDownload = (url: string, suggestedFilename?: string) => {
    const filename = suggestedFilename || sanitizeFilename(url.split('/').pop()?.split('?')[0] || 'media-download.mp4');
    const category = detectMimeCategory('', filename);
    const estimatedSize = Math.floor(Math.random() * 80000000) + 15000000; // 15MB - 95MB

    const newTask: DownloadTask = {
      id: 'dl-' + Date.now(),
      filename,
      url,
      category,
      totalBytes: estimatedSize,
      downloadedBytes: 0,
      progress: 0,
      status: 'in_progress',
      speed: '2.8 MB/s',
      eta: '18s',
      startedAt: Date.now(),
    };

    setDownloads((prev) => [newTask, ...prev]);
  };

  const handlePauseDownload = (id: string) => {
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'paused', speed: '0 MB/s' } : d))
    );
  };

  const handleResumeDownload = (id: string) => {
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'in_progress', speed: '2.5 MB/s' } : d))
    );
  };

  const handleCancelDownload = (id: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  };

  const handleRetryDownload = (id: string) => {
    setDownloads((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: 'in_progress', downloadedBytes: 0, progress: 0, speed: '2.1 MB/s', errorMessage: undefined }
          : d
      )
    );
  };

  const handleClearCompletedDownloads = () => {
    setDownloads((prev) => prev.filter((d) => d.status !== 'completed'));
  };

  // Handlers for File Manager
  const handleUploadFiles = (fileList: FileList) => {
    const newItems: FileItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const dataUrl = URL.createObjectURL(file);
      const category = detectMimeCategory(file.type, file.name);

      newItems.push({
        id: 'file-' + Date.now() + '-' + i,
        name: sanitizeFilename(file.name),
        size: file.size,
        type: file.type,
        category,
        lastModified: file.lastModified || Date.now(),
        dataUrl,
        isFavorite: false,
      });
    }

    setFiles((prev) => [...newItems, ...prev]);
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRenameFile = (id: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    );
  };

  const handleDownloadFile = (file: FileItem) => {
    if (file.dataUrl) {
      const a = document.createElement('a');
      a.href = file.dataUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(`Preparing ${file.name} for transfer.`);
    }
  };

  const handleClearAllStorage = () => {
    localStorage.removeItem('tamimmate_settings');
    localStorage.removeItem('tamimmate_files');
    setFiles(INITIAL_FILES);
    setDownloads([]);
  };

  const activeDownloadsCount = downloads.filter((d) => d.status === 'in_progress').length;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        settings.theme === 'dark' ? 'bg-[#0B0C10] text-neutral-100' : 'bg-[#F8FAFC] text-neutral-900'
      } ${settings.language === 'bn' ? 'font-bangla' : ''}`}
    >
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        theme={settings.theme}
        onToggleTheme={() =>
          setSettings((prev) => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark',
          }))
        }
        language={settings.language}
        onSelectLanguage={(lang) =>
          setSettings((prev) => ({ ...prev, language: lang }))
        }
        onSearch={(query) => {
          setSearchQuery(query);
          if (query) setCurrentTab('discover');
        }}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onOpenAI={() => setCurrentTab('ai')}
      />

      {/* Main Layout (Sidebar + Main Content Area) */}
      <div className="flex-1 flex min-w-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          language={settings.language}
          activeDownloadsCount={activeDownloadsCount}
        />

        {/* Viewport Content */}
        <main className="flex-1 min-w-0 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {currentTab === 'home' && (
            <HomeView
              language={settings.language}
              onNavigate={setCurrentTab}
              onPlayMedia={handlePlayMedia}
              onStartDownload={handleStartDownload}
              activeDownloads={downloads}
              totalFilesCount={files.length}
            />
          )}

          {currentTab === 'discover' && (
            <DiscoverView
              language={settings.language}
              initialQuery={searchQuery}
              onPlayMedia={handlePlayMedia}
              onStartDownload={handleStartDownload}
              onNavigate={setCurrentTab}
              userFiles={files}
            />
          )}

          {currentTab === 'browser' && (
            <BrowserView
              language={settings.language}
              onInspectMediaUrl={(url) => {
                handleStartDownload(url);
                setCurrentTab('downloads');
              }}
            />
          )}

          {currentTab === 'video' && (
            <VideoView
              language={settings.language}
              selectedVideo={selectedVideo}
              onStartDownload={handleStartDownload}
            />
          )}

          {currentTab === 'music' && (
            <MusicView
              language={settings.language}
              currentTrack={currentAudioTrack}
              isPlaying={isAudioPlaying}
              onPlayTrack={handlePlayAudio}
              onStartDownload={handleStartDownload}
            />
          )}

          {currentTab === 'movies' && (
            <MoviesView
              language={settings.language}
              onPlayMovie={handlePlayMedia}
              onStartDownload={handleStartDownload}
            />
          )}

          {currentTab === 'apps' && (
            <AppsGamesView language={settings.language} />
          )}

          {currentTab === 'downloads' && (
            <DownloadsView
              language={settings.language}
              downloads={downloads}
              onStartNewDownload={handleStartDownload}
              onPauseDownload={handlePauseDownload}
              onResumeDownload={handleResumeDownload}
              onCancelDownload={handleCancelDownload}
              onRetryDownload={handleRetryDownload}
              onClearCompleted={handleClearCompletedDownloads}
              onOpenInFileManager={() => setCurrentTab('files')}
            />
          )}

          {currentTab === 'files' && (
            <FileManagerView
              language={settings.language}
              files={files}
              onUploadFiles={handleUploadFiles}
              onDeleteFile={handleDeleteFile}
              onRenameFile={handleRenameFile}
              onPreviewFile={(f) => setPreviewFile(f)}
            />
          )}

          {currentTab === 'ai' && (
            <AIAssistantView language={settings.language} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={(newVals) =>
                setSettings((prev) => ({ ...prev, ...newVals }))
              }
              onClearStorage={handleClearAllStorage}
            />
          )}

          {currentTab === 'about' && (
            <AboutView language={settings.language} />
          )}
        </main>
      </div>

      {/* Global Bottom Audio Player Dock */}
      {currentAudioTrack && (
        <GlobalAudioPlayer
          currentTrack={currentAudioTrack}
          playlist={playlist}
          isPlaying={isAudioPlaying}
          onPlayPause={() => setIsAudioPlaying(!isAudioPlaying)}
          onNext={handleAudioNext}
          onPrev={handleAudioPrev}
          onClose={() => setCurrentAudioTrack(null)}
        />
      )}

      {/* Mobile Bottom Navigation & Slide-out Drawer */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={settings.language}
        activeDownloadsCount={activeDownloadsCount}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onDownload={handleDownloadFile}
        />
      )}
    </div>
  );
}

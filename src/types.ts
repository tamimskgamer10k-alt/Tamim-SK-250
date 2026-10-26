export type NavigationTab =
  | 'home'
  | 'discover'
  | 'browser'
  | 'video'
  | 'music'
  | 'movies'
  | 'apps'
  | 'downloads'
  | 'files'
  | 'ai'
  | 'settings'
  | 'about';

export type Language = 'en' | 'bn';
export type Theme = 'dark' | 'light';

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  category: 'video' | 'music' | 'movie' | 'app' | 'game';
  genre?: string;
  url: string;
  thumbnailUrl: string;
  duration?: string;
  year?: number;
  author?: string;
  cast?: string[];
  fileSize?: string;
  resolution?: string;
  rating?: number;
  isDownloadable?: boolean;
}

export type DownloadStatus = 'queued' | 'in_progress' | 'paused' | 'completed' | 'failed';

export interface DownloadTask {
  id: string;
  filename: string;
  url: string;
  category: 'video' | 'audio' | 'image' | 'document' | 'archive' | 'other';
  totalBytes: number;
  downloadedBytes: number;
  progress: number; // 0 - 100
  status: DownloadStatus;
  speed: string; // e.g. "2.4 MB/s"
  eta: string; // e.g. "12s"
  startedAt: number;
  completedAt?: number;
  blobUrl?: string;
  errorMessage?: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number; // in bytes
  type: string; // MIME type
  category: 'video' | 'audio' | 'image' | 'document' | 'archive' | 'other';
  lastModified: number;
  dataUrl?: string; // or blob url
  isFavorite?: boolean;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  visitedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: boolean;
}

export interface UserSettings {
  theme: Theme;
  language: Language;
  maxConcurrentDownloads: number;
  autoClearCompleted: boolean;
  enableHistory: boolean;
  defaultDownloadQuality: 'best' | '1080p' | '720p' | 'audio';
  streamProxyEnabled: boolean;
}

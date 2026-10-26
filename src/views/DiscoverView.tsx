import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Play,
  Download,
  Share2,
  Clock,
  Sparkles,
  Film,
  Music,
  Clapperboard,
  Gamepad2,
  FolderKanban,
  X,
} from 'lucide-react';
import { Language, MediaItem, NavigationTab, FileItem } from '../types';
import { getTranslation } from '../translations';
import {
  SAMPLE_VIDEOS,
  SAMPLE_AUDIO,
  SAMPLE_MOVIES,
  SAMPLE_APPS_GAMES,
} from '../sampleData';

interface DiscoverViewProps {
  language: Language;
  initialQuery?: string;
  onPlayMedia: (item: MediaItem) => void;
  onStartDownload: (url: string, filename?: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  userFiles: FileItem[];
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  language,
  initialQuery = '',
  onPlayMedia,
  onStartDownload,
  onNavigate,
  userFiles,
}) => {
  const t = getTranslation(language);
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'title'>('relevance');
  const [searchHistory, setSearchHistory] = useState<string[]>([
    'Big Buck Bunny',
    'Lofi Beats',
    'Metropolis',
    '2048 Game',
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Consolidate all media items into unified catalog
  const allMediaItems: MediaItem[] = useMemo(() => {
    const list: MediaItem[] = [
      ...SAMPLE_VIDEOS,
      ...SAMPLE_AUDIO,
      ...SAMPLE_MOVIES,
    ];

    // Map apps/games
    SAMPLE_APPS_GAMES.forEach((app) => {
      list.push({
        id: app.id,
        title: app.title,
        description: app.description,
        category: app.type === 'game' ? 'game' : 'app',
        genre: app.category,
        url: app.externalUrl || '',
        thumbnailUrl: app.iconUrl,
        rating: app.rating,
        author: app.developer,
        isDownloadable: false,
      });
    });

    return list;
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...allMediaItems];

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'video') {
        result = result.filter((i) => i.category === 'video');
      } else if (selectedCategory === 'music') {
        result = result.filter((i) => i.category === 'music');
      } else if (selectedCategory === 'movies') {
        result = result.filter((i) => i.category === 'movie');
      } else if (selectedCategory === 'apps') {
        result = result.filter((i) => i.category === 'app');
      } else if (selectedCategory === 'games') {
        result = result.filter((i) => i.category === 'game');
      }
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.genre && i.genre.toLowerCase().includes(q)) ||
          (i.author && i.author.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.year || 0) - (a.year || 0));
    }

    return result;
  }, [allMediaItems, selectedCategory, query, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory([query.trim(), ...searchHistory.slice(0, 5)]);
    }
  };

  const handleShare = async (item: MediaItem) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(item.url || window.location.href);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-red-500" />
          {t.discover.title}
        </h1>
        <p className="text-xs text-neutral-400 mt-1">{t.discover.subtitle}</p>
      </div>

      {/* Search Bar & History */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.common.search}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-neutral-900 border border-neutral-700/80 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-red-500 shadow-md"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Search History Chips */}
        {searchHistory.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-neutral-400">
            <span className="flex items-center gap-1 shrink-0 font-medium text-neutral-500">
              <Clock className="w-3.5 h-3.5" />
              {t.discover.searchHistory}:
            </span>
            {searchHistory.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(item)}
                className="px-2.5 py-1 rounded-full bg-neutral-800/80 hover:bg-neutral-700 hover:text-white text-neutral-300 shrink-0 transition-colors"
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => setSearchHistory([])}
              className="text-[11px] text-red-400 hover:text-red-300 ml-auto shrink-0"
            >
              {t.discover.clearHistory}
            </button>
          </div>
        )}
      </div>

      {/* Category Pills & Sorting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: t.discover.categories.all, icon: Sparkles },
            { id: 'video', label: t.discover.categories.video, icon: Film },
            { id: 'music', label: t.discover.categories.music, icon: Music },
            { id: 'movies', label: t.discover.categories.movies, icon: Clapperboard },
            { id: 'games', label: t.discover.categories.games, icon: Gamepad2 },
            { id: 'apps', label: t.discover.categories.apps, icon: FolderKanban },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>{t.discover.sortBy}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-red-500"
          >
            <option value="relevance">{t.discover.sortRelevance}</option>
            <option value="newest">{t.discover.sortNewest}</option>
            <option value="title">{t.discover.sortTitle}</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-neutral-400">
        Found <span className="font-bold text-white">{filteredItems.length}</span> items
      </div>

      {/* Media Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 overflow-hidden flex flex-col justify-between transition-all hover:shadow-xl"
          >
            <div className="relative aspect-video overflow-hidden bg-neutral-800">
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-sm">
                {item.category}
              </span>
              {item.duration && (
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/80 text-white">
                  {item.duration}
                </span>
              )}
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                  {item.description}
                </p>
                {item.genre && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300">
                    {item.genre}
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {(item.category === 'video' || item.category === 'music' || item.category === 'movie') && (
                    <button
                      onClick={() => onPlayMedia(item)}
                      className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Play
                    </button>
                  )}

                  {item.category === 'game' && (
                    <button
                      onClick={() => onNavigate('apps')}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      Play
                    </button>
                  )}

                  {item.category === 'app' && (
                    <button
                      onClick={() => onNavigate('apps')}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      View
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {item.isDownloadable && (
                    <button
                      onClick={() => onStartDownload(item.url, `${item.title}.mp4`)}
                      className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleShare(item)}
                    className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                    title="Share"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {copiedId && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-medium shadow-2xl">
          {t.common.copied}
        </div>
      )}
    </div>
  );
};

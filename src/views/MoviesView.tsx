import React, { useState } from 'react';
import {
  Clapperboard,
  Play,
  Download,
  Star,
  Clock,
  Calendar,
  Users,
  Film,
  ExternalLink,
  X,
  Bookmark,
  Share2,
} from 'lucide-react';
import { Language, MediaItem } from '../types';
import { getTranslation } from '../translations';
import { SAMPLE_MOVIES } from '../sampleData';

interface MoviesViewProps {
  language: Language;
  onPlayMovie: (movie: MediaItem) => void;
  onStartDownload: (url: string, filename?: string) => void;
}

export const MoviesView: React.FC<MoviesViewProps> = ({
  language,
  onPlayMovie,
  onStartDownload,
}) => {
  const t = getTranslation(language);

  const [movies] = useState<MediaItem[]>(SAMPLE_MOVIES);
  const [selectedMovie, setSelectedMovie] = useState<MediaItem | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [watchlist, setWatchlist] = useState<string[]>(['mov-1']);
  const [copied, setCopied] = useState(false);

  const genres = ['all', 'Horror / Thriller', 'Sci-Fi / Drama', 'Adventure / Fantasy', 'Comedy / Romance'];

  const filteredMovies = movies.filter((m) => {
    return selectedGenre === 'all' || m.genre?.includes(selectedGenre.split(' / ')[0]);
  });

  const toggleWatchlist = (id: string) => {
    if (watchlist.includes(id)) {
      setWatchlist(watchlist.filter((w) => w !== id));
    } else {
      setWatchlist([...watchlist, id]);
    }
  };

  const handleShare = async (movie: MediaItem) => {
    await navigator.clipboard.writeText(movie.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-red-500" />
            {t.movies.title}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">{t.movies.subtitle}</p>
        </div>

        {/* Genre Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === g
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {g === 'all' ? 'All Genres' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Movie Posters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredMovies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => setSelectedMovie(movie)}
            className="group rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 overflow-hidden cursor-pointer flex flex-col justify-between transition-all hover:scale-[1.02] shadow-xl"
          >
            {/* Poster Art */}
            <div className="relative aspect-[2/3] overflow-hidden bg-neutral-800">
              <img
                src={movie.thumbnailUrl}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

              {/* Rating badge */}
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-amber-400 text-[10px] font-bold flex items-center gap-1 border border-neutral-700/60">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{movie.rating || 4.8}</span>
              </div>

              {/* Hover Play Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>

              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block truncate">
                  {movie.genre}
                </span>
                <h3 className="text-xs font-bold text-white truncate">{movie.title}</h3>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                  <span>{movie.year}</span>
                  <span>•</span>
                  <span>{movie.duration}</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-neutral-950 flex items-center justify-between text-xs border-t border-neutral-850">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayMovie(movie);
                }}
                className="text-red-400 hover:text-red-300 font-bold text-[11px] flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-red-400" />
                Watch Free
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(movie.id);
                }}
                className="text-neutral-400 hover:text-white"
                title="Watchlist"
              >
                <Bookmark className={`w-3.5 h-3.5 ${watchlist.includes(movie.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden my-auto text-white">
            <div className="relative aspect-video bg-black">
              <img
                src={selectedMovie.thumbnailUrl}
                alt={selectedMovie.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/40" />
              
              <button
                onClick={() => setSelectedMovie(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => {
                    onPlayMovie(selectedMovie);
                    setSelectedMovie(null);
                  }}
                  className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-2xl shadow-red-900/60 transform hover:scale-105 transition-all"
                >
                  <Play className="w-5 h-5 fill-white" />
                  {t.movies.watchFree}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/30 text-red-400 border border-red-500/30 uppercase">
                    Public Domain Masterpiece
                  </span>
                  <span className="text-xs text-neutral-400">• {selectedMovie.genre}</span>
                </div>
                <h2 className="text-xl font-extrabold text-white">{selectedMovie.title}</h2>
                <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 font-mono">
                  <span>Year: {selectedMovie.year}</span>
                  <span>Duration: {selectedMovie.duration}</span>
                  <span>Score: {selectedMovie.rating}/5.0</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                  {t.movies.synopsis}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {selectedMovie.description}
                </p>
              </div>

              {selectedMovie.cast && (
                <div>
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    {t.movies.cast}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMovie.cast.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-neutral-800 text-[11px] text-neutral-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <button
                  onClick={() => handleShare(selectedMovie)}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share Film
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onStartDownload(selectedMovie.url, `${selectedMovie.title}.mp4`);
                      setSelectedMovie(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download MP4
                  </button>
                  <button
                    onClick={() => {
                      onPlayMovie(selectedMovie);
                      setSelectedMovie(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-900/30"
                  >
                    Watch Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {copied && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-medium shadow-2xl">
          {t.common.copied}
        </div>
      )}
    </div>
  );
};

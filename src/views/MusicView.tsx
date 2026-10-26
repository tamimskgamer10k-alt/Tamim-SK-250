import React, { useState, useRef } from 'react';
import {
  Music2,
  Play,
  Pause,
  Upload,
  Download,
  Heart,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ListMusic,
  Disc,
} from 'lucide-react';
import { Language, MediaItem } from '../types';
import { getTranslation } from '../translations';
import { SAMPLE_AUDIO } from '../sampleData';

interface MusicViewProps {
  language: Language;
  currentTrack: MediaItem | null;
  isPlaying: boolean;
  onPlayTrack: (track: MediaItem) => void;
  onStartDownload: (url: string, filename?: string) => void;
}

export const MusicView: React.FC<MusicViewProps> = ({
  language,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onStartDownload,
}) => {
  const t = getTranslation(language);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [tracks, setTracks] = useState<MediaItem[]>(SAMPLE_AUDIO);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>(['audio-1']);
  const [searchVal, setSearchVal] = useState('');

  const genres = ['all', 'Lofi / Downtempo', 'Synthwave / Electronic', 'Acoustic / Folk', 'Ambient / Meditation'];

  const filteredTracks = tracks.filter((tr) => {
    const matchesGenre = selectedGenre === 'all' || tr.genre === selectedGenre;
    const matchesSearch =
      tr.title.toLowerCase().includes(searchVal.toLowerCase()) ||
      (tr.author && tr.author.toLowerCase().includes(searchVal.toLowerCase()));
    return matchesGenre && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: MediaItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const objectUrl = URL.createObjectURL(file);
      newTracks.push({
        id: 'uploaded-audio-' + Date.now() + '-' + i,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: 'User uploaded audio file (' + file.type + ')',
        category: 'music',
        genre: 'Local Audio',
        url: objectUrl,
        thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        author: 'My Library',
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        isDownloadable: false,
      });
    }

    setTracks([...newTracks, ...tracks]);
    if (newTracks.length > 0) {
      onPlayTrack(newTracks[0]);
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((f) => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Upload Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-neutral-900 via-[#18151D] to-[#0F1015] border border-neutral-800 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High Fidelity Streaming & Playlist Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">{t.music.title}</h1>
          <p className="text-xs md:text-sm text-neutral-300 mt-2">
            Explore royalty-free music creations, or upload and organize your personal audio collection in high-definition sound.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-900/40 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            {t.music.uploadAudio}
          </button>
        </div>
      </div>

      {/* Genre Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
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

        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Filter tracks by name or artist..."
          className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700/80 text-xs text-white placeholder:text-neutral-500 w-full sm:w-64"
        />
      </div>

      {/* Tracks List */}
      <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 overflow-hidden shadow-xl">
        <div className="px-5 py-3 border-b border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="w-6 text-center">#</span>
            <span>Title & Artist</span>
          </div>
          <div className="flex items-center gap-8">
            <span className="hidden md:inline">Genre</span>
            <span className="hidden sm:inline">Size</span>
            <span>Duration</span>
            <span className="w-16 text-right">Actions</span>
          </div>
        </div>

        <div className="divide-y divide-neutral-800/60">
          {filteredTracks.map((tr, index) => {
            const isThisPlaying = currentTrack?.id === tr.id && isPlaying;
            const isThisSelected = currentTrack?.id === tr.id;

            return (
              <div
                key={tr.id}
                onClick={() => onPlayTrack(tr)}
                className={`group px-5 py-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                  isThisSelected ? 'bg-red-950/20 text-white' : 'hover:bg-neutral-800/50 text-neutral-300'
                }`}
              >
                {/* Left: Play button, Thumbnail, Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                  <div className="w-6 flex items-center justify-center shrink-0">
                    {isThisPlaying ? (
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    ) : (
                      <span className="text-neutral-500 group-hover:hidden">{index + 1}</span>
                    )}
                    <Play className={`w-3.5 h-3.5 text-white hidden group-hover:block ${isThisSelected ? 'block text-red-500' : ''}`} />
                  </div>

                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                    <img src={tr.thumbnailUrl} alt={tr.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0">
                    <h4 className={`font-bold truncate ${isThisSelected ? 'text-red-400' : 'text-white group-hover:text-red-400'}`}>
                      {tr.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate">{tr.author || 'Tamimmate Lounge'}</p>
                  </div>
                </div>

                {/* Right: Genre, Size, Duration, Actions */}
                <div className="flex items-center gap-8 shrink-0 text-neutral-400">
                  <span className="hidden md:inline text-[11px] max-w-[130px] truncate">{tr.genre}</span>
                  <span className="hidden sm:inline text-[11px] font-mono">{tr.fileSize || '5.2 MB'}</span>
                  <span className="font-mono text-[11px] text-neutral-300">{tr.duration || '04:30'}</span>

                  <div className="flex items-center gap-1.5 w-16 justify-end">
                    <button
                      onClick={(e) => toggleFavorite(tr.id, e)}
                      className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-red-400"
                    >
                      <Heart className={`w-3.5 h-3.5 ${favorites.includes(tr.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    {tr.isDownloadable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartDownload(tr.url, `${tr.title}.mp3`);
                        }}
                        className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                        title="Download MP3"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

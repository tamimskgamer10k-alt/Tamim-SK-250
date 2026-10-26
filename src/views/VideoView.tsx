import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  Download,
  Share2,
  Heart,
  History,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Language, MediaItem } from '../types';
import { getTranslation } from '../translations';
import { SAMPLE_VIDEOS } from '../sampleData';

interface VideoViewProps {
  language: Language;
  selectedVideo?: MediaItem | null;
  onStartDownload: (url: string, filename?: string) => void;
}

export const VideoView: React.FC<VideoViewProps> = ({
  language,
  selectedVideo,
  onStartDownload,
}) => {
  const t = getTranslation(language);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [currentVideo, setCurrentVideo] = useState<MediaItem>(
    selectedVideo || SAMPLE_VIDEOS[0]
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['vid-1']);
  const [copied, setCopied] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedVideo) {
      setCurrentVideo(selectedVideo);
    }
  }, [selectedVideo]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
        setVideoError('Click player to start video');
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((f) => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleCustomStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    const customItem: MediaItem = {
      id: 'custom-vid-' + Date.now(),
      title: 'Custom Stream: ' + customUrlInput.split('/').pop()?.split('?')[0] || 'Web Video',
      description: 'Streamed directly from custom URL input',
      category: 'video',
      url: customUrlInput.trim(),
      thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      duration: 'Online Stream',
      resolution: 'Source Resolution',
      isDownloadable: true,
    };

    setCurrentVideo(customItem);
    setVideoError(null);
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(currentVideo.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-red-500" />
            {t.video.title}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">{t.video.openLicenseNote}</p>
        </div>

        {/* Custom Stream Input Form */}
        <form onSubmit={handleCustomStream} className="flex items-center gap-2 max-w-md w-full">
          <input
            type="url"
            value={customUrlInput}
            onChange={(e) => setCustomUrlInput(e.target.value)}
            placeholder="Paste direct MP4/WebM URL..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 transition-colors"
          >
            {t.video.playDirect}
          </button>
        </form>
      </div>

      {/* Cinema Player Stage */}
      <div className="relative rounded-3xl overflow-hidden bg-black border border-neutral-800 shadow-2xl">
        <video
          ref={videoRef}
          src={currentVideo.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setVideoError('Error playing video stream. Check URL or codec compatibility.')}
          className="w-full aspect-video object-contain bg-black cursor-pointer"
          onClick={togglePlay}
          playsInline
        />

        {videoError && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
            <p className="text-sm font-semibold text-white mb-4">{videoError}</p>
            <button
              onClick={() => {
                setVideoError(null);
                videoRef.current?.load();
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white"
            >
              Reload Stream
            </button>
          </div>
        )}

        {/* Custom Control Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          {/* Scrubber */}
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-neutral-300">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = 0;
                }}
                className="p-1.5 rounded-lg text-neutral-300 hover:text-white"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg text-neutral-300 hover:text-white"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (videoRef.current) videoRef.current.volume = v;
                    if (isMuted) setIsMuted(false);
                  }}
                  className="w-16 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              {/* Resolution Pill */}
              {currentVideo.resolution && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-200 border border-neutral-700">
                  {currentVideo.resolution}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Speed selector */}
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="bg-neutral-850/80 border border-neutral-700 text-neutral-200 text-xs rounded-xl px-2 py-1 focus:outline-none"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1.0x (Normal)</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2.0x</option>
              </select>

              <button
                onClick={handleFullscreen}
                className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Details & Actions Bar */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">{currentVideo.title}</h2>
          <p className="text-xs text-neutral-400 mt-1">{currentVideo.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
            {currentVideo.author && <span>By: <strong className="text-neutral-200">{currentVideo.author}</strong></span>}
            {currentVideo.year && <span>• Released {currentVideo.year}</span>}
            {currentVideo.fileSize && <span>• Size: {currentVideo.fileSize}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => toggleFavorite(currentVideo.id)}
            className={`p-2.5 rounded-xl border transition-colors ${
              favorites.includes(currentVideo.id)
                ? 'bg-red-600/20 border-red-500 text-red-500'
                : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-white'
            }`}
            title="Favorite"
          >
            <Heart className={`w-4 h-4 ${favorites.includes(currentVideo.id) ? 'fill-red-500' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700 text-neutral-300 hover:text-white"
            title="Share Video"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onStartDownload(currentVideo.url, `${currentVideo.title}.mp4`)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-900/30"
          >
            <Download className="w-4 h-4" />
            Download MP4
          </button>
        </div>
      </div>

      {/* Suggested & Catalog Videos */}
      <div>
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Film className="w-4 h-4 text-red-500" />
          More Open Source Films
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {SAMPLE_VIDEOS.map((vid) => (
            <div
              key={vid.id}
              onClick={() => {
                setCurrentVideo(vid);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`rounded-2xl overflow-hidden cursor-pointer border transition-all ${
                currentVideo.id === vid.id
                  ? 'border-red-500 ring-2 ring-red-500/30 bg-neutral-850'
                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900'
              }`}
            >
              <div className="relative aspect-video bg-neutral-800">
                <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white">
                  {vid.duration}
                </span>
              </div>
              <div className="p-3">
                <h4 className="text-xs font-bold text-white truncate">{vid.title}</h4>
                <p className="text-[10px] text-neutral-400 mt-1 line-clamp-1">{vid.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {copied && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-medium shadow-2xl">
          {t.common.copied}
        </div>
      )}
    </div>
  );
};

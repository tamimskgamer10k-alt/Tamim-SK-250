import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  X,
  Music,
} from 'lucide-react';
import { MediaItem } from '../types';

interface GlobalAudioPlayerProps {
  currentTrack: MediaItem | null;
  playlist: MediaItem[];
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onClose,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      setAudioError(null);
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn('Audio playback error:', err);
          setAudioError('Click Play to start audio stream');
        });
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      onNext();
    }
  };

  const toggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-30 bg-[#12141A]/95 border-t border-neutral-800 backdrop-blur-2xl shadow-2xl transition-all duration-300">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
        onError={() => setAudioError('Unable to load audio file stream')}
      />

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 text-white">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 w-1/4">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700/60 shadow-md">
            {currentTrack.thumbnailUrl ? (
              <img
                src={currentTrack.thumbnailUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <Music className="w-5 h-5" />
              </div>
            )}
            {/* Equalizer animation overlay when playing */}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5 px-2">
                <span className="w-1 bg-red-500 rounded-full animate-bounce [animation-delay:0.1s] h-3" />
                <span className="w-1 bg-red-400 rounded-full animate-bounce [animation-delay:0.3s] h-5" />
                <span className="w-1 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s] h-2" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
            <p className="text-[11px] text-neutral-400 truncate">
              {currentTrack.author || currentTrack.genre || 'Audio Track'}
            </p>
            {audioError && (
              <p className="text-[9px] text-amber-400 truncate">{audioError}</p>
            )}
          </div>
        </div>

        {/* Center Controls & Scrubber */}
        <div className="flex flex-col items-center flex-1 max-w-xl">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-1.5 rounded-lg transition-colors ${
                isShuffle ? 'text-red-500' : 'text-neutral-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onPrev}
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onPlayPause}
              className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button
              onClick={onNext}
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-lg transition-colors ${
                repeatMode !== 'off' ? 'text-red-500' : 'text-neutral-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Time scrubber */}
          <div className="w-full flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Close */}
        <div className="hidden sm:flex items-center justify-end gap-2.5 w-1/4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-neutral-400 hover:text-white"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-20 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
            title="Close Player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

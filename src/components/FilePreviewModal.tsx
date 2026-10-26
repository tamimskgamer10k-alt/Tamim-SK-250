import React from 'react';
import {
  X,
  Download,
  Film,
  Music,
  Image as ImageIcon,
  FileText,
  Archive,
  FileCode,
  Calendar,
  HardDrive,
} from 'lucide-react';
import { FileItem } from '../types';
import { formatBytes } from '../utils/fileTools';

interface FilePreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  onDownload,
}) => {
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-500 shrink-0">
              {file.category === 'video' ? (
                <Film className="w-4 h-4" />
              ) : file.category === 'audio' ? (
                <Music className="w-4 h-4" />
              ) : file.category === 'image' ? (
                <ImageIcon className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{file.name}</h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                {file.type || 'application/octet-stream'} • {formatBytes(file.size)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-neutral-950 min-h-[320px]">
          {file.category === 'image' && file.dataUrl ? (
            <div className="max-h-[420px] rounded-xl overflow-hidden">
              <img
                src={file.dataUrl}
                alt={file.name}
                className="max-h-[400px] w-auto object-contain rounded-xl"
              />
            </div>
          ) : file.category === 'video' && file.dataUrl ? (
            <video
              src={file.dataUrl}
              controls
              className="max-h-[400px] w-full rounded-2xl bg-black"
            />
          ) : file.category === 'audio' && file.dataUrl ? (
            <div className="w-full max-w-md p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mx-auto">
                <Music className="w-8 h-8" />
              </div>
              <audio src={file.dataUrl} controls className="w-full" />
            </div>
          ) : (
            <div className="text-center p-8 max-w-sm space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-white">{file.name}</h4>
              <p className="text-xs text-neutral-400">
                Binary or document payload. Size: {formatBytes(file.size)}. You can download this file directly to your system.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 px-6 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between text-xs">
          <div className="text-neutral-400 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Modified: {new Date(file.lastModified).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(file)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-red-900/30"
            >
              <Download className="w-3.5 h-3.5" />
              Download File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

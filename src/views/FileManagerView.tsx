import React, { useState, useRef } from 'react';
import {
  FolderKanban,
  Upload,
  Search,
  Grid,
  List,
  Trash2,
  Download,
  Eye,
  Edit2,
  FileText,
  Film,
  Music,
  Image as ImageIcon,
  Archive,
  File,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRightLeft,
  ShieldCheck,
  X,
  Check,
} from 'lucide-react';
import { Language, FileItem } from '../types';
import { getTranslation } from '../translations';
import { formatBytes, sanitizeFilename, convertImageFormat } from '../utils/fileTools';

interface FileManagerViewProps {
  language: Language;
  files: FileItem[];
  onUploadFiles: (files: FileList) => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onPreviewFile: (file: FileItem) => void;
}

export const FileManagerView: React.FC<FileManagerViewProps> = ({
  language,
  files,
  onUploadFiles,
  onDeleteFile,
  onRenameFile,
  onPreviewFile,
}) => {
  const t = getTranslation(language);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchVal, setSearchVal] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [activeTool, setActiveTool] = useState<'inspector' | 'converter' | 'sanitizer' | 'imageConvert' | null>(null);

  // Tools state
  const [calcBytes, setCalcBytes] = useState<number>(1048576); // 1 MB
  const [sanitizeInput, setSanitizeInput] = useState('My File: With <Bad*Chars>!.mp4');
  const [imageConvertFile, setImageConvertFile] = useState<File | null>(null);
  const [imageConvertFormat, setImageConvertFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');
  const [imageConvertQuality, setImageConvertQuality] = useState(0.9);
  const [convertedData, setConvertedData] = useState<{ url: string; size: number } | null>(null);

  const categories = [
    { id: 'all', label: 'All Files', icon: FolderKanban },
    { id: 'video', label: 'Videos', icon: Film },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'archive', label: 'Archives', icon: Archive },
  ];

  const filteredFiles = files.filter((f) => {
    const matchesCat = activeCategory === 'all' || f.category === activeCategory;
    const matchesSearch = f.name.toLowerCase().includes(searchVal.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFiles.map((f) => f.id));
    }
  };

  const handleBatchDelete = () => {
    if (window.confirm(`Delete ${selectedIds.length} selected files?`)) {
      selectedIds.forEach((id) => onDeleteFile(id));
      setSelectedIds([]);
    }
  };

  const handleSaveRename = (id: string) => {
    if (renameVal.trim()) {
      onRenameFile(id, sanitizeFilename(renameVal.trim()));
    }
    setRenameId(null);
    setRenameVal('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  const handleRunImageConversion = async () => {
    if (!imageConvertFile) return;
    try {
      const res = await convertImageFormat(imageConvertFile, imageConvertFormat, imageConvertQuality);
      setConvertedData({ url: res.dataUrl, size: res.size });
    } catch (err) {
      alert('Conversion failed: ' + err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-red-500" />
            {t.files.title}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Browse, preview, rename, and convert your local and downloaded assets safely in-browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => e.target.files && onUploadFiles(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-900/30 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            {t.files.uploadButton}
          </button>
        </div>
      </div>

      {/* Practical Utilities Launcher Strip */}
      <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-red-500" />
          {t.files.toolsTitle}:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTool(activeTool === 'converter' ? null : 'converter')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              activeTool === 'converter'
                ? 'bg-red-600 border-red-500 text-white'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            {t.files.sizeConverter}
          </button>

          <button
            onClick={() => setActiveTool(activeTool === 'sanitizer' ? null : 'sanitizer')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              activeTool === 'sanitizer'
                ? 'bg-red-600 border-red-500 text-white'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            {t.files.nameSanitizer}
          </button>

          <button
            onClick={() => setActiveTool(activeTool === 'imageConvert' ? null : 'imageConvert')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              activeTool === 'imageConvert'
                ? 'bg-red-600 border-red-500 text-white'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            {t.files.imageConverter}
          </button>
        </div>
      </div>

      {/* TOOL MODAL: SIZE CONVERTER */}
      {activeTool === 'converter' && (
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-red-500" />
              File Size Converter
            </h4>
            <button onClick={() => setActiveTool(null)} className="text-neutral-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-neutral-400 block font-mono">Bytes</span>
              <input
                type="number"
                value={calcBytes}
                onChange={(e) => setCalcBytes(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-bold text-white mt-1 text-sm focus:outline-none"
              />
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-neutral-400 block font-mono">Kilobytes (KB)</span>
              <span className="font-bold text-white mt-1 block text-sm font-mono">
                {(calcBytes / 1024).toFixed(3)} KB
              </span>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-neutral-400 block font-mono">Megabytes (MB)</span>
              <span className="font-bold text-emerald-400 mt-1 block text-sm font-mono">
                {(calcBytes / (1024 * 1024)).toFixed(3)} MB
              </span>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-neutral-400 block font-mono">Gigabytes (GB)</span>
              <span className="font-bold text-red-400 mt-1 block text-sm font-mono">
                {(calcBytes / (1024 * 1024 * 1024)).toFixed(4)} GB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TOOL MODAL: SAFE RENAMER */}
      {activeTool === 'sanitizer' && (
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Safe Filename Sanitizer
            </h4>
            <button onClick={() => setActiveTool(null)} className="text-neutral-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={sanitizeInput}
              onChange={(e) => setSanitizeInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
            />
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Sanitized Output:</span>
              <span className="font-mono font-bold text-emerald-400">
                {sanitizeFilename(sanitizeInput)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TOOL MODAL: IMAGE CONVERTER */}
      {activeTool === 'imageConvert' && (
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-red-500" />
              Client-Side Image Converter (WebP / PNG / JPEG)
            </h4>
            <button onClick={() => setActiveTool(null)} className="text-neutral-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageConvertFile(e.target.files[0]);
                  setConvertedData(null);
                }
              }}
              className="text-xs text-neutral-300"
            />

            <select
              value={imageConvertFormat}
              onChange={(e) => setImageConvertFormat(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white"
            >
              <option value="image/webp">Convert to WebP</option>
              <option value="image/png">Convert to PNG</option>
              <option value="image/jpeg">Convert to JPEG</option>
            </select>

            <button
              onClick={handleRunImageConversion}
              disabled={!imageConvertFile}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-xs font-bold text-white shrink-0"
            >
              Process Image
            </button>
          </div>

          {convertedData && (
            <div className="p-3 rounded-xl bg-neutral-950 border border-emerald-500/40 flex items-center justify-between">
              <span className="text-xs text-white">
                Converted Size: <strong className="text-emerald-400">{formatBytes(convertedData.size)}</strong>
              </span>
              <a
                href={convertedData.url}
                download={`converted-image.${imageConvertFormat.split('/')[1]}`}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Output
              </a>
            </div>
          )}
        </div>
      )}

      {/* Drop Zone Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="p-8 border-2 border-dashed border-neutral-700/80 hover:border-red-500 rounded-3xl bg-neutral-900/50 hover:bg-neutral-850/50 cursor-pointer text-center transition-all group"
      >
        <Upload className="w-10 h-10 text-neutral-500 group-hover:text-red-500 mx-auto mb-2 transition-colors" />
        <h3 className="text-sm font-bold text-white mb-1">{t.files.dropzoneText}</h3>
        <p className="text-xs text-neutral-400">Supports video, audio, pictures, documents, and archives</p>
      </div>

      {/* Category Pills & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search files..."
            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder:text-neutral-500"
          />

          <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Batch Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-red-950/40 border border-red-800 flex items-center justify-between text-xs text-white">
          <span>{selectedIds.length} files selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Files Display: Grid or List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredFiles.map((file) => {
            const isSelected = selectedIds.includes(file.id);
            return (
              <div
                key={file.id}
                className={`group p-3 rounded-2xl bg-neutral-900 border transition-all flex flex-col justify-between ${
                  isSelected ? 'border-red-500 bg-red-950/20' : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => toggleSelect(file.id)}
                      className="text-neutral-500 hover:text-white"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-red-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <span className="text-[9px] uppercase font-bold text-neutral-500">{file.category}</span>
                  </div>

                  <div
                    onClick={() => onPreviewFile(file)}
                    className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center mx-auto mb-2 text-neutral-400 group-hover:text-red-500 cursor-pointer transition-colors"
                  >
                    {file.category === 'video' ? (
                      <Film className="w-6 h-6" />
                    ) : file.category === 'audio' ? (
                      <Music className="w-6 h-6" />
                    ) : file.category === 'image' ? (
                      <ImageIcon className="w-6 h-6" />
                    ) : (
                      <FileText className="w-6 h-6" />
                    )}
                  </div>

                  {renameId === file.id ? (
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="text"
                        value={renameVal}
                        onChange={(e) => setRenameVal(e.target.value)}
                        className="w-full px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-700 text-xs text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(file.id)}
                        className="text-emerald-400"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <h4
                      onClick={() => onPreviewFile(file)}
                      className="text-xs font-bold text-white truncate text-center cursor-pointer hover:text-red-400"
                    >
                      {file.name}
                    </h4>
                  )}
                  <p className="text-[10px] text-neutral-400 text-center mt-0.5 font-mono">
                    {formatBytes(file.size)}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-850 flex items-center justify-between text-neutral-400">
                  <button
                    onClick={() => {
                      setRenameId(file.id);
                      setRenameVal(file.name);
                    }}
                    className="p-1 hover:text-white"
                    title="Rename"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onPreviewFile(file)}
                    className="p-1 hover:text-white"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden divide-y divide-neutral-800/60">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="p-3 px-4 flex items-center justify-between text-xs hover:bg-neutral-850/60"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button onClick={() => toggleSelect(file.id)}>
                  {selectedIds.includes(file.id) ? (
                    <CheckSquare className="w-4 h-4 text-red-500" />
                  ) : (
                    <Square className="w-4 h-4 text-neutral-500" />
                  )}
                </button>
                <div className="min-w-0">
                  <h4
                    onClick={() => onPreviewFile(file)}
                    className="font-bold text-white truncate cursor-pointer hover:text-red-400"
                  >
                    {file.name}
                  </h4>
                  <span className="text-[10px] text-neutral-400">{file.type || 'Binary file'}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-neutral-400">
                <span className="font-mono text-[11px]">{formatBytes(file.size)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreviewFile(file)}
                    className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

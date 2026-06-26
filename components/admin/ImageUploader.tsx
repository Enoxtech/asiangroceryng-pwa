'use client';

import { useRef, useState } from 'react';
import { Upload, X, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `Failed to upload ${file.name}`);
        uploaded.push(json.url);
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function addUrl() {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
  }

  function removeImage(i: number) {
    onChange(images.filter((_, j) => j !== i));
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="image-upload-input"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-brand-red hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
        >
          <Upload className="h-3.5 w-3.5" /> {uploading ? 'Uploading…' : 'Upload Image(s)'}
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
            placeholder="...or paste an image URL"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm font-display border focus:outline-none focus:border-brand-red text-gray-200 bg-[#0f0e0b] border-[rgba(255,255,255,0.08)]"
          />
        </div>
        <button
          type="button"
          onClick={addUrl}
          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 border transition-colors cursor-pointer"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          Add
        </button>
      </div>

      {error && <p className="text-xs text-red-400 font-display">{error}</p>}
      <p className="text-[10px] text-gray-600 font-label">Uploaded images are saved directly to Cloudflare R2. JPG, PNG, WEBP, or GIF — max 8MB each.</p>
    </div>
  );
}

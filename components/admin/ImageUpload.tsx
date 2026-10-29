'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  eventSlug?: string;
  endpoint?: string;
  aspect?: 'square' | 'wide' | 'auto';
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  eventSlug = 'hackx',
  endpoint = '/api/admin/upload',
  aspect = 'auto',
  label = 'Upload Image',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    // Check format
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventSlug', eventSlug);

    setUploading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Upload failed');
        return;
      }

      onChange(data.url);
      toast.success('Image uploaded successfully');
    } catch {
      toast.error('Network error during upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const aspectClass =
    aspect === 'square'
      ? 'aspect-square w-32'
      : aspect === 'wide'
      ? 'aspect-video w-full max-w-sm'
      : 'h-36 w-full max-w-sm';

  return (
    <div className="space-y-2">
      {label && (
        <span className="block text-xs font-mono text-neutral-400">{label}</span>
      )}

      {value ? (
        <div className={`relative rounded-xl border border-white/15 bg-black/40 overflow-hidden ${aspectClass} group`}>
          <Image
            src={value}
            alt="Uploaded preview"
            fill
            className="object-cover"
            unoptimized={value.startsWith('data:')}
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 text-xs font-mono"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500 text-xs font-mono"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all p-4 ${aspectClass}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-primary font-mono text-xs">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-400 text-center font-mono text-xs">
              <Upload className="w-5 h-5 text-neutral-500" />
              <span>Click or drag image</span>
              <span className="text-[10px] text-neutral-500">Max 5MB (JPG, PNG, WebP)</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

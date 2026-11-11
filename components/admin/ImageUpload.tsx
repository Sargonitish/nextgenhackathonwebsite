'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { Upload, X, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage } from '@/lib/compressImage';

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const offsetX = useSpring(rawX, { stiffness: 300, damping: 24 });
  const offsetY = useSpring(rawY, { stiffness: 300, damping: 24 });

  const processFile = async (file: File) => {
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

    setUploading(true);
    try {
      const optimizedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('file', optimizedFile);
      formData.append('eventSlug', eventSlug);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const resetDrag = () => {
    dragDepthRef.current = 0;
    setIsDragging(false);
    rawX.set(0);
    rawY.set(0);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2 || 1);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2 || 1);
    rawX.set(Math.max(-1, Math.min(1, relX)) * 10);
    rawY.set(Math.max(-1, Math.min(1, relY)) * 8);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      resetDrag();
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    resetDrag();
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
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
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-xl border border-dashed cursor-pointer transition-all p-4 ${aspectClass} ${
            isDragging
              ? 'border-yellow bg-yellow/10 ring-2 ring-yellow/40 scale-[1.01]'
              : 'border-white/20 bg-black/20 hover:border-primary/50 hover:bg-primary/5'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-primary font-mono text-xs">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : (
            <motion.div
              style={prefersReducedMotion ? undefined : { x: offsetX, y: offsetY }}
              className="pointer-events-none flex flex-col items-center gap-2 text-neutral-400 text-center font-mono text-xs"
            >
              <Upload className={`w-5 h-5 transition-colors ${isDragging ? 'text-yellow' : 'text-neutral-500'}`} />
              <span className={isDragging ? 'text-yellow font-bold' : undefined}>
                {isDragging ? 'Drop image to upload' : 'Click or drag image'}
              </span>
              <span className="text-[10px] text-neutral-500">Max 5MB (JPG, PNG, WebP)</span>
            </motion.div>
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

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';

interface GalleryItem {
  _id?: string;
  imageUrl: string;
  caption?: string;
}

export default function Gallery({ gallery = [] }: { gallery: GalleryItem[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  if (gallery.length === 0) return null;

  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs uppercase tracking-widest mb-3">
          <Camera className="w-3.5 h-3.5" />
          <span>Moments</span>
        </div>
        <h2 className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
          HackX In Action
        </h2>
        <p className="text-neutral-400 font-mono text-xs sm:text-sm mt-2">
          Glances from past hacking sprints, pitch sessions, and celebratory nights.
        </p>
      </div>

      {/* Masonry / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.map((item, idx) => (
          <div
            key={item._id || idx}
            onClick={() => setSelectedPhoto(item)}
            className="group relative h-64 rounded-2xl border border-white/10 bg-[#12121c] overflow-hidden cursor-pointer shadow-lg hover:border-primary/50 transition-all"
          >
            <Image
              src={item.imageUrl}
              alt={item.caption || 'Hackathon photo'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="font-mono text-xs text-white">
                {item.caption || 'HackX Moment'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full rounded-2xl overflow-hidden border border-white/20 bg-[#101018] shadow-2xl"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-[65vh] w-full">
              <Image
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.caption || 'Hackathon photo'}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {selectedPhoto.caption && (
              <div className="p-4 border-t border-white/10 text-center font-mono text-xs text-neutral-300">
                {selectedPhoto.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

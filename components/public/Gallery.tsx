'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, X, Maximize2, ZoomIn } from 'lucide-react';

export interface GalleryItem {
  _id?: string;
  imageUrl: string;
  caption?: string;
  order?: number;
}

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop',
    caption: 'Hacking through the midnight hours at HackX',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop',
    caption: 'Team brainstorming and architectural whiteboard session',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop',
    caption: 'Live pitch presentations before the panel of industry judges',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
    caption: 'Collaborative code reviews and agent deployments',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&h=600&fit=crop',
    caption: 'Midnight caffeine runs and snack reloads',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
    caption: 'Grand prize celebrations and trophy presentations',
  },
];

export default function Gallery({ gallery = [] }: { gallery?: GalleryItem[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const displayItems = gallery && gallery.length > 0 ? gallery : DEFAULT_GALLERY;

  // Keyboard accessibility: ESC closes lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    }
    if (selectedPhoto) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedPhoto]);

  return (
    <section id="gallery" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      {/* Blueprint Header Metadata */}
      <div className="flex items-center justify-between font-mono text-xs text-offwhite/50 uppercase tracking-widest mb-8">
        <div>08 / PHOTO GALLERY &amp; MOMENTS</div>
        <div className="hidden sm:inline">[VISUAL TELEMETRY // ARCHIVAL LOGS]</div>
      </div>

      <div className="mb-10">
        <h2 className="font-display text-2xl sm:text-3xl font-black text-offwhite uppercase tracking-tight">
          FIELD MOMENTS &amp; ARCHIVES
        </h2>
        <p className="font-mono text-xs sm:text-sm text-offwhite/70 mt-2 max-w-2xl leading-relaxed">
          Snapshots from past sprints, 3 AM debugging marathons, whiteboarding sessions, and stage demos.
        </p>
      </div>

      {/* Blueprint Photo Contact-Sheet Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayItems.map((item, idx) => (
          <div
            key={item._id || idx}
            onClick={() => setSelectedPhoto(item)}
            className="group border border-line bg-[#0c223f] hover:border-yellow shadow-hard-sm transition-all duration-150 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Architectural Camera Spec Bar */}
            <div className="px-3.5 py-2 border-b border-line bg-navy flex items-center justify-between font-mono text-[10px] text-offwhite/50">
              <span className="text-yellow font-bold uppercase tracking-wider">
                + [SHOT: 0{idx + 1}]
              </span>
              <span className="flex items-center gap-1 group-hover:text-yellow transition-colors">
                <ZoomIn className="w-3 h-3" />
                <span className="hidden sm:inline">[EXPAND]</span>
              </span>
            </div>

            {/* Photo Container */}
            <div className="relative h-60 w-full overflow-hidden bg-navy">
              <Image
                src={item.imageUrl}
                alt={item.caption || `Hackathon Moment 0${idx + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Technical Caption Plate */}
            <div className="p-3.5 border-t border-line bg-[#0c223f] font-mono text-xs text-offwhite/80 group-hover:text-offwhite transition-colors flex items-start gap-2">
              <span className="text-yellow font-bold">&gt;</span>
              <span className="line-clamp-2 leading-relaxed">
                {item.caption || `HackX Sprint Snapshot 0${idx + 1}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Blueprint Technical Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/95 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full border border-yellow bg-navy shadow-hard overflow-hidden font-mono"
          >
            {/* Modal Window Title Bar */}
            <div className="px-4 py-3 border-b border-line bg-[#0c223f] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow animate-pulse" />
                <span className="text-yellow font-bold uppercase tracking-wider">
                  &gt;_ ARCHIVAL PHOTOMETRY VIEWER
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="text-offwhite/60 hover:text-yellow transition-colors flex items-center gap-1 uppercase text-[11px] font-bold"
              >
                <span>[✕ CLOSE (ESC)]</span>
              </button>
            </div>

            {/* Full-size Photo View */}
            <div className="relative h-[65vh] w-full bg-navy/90 p-2">
              <Image
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.caption || 'Hackathon photo'}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {/* Lightbox Footer Caption Plate */}
            <div className="p-4 border-t border-line bg-[#0c223f] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-offwhite">
                <span className="text-yellow font-bold">&gt;</span>
                <span>{selectedPhoto.caption || 'Archived Hackathon Moment'}</span>
              </div>
              <span className="text-[10px] text-offwhite/40 tracking-widest uppercase">
                [HIGH RESOLUTION // ARCHIVE SPEC]
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

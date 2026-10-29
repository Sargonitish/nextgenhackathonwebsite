'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ListEditor, { FieldConfig } from '@/components/admin/ListEditor';
import { RefreshCw } from 'lucide-react';

export default function GalleryPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event') || '';

  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const url = eventId ? `/api/admin/events/${eventId}` : '/api/admin/events';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setEventData(data.event || (data.events ? data.events[0] : null));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  const fields: FieldConfig[] = [
    { name: 'caption', label: 'Photo Caption', type: 'text', required: true, placeholder: 'e.g. Midnight pizza round at HackX' },
    { name: 'imageUrl', label: 'Gallery Photo (High Resolution)', type: 'image', required: true },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-primary" />
        Loading gallery...
      </div>
    );
  }

  return (
    <ListEditor
      title="Photo Gallery & Moments"
      description="Images showcased in the masonry grid and full-screen lightbox on the public site."
      eventId={eventData?._id || ''}
      eventSlug={eventData?.slug || 'hackx'}
      section="gallery"
      initialItems={eventData?.gallery || []}
      fields={fields}
      itemTitleKey="caption"
    />
  );
}

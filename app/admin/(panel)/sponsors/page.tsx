'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ListEditor, { FieldConfig } from '@/components/admin/ListEditor';
import { RefreshCw } from 'lucide-react';

export default function SponsorsPage() {
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
    { name: 'name', label: 'Company / Partner Name', type: 'text', required: true, placeholder: 'e.g. Cloudflare' },
    {
      name: 'tier',
      label: 'Sponsorship Tier',
      type: 'select',
      required: true,
      options: [
        { label: 'Title Partner', value: 'Title Partner' },
        { label: 'Platform Partner', value: 'Platform Partner' },
        { label: 'Database Sponsor', value: 'Database Sponsor' },
        { label: 'Swag & Food Partner', value: 'Swag & Food Partner' },
        { label: 'Community Partner', value: 'Community Partner' },
      ],
      defaultValue: 'Platform Partner',
    },
    { name: 'website', label: 'Website URL', type: 'text', placeholder: 'https://...' },
    { name: 'logoUrl', label: 'Partner Logo Image (Transparent PNG recommended)', type: 'image', required: true },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-primary" />
        Loading sponsors...
      </div>
    );
  }

  return (
    <ListEditor
      title="Sponsors & Industry Partners"
      description="Corporate and community partners shown in grayscale, switching to full color on hover."
      eventId={eventData?._id || ''}
      eventSlug={eventData?.slug || 'hackx'}
      section="sponsors"
      initialItems={eventData?.sponsors || []}
      fields={fields}
      itemTitleKey="name"
      itemSubtitleKey="tier"
    />
  );
}

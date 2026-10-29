'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ListEditor, { FieldConfig } from '@/components/admin/ListEditor';
import { RefreshCw } from 'lucide-react';

export default function TracksPage() {
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
    { name: 'title', label: 'Track Title', type: 'text', required: true, placeholder: 'e.g. AI & Intelligent Agents' },
    { name: 'description', label: 'Short Description', type: 'textarea', required: true, placeholder: 'What should teams build in this track?' },
    {
      name: 'icon',
      label: 'Lucide Icon Name',
      type: 'select',
      required: true,
      options: [
        { label: 'Bot (AI/Agents)', value: 'Bot' },
        { label: 'Shield (Security/FinTech)', value: 'Shield' },
        { label: 'Activity (HealthTech)', value: 'Activity' },
        { label: 'Cpu (Hardware/IoT)', value: 'Cpu' },
        { label: 'Globe (Web3/Open)', value: 'Globe' },
        { label: 'Code (General Software)', value: 'Code' },
        { label: 'Database (Cloud/Data)', value: 'Database' },
        { label: 'Smartphone (Mobile)', value: 'Smartphone' },
      ],
      defaultValue: 'Code',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-primary" />
        Loading tracks...
      </div>
    );
  }

  return (
    <ListEditor
      title="Innovation Tracks"
      description="Hackathon themes and challenge categories available in the team registration dropdown."
      eventId={eventData?._id || ''}
      eventSlug={eventData?.slug || 'hackx'}
      section="tracks"
      initialItems={eventData?.tracks || []}
      fields={fields}
      itemTitleKey="title"
      itemSubtitleKey="description"
    />
  );
}

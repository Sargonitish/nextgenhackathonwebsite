'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ListEditor, { FieldConfig } from '@/components/admin/ListEditor';
import { RefreshCw } from 'lucide-react';

export default function PrizesPage() {
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
    {
      name: 'position',
      label: 'Podium Rank / Category',
      type: 'select',
      required: true,
      options: [
        { label: '1st Place (Grand Champion)', value: '1st' },
        { label: '2nd Place (First Runner-Up)', value: '2nd' },
        { label: '3rd Place (Second Runner-Up)', value: '3rd' },
        { label: 'Special Category Award', value: 'Special' },
      ],
      defaultValue: '1st',
    },
    { name: 'title', label: 'Prize Title', type: 'text', required: true, placeholder: 'e.g. Grand Winners' },
    { name: 'amount', label: 'Cash Reward Value', type: 'text', required: true, placeholder: 'e.g. ₹50,000' },
    { name: 'perks', label: 'Additional Perks & Swag', type: 'textarea', placeholder: 'e.g. Cloud credits, Trophy, Fast-track interviews' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-primary" />
        Loading prizes...
      </div>
    );
  }

  return (
    <ListEditor
      title="Prizes & Rewards Pool"
      description="Podium positions and cash rewards displayed in the public awards showcase."
      eventId={eventData?._id || ''}
      eventSlug={eventData?.slug || 'hackx'}
      section="prizes"
      initialItems={eventData?.prizes || []}
      fields={fields}
      itemTitleKey="title"
      itemSubtitleKey="amount"
    />
  );
}

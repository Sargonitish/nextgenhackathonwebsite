'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ListEditor, { FieldConfig } from '@/components/admin/ListEditor';
import { RefreshCw } from 'lucide-react';

export default function SchedulePage() {
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
    { name: 'day', label: 'Day / Phase', type: 'text', required: true, placeholder: 'e.g. Day 1 / Nov 14' },
    { name: 'time', label: 'Time Window', type: 'text', required: true, placeholder: 'e.g. 09:00 AM - 10:30 AM' },
    { name: 'title', label: 'Activity Title', type: 'text', required: true, placeholder: 'e.g. Opening Ceremony & Keynote' },
    { name: 'description', label: 'Activity Details / Location', type: 'textarea', placeholder: 'Auditorium main hall. Briefing on scoring rubric.' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-primary" />
        Loading schedule...
      </div>
    );
  }

  return (
    <ListEditor
      title="Event Schedule Timeline"
      description="Vertical timeline of hackathon milestones grouped by day and time."
      eventId={eventData?._id || ''}
      eventSlug={eventData?.slug || 'hackx'}
      section="schedule"
      initialItems={eventData?.schedule || []}
      fields={fields}
      itemTitleKey="title"
      itemSubtitleKey="time"
    />
  );
}

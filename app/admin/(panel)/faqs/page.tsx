'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ListEditor, { FieldConfig } from '@/components/admin/ListEditor';
import { RefreshCw } from 'lucide-react';

export default function FaqsPage() {
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
    { name: 'question', label: 'Question', type: 'text', required: true, placeholder: 'e.g. Is food provided?' },
    { name: 'answer', label: 'Detailed Answer', type: 'textarea', required: true, placeholder: 'Yes, full meals, midnight pizza and coffee are free.' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-primary" />
        Loading FAQs...
      </div>
    );
  }

  return (
    <ListEditor
      title="Frequently Asked Questions"
      description="Accordion questions displayed to help students resolve common doubts."
      eventId={eventData?._id || ''}
      eventSlug={eventData?.slug || 'hackx'}
      section="faqs"
      initialItems={eventData?.faqs || []}
      fields={fields}
      itemTitleKey="question"
    />
  );
}

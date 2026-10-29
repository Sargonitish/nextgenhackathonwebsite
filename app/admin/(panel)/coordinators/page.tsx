'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ListEditor, { FieldConfig } from '@/components/admin/ListEditor';
import { RefreshCw } from 'lucide-react';

export default function CoordinatorsPage() {
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
    { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Dr. K. Ramesh' },
    { name: 'role', label: 'Role / Designation', type: 'text', required: true, placeholder: 'e.g. Head of CSE / Lead Student' },
    {
      name: 'type',
      label: 'Coordinator Category',
      type: 'select',
      required: true,
      options: [
        { label: 'Faculty Coordinator', value: 'faculty' },
        { label: 'Student Coordinator', value: 'student' },
      ],
      defaultValue: 'student',
    },
    { name: 'phone', label: 'Contact Phone Number', type: 'text', placeholder: '+91 9840123456' },
    { name: 'email', label: 'Official Email', type: 'text', placeholder: 'ramesh@college.edu' },
    { name: 'linkedin', label: 'LinkedIn Profile URL', type: 'text', placeholder: 'https://linkedin.com/in/...' },
    { name: 'photoUrl', label: 'Profile Photo (Face cropped)', type: 'image' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-primary" />
        Loading coordinators...
      </div>
    );
  }

  return (
    <ListEditor
      title="Event Coordinators & Faculty Leads"
      description="Faculty and student leads displayed in the contact section of the public website."
      eventId={eventData?._id || ''}
      eventSlug={eventData?.slug || 'hackx'}
      section="coordinators"
      initialItems={eventData?.coordinators || []}
      fields={fields}
      itemTitleKey="name"
      itemSubtitleKey="role"
    />
  );
}

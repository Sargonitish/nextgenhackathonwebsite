'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  RefreshCw,
  Check,
} from 'lucide-react';
import ImageUpload from './ImageUpload';
import { toast } from 'sonner';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'image' | 'number';
  options?: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
}

interface ListEditorProps {
  title: string;
  description: string;
  eventId: string;
  eventSlug: string;
  section: string;
  initialItems: any[];
  fields: FieldConfig[];
  itemTitleKey: string;
  itemSubtitleKey?: string;
}

function SortableItem({
  item,
  index,
  itemTitleKey,
  itemSubtitleKey,
  onEdit,
  onDelete,
}: {
  item: any;
  index: number;
  itemTitleKey: string;
  itemSubtitleKey?: string;
  onEdit: (item: any) => void;
  onDelete: (index: number) => void;
}) {
  const id = item._id || item.id || `item-${index}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-[#12121a] hover:border-white/20 transition-all ${
        isDragging ? 'opacity-50 ring-2 ring-primary' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-white p-1"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="truncate">
          <div className="font-mono text-sm font-semibold text-white truncate">
            {item[itemTitleKey] || `Item #${index + 1}`}
          </div>
          {itemSubtitleKey && item[itemSubtitleKey] && (
            <div className="font-mono text-xs text-neutral-400 truncate">
              {item[itemSubtitleKey]}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="p-1.5 rounded-lg border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 text-xs font-mono transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-mono transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function ListEditor({
  title,
  description,
  eventId,
  eventSlug,
  section,
  initialItems,
  fields,
  itemTitleKey,
  itemSubtitleKey,
}: ListEditorProps) {
  const [items, setItems] = useState<any[]>(initialItems || []);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(
      (item, idx) => (item._id || item.id || `item-${idx}`) === active.id
    );
    const newIndex = items.findIndex(
      (item, idx) => (item._id || item.id || `item-${idx}`) === over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
      setItems(reordered);
    }
  };

  const handleOpenAdd = () => {
    const defaults: Record<string, any> = {};
    fields.forEach((f) => {
      defaults[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
    });
    setFormData(defaults);
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    const index = items.indexOf(item);
    setEditingIndex(index);
    setFormData({ ...item });
    setModalOpen(true);
  };

  const handleDelete = (index: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = { ...formData, order: editingIndex + 1 };
      setItems(updated);
    } else {
      const newItem = { ...formData, order: items.length + 1 };
      setItems([...items, newItem]);
    }
    setModalOpen(false);
  };

  const handleSaveToDatabase = async () => {
    if (!eventId) {
      toast.error('No event selected to save to.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          data: items,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Failed to save items');
        return;
      }

      toast.success('Saved ✓');
    } catch {
      toast.error('Network error during save');
    } finally {
      setSaving(false);
    }
  };

  const sortableIds = items.map((item, idx) => item._id || item.id || `item-${idx}`);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-mono text-xl font-bold text-white">{title}</h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">{description}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New
          </button>
          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary hover:opacity-90 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-40"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* List or Empty State */}
      {items.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-white/15 bg-white/5 font-mono text-xs text-neutral-400">
          No items added yet. Click &quot;Add New&quot; to create your first entry.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5">
              {items.map((item, index) => (
                <SortableItem
                  key={item._id || item.id || `item-${index}`}
                  item={item}
                  index={index}
                  itemTitleKey={itemTitleKey}
                  itemSubtitleKey={itemSubtitleKey}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#12121c] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 font-mono">
              <h2 className="text-base font-bold text-white">
                {editingIndex !== null ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>

                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={formData[field.name] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.name]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-3.5 py-2 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-primary"
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={formData[field.name] || 0}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.name]: Number(e.target.value) })
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-3.5 py-2 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-primary"
                    />
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      rows={3}
                      value={formData[field.name] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.name]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-3.5 py-2 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-primary"
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.name]: e.target.value })
                      }
                      required={field.required}
                      className="w-full px-3.5 py-2 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="">Select option</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'image' && (
                    <ImageUpload
                      value={formData[field.name]}
                      onChange={(url) => setFormData({ ...formData, [field.name]: url })}
                      eventSlug={eventSlug}
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-white/15 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-black font-semibold hover:opacity-90 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { EventInput } from '../declarations/icp-gramps';

interface EventFormProps {
  eventType: string;
  initialData?: {
    date_text?: string;
    place_text?: string;
    description?: string;
    private?: boolean;
  };
  onSubmit: (input: EventInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function EventForm({
  eventType,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: EventFormProps) {
  const [dateText, setDateText] = useState(initialData?.date_text || '');
  const [placeText, setPlaceText] = useState(initialData?.place_text || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isPrivate, setIsPrivate] = useState(initialData?.private || false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        event_type: eventType,
        date_text: dateText || null,
        place_text: placeText || null,
        description: description || null,
        date_sortval: null, // Could add date parsing logic later
        private: isPrivate ? true : null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="date_text" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="text"
          id="date_text"
          value={dateText}
          onChange={(e) => setDateText(e.target.value)}
          placeholder="e.g., 15 Mar 1872, Abt. 1850, Jan 1900"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Free-form date text (e.g., "15 Mar 1872", "Abt. 1850")</p>
      </div>

      <div>
        <label htmlFor="place_text" className="block text-sm font-medium text-gray-700">
          Place
        </label>
        <input
          type="text"
          id="place_text"
          value={placeText}
          onChange={(e) => setPlaceText(e.target.value)}
          placeholder="e.g., London, England or New York, USA"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">City, county, country, etc.</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Additional notes about this event"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="private"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="private" className="ml-2 block text-sm text-gray-700">
          Mark as private
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

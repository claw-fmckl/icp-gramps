import { useState, useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import type { EventInput, Place } from '../declarations/icp-gramps';

interface EventFormProps {
  eventType: string;
  initialData?: {
    date_text?: string;
    place_handle?: string;
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
  const actor = useActor();
  const [dateText, setDateText] = useState(initialData?.date_text || '');
  const [placeHandle, setPlaceHandle] = useState<string | null>(initialData?.place_handle || null);
  const [placeText, setPlaceText] = useState(initialData?.place_text || '');
  const [placeSearch, setPlaceSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [description, setDescription] = useState(initialData?.description || '');
  const [isPrivate, setIsPrivate] = useState(initialData?.private || false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function doSearch() {
      if (placeSearch.length > 0) {
        const results = await actor.search_places(placeSearch);
        setSearchResults(results);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }
    const timeoutId = setTimeout(doSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [placeSearch, actor]);

  function selectPlace(place: Place) {
    setPlaceHandle(place.handle);
    setPlaceSearch(place.title);
    setPlaceText('');
    setShowDropdown(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        event_type: eventType,
        date_text: dateText || null,
        place_handle: placeHandle || null,
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
        <label htmlFor="place_search" className="block text-sm font-medium text-gray-700">
          Place
        </label>
        <div className="relative">
          <input
            type="text"
            id="place_search"
            value={placeSearch}
            onChange={(e) => {
              setPlaceSearch(e.target.value);
              setPlaceHandle(null);
            }}
            placeholder="Search for a place..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((place) => (
                <button
                  key={place.handle}
                  type="button"
                  onClick={() => selectPlace(place)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                >
                  <div className="font-medium">{place.title}</div>
                  <div className="text-sm text-gray-500">{place.place_type}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          {placeHandle ? (
            <span className="text-green-600">Place selected</span>
          ) : (
            <span className="text-gray-500">
              Or use free text below if place not found
            </span>
          )}
          {!placeHandle && (
            <a
              href="/places/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Create new place
            </a>
          )}
        </div>
        {!placeHandle && (
          <input
            type="text"
            value={placeText}
            onChange={(e) => setPlaceText(e.target.value)}
            placeholder="Or enter free text place (legacy)"
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        )}
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

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, FormEvent } from 'react';
import { useActor } from '../../hooks/useActor';

export const Route = createFileRoute('/places/new' as any)({
  component: NewPlacePage,
});

function NewPlacePage() {
  const actor = useActor();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    name: '',
    place_type: 'unknown',
    latitude: '',
    longitude: '',
    code: '',
    private: false,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const input = {
        title: formData.title,
        name: formData.name || null,
        place_type: formData.place_type || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        code: formData.code || null,
        private: formData.private || null,
      };

      const result = await actor.create_place(input);
      if (result) {
        navigate({ to: `/places/${result.handle}` as any });
      } else {
        setError('Failed to create place');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create place');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Place</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                placeholder="e.g., Stockholm, Sweden"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Short Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="e.g., Stockholm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">Leave empty to use the title</p>
            </div>

            <div>
              <label htmlFor="place_type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="place_type"
                value={formData.place_type}
                onChange={(e) => setFormData({ ...formData, place_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="unknown">Unknown</option>
                <option value="city">City</option>
                <option value="county">County</option>
                <option value="state">State</option>
                <option value="country">Country</option>
                <option value="parish">Parish</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  step="any"
                  placeholder="59.3293"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  step="any"
                  placeholder="18.0686"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Code
              </label>
              <input
                type="text"
                id="code"
                placeholder="Postal code, FIPS, etc."
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="private"
                checked={formData.private}
                onChange={(e) => setFormData({ ...formData, private: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="private" className="ml-2 block text-sm text-gray-700">
                Private
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Creating...' : 'Create Place'}
            </button>
            <a
              href="/places"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, FormEvent } from 'react';
import { useActor } from '../../hooks/useActor';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Place } from '../../declarations/icp-gramps';

export const Route = createFileRoute('/places/$handle' as any)({
  component: PlaceDetailPage,
});

function PlaceDetailPage() {
  const actor = useActor();
  const navigate = useNavigate();
  const { handle } = Route.useParams();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    name: '',
    place_type: 'unknown',
    latitude: '',
    longitude: '',
    code: '',
    private: false,
  });

  useEffect(() => {
    async function fetchPlace() {
      try {
        setLoading(true);
        const result = await actor.get_place(handle);
        if (result) {
          setPlace(result);
          setFormData({
            title: result.title,
            name: result.name,
            place_type: result.place_type,
            latitude: result.latitude?.toString() || '',
            longitude: result.longitude?.toString() || '',
            code: result.code || '',
            private: result.private,
          });
        } else {
          setError('Place not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch place');
      } finally {
        setLoading(false);
      }
    }
    fetchPlace();
  }, [actor, handle]);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this place? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const result = await actor.delete_place(handle);
      if (result) {
        navigate({ to: '/places' as any });
      } else {
        setError('Failed to delete place');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete place');
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpdate(e: FormEvent) {
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

      const result = await actor.update_place(handle, input);
      if (result) {
        setPlace(result);
        setEditing(false);
      } else {
        setError('Failed to update place');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update place');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !place) {
    return (
      <div>
        <div className="text-red-600 mb-4">
          Error: {error}
        </div>
        <a href="/places" className="text-blue-600 hover:text-blue-800">
          Back to Places
        </a>
      </div>
    );
  }

  if (!place) {
    return (
      <div>
        <div className="text-red-600 mb-4">
          Place not found
        </div>
        <a href="/places" className="text-blue-600 hover:text-blue-800">
          Back to Places
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <a href="/places" className="text-blue-600 hover:text-blue-800">
          ← Back to Places
        </a>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {editing ? (
          <form onSubmit={handleUpdate}>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Place</h1>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  required
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {place.title}
                </h1>
                <div className="text-sm text-gray-500">ID: {place.gramps_id}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500">Short Name</h2>
                <p className="text-gray-900">{place.name}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500">Type</h2>
                <p className="text-gray-900 capitalize">{place.place_type}</p>
              </div>

              {(place.latitude || place.longitude) && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Coordinates</h2>
                  <p className="text-gray-900">
                    {place.latitude && place.longitude
                      ? `${place.latitude.toFixed(6)}, ${place.longitude.toFixed(6)}`
                      : '—'}
                  </p>
                </div>
              )}

              {place.code && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Code</h2>
                  <p className="text-gray-900">{place.code}</p>
                </div>
              )}

              <div>
                <h2 className="text-sm font-medium text-gray-500">Privacy</h2>
                <p className="text-gray-900">{place.private ? 'Private' : 'Public'}</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 text-red-600 text-sm">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

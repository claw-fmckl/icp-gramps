import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useActor } from '../../hooks/useActor';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Place } from '../../declarations/icp-gramps';

export const Route = createFileRoute('/places/' as any)({
  component: PlacesListPage,
});

function PlacesListPage() {
  const actor = useActor();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaces() {
      try {
        setLoading(true);
        const result = await actor.list_places();
        setPlaces(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch places');
      } finally {
        setLoading(false);
      }
    }
    fetchPlaces();
  }, [actor]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Places</h1>
        <a
          href="/places/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Place
        </a>
      </div>

      {places.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No places yet. Create your first place to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coordinates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {places.map((place) => (
                <tr key={place.handle} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`/places/${place.handle}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {place.title}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {place.place_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {place.latitude && place.longitude
                      ? `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href={`/places/${place.handle}`}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, FormEvent } from 'react';
import { useActor } from '../../hooks/useActor';

export const Route = createFileRoute('/families/new' as any)({
  component: NewFamilyPage,
});

function NewFamilyPage() {
  const actor = useActor();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    father_handle: '',
    mother_handle: '',
    family_type: 'married',
    private: false,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const input = {
        father_handle: formData.father_handle || null,
        mother_handle: formData.mother_handle || null,
        family_type: formData.family_type || null,
        private: formData.private || null,
      };

      const result = await actor.create_family(input);
      if (result) {
        navigate({ to: `/families/${result.handle}` as any });
      } else {
        setError('Failed to create family');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create family');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Family</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="father_handle" className="block text-sm font-medium text-gray-700 mb-1">
                Father Handle
              </label>
              <input
                type="text"
                id="father_handle"
                value={formData.father_handle}
                onChange={(e) => setFormData({ ...formData, father_handle: e.target.value })}
                placeholder="Person handle or Gramps ID (e.g., I0001)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the handle or Gramps ID of the father
              </p>
            </div>

            <div>
              <label htmlFor="mother_handle" className="block text-sm font-medium text-gray-700 mb-1">
                Mother Handle
              </label>
              <input
                type="text"
                id="mother_handle"
                value={formData.mother_handle}
                onChange={(e) => setFormData({ ...formData, mother_handle: e.target.value })}
                placeholder="Person handle or Gramps ID (e.g., I0002)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the handle or Gramps ID of the mother
              </p>
            </div>

            <div>
              <label htmlFor="family_type" className="block text-sm font-medium text-gray-700 mb-1">
                Family Type
              </label>
              <select
                id="family_type"
                value={formData.family_type}
                onChange={(e) => setFormData({ ...formData, family_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="married">Married</option>
                <option value="unmarried">Unmarried</option>
                <option value="civil_union">Civil Union</option>
                <option value="unknown">Unknown</option>
              </select>
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
              {submitting ? 'Creating...' : 'Create Family'}
            </button>
            <a
              href="/families"
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

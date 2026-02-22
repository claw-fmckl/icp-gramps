import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, FormEvent } from 'react';
import { useActor } from '../../hooks/useActor';

export const Route = createFileRoute('/persons/new' as any)({
  component: NewPersonPage,
});

function NewPersonPage() {
  const actor = useActor();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    given_names: '',
    surname: '',
    gender: '0',
    call_name: '',
    title_text: '',
    suffix: '',
    private: false,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const input = {
        given_names: formData.given_names,
        surname: formData.surname,
        gender: BigInt(formData.gender),
        call_name: formData.call_name || null,
        title_text: formData.title_text || null,
        suffix: formData.suffix || null,
        private: formData.private || null,
      };

      const result = await actor.create_person(input);
      if (result) {
        navigate({ to: `/persons/${result.handle}` as any });
      } else {
        setError('Failed to create person');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create person');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Person</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="given_names" className="block text-sm font-medium text-gray-700 mb-1">
                Given Names <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="given_names"
                required
                value={formData.given_names}
                onChange={(e) => setFormData({ ...formData, given_names: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                Surname
              </label>
              <input
                type="text"
                id="surname"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">Unknown</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
                <option value="3">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="call_name" className="block text-sm font-medium text-gray-700 mb-1">
                Call Name
              </label>
              <input
                type="text"
                id="call_name"
                value={formData.call_name}
                onChange={(e) => setFormData({ ...formData, call_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="title_text" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title_text"
                placeholder="Dr., Rev., etc."
                value={formData.title_text}
                onChange={(e) => setFormData({ ...formData, title_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="suffix" className="block text-sm font-medium text-gray-700 mb-1">
                Suffix
              </label>
              <input
                type="text"
                id="suffix"
                placeholder="Jr., III, etc."
                value={formData.suffix}
                onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
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
              {submitting ? 'Creating...' : 'Create Person'}
            </button>
            <a
              href="/persons"
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

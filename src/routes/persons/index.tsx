import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useActor } from '../../hooks/useActor';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { GenderIcon } from '../../components/GenderIcon';
import { PersonName } from '../../components/PersonName';
import type { Person } from '../../declarations/icp-gramps';

export const Route = createFileRoute('/persons/' as any)({
  component: PersonsListPage,
});

function PersonsListPage() {
  const actor = useActor();
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPersons() {
      try {
        setLoading(true);
        const result = await actor.list_persons();
        setPersons(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch persons');
      } finally {
        setLoading(false);
      }
    }
    fetchPersons();
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
        <h1 className="text-3xl font-bold text-gray-900">Persons</h1>
        <a
          href="/persons/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Person
        </a>
      </div>

      {persons.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No persons yet. Create your first person to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {persons.map((person) => (
                <tr key={person.handle} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`/persons/${person.handle}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <PersonName person={person} />
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <GenderIcon gender={person.gender} className="text-lg" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href={`/persons/${person.handle}/edit`}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      Edit
                    </a>
                    <a
                      href={`/persons/${person.handle}`}
                      className="text-gray-600 hover:text-gray-800"
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

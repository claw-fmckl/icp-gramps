import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useActor } from '../../hooks/useActor';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Family, Person } from '../../declarations/icp-gramps';

export const Route = createFileRoute('/families/' as any)({
  component: FamiliesListPage,
});

function FamiliesListPage() {
  const actor = useActor();
  const [families, setFamilies] = useState<Family[]>([]);
  const [familyChildren, setFamilyChildren] = useState<Record<string, number>>({});
  const [persons, setPersons] = useState<Record<string, Person>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [familiesResult, personsResult] = await Promise.all([
          actor.list_families(),
          actor.list_persons(),
        ]);
        setFamilies(familiesResult);

        // Build a person lookup map
        const personMap: Record<string, Person> = {};
        personsResult.forEach((p) => {
          personMap[p.handle] = p;
        });
        setPersons(personMap);

        // Fetch children count for each family
        const childrenCounts: Record<string, number> = {};
        await Promise.all(
          familiesResult.map(async (family) => {
            const children = await actor.get_family_children(family.handle);
            childrenCounts[family.handle] = children.length;
          })
        );
        setFamilyChildren(childrenCounts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch families');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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

  const getPersonName = (handle: string | null) => {
    if (!handle) return 'Unknown';
    const person = persons[handle];
    if (!person) return 'Unknown';
    return `${person.given_names} ${person.surname}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Families</h1>
        <a
          href="/families/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Family
        </a>
      </div>

      {families.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No families yet. Create your first family to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Father
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mother
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Children
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {families.map((family) => (
                <tr key={family.handle} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {family.father_handle ? (
                      <a
                        href={`/persons/${family.father_handle}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {getPersonName(family.father_handle)}
                      </a>
                    ) : (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {family.mother_handle ? (
                      <a
                        href={`/persons/${family.mother_handle}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {getPersonName(family.mother_handle)}
                      </a>
                    ) : (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {familyChildren[family.handle] || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href={`/families/${family.handle}`}
                      className="text-blue-600 hover:text-blue-800"
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

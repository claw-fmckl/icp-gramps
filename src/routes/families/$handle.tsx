import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useActor } from '../../hooks/useActor';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PersonName } from '../../components/PersonName';
import type { Family, Person } from '../../declarations/icp-gramps';

export const Route = createFileRoute('/families/$handle' as any)({
  component: FamilyDetailPage,
});

function FamilyDetailPage() {
  const actor = useActor();
  const navigate = useNavigate();
  const { handle } = Route.useParams();
  const [family, setFamily] = useState<Family | null>(null);
  const [father, setFather] = useState<Person | null>(null);
  const [mother, setMother] = useState<Person | null>(null);
  const [children, setChildren] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchFamily() {
      try {
        setLoading(true);
        const result = await actor.get_family(handle);
        if (result) {
          setFamily(result);

          // Fetch father and mother
          if (result.father_handle) {
            const f = await actor.get_person(result.father_handle);
            setFather(f);
          }
          if (result.mother_handle) {
            const m = await actor.get_person(result.mother_handle);
            setMother(m);
          }

          // Fetch children
          const c = await actor.get_family_children(handle);
          setChildren(c);
        } else {
          setError('Family not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch family');
      } finally {
        setLoading(false);
      }
    }
    fetchFamily();
  }, [actor, handle]);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this family? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const result = await actor.delete_family(handle);
      if (result) {
        navigate({ to: '/families' as any });
      } else {
        setError('Failed to delete family');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete family');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !family) {
    return (
      <div>
        <div className="text-red-600 mb-4">
          Error: {error || 'Family not found'}
        </div>
        <a href="/families" className="text-blue-600 hover:text-blue-800">
          Back to Families
        </a>
      </div>
    );
  }

  const getFamilyTypeLabel = (type: string) => {
    switch (type) {
      case 'married': return 'Married';
      case 'unmarried': return 'Unmarried';
      case 'civil_union': return 'Civil Union';
      case 'unknown': return 'Unknown';
      default: return type;
    }
  };

  return (
    <div>
      <div className="mb-4">
        <a href="/families" className="text-blue-600 hover:text-blue-800">
          ← Back to Families
        </a>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Family {family.gramps_id}
            </h1>
            <div className="text-sm text-gray-500">
              {getFamilyTypeLabel(family.family_type)}
            </div>
          </div>
          <div className="flex gap-2">
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Father</h2>
            {father ? (
              <a
                href={`/persons/${father.handle}`}
                className="text-blue-600 hover:text-blue-800 text-lg"
              >
                <PersonName person={father} />
              </a>
            ) : (
              <p className="text-gray-500 italic">Unknown</p>
            )}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Mother</h2>
            {mother ? (
              <a
                href={`/persons/${mother.handle}`}
                className="text-blue-600 hover:text-blue-800 text-lg"
              >
                <PersonName person={mother} />
              </a>
            ) : (
              <p className="text-gray-500 italic">Unknown</p>
            )}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Children ({children.length})
            </h2>
            {children.length === 0 ? (
              <p className="text-gray-500 italic">No children recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {children.map((child) => (
                  <li key={child.handle}>
                    <a
                      href={`/persons/${child.handle}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <PersonName person={child} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-sm font-medium text-gray-500">Privacy</h2>
            <p className="text-gray-900">{family.private ? 'Private' : 'Public'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

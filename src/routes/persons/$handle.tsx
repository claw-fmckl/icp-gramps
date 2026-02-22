import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useActor } from '../../hooks/useActor';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { GenderIcon } from '../../components/GenderIcon';
import { PersonName } from '../../components/PersonName';
import { EventForm } from '../../components/EventForm';
import type { Person, Event, EventInput, Family } from '../../declarations/icp-gramps';

export const Route = createFileRoute('/persons/$handle' as any)({
  component: PersonDetailPage,
});

function PersonDetailPage() {
  const actor = useActor();
  const navigate = useNavigate();
  const { handle } = Route.useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [birthEvent, setBirthEvent] = useState<Event | null>(null);
  const [deathEvent, setDeathEvent] = useState<Event | null>(null);
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [showDeathForm, setShowDeathForm] = useState(false);
  const [parentFamilies, setParentFamilies] = useState<Family[]>([]);
  const [ownFamilies, setOwnFamilies] = useState<Family[]>([]);
  const [personsCache, setPersonsCache] = useState<Record<string, Person>>({});

  useEffect(() => {
    async function fetchPerson() {
      try {
        setLoading(true);
        const result = await actor.get_person(handle);
        if (result) {
          setPerson(result);
          // Fetch birth and death events
          const birth = await actor.get_person_birth(handle);
          const death = await actor.get_person_death(handle);
          setBirthEvent(birth);
          setDeathEvent(death);

          // Fetch families
          const parentFams = await actor.get_person_parent_families(handle);
          const ownFams = await actor.get_person_own_families(handle);
          setParentFamilies(parentFams);
          setOwnFamilies(ownFams);

          // Build person cache for family members
          const cache: Record<string, Person> = {};
          const allFamilies = [...parentFams, ...ownFams];
          const personHandles = new Set<string>();
          allFamilies.forEach(fam => {
            if (fam.father_handle) personHandles.add(fam.father_handle);
            if (fam.mother_handle) personHandles.add(fam.mother_handle);
          });
          await Promise.all(
            Array.from(personHandles).map(async (h) => {
              const p = await actor.get_person(h);
              if (p) cache[h] = p;
            })
          );
          setPersonsCache(cache);
        } else {
          setError('Person not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch person');
      } finally {
        setLoading(false);
      }
    }
    fetchPerson();
  }, [actor, handle]);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this person? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const result = await actor.delete_person(handle);
      if (result) {
        navigate({ to: '/persons' as any });
      } else {
        setError('Failed to delete person');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete person');
    } finally {
      setDeleting(false);
    }
  }

  async function handleBirthSubmit(input: EventInput) {
    try {
      if (birthEvent) {
        // Update existing birth event
        const updated = await actor.update_event(birthEvent.handle, input);
        setBirthEvent(updated);
      } else {
        // Create new birth event
        const newEvent = await actor.set_person_birth(handle, input);
        setBirthEvent(newEvent);
      }
      setShowBirthForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save birth event');
    }
  }

  async function handleDeathSubmit(input: EventInput) {
    try {
      if (deathEvent) {
        // Update existing death event
        const updated = await actor.update_event(deathEvent.handle, input);
        setDeathEvent(updated);
      } else {
        // Create new death event
        const newEvent = await actor.set_person_death(handle, input);
        setDeathEvent(newEvent);
      }
      setShowDeathForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save death event');
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !person) {
    return (
      <div>
        <div className="text-red-600 mb-4">
          Error: {error || 'Person not found'}
        </div>
        <a href="/persons" className="text-blue-600 hover:text-blue-800">
          Back to Persons
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <a href="/persons" className="text-blue-600 hover:text-blue-800">
          ← Back to Persons
        </a>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <PersonName person={person} />
            </h1>
            <div className="flex items-center gap-3 text-gray-600">
              <GenderIcon gender={person.gender} className="text-xl" />
              <span className="text-sm text-gray-500">ID: {person.gramps_id}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`/persons/${person.handle}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </a>
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
          {person.call_name && (
            <div>
              <h2 className="text-sm font-medium text-gray-500">Known as</h2>
              <p className="text-gray-900">{person.call_name}</p>
            </div>
          )}

          <div>
            <h2 className="text-sm font-medium text-gray-500">Given Names</h2>
            <p className="text-gray-900">{person.given_names}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Surname</h2>
            <p className="text-gray-900">{person.surname || '(none)'}</p>
          </div>

          {person.title_text && (
            <div>
              <h2 className="text-sm font-medium text-gray-500">Title</h2>
              <p className="text-gray-900">{person.title_text}</p>
            </div>
          )}

          {person.suffix && (
            <div>
              <h2 className="text-sm font-medium text-gray-500">Suffix</h2>
              <p className="text-gray-900">{person.suffix}</p>
            </div>
          )}

          <div>
            <h2 className="text-sm font-medium text-gray-500">Privacy</h2>
            <p className="text-gray-900">{person.private ? 'Private' : 'Public'}</p>
          </div>

          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Birth</h2>
              {!showBirthForm && (
                <button
                  onClick={() => setShowBirthForm(true)}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {birthEvent ? 'Edit' : 'Add birth'}
                </button>
              )}
            </div>
            {showBirthForm ? (
              <EventForm
                eventType="birth"
                initialData={birthEvent ? {
                  date_text: birthEvent.date_text || undefined,
                  place_text: birthEvent.place_text || undefined,
                  description: birthEvent.description || undefined,
                  private: birthEvent.private,
                } : undefined}
                onSubmit={handleBirthSubmit}
                onCancel={() => setShowBirthForm(false)}
              />
            ) : birthEvent ? (
              <div className="space-y-1">
                {birthEvent.date_text && <p className="text-gray-900">{birthEvent.date_text}</p>}
                {birthEvent.place_text && <p className="text-gray-600">{birthEvent.place_text}</p>}
                {birthEvent.description && <p className="text-sm text-gray-500 mt-2">{birthEvent.description}</p>}
              </div>
            ) : (
              <p className="text-gray-500 italic">No birth information recorded yet.</p>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Death</h2>
              {!showDeathForm && (
                <button
                  onClick={() => setShowDeathForm(true)}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {deathEvent ? 'Edit' : 'Add death'}
                </button>
              )}
            </div>
            {showDeathForm ? (
              <EventForm
                eventType="death"
                initialData={deathEvent ? {
                  date_text: deathEvent.date_text || undefined,
                  place_text: deathEvent.place_text || undefined,
                  description: deathEvent.description || undefined,
                  private: deathEvent.private,
                } : undefined}
                onSubmit={handleDeathSubmit}
                onCancel={() => setShowDeathForm(false)}
              />
            ) : deathEvent ? (
              <div className="space-y-1">
                {deathEvent.date_text && <p className="text-gray-900">{deathEvent.date_text}</p>}
                {deathEvent.place_text && <p className="text-gray-600">{deathEvent.place_text}</p>}
                {deathEvent.description && <p className="text-sm text-gray-500 mt-2">{deathEvent.description}</p>}
              </div>
            ) : (
              <p className="text-gray-500 italic">No death information recorded yet.</p>
            )}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Parents</h2>
            {parentFamilies.length === 0 ? (
              <p className="text-gray-500 italic">No parent information recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {parentFamilies.map((family) => (
                  <div key={family.handle} className="bg-gray-50 p-3 rounded">
                    <a href={`/families/${family.handle}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      Family {family.gramps_id}
                    </a>
                    <div className="mt-1 text-sm space-y-1">
                      {family.father_handle && personsCache[family.father_handle] && (
                        <div>
                          <span className="text-gray-600">Father: </span>
                          <a href={`/persons/${family.father_handle}`} className="text-blue-600 hover:text-blue-800">
                            <PersonName person={personsCache[family.father_handle]} />
                          </a>
                        </div>
                      )}
                      {family.mother_handle && personsCache[family.mother_handle] && (
                        <div>
                          <span className="text-gray-600">Mother: </span>
                          <a href={`/persons/${family.mother_handle}`} className="text-blue-600 hover:text-blue-800">
                            <PersonName person={personsCache[family.mother_handle]} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Families & Spouses</h2>
            {ownFamilies.length === 0 ? (
              <p className="text-gray-500 italic">No family information recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {ownFamilies.map((family) => {
                  // Find spouse (the other parent in the family)
                  const spouseHandle = family.father_handle === handle 
                    ? family.mother_handle 
                    : family.father_handle;
                  const spouse = spouseHandle ? personsCache[spouseHandle] : null;

                  return (
                    <div key={family.handle} className="bg-gray-50 p-3 rounded">
                      <a href={`/families/${family.handle}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        Family {family.gramps_id}
                      </a>
                      {spouse && (
                        <div className="mt-1 text-sm">
                          <span className="text-gray-600">Spouse: </span>
                          <a href={`/persons/${spouse.handle}`} className="text-blue-600 hover:text-blue-800">
                            <PersonName person={spouse} />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

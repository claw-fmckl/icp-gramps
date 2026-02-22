import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useActor } from '../../hooks/useActor';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { GenderIcon } from '../../components/GenderIcon';
import { PersonName } from '../../components/PersonName';
import { EventForm } from '../../components/EventForm';
import type { Person, Event, EventInput } from '../../declarations/icp-gramps';

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
            <p className="text-gray-500 italic">Parent information will be available in Phase 5.</p>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Families & Spouses</h2>
            <p className="text-gray-500 italic">Family information will be available in Phase 5.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Person } from '../declarations/icp-gramps';

interface PersonNameProps {
  person: Person;
  className?: string;
}

export function PersonName({ person, className = '' }: PersonNameProps) {
  const parts = [
    person.title_text,
    person.given_names,
    person.surname,
    person.suffix,
  ].filter(Boolean);

  return <span className={className}>{parts.join(' ')}</span>;
}

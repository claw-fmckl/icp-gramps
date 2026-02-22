export interface Person {
  handle: string;
  gramps_id: string;
  gender: bigint;
  given_names: string;
  call_name: string | null;
  surname: string;
  suffix: string | null;
  title_text: string | null;
  birth_ref_handle: string | null;
  death_ref_handle: string | null;
  private: boolean;
  change_date: bigint;
  created_at: bigint;
}

export interface PersonInput {
  gender: bigint;
  given_names: string;
  call_name: string | null;
  surname: string;
  suffix: string | null;
  title_text: string | null;
  private: boolean | null;
}

export interface Event {
  handle: string;
  gramps_id: string;
  event_type: string;
  place_text: string | null;
  date_sortval: bigint | null;
  date_text: string | null;
  description: string;
  private: boolean;
  change_date: bigint;
  created_at: bigint;
}

export interface EventInput {
  event_type: string;
  place_text: string | null;
  date_sortval: bigint | null;
  date_text: string | null;
  description: string | null;
  private: boolean | null;
}

export interface _SERVICE {
  list_persons: () => Promise<Person[]>;
  get_person: (handle: string) => Promise<Person | null>;
  create_person: (input: PersonInput) => Promise<Person | null>;
  update_person: (handle: string, input: PersonInput) => Promise<Person | null>;
  delete_person: (handle: string) => Promise<boolean>;
  create_event: (input: EventInput) => Promise<Event | null>;
  update_event: (handle: string, input: EventInput) => Promise<Event | null>;
  delete_event: (handle: string) => Promise<boolean>;
  get_event: (handle: string) => Promise<Event | null>;
  set_person_birth: (person_handle: string, input: EventInput) => Promise<Event | null>;
  set_person_death: (person_handle: string, input: EventInput) => Promise<Event | null>;
  get_person_birth: (person_handle: string) => Promise<Event | null>;
  get_person_death: (person_handle: string) => Promise<Event | null>;
}

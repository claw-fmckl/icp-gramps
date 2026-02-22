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
  place_handle: string | null;
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
  place_handle: string | null;
  place_text: string | null;
  date_sortval: bigint | null;
  date_text: string | null;
  description: string | null;
  private: boolean | null;
}

export interface Family {
  handle: string;
  gramps_id: string;
  father_handle: string | null;
  mother_handle: string | null;
  family_type: string;
  private: boolean;
  change_date: bigint;
  created_at: bigint;
}

export interface FamilyInput {
  father_handle: string | null;
  mother_handle: string | null;
  family_type: string | null;
  private: boolean | null;
}

export interface Place {
  handle: string;
  gramps_id: string;
  title: string;
  name: string;
  place_type: string;
  latitude: number | null;
  longitude: number | null;
  code: string | null;
  private: boolean;
  change_date: bigint;
  created_at: bigint;
}

export interface PlaceInput {
  title: string;
  name: string | null;
  place_type: string | null;
  latitude: number | null;
  longitude: number | null;
  code: string | null;
  private: boolean | null;
}

export interface _SERVICE {
  list_persons: () => Promise<Person[]>;
  get_person: (handle: string) => Promise<Person | null>;
  create_person: (input: PersonInput) => Promise<Person | null>;
  update_person: (handle: string, input: PersonInput) => Promise<Person | null>;
  delete_person: (handle: string) => Promise<boolean>;
  search_persons: (query: string) => Promise<Person[]>;
  create_event: (input: EventInput) => Promise<Event | null>;
  update_event: (handle: string, input: EventInput) => Promise<Event | null>;
  delete_event: (handle: string) => Promise<boolean>;
  get_event: (handle: string) => Promise<Event | null>;
  set_person_birth: (person_handle: string, input: EventInput) => Promise<Event | null>;
  set_person_death: (person_handle: string, input: EventInput) => Promise<Event | null>;
  get_person_birth: (person_handle: string) => Promise<Event | null>;
  get_person_death: (person_handle: string) => Promise<Event | null>;
  list_places: () => Promise<Place[]>;
  get_place: (handle: string) => Promise<Place | null>;
  search_places: (query: string) => Promise<Place[]>;
  create_place: (input: PlaceInput) => Promise<Place | null>;
  update_place: (handle: string, input: PlaceInput) => Promise<Place | null>;
  delete_place: (handle: string) => Promise<boolean>;
  list_families: () => Promise<Family[]>;
  get_family: (handle: string) => Promise<Family | null>;
  create_family: (input: FamilyInput) => Promise<Family | null>;
  update_family: (handle: string, input: FamilyInput) => Promise<Family | null>;
  delete_family: (handle: string) => Promise<boolean>;
  add_child_to_family: (family_handle: string, child_handle: string, father_rel: string, mother_rel: string) => Promise<boolean>;
  remove_child_from_family: (family_handle: string, child_handle: string) => Promise<boolean>;
  get_family_children: (family_handle: string) => Promise<Person[]>;
  get_person_parent_families: (person_handle: string) => Promise<Family[]>;
  get_person_own_families: (person_handle: string) => Promise<Family[]>;
}

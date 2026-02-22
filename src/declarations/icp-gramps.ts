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

export interface _SERVICE {
  list_persons: () => Promise<Person[]>;
  get_person: (handle: string) => Promise<Person | null>;
  create_person: (input: PersonInput) => Promise<Person | null>;
  update_person: (handle: string, input: PersonInput) => Promise<Person | null>;
  delete_person: (handle: string) => Promise<boolean>;
}

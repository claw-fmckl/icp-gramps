import type { IDL } from '@dfinity/candid';

export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const Person = IDL.Record({
    handle: IDL.Text,
    gramps_id: IDL.Text,
    gender: IDL.Int64,
    given_names: IDL.Text,
    call_name: IDL.Opt(IDL.Text),
    surname: IDL.Text,
    suffix: IDL.Opt(IDL.Text),
    title_text: IDL.Opt(IDL.Text),
    birth_ref_handle: IDL.Opt(IDL.Text),
    death_ref_handle: IDL.Opt(IDL.Text),
    private: IDL.Bool,
    change_date: IDL.Int64,
    created_at: IDL.Int64,
  });

  const PersonInput = IDL.Record({
    gender: IDL.Int64,
    given_names: IDL.Text,
    call_name: IDL.Opt(IDL.Text),
    surname: IDL.Text,
    suffix: IDL.Opt(IDL.Text),
    title_text: IDL.Opt(IDL.Text),
    private: IDL.Opt(IDL.Bool),
  });

  const Event = IDL.Record({
    handle: IDL.Text,
    gramps_id: IDL.Text,
    event_type: IDL.Text,
    place_text: IDL.Opt(IDL.Text),
    date_sortval: IDL.Opt(IDL.Int64),
    date_text: IDL.Opt(IDL.Text),
    description: IDL.Text,
    private: IDL.Bool,
    change_date: IDL.Int64,
    created_at: IDL.Int64,
  });

  const EventInput = IDL.Record({
    event_type: IDL.Text,
    place_text: IDL.Opt(IDL.Text),
    date_sortval: IDL.Opt(IDL.Int64),
    date_text: IDL.Opt(IDL.Text),
    description: IDL.Opt(IDL.Text),
    private: IDL.Opt(IDL.Bool),
  });

  return IDL.Service({
    http_request: IDL.Func(
      [
        IDL.Record({
          url: IDL.Text,
          method: IDL.Text,
          headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
          body: IDL.Vec(IDL.Nat8),
        }),
      ],
      [
        IDL.Record({
          status_code: IDL.Nat16,
          headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
          body: IDL.Vec(IDL.Nat8),
          upgrade: IDL.Opt(IDL.Bool),
        }),
      ],
      ['query']
    ),
    http_request_update: IDL.Func(
      [
        IDL.Record({
          url: IDL.Text,
          method: IDL.Text,
          headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
          body: IDL.Vec(IDL.Nat8),
        }),
      ],
      [
        IDL.Record({
          status_code: IDL.Nat16,
          headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
          body: IDL.Vec(IDL.Nat8),
          upgrade: IDL.Opt(IDL.Bool),
        }),
      ],
      []
    ),
    list_persons: IDL.Func([], [IDL.Vec(Person)], ['query']),
    get_person: IDL.Func([IDL.Text], [IDL.Opt(Person)], ['query']),
    create_person: IDL.Func([PersonInput], [IDL.Opt(Person)], []),
    update_person: IDL.Func([IDL.Text, PersonInput], [IDL.Opt(Person)], []),
    delete_person: IDL.Func([IDL.Text], [IDL.Bool], []),
    create_event: IDL.Func([EventInput], [IDL.Opt(Event)], []),
    update_event: IDL.Func([IDL.Text, EventInput], [IDL.Opt(Event)], []),
    delete_event: IDL.Func([IDL.Text], [IDL.Bool], []),
    get_event: IDL.Func([IDL.Text], [IDL.Opt(Event)], ['query']),
    set_person_birth: IDL.Func([IDL.Text, EventInput], [IDL.Opt(Event)], []),
    set_person_death: IDL.Func([IDL.Text, EventInput], [IDL.Opt(Event)], []),
    get_person_birth: IDL.Func([IDL.Text], [IDL.Opt(Event)], ['query']),
    get_person_death: IDL.Func([IDL.Text], [IDL.Opt(Event)], ['query']),
  });
};

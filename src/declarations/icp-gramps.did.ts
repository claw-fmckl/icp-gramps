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
    place_handle: IDL.Opt(IDL.Text),
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
    place_handle: IDL.Opt(IDL.Text),
    place_text: IDL.Opt(IDL.Text),
    date_sortval: IDL.Opt(IDL.Int64),
    date_text: IDL.Opt(IDL.Text),
    description: IDL.Opt(IDL.Text),
    private: IDL.Opt(IDL.Bool),
  });

  const Family = IDL.Record({
    handle: IDL.Text,
    gramps_id: IDL.Text,
    father_handle: IDL.Opt(IDL.Text),
    mother_handle: IDL.Opt(IDL.Text),
    family_type: IDL.Text,
    private: IDL.Bool,
    change_date: IDL.Int64,
    created_at: IDL.Int64,
  });

  const FamilyInput = IDL.Record({
    father_handle: IDL.Opt(IDL.Text),
    mother_handle: IDL.Opt(IDL.Text),
    family_type: IDL.Opt(IDL.Text),
    private: IDL.Opt(IDL.Bool),
  });

  const Place = IDL.Record({
    handle: IDL.Text,
    gramps_id: IDL.Text,
    title: IDL.Text,
    name: IDL.Text,
    place_type: IDL.Text,
    latitude: IDL.Opt(IDL.Float64),
    longitude: IDL.Opt(IDL.Float64),
    code: IDL.Opt(IDL.Text),
    private: IDL.Bool,
    change_date: IDL.Int64,
    created_at: IDL.Int64,
  });

  const PlaceInput = IDL.Record({
    title: IDL.Text,
    name: IDL.Opt(IDL.Text),
    place_type: IDL.Opt(IDL.Text),
    latitude: IDL.Opt(IDL.Float64),
    longitude: IDL.Opt(IDL.Float64),
    code: IDL.Opt(IDL.Text),
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
    search_persons: IDL.Func([IDL.Text], [IDL.Vec(Person)], ['query']),
    create_event: IDL.Func([EventInput], [IDL.Opt(Event)], []),
    update_event: IDL.Func([IDL.Text, EventInput], [IDL.Opt(Event)], []),
    delete_event: IDL.Func([IDL.Text], [IDL.Bool], []),
    get_event: IDL.Func([IDL.Text], [IDL.Opt(Event)], ['query']),
    set_person_birth: IDL.Func([IDL.Text, EventInput], [IDL.Opt(Event)], []),
    set_person_death: IDL.Func([IDL.Text, EventInput], [IDL.Opt(Event)], []),
    get_person_birth: IDL.Func([IDL.Text], [IDL.Opt(Event)], ['query']),
    get_person_death: IDL.Func([IDL.Text], [IDL.Opt(Event)], ['query']),
    list_places: IDL.Func([], [IDL.Vec(Place)], ['query']),
    get_place: IDL.Func([IDL.Text], [IDL.Opt(Place)], ['query']),
    search_places: IDL.Func([IDL.Text], [IDL.Vec(Place)], ['query']),
    create_place: IDL.Func([PlaceInput], [IDL.Opt(Place)], []),
    update_place: IDL.Func([IDL.Text, PlaceInput], [IDL.Opt(Place)], []),
    delete_place: IDL.Func([IDL.Text], [IDL.Bool], []),
    list_families: IDL.Func([], [IDL.Vec(Family)], ['query']),
    get_family: IDL.Func([IDL.Text], [IDL.Opt(Family)], ['query']),
    create_family: IDL.Func([FamilyInput], [IDL.Opt(Family)], []),
    update_family: IDL.Func([IDL.Text, FamilyInput], [IDL.Opt(Family)], []),
    delete_family: IDL.Func([IDL.Text], [IDL.Bool], []),
    add_child_to_family: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    remove_child_from_family: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    get_family_children: IDL.Func([IDL.Text], [IDL.Vec(Person)], ['query']),
    get_person_parent_families: IDL.Func([IDL.Text], [IDL.Vec(Family)], ['query']),
    get_person_own_families: IDL.Func([IDL.Text], [IDL.Vec(Family)], ['query']),
  });
};

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
  });
};

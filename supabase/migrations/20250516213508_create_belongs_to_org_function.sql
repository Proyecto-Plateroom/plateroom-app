create or replace function private.belongs_to_org(org_id text)
returns boolean
language plpgsql
security definer
as $$
  begin
    return (( SELECT (auth.jwt() #>> '{o,id}'::text[])) = org_id);
  end;
$$;
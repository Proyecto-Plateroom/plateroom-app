create or replace function private.order_belongs_to_user_org(table_id bigint, menu_id bigint)
returns boolean
language plpgsql
security definer
as $$
declare
  v_org_id text;
  v_table_org text;
  v_menu_org text;
begin
  select (auth.jwt() #>> '{o,id}') into v_org_id;

  select organization_id into v_table_org
  from public.tables
  where id = table_id;

  select organization_id into v_menu_org
  from public.menus
  where id = menu_id;

  return v_table_org = v_org_id and v_menu_org = v_org_id;
end;
$$;
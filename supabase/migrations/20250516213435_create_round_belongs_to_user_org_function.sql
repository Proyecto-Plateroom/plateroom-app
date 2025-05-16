CREATE SCHEMA IF NOT EXISTS private;

create or replace function private.round_belongs_to_user_org(order_id bigint)
returns boolean
language plpgsql
security definer
as $$
declare
  v_table_id bigint;
  v_menu_id bigint;
  v_org_id text;
  v_table_org text;
  v_menu_org text;
begin
  select table_id, menu_id into v_table_id, v_menu_id
  from public.orders
  where id = order_id;

  select (auth.jwt() #>> '{o,id}') into v_org_id;

  select organization_id into v_table_org
  from public.tables
  where id = v_table_id;

  select organization_id into v_menu_org
  from public.menus
  where id = v_menu_id;

  return v_table_org = v_org_id and v_menu_org = v_org_id;
end;
$$;
ALTER TABLE menus
    ALTER COLUMN organization_id TYPE text USING organization_id::text;

ALTER TABLE tables
    ALTER COLUMN organization_id TYPE text USING organization_id::text;

CREATE TABLE IF NOT EXISTS menus (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name varchar(255) NOT NULL,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    organization_id bigint,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS orders (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uuid uuid UNIQUE NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    is_open boolean NOT NULL DEFAULT true,
    menu_id bigint NOT NULL REFERENCES menus(id),
    table_id bigint NOT NULL REFERENCES tables(id),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

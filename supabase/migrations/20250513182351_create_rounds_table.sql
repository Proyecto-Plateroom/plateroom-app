CREATE TABLE IF NOT EXISTS rounds (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    number integer NOT NULL DEFAULT 1,
    is_open boolean NOT NULL DEFAULT true,
    order_id bigint NOT NULL REFERENCES orders(id),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

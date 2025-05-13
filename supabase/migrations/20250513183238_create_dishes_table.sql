CREATE TABLE IF NOT EXISTS dishes (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name varchar(255) NOT NULL,
    description text,
    supplement NUMERIC(12,2) NOT NULL DEFAULT 0,
    photo_path varchar(255),
    category_id bigint NOT NULL REFERENCES dish_categories(id),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

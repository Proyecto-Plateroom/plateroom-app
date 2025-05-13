CREATE TABLE IF NOT EXISTS dish_round (
    dish_id bigint NOT NULL REFERENCES dishes(id),
    round_id bigint NOT NULL REFERENCES rounds(id),
    amount integer NOT NULL DEFAULT 1,
    PRIMARY KEY (dish_id, round_id)
);

ALTER TABLE dish_round ENABLE ROW LEVEL SECURITY;

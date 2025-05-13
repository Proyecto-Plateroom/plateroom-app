CREATE TABLE IF NOT EXISTS dish_menu (
    dish_id bigint NOT NULL REFERENCES dishes(id),
    menu_id bigint NOT NULL REFERENCES menus(id),
    PRIMARY KEY (dish_id, menu_id)
);

ALTER TABLE dish_menu ENABLE ROW LEVEL SECURITY;

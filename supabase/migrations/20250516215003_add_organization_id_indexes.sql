-- Índice para la tabla tables
CREATE INDEX IF NOT EXISTS idx_tables_organization_id ON public.tables(organization_id);

-- Índice para la tabla menus
CREATE INDEX IF NOT EXISTS idx_menus_organization_id ON public.menus(organization_id);

-- Índice para la tabla dishes
CREATE INDEX IF NOT EXISTS idx_dishes_organization_id ON public.dishes(organization_id);

-- Índice para la tabla dish_categories
CREATE INDEX IF NOT EXISTS idx_dish_categories_organization_id ON public.dish_categories(organization_id);
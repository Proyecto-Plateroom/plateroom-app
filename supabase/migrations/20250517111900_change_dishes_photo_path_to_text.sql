-- Cambiar el tipo de la columna photo_path de varchar a text
ALTER TABLE public.dishes
ALTER COLUMN photo_path TYPE text;

-- ============================================
-- Startbord: meer indelingen en maximaal 5 borden
-- Toegepast 29 oktober 2026
-- ============================================

-- Nieuwe indelingen met kleinere vakken (tot 8 per bord):
--   drie        drie naast elkaar
--   groot-vier  één groot vak links, vier kleine rechts
--   boven-vier  één breed vak boven, vier kleine eronder
--   zes         3 x 2
--   acht        4 x 2
--
-- Nieuw bloktype 'beeld': een afbeelding. Het plaatje zelf staat NIET in de
-- database maar in de browser van de leerkracht (IndexedDB); in de database
-- staat alleen een sleutel ernaar.
--
-- Maximaal 5 borden per persoon (bijvoorbeeld één per schooldag). De
-- editor zegt het netjes; deze trigger zorgt dat het ook echt zo is.

ALTER TABLE public.startborden DROP CONSTRAINT IF EXISTS startborden_indeling_check;
ALTER TABLE public.startborden ADD CONSTRAINT startborden_indeling_check
    CHECK (indeling IN ('een', 'twee', 'drie', 'groot-twee', 'vier', 'groot-vier', 'boven-vier', 'zes', 'acht'));

ALTER TABLE public.startborden DROP CONSTRAINT IF EXISTS startborden_blokken_check;
ALTER TABLE public.startborden ADD CONSTRAINT startborden_blokken_check
    CHECK (jsonb_typeof(blokken) = 'array'
           AND jsonb_array_length(blokken) <= 8
           AND pg_column_size(blokken) < 80000);

CREATE OR REPLACE FUNCTION public.startborden_max()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (SELECT count(*) FROM public.startborden WHERE user_id = NEW.user_id) >= 5 THEN
        RAISE EXCEPTION 'Je kunt maximaal 5 borden bewaren.' USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.startborden_max() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS startborden_max ON public.startborden;
CREATE TRIGGER startborden_max
    BEFORE INSERT ON public.startborden
    FOR EACH ROW EXECUTE FUNCTION public.startborden_max();

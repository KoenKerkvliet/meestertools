-- ============================================
-- Startbord: geen maximum voor de beheerder
-- Toegepast 30 oktober 2026
-- ============================================

-- Leerkrachten houden maximaal 5 borden. De beheerder (super_admin) mag er
-- zoveel bewaren als hij wil. De rol komt uit profiles van de eigenaar van het
-- nieuwe bord, niet uit de browser.

CREATE OR REPLACE FUNCTION public.startborden_max()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.user_id AND role = 'super_admin') THEN
        RETURN NEW;
    END IF;
    IF (SELECT count(*) FROM public.startborden WHERE user_id = NEW.user_id) >= 5 THEN
        RAISE EXCEPTION 'Je kunt maximaal 5 borden bewaren.' USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.startborden_max() FROM PUBLIC, anon, authenticated;

-- ============================================
-- Tijdlijn: bewerking voorstellen
-- Toegepast 27 oktober 2026
-- ============================================

-- Onder elk onderwerp van de tijdlijn kan een bezoeker een fout melden of een
-- aanvulling voorstellen. De tijdlijn is openbaar en heeft geen login, dus
-- insturen mag iedereen, maar alleen via public.tijdlijn_voorstel.
--
-- Er wordt niets over de inzender opgeslagen: geen naam, geen e-mailadres,
-- geen IP-adres, geen gebruikers-id. Alleen het onderwerp en het voorstel.
--
-- Remmen tegen misbruik, omdat er geen login is:
--  - lengte van de tekst begrensd (10 tot 2000 tekens);
--  - een tweede keer precies dezelfde tekst bij hetzelfde onderwerp telt niet;
--  - hooguit 100 voorstellen per uur in totaal (de tabel kan niet vollopen).
--
-- Lezen, bijwerken en verwijderen: alleen de super_admin (tabblad Tijdlijn in beheer).

CREATE TABLE IF NOT EXISTS public.tijdlijn_voorstellen (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  timestamptz NOT NULL DEFAULT now(),
    slug        text        NOT NULL,
    onderwerp   text        NOT NULL,
    soort       text        NOT NULL DEFAULT 'fout' CHECK (soort IN ('fout', 'aanvulling', 'anders')),
    tekst       text        NOT NULL,
    status      text        NOT NULL DEFAULT 'nieuw' CHECK (status IN ('nieuw', 'verwerkt', 'afgewezen'))
);

CREATE INDEX IF NOT EXISTS tijdlijn_voorstellen_created_idx ON public.tijdlijn_voorstellen (created_at DESC);

ALTER TABLE public.tijdlijn_voorstellen ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tijdlijn_voorstellen FROM anon;

DROP POLICY IF EXISTS "tijdlijn_voorstellen_admin" ON public.tijdlijn_voorstellen;
CREATE POLICY "tijdlijn_voorstellen_admin" ON public.tijdlijn_voorstellen
    FOR ALL TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

CREATE OR REPLACE FUNCTION public.tijdlijn_voorstel(p_slug text, p_onderwerp text, p_soort text, p_tekst text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_slug      text := lower(btrim(COALESCE(p_slug, '')));
    v_onderwerp text := btrim(COALESCE(p_onderwerp, ''));
    v_soort     text := COALESCE(NULLIF(btrim(p_soort), ''), 'fout');
    v_tekst     text := btrim(COALESCE(p_tekst, ''));
BEGIN
    IF v_slug !~ '^[a-z0-9-]{1,120}$' OR length(v_onderwerp) NOT BETWEEN 1 AND 200 THEN
        RETURN false;
    END IF;
    IF v_soort NOT IN ('fout', 'aanvulling', 'anders') THEN
        v_soort := 'anders';
    END IF;
    IF length(v_tekst) NOT BETWEEN 10 AND 2000 THEN
        RETURN false;
    END IF;

    IF (SELECT count(*) FROM public.tijdlijn_voorstellen WHERE created_at > now() - interval '1 hour') >= 100 THEN
        RETURN false;
    END IF;

    -- Twee keer op Versturen drukken levert één voorstel op.
    IF EXISTS (SELECT 1 FROM public.tijdlijn_voorstellen
               WHERE slug = v_slug AND tekst = v_tekst AND created_at > now() - interval '1 day') THEN
        RETURN true;
    END IF;

    INSERT INTO public.tijdlijn_voorstellen (slug, onderwerp, soort, tekst)
    VALUES (v_slug, v_onderwerp, v_soort, v_tekst);
    RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.tijdlijn_voorstel(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tijdlijn_voorstel(text, text, text, text) TO anon, authenticated;

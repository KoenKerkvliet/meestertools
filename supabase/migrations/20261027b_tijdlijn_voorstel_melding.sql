-- ============================================
-- Tijdlijn: mailtje bij een nieuw voorstel
-- Toegepast 27 oktober 2026
-- ============================================

-- Nieuwe voorstellen (zie 20261027_tijdlijn_voorstellen.sql) komen per mail
-- binnen, gebundeld: één mail met alles wat nog niet gemeld is.
--
-- Hoe het loopt:
--  - public.tijdlijn_voorstel roept na het opslaan public.tijdlijn_melding_tick aan.
--  - Die roept de edge function tijdlijn-melding aan (via pg_net, met het
--    gedeelde geheim uit public.opruim_geheim), maar hooguit één keer per
--    10 minuten. Zo kan iemand die het formulier volspamt de mailbox niet vullen.
--  - pg_cron draait de tick elk kwartier, zodat een voorstel dat binnen die
--    10 minuten viel alsnog gemeld wordt.
--  - De functie zet gemeld_at; een voorstel wordt dus maar één keer gemaild.

ALTER TABLE public.tijdlijn_voorstellen ADD COLUMN IF NOT EXISTS gemeld_at timestamptz;

CREATE OR REPLACE FUNCTION public.tijdlijn_melding_tick()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_geheim text;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.tijdlijn_voorstellen WHERE gemeld_at IS NULL) THEN
        RETURN;
    END IF;
    IF EXISTS (SELECT 1 FROM public.tijdlijn_voorstellen WHERE gemeld_at > now() - interval '10 minutes') THEN
        RETURN;
    END IF;
    SELECT geheim INTO v_geheim FROM public.opruim_geheim;
    PERFORM net.http_post(
        url     := 'https://chnjybpwquystuwmiger.supabase.co/functions/v1/tijdlijn-melding',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body    := jsonb_build_object('geheim', v_geheim)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.tijdlijn_melding_tick() FROM PUBLIC, anon, authenticated;

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

    -- Mailen mag het opslaan nooit laten mislukken.
    BEGIN
        PERFORM public.tijdlijn_melding_tick();
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.tijdlijn_voorstel(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tijdlijn_voorstel(text, text, text, text) TO anon, authenticated;

SELECT cron.schedule('tijdlijn_melding', '*/15 * * * *', 'SELECT public.tijdlijn_melding_tick();');

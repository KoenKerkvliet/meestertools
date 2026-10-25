-- ============================================
-- Nieuwsbrief: toestemming via het registratieformulier
-- Toegepast 25 oktober 2026
-- ============================================

-- Bij registreren staat een vinkje "Stuur me af en toe een mail over nieuwe
-- tools", standaard uit. In Instellingen > Profiel kan iedereen het later aan-
-- of uitzetten. Bestaande gebruikers worden hier NIET voor gemaild.
--
-- De lijst zelf staat in Emailit (audience "MT – Nieuwe tools"); de edge function
-- nieuwsbrief-sync houdt die gelijk aan de database:
--   - aangevinkt EN e-mailadres bevestigd  -> in de audience
--   - uitgevinkt                            -> uit de audience
--   - account verwijderd                    -> contact helemaal uit Emailit
--   - afgemeld via de link in een Emailit-mail -> vinkje gaat hier ook uit
-- Hij draait direct na een wijziging van het vinkje of een verwijderd account,
-- en elke nacht om alles na te lopen (bevestigingen, gemiste aanroepen).
-- Pas na de bevestiging, zodat iemand niet andermans adres kan opgeven.

-- ---------- 1. Kolommen ----------
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS nieuwsbrief       boolean NOT NULL DEFAULT false,
    -- Bewijs van toestemming: wanneer het vinkje aan ging. Wordt door de
    -- trigger hieronder gezet, nooit door de browser.
    ADD COLUMN IF NOT EXISTS nieuwsbrief_sinds timestamptz;

CREATE OR REPLACE FUNCTION public.nieuwsbrief_sinds_bijhouden()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR NEW.nieuwsbrief IS DISTINCT FROM OLD.nieuwsbrief THEN
        NEW.nieuwsbrief_sinds := CASE WHEN NEW.nieuwsbrief THEN now() ELSE NULL END;
    ELSE
        NEW.nieuwsbrief_sinds := OLD.nieuwsbrief_sinds;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_nieuwsbrief_sinds ON public.profiles;
CREATE TRIGGER profiles_nieuwsbrief_sinds
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.nieuwsbrief_sinds_bijhouden();

-- ---------- 2. Het vinkje uit het registratieformulier overnemen ----------
-- signUp stuurt { nieuwsbrief: true } mee in de metadata. Bewust een
-- tekstvergelijking: een rare waarde mag de registratie nooit laten mislukken.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, nieuwsbrief)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.email,
        CASE
            WHEN NEW.email = 'koen.kerkvliet@movare.nl' THEN 'super_admin'
            ELSE 'user'
        END,
        (NEW.raw_user_meta_data ->> 'nieuwsbrief') = 'true'
    );
    RETURN NEW;
END;
$$;

-- ---------- 3. Wie hoort er in de audience? ----------
CREATE OR REPLACE FUNCTION public._nieuwsbrief_leden()
RETURNS TABLE (user_id uuid, email text, naam text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT p.id,
           lower(u.email),
           split_part(COALESCE(NULLIF(btrim(p.full_name), ''), ''), ' ', 1)
      FROM public.profiles p
      JOIN auth.users u ON u.id = p.id
     WHERE p.nieuwsbrief
       AND u.email IS NOT NULL
       AND u.email_confirmed_at IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public._nieuwsbrief_leden() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._nieuwsbrief_leden() TO service_role;

-- Bestaat er (nog) een account met dit adres? Voor het opruimen in Emailit.
CREATE OR REPLACE FUNCTION public._nieuwsbrief_account_van(p_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT id FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public._nieuwsbrief_account_van(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._nieuwsbrief_account_van(text) TO service_role;

-- ---------- 4. Synchroniseren ----------
-- Zelfde gedeelde geheim als de andere functies die de database aanroept.
CREATE OR REPLACE FUNCTION public.nieuwsbrief_sync_tick()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_geheim text;
BEGIN
    SELECT geheim INTO v_geheim FROM public.opruim_geheim;
    PERFORM net.http_post(
        url     := 'https://chnjybpwquystuwmiger.supabase.co/functions/v1/nieuwsbrief-sync',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body    := jsonb_build_object('geheim', v_geheim)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.nieuwsbrief_sync_tick() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.nieuwsbrief_gewijzigd()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    PERFORM public.nieuwsbrief_sync_tick();
    RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.nieuwsbrief_gewijzigd() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS profiles_nieuwsbrief_sync ON public.profiles;
CREATE TRIGGER profiles_nieuwsbrief_sync
    AFTER UPDATE OF nieuwsbrief ON public.profiles
    FOR EACH ROW
    WHEN (NEW.nieuwsbrief IS DISTINCT FROM OLD.nieuwsbrief)
    EXECUTE FUNCTION public.nieuwsbrief_gewijzigd();

DROP TRIGGER IF EXISTS profiles_nieuwsbrief_weg ON public.profiles;
CREATE TRIGGER profiles_nieuwsbrief_weg
    AFTER DELETE ON public.profiles
    FOR EACH ROW
    WHEN (OLD.nieuwsbrief)
    EXECUTE FUNCTION public.nieuwsbrief_gewijzigd();

SELECT cron.unschedule('nieuwsbrief_sync') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'nieuwsbrief_sync');
SELECT cron.schedule('nieuwsbrief_sync', '20 2 * * *', 'SELECT public.nieuwsbrief_sync_tick();');

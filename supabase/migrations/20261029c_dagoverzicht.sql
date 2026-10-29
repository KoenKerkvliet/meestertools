-- ============================================
-- Dagoverzicht: elke dag om 17.00 uur een mail aan de beheerder
-- Toegepast 29 oktober 2026
-- ============================================

-- Eén mail met de nieuwe aanmeldingen, de gegeven feedback (sterren) en de
-- nieuwe ideeën uit de ideeënbus sinds het vorige overzicht. Ook op een stille
-- dag komt er een (korte) mail: zo zie je meteen als het overzicht stilvalt.
--
-- Geen klasdata: alleen wat de beheerder in Beheer ook al ziet (naam, adres,
-- school, aanmelddatum). Zie project_super_admin_geen_klasdata.

-- ---------- 1. Wanneer is er gemaild? ----------
-- De primary key op de dag is de rem tegen een dubbele mail; de edge function
-- claimt eerst de dag en verstuurt pas daarna. Het vorige verzonden_op is ook het
-- begin van de periode van het volgende overzicht, zodat er niets tussen valt.
CREATE TABLE IF NOT EXISTS public.dagoverzicht_verzonden (
    dag          date PRIMARY KEY,
    verzonden_op timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dagoverzicht_verzonden ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.dagoverzicht_verzonden FROM anon, authenticated;

-- ---------- 2. De inhoud ----------
CREATE OR REPLACE FUNCTION public._dagoverzicht(p_sinds timestamptz)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT jsonb_build_object(
        'aanmeldingen', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                       'naam',        NULLIF(btrim(p.full_name), ''),
                       'email',       p.email,
                       'school',      s.name,
                       'plaats',      s.city,
                       'bevestigd',   u.email_confirmed_at IS NOT NULL,
                       'nieuwsbrief', COALESCE(p.nieuwsbrief, false),
                       'aangemeld',   p.created_at
                   ) ORDER BY p.created_at)
              FROM public.profiles p
              JOIN auth.users u ON u.id = p.id
              LEFT JOIN public.schools s ON s.id = p.school_id
             WHERE p.role = 'user'
               AND p.created_at >= p_sinds
        ), '[]'::jsonb),
        -- Ook een beoordeling die vandaag is aangepast of een toelichting kreeg.
        'feedback', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                       'naam',      NULLIF(btrim(p.full_name), ''),
                       'email',     p.email,
                       'rating',    f.rating,
                       'comment',   f.comment,
                       'nieuw',     f.created_at >= p_sinds,
                       'gegeven',   f.created_at
                   ) ORDER BY f.created_at)
              FROM public.feedback f
              LEFT JOIN public.profiles p ON p.id = f.user_id
             WHERE f.created_at >= p_sinds OR f.updated_at >= p_sinds
        ), '[]'::jsonb),
        'ideeen', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                       'titel',     i.title,
                       'categorie', i.category,
                       'naam',      NULLIF(btrim(p.full_name), ''),
                       'gegeven',   i.created_at
                   ) ORDER BY i.created_at)
              FROM public.ideas i
              LEFT JOIN public.profiles p ON p.id = i.user_id
             WHERE i.created_at >= p_sinds
        ), '[]'::jsonb),
        'totaal_accounts', (SELECT count(*) FROM public.profiles WHERE role = 'user')
    );
$$;

REVOKE ALL ON FUNCTION public._dagoverzicht(timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._dagoverzicht(timestamptz) TO service_role;

-- ---------- 3. Versturen: de database roept de edge function aan ----------
-- pg_cron rekent in UTC. De job draait om 15.00 én 16.00 UTC; alleen de run die
-- in Nederland op 17.00 uur valt gaat door (16.00 UTC in de winter, 15.00 UTC in
-- de zomer). Hetzelfde gedeelde geheim als de account-opruiming.
CREATE OR REPLACE FUNCTION public.dagoverzicht_tick()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_geheim text;
BEGIN
    IF extract(hour FROM now() AT TIME ZONE 'Europe/Amsterdam') <> 17 THEN
        RETURN;
    END IF;

    SELECT geheim INTO v_geheim FROM public.opruim_geheim;

    PERFORM net.http_post(
        url     := 'https://chnjybpwquystuwmiger.supabase.co/functions/v1/dagoverzicht',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body    := jsonb_build_object('geheim', v_geheim)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.dagoverzicht_tick() FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule('dagoverzicht') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'dagoverzicht');
SELECT cron.schedule('dagoverzicht', '0 15,16 * * *', 'SELECT public.dagoverzicht_tick();');

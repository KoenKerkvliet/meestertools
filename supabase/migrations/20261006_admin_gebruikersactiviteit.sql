-- ============================================
-- Beheer: activiteit per gebruiker
-- Toegepast 6 oktober 2026
-- ============================================

-- De gebruikerslijst in /beheer moet kunnen tonen wie nieuw is, wie niet is
-- teruggekomen en wie nooit zijn mail heeft bevestigd. Die gegevens staan niet
-- in public.profiles maar in auth.users / auth.sessions, en daar komt de
-- browser niet bij. Deze functie geeft per gebruiker alleen vier velden terug:
--
--   laatst_actief   het laatste moment dat er een sessie is aangemaakt of
--                   ververst. last_sign_in_at alleen is te zuinig: wie ingelogd
--                   blijft, ververst zijn token zonder dat die kolom verandert.
--   email_bevestigd of de bevestigingsmail is aangeklikt
--   heeft_klas      of er ooit een klas is aangemaakt (of gedeeld met de gebruiker)
--
-- heeft_klas is bewust een boolean. Wat er IN de klas staat blijft buiten bereik
-- van de super admin (zie 20260826_super_admin_ziet_geen_klasdata.sql); dit is
-- geen leesrecht op groups of students.

CREATE OR REPLACE FUNCTION public.admin_gebruikersactiviteit()
RETURNS TABLE (
    user_id         uuid,
    laatst_actief   timestamptz,
    email_bevestigd boolean,
    heeft_klas      boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Alleen voor de beheerder' USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        GREATEST(
            u.last_sign_in_at,
            (SELECT max(GREATEST(s.refreshed_at, s.updated_at, s.created_at))
               FROM auth.sessions s WHERE s.user_id = p.id)
        ),
        (u.email_confirmed_at IS NOT NULL),
        EXISTS (SELECT 1 FROM public.groups g WHERE g.user_id = p.id)
            OR EXISTS (SELECT 1 FROM public.group_members m WHERE m.user_id = p.id)
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_gebruikersactiviteit() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_gebruikersactiviteit() TO authenticated;

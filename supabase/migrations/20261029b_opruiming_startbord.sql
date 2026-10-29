-- ============================================
-- Account-opruiming: ook een startbord telt als gebruik
-- Toegepast 29 oktober 2026
-- ============================================

-- Net als bij Topografie (20261028d): wie een startbord heeft, gebruikt het
-- platform en krijgt geen zetje, geen waarschuwing en wordt nooit automatisch
-- verwijderd. Verder gelijk aan de vorige versie van de functie.

CREATE OR REPLACE FUNCTION public._opruim_kandidaten()
RETURNS TABLE (
    user_id       uuid,
    email         text,
    naam          text,
    aangemeld     timestamptz,
    laatst_actief timestamptz,
    actie         text,
    stap_datum    timestamptz,
    due           boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    WITH basis AS (
        SELECT
            p.id,
            p.email,
            split_part(COALESCE(NULLIF(btrim(p.full_name), ''), ''), ' ', 1) AS naam,
            p.created_at,
            p.school_id,
            (u.email_confirmed_at IS NOT NULL) AS bevestigd,
            GREATEST(
                u.last_sign_in_at,
                (SELECT max(GREATEST(s.refreshed_at, s.updated_at, s.created_at))
                   FROM auth.sessions s WHERE s.user_id = p.id)
            ) AS la,
            -- In gebruik: een eigen of gedeelde klas, een topografiekaart of een startbord
            (EXISTS (SELECT 1 FROM public.groups g WHERE g.user_id = p.id)
              OR EXISTS (SELECT 1 FROM public.group_members m WHERE m.user_id = p.id)
              OR EXISTS (SELECT 1 FROM public.topografie_kaarten t WHERE t.user_id = p.id)
              OR EXISTS (SELECT 1 FROM public.startborden sb WHERE sb.user_id = p.id)) AS in_gebruik,
            (SELECT m.verzonden_op FROM public.opruim_mails m
              WHERE m.user_id = p.id AND m.soort = 'zetje') AS zetje_op,
            (SELECT m.verzonden_op FROM public.opruim_mails m
              WHERE m.user_id = p.id AND m.soort = 'spook') AS spook_op
        FROM public.profiles p
        JOIN auth.users u ON u.id = p.id
        WHERE p.role = 'user'
    ),
    afgeleid AS (
        SELECT b.*,
               (NOT b.in_gebruik AND b.school_id IS NULL) AS kaal,
               (b.la IS NULL OR b.la < b.created_at + interval '1 day') AS nooit_terug
          FROM basis b
    ),
    stappen AS (
        -- Nooit ingelogd, adres nooit bevestigd: stil verwijderen.
        SELECT a.id, a.email, a.naam, a.created_at, a.la,
               'verwijder_onbevestigd'::text AS actie,
               a.created_at + interval '14 days' AS datum
          FROM afgeleid a
         WHERE NOT a.bevestigd AND a.la IS NULL

        UNION ALL
        -- Gewaarschuwd en daarna niets van zich laten horen: verwijderen.
        SELECT a.id, a.email, a.naam, a.created_at, a.la,
               'verwijder_spook',
               a.spook_op + interval '30 days'
          FROM afgeleid a
         WHERE a.bevestigd AND a.kaal AND a.spook_op IS NOT NULL
           AND (a.la IS NULL OR a.la <= a.spook_op)

        UNION ALL
        -- Spook, nog niet gewaarschuwd, 2 maanden oud (of al een zetje gehad).
        SELECT a.id, a.email, a.naam, a.created_at, a.la,
               'mail_spook',
               a.created_at + interval '60 days'
          FROM afgeleid a
         WHERE a.bevestigd AND a.kaal AND a.nooit_terug AND a.spook_op IS NULL
           AND (a.zetje_op IS NOT NULL OR a.created_at <= now() - interval '60 days')

        UNION ALL
        -- Spook van minder dan 2 maanden: eerst een zetje, na 3 weken.
        SELECT a.id, a.email, a.naam, a.created_at, a.la,
               'mail_zetje',
               a.created_at + interval '21 days'
          FROM afgeleid a
         WHERE a.bevestigd AND a.kaal AND a.nooit_terug AND a.spook_op IS NULL
           AND a.zetje_op IS NULL AND a.created_at > now() - interval '60 days'

        UNION ALL
        -- Niet in gebruik, wel eens geweest of wel een school: een zetje, als
        -- hij minstens 3 weken bestaat en 2 weken niet is gezien.
        SELECT a.id, a.email, a.naam, a.created_at, a.la,
               'mail_zetje',
               GREATEST(a.created_at + interval '21 days',
                        COALESCE(a.la, a.created_at) + interval '14 days')
          FROM afgeleid a
         WHERE a.bevestigd AND NOT a.in_gebruik AND a.zetje_op IS NULL AND a.spook_op IS NULL
           AND NOT (a.kaal AND a.nooit_terug)
    )
    SELECT s.id, s.email, s.naam, s.created_at, s.la, s.actie, s.datum,
           -- In juli en augustus gebeurt er niets.
           (s.datum <= now()
            AND extract(month FROM now() AT TIME ZONE 'Europe/Amsterdam') NOT IN (7, 8)) AS due
      FROM stappen s;
$$;

-- Rechten blijven zoals ze waren: alleen de database zelf en service_role.
REVOKE ALL ON FUNCTION public._opruim_kandidaten() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._opruim_kandidaten() TO service_role;

-- ============================================
-- Accounts opruimen + zetje-mail
-- Toegepast 7 oktober 2026
-- ============================================

-- Wie zich aanmeldt en daarna nooit iets doet, laat een naam en e-mailadres
-- achter zonder dat daar een reden voor is. Dit ruimt dat op, rustig en met
-- waarschuwing, en geeft accounts zonder klas eerst een duwtje.
--
-- Regels (alleen role = 'user'; een super admin of admin wordt nooit geraakt):
--
--   onbevestigd   Nooit ingelogd en het e-mailadres nooit bevestigd, 14 dagen
--                 na aanmelden: stil verwijderen. Geen mail: het adres is niet
--                 bevestigd en kan een typefout of van iemand anders zijn.
--
--   zetje         Bevestigd, geen klas, 3 weken na aanmelden en 2 weken niet
--                 gezien: eenmalig een vriendelijke mail hoe je begint.
--
--   spook         Bevestigd, geen klas, geen school en na de eerste dag nooit
--                 teruggekomen. Na 2 maanden een waarschuwing, 30 dagen later
--                 verwijderen. Logt de gebruiker in of maakt hij een klas of
--                 koppelt hij een school, dan stopt het traject vanzelf.
--
--   Accounts met een klas worden hier nooit automatisch verwijderd.
--
-- Juli en augustus staan stil: dan wordt er niets verstuurd en niets verwijderd,
-- want een leerkracht die zich in de zomer aanmeldt is nog niet aan het
-- schooljaar begonnen.
--
-- De modus (tabel opruim_instellingen) bepaalt wat er echt gebeurt:
--   lijst     niets; alleen te zien in beheer wie er aan de beurt komt (standaard)
--   mails     mails worden verstuurd, er wordt niets verwijderd
--   volledig  mails en verwijderen

-- ---------- 1. Instellingen en logboek ----------
CREATE TABLE IF NOT EXISTS public.opruim_instellingen (
    id         boolean PRIMARY KEY DEFAULT true CHECK (id),
    modus      text NOT NULL DEFAULT 'lijst' CHECK (modus IN ('lijst', 'mails', 'volledig')),
    updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.opruim_instellingen (id) VALUES (true) ON CONFLICT DO NOTHING;

ALTER TABLE public.opruim_instellingen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "opruim instellingen super admin" ON public.opruim_instellingen;
CREATE POLICY "opruim instellingen super admin"
    ON public.opruim_instellingen FOR ALL
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

DROP TRIGGER IF EXISTS opruim_instellingen_updated_at ON public.opruim_instellingen;
CREATE TRIGGER opruim_instellingen_updated_at
    BEFORE UPDATE ON public.opruim_instellingen
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Welke mail is al naar wie? Voorkomt dubbele mails en bepaalt de 30 dagen
-- tussen waarschuwing en verwijderen. CASCADE: verdwijnt het account, dan ook dit.
CREATE TABLE IF NOT EXISTS public.opruim_mails (
    user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    soort        text NOT NULL CHECK (soort IN ('zetje', 'spook')),
    verzonden_op timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, soort)
);

ALTER TABLE public.opruim_mails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "opruim mails super admin" ON public.opruim_mails;
CREATE POLICY "opruim mails super admin"
    ON public.opruim_mails FOR SELECT
    USING (public.is_super_admin());

-- Wat er is opgeruimd, zonder één persoonsgegeven. Alleen om te kunnen tellen.
CREATE TABLE IF NOT EXISTS public.opruim_log (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    uitgevoerd_op timestamptz NOT NULL DEFAULT now(),
    reden         text NOT NULL CHECK (reden IN ('spook', 'onbevestigd')),
    aangemeld_op  timestamptz
);

ALTER TABLE public.opruim_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "opruim log super admin" ON public.opruim_log;
CREATE POLICY "opruim log super admin"
    ON public.opruim_log FOR SELECT
    USING (public.is_super_admin());

-- Gedeeld geheim tussen de database en de edge function die de mails verstuurt.
-- Geen enkele policy en geen rechten voor anon/authenticated: alleen de database
-- zelf en de service role komen erbij.
CREATE TABLE IF NOT EXISTS public.opruim_geheim (
    id     boolean PRIMARY KEY DEFAULT true CHECK (id),
    geheim text NOT NULL DEFAULT (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
);

INSERT INTO public.opruim_geheim (id) VALUES (true) ON CONFLICT DO NOTHING;

ALTER TABLE public.opruim_geheim ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.opruim_geheim FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.opruim_mails, public.opruim_log, public.opruim_instellingen FROM anon;

-- ---------- 2. Wie komt waarvoor aan de beurt? ----------
-- Eén bron van waarheid voor de beheerlijst, de mail-functie en het verwijderen.
-- Per gebruiker hoogstens één rij: de eerstvolgende stap.
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
            (EXISTS (SELECT 1 FROM public.groups g WHERE g.user_id = p.id)
              OR EXISTS (SELECT 1 FROM public.group_members m WHERE m.user_id = p.id)) AS klas,
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
               (NOT b.klas AND b.school_id IS NULL) AS kaal,
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
        -- Geen klas, wel eens geweest of wel een school: een zetje, als hij
        -- minstens 3 weken bestaat en 2 weken niet is gezien.
        SELECT a.id, a.email, a.naam, a.created_at, a.la,
               'mail_zetje',
               GREATEST(a.created_at + interval '21 days',
                        COALESCE(a.la, a.created_at) + interval '14 days')
          FROM afgeleid a
         WHERE a.bevestigd AND NOT a.klas AND a.zetje_op IS NULL AND a.spook_op IS NULL
           AND NOT (a.kaal AND a.nooit_terug)
    )
    SELECT s.id, s.email, s.naam, s.created_at, s.la, s.actie, s.datum,
           -- In juli en augustus gebeurt er niets.
           (s.datum <= now()
            AND extract(month FROM now() AT TIME ZONE 'Europe/Amsterdam') NOT IN (7, 8)) AS due
      FROM stappen s;
$$;

REVOKE ALL ON FUNCTION public._opruim_kandidaten() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._opruim_kandidaten() TO service_role;

-- Voor het tabblad Opruimen in beheer.
CREATE OR REPLACE FUNCTION public.admin_opruim_overzicht()
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
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Alleen voor de beheerder' USING ERRCODE = '42501';
    END IF;
    RETURN QUERY SELECT * FROM public._opruim_kandidaten() ORDER BY 7;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_opruim_overzicht() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_opruim_overzicht() TO authenticated;

-- ---------- 3. Mails: de database roept de edge function aan ----------
-- Alleen als de modus mails toestaat en er ook echt iets te versturen is. De
-- edge function controleert dat zelf nog een keer, met het gedeelde geheim.
CREATE OR REPLACE FUNCTION public.opruim_mail_tick()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_modus  text;
    v_geheim text;
BEGIN
    SELECT modus INTO v_modus FROM public.opruim_instellingen;
    IF v_modus IS NULL OR v_modus NOT IN ('mails', 'volledig') THEN
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public._opruim_kandidaten()
                    WHERE due AND actie IN ('mail_zetje', 'mail_spook')) THEN
        RETURN;
    END IF;

    SELECT geheim INTO v_geheim FROM public.opruim_geheim;

    PERFORM net.http_post(
        url     := 'https://chnjybpwquystuwmiger.supabase.co/functions/v1/account-opruiming',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body    := jsonb_build_object('geheim', v_geheim)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.opruim_mail_tick() FROM PUBLIC, anon, authenticated;

-- ---------- 4. Verwijderen ----------
-- Alleen in modus 'volledig'. Hoogstens 10 per run als rem: loopt er ooit iets
-- mis in de regels, dan blijft de schade beperkt en valt het op in het logboek.
CREATE OR REPLACE FUNCTION public.opruim_verwijder_tick()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    r        record;
    v_modus  text;
    v_aantal integer := 0;
BEGIN
    SELECT modus INTO v_modus FROM public.opruim_instellingen;
    IF v_modus IS DISTINCT FROM 'volledig' THEN
        RETURN 0;
    END IF;

    FOR r IN
        SELECT k.user_id, k.actie, k.aangemeld
          FROM public._opruim_kandidaten() k
         WHERE k.due AND k.actie LIKE 'verwijder\_%'
         ORDER BY k.stap_datum
         LIMIT 10
    LOOP
        INSERT INTO public.opruim_log (reden, aangemeld_op)
        VALUES (CASE r.actie WHEN 'verwijder_onbevestigd' THEN 'onbevestigd' ELSE 'spook' END,
                r.aangemeld);

        -- profiles en alles wat eraan hangt gaat via ON DELETE CASCADE mee.
        DELETE FROM auth.users WHERE id = r.user_id;
        v_aantal := v_aantal + 1;
    END LOOP;

    RETURN v_aantal;
END;
$$;

REVOKE ALL ON FUNCTION public.opruim_verwijder_tick() FROM PUBLIC, anon, authenticated;

-- 's Ochtends mailen (09:00/10:00 NL), 's nachts verwijderen.
SELECT cron.unschedule('opruim_mails')     WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'opruim_mails');
SELECT cron.unschedule('opruim_verwijder') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'opruim_verwijder');
SELECT cron.schedule('opruim_mails',     '0 8 * * *',  'SELECT public.opruim_mail_tick();');
SELECT cron.schedule('opruim_verwijder', '40 3 * * *', 'SELECT public.opruim_verwijder_tick();');

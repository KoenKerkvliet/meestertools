-- ============================================
-- Feedbackmail: één mail met sterren om op te klikken
-- Toegepast 25 oktober 2026
-- ============================================

-- De sterren-popup op het dashboard bereikte bijna niemand: van 45 mensen die in
-- aanmerking kwamen had er één antwoord gegeven. Wie rechtstreeks een tool opent
-- ziet het dashboard nooit. Deze mail bereikt iedereen, ook zonder in te loggen:
-- elke ster in de mail is een link met een persoonlijke, geheime code.
--
-- Wie krijgt de mail (public._feedbackmail_kandidaten):
--   - een gewoon account (role = 'user') met een bevestigd e-mailadres
--   - minstens 3 weken oud, met een klas (zelf gemaakt of gedeeld)
--   - nog nooit een beoordeling gegeven, nog nooit deze mail gehad
--   - niet net op "Later" gedrukt in de popup
--   - niet in juli en augustus
-- Hoogstens één mail per persoon, zonder herinnering. Hoogstens 20 per dag.
--
-- De schakelaar (tabel feedbackmail_instellingen) staat standaard UIT. Pas als
-- de beheerder hem in beheer aanzet, gaat er iets de deur uit.
--
-- Veiligheid: de code staat alleen als sha256-hash in de database. Een gelekte
-- database laat dus niemand stemmen. De code werkt 60 dagen en alleen voor deze
-- ene beoordeling; de beoordeling komt gewoon in public.feedback terecht en is
-- zichtbaar in het tabblad Feedback in beheer.

-- ---------- 1. Schakelaar ----------
CREATE TABLE IF NOT EXISTS public.feedbackmail_instellingen (
    id         boolean PRIMARY KEY DEFAULT true CHECK (id),
    aan        boolean NOT NULL DEFAULT false,
    updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.feedbackmail_instellingen (id) VALUES (true) ON CONFLICT DO NOTHING;

ALTER TABLE public.feedbackmail_instellingen ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.feedbackmail_instellingen FROM anon;

DROP POLICY IF EXISTS "feedbackmail instellingen super admin" ON public.feedbackmail_instellingen;
CREATE POLICY "feedbackmail instellingen super admin"
    ON public.feedbackmail_instellingen FOR ALL
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

DROP TRIGGER IF EXISTS feedbackmail_instellingen_updated_at ON public.feedbackmail_instellingen;
CREATE TRIGGER feedbackmail_instellingen_updated_at
    BEFORE UPDATE ON public.feedbackmail_instellingen
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------- 2. Wie heeft de mail gehad? ----------
-- De primary key op user_id is ook de rem tegen dubbele mails: de edge function
-- "claimt" eerst een rij en verstuurt pas daarna.
CREATE TABLE IF NOT EXISTS public.feedbackmail_verzonden (
    user_id      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash   text NOT NULL UNIQUE,
    verzonden_op timestamptz NOT NULL DEFAULT now(),
    verloopt_op  timestamptz NOT NULL,
    -- De beoordeling die uit deze mail is voortgekomen. SET NULL: verwijdert de
    -- beheerder een beoordeling, dan blijft de mailregel staan.
    feedback_id  uuid REFERENCES public.feedback(id) ON DELETE SET NULL
);

ALTER TABLE public.feedbackmail_verzonden ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.feedbackmail_verzonden FROM anon, authenticated;
GRANT SELECT (user_id, verzonden_op, verloopt_op, feedback_id) ON public.feedbackmail_verzonden TO authenticated;

DROP POLICY IF EXISTS "feedbackmail verzonden super admin" ON public.feedbackmail_verzonden;
CREATE POLICY "feedbackmail verzonden super admin"
    ON public.feedbackmail_verzonden FOR SELECT
    USING (public.is_super_admin());

-- ---------- 3. Wie komt aan de beurt? ----------
CREATE OR REPLACE FUNCTION public._feedbackmail_kandidaten()
RETURNS TABLE (
    user_id   uuid,
    email     text,
    naam      text,
    aangemeld timestamptz,
    due       boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT p.id,
           p.email,
           split_part(COALESCE(NULLIF(btrim(p.full_name), ''), ''), ' ', 1),
           p.created_at,
           (p.created_at <= now() - interval '21 days'
            AND extract(month FROM now() AT TIME ZONE 'Europe/Amsterdam') NOT IN (7, 8))
      FROM public.profiles p
      JOIN auth.users u ON u.id = p.id
     WHERE p.role = 'user'
       AND p.email IS NOT NULL
       AND u.email_confirmed_at IS NOT NULL
       AND (EXISTS (SELECT 1 FROM public.groups g WHERE g.user_id = p.id)
         OR EXISTS (SELECT 1 FROM public.group_members m WHERE m.user_id = p.id))
       AND NOT EXISTS (SELECT 1 FROM public.feedback f WHERE f.user_id = p.id)
       AND NOT EXISTS (SELECT 1 FROM public.feedbackmail_verzonden v WHERE v.user_id = p.id)
       AND (p.feedback_uitgesteld_tot IS NULL OR p.feedback_uitgesteld_tot <= now());
$$;

REVOKE ALL ON FUNCTION public._feedbackmail_kandidaten() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._feedbackmail_kandidaten() TO service_role;

-- Voor beheer: alleen een aantal, geen namen of adressen.
CREATE OR REPLACE FUNCTION public.admin_feedbackmail_wachtrij()
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Alleen voor de beheerder' USING ERRCODE = '42501';
    END IF;
    RETURN (SELECT count(*)::integer FROM public._feedbackmail_kandidaten() WHERE due);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_feedbackmail_wachtrij() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_feedbackmail_wachtrij() TO authenticated;

-- ---------- 4. Versturen: de database roept de edge function aan ----------
-- Hetzelfde gedeelde geheim als de account-opruiming (public.opruim_geheim).
CREATE OR REPLACE FUNCTION public.feedbackmail_tick()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_aan    boolean;
    v_geheim text;
BEGIN
    SELECT aan INTO v_aan FROM public.feedbackmail_instellingen;
    IF v_aan IS NOT TRUE THEN
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public._feedbackmail_kandidaten() WHERE due) THEN
        RETURN;
    END IF;

    SELECT geheim INTO v_geheim FROM public.opruim_geheim;

    PERFORM net.http_post(
        url     := 'https://chnjybpwquystuwmiger.supabase.co/functions/v1/feedback-mail',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body    := jsonb_build_object('geheim', v_geheim)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.feedbackmail_tick() FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule('feedbackmail') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'feedbackmail');
SELECT cron.schedule('feedbackmail', '30 8 * * *', 'SELECT public.feedbackmail_tick();');

-- ---------- 5. Een ster aanklikken (zonder inloggen) ----------
-- De pagina /beoordeel roept deze functies aan met de code uit de mail. Ze geven
-- altijd gewoon { ok: false } terug bij een onbekende of verlopen code, zonder te
-- verraden welke van de twee het was.
CREATE OR REPLACE FUNCTION public.feedback_via_mail(p_token text, p_rating integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v  public.feedbackmail_verzonden%ROWTYPE;
    v_id uuid;
BEGIN
    IF p_rating IS NULL OR p_rating NOT BETWEEN 1 AND 5 OR p_token IS NULL OR length(p_token) > 200 THEN
        RETURN jsonb_build_object('ok', false);
    END IF;

    -- FOR UPDATE: twee tegelijke klikken (bijvoorbeeld een mailscanner en de
    -- lezer) maken zo nooit twee beoordelingen.
    SELECT * INTO v
      FROM public.feedbackmail_verzonden
     WHERE token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
       AND verloopt_op > now()
       FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false);
    END IF;

    IF v.feedback_id IS NOT NULL
       AND EXISTS (SELECT 1 FROM public.feedback WHERE id = v.feedback_id) THEN
        UPDATE public.feedback SET rating = p_rating WHERE id = v.feedback_id;
    ELSE
        INSERT INTO public.feedback (user_id, rating) VALUES (v.user_id, p_rating) RETURNING id INTO v_id;
        UPDATE public.feedbackmail_verzonden SET feedback_id = v_id WHERE user_id = v.user_id;
    END IF;

    RETURN jsonb_build_object('ok', true, 'rating', p_rating);
END;
$$;

CREATE OR REPLACE FUNCTION public.feedback_mail_toelichting(p_token text, p_comment text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v public.feedbackmail_verzonden%ROWTYPE;
    v_tekst text := NULLIF(btrim(COALESCE(p_comment, '')), '');
BEGIN
    IF p_token IS NULL OR length(p_token) > 200 OR (v_tekst IS NOT NULL AND char_length(v_tekst) > 2000) THEN
        RETURN jsonb_build_object('ok', false);
    END IF;

    SELECT * INTO v
      FROM public.feedbackmail_verzonden
     WHERE token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
       AND verloopt_op > now();

    -- Een toelichting hoort bij een beoordeling: eerst een ster.
    IF NOT FOUND OR v.feedback_id IS NULL THEN
        RETURN jsonb_build_object('ok', false);
    END IF;

    UPDATE public.feedback SET comment = v_tekst WHERE id = v.feedback_id;
    RETURN jsonb_build_object('ok', FOUND);
END;
$$;

REVOKE ALL ON FUNCTION public.feedback_via_mail(text, integer)  FROM PUBLIC;
REVOKE ALL ON FUNCTION public.feedback_mail_toelichting(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.feedback_via_mail(text, integer)  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.feedback_mail_toelichting(text, text) TO anon, authenticated;

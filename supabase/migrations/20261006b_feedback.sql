-- ============================================
-- Feedback van gebruikers (sterren + optionele toelichting)
-- Toegepast 6 oktober 2026
-- ============================================

-- Het dashboard vraagt een leerkracht na twee weken gebruik hoe Meestertools
-- bevalt (js/feedback.js). Eén tabel voor de beoordelingen, twee kleine functies
-- die bepalen WANNEER er gevraagd wordt. Die logica staat bewust in de database:
-- dan kan geen enkele pagina per ongeluk vaker vragen dan afgesproken.
--
-- Net als de ideeënbus is dit vrije tekst van leerkrachten (en die kan per
-- ongeluk een leerlingnaam bevatten): alleen de schrijver en de super admin
-- zien een rij.

-- ---------- 1. De beoordelingen ----------
CREATE TABLE IF NOT EXISTS public.feedback (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- CASCADE: de privacyverklaring belooft dat een verwijderd account ook zijn
    -- beoordelingen meeneemt. Een toelichting kan herleidbaar zijn.
    user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating     smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    text CHECK (comment IS NULL OR char_length(comment) <= 2000),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_created_idx ON public.feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_user_idx    ON public.feedback (user_id, created_at DESC);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback geven"               ON public.feedback;
DROP POLICY IF EXISTS "eigen feedback lezen"         ON public.feedback;
DROP POLICY IF EXISTS "eigen feedback aanvullen"     ON public.feedback;
DROP POLICY IF EXISTS "super admin leest feedback"   ON public.feedback;
DROP POLICY IF EXISTS "super admin beheert feedback" ON public.feedback;

CREATE POLICY "feedback geven"
    ON public.feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Nodig voor insert(...).select(): de popup wil het id van de net opgeslagen rij.
CREATE POLICY "eigen feedback lezen"
    ON public.feedback FOR SELECT
    USING (auth.uid() = user_id);

-- De popup slaat de sterren meteen op en vult de toelichting daarna aan (of past
-- de sterren aan als iemand zich bedenkt). Alleen de eigen rij.
CREATE POLICY "eigen feedback aanvullen"
    ON public.feedback FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "super admin leest feedback"
    ON public.feedback FOR SELECT
    USING (public.is_super_admin());

CREATE POLICY "super admin beheert feedback"
    ON public.feedback FOR ALL
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

DROP TRIGGER IF EXISTS feedback_updated_at ON public.feedback;
CREATE TRIGGER feedback_updated_at
    BEFORE UPDATE ON public.feedback
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Rem tegen een vastgelopen knop of een knoeiende client. Normaal is het één
-- insert per 90 dagen.
CREATE OR REPLACE FUNCTION public.feedback_rate_limit()
RETURNS trigger AS $$
BEGIN
    IF (SELECT count(*) FROM public.feedback
         WHERE user_id = NEW.user_id
           AND created_at > now() - interval '1 hour') >= 3 THEN
        RAISE EXCEPTION 'Je hebt zojuist al feedback gegeven. Bedankt!'
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Supabase geeft anon/authenticated standaard zelf EXECUTE (los van PUBLIC), dus
-- die moeten er expliciet af. Een triggerfunctie heeft het recht niet nodig.
REVOKE EXECUTE ON FUNCTION public.feedback_rate_limit() FROM PUBLIC, anon, authenticated;

-- Niet-ingelogde bezoekers hebben niets te zoeken in deze tabel.
REVOKE ALL ON public.feedback FROM anon;

DROP TRIGGER IF EXISTS feedback_rate_limit_trg ON public.feedback;
CREATE TRIGGER feedback_rate_limit_trg
    BEFORE INSERT ON public.feedback
    FOR EACH ROW EXECUTE FUNCTION public.feedback_rate_limit();

-- ---------- 2. "Later": uitstel bijhouden ----------
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS feedback_uitgesteld_tot timestamptz;

-- ---------- 3. Moet deze gebruiker nu gevraagd worden? ----------
-- Ja als: minstens 14 dagen geleden aangemeld, echt iets gedaan (een klas
-- aangemaakt of gedeeld gekregen), de laatste beoordeling ouder is dan 90 dagen
-- en een eerder "Later" is verlopen. De beheerder zelf wordt nooit gevraagd.
CREATE OR REPLACE FUNCTION public.feedback_moet_vragen()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT COALESCE((
        SELECT p.role <> 'super_admin'
           AND p.created_at <= now() - interval '14 days'
           AND (EXISTS (SELECT 1 FROM public.groups g WHERE g.user_id = p.id)
             OR EXISTS (SELECT 1 FROM public.group_members m WHERE m.user_id = p.id))
           AND NOT EXISTS (SELECT 1 FROM public.feedback f
                            WHERE f.user_id = p.id
                              AND f.created_at > now() - interval '90 days')
           AND (p.feedback_uitgesteld_tot IS NULL OR p.feedback_uitgesteld_tot <= now())
          FROM public.profiles p
         WHERE p.id = auth.uid()
    ), false);
$$;

-- "Later": zeven dagen rust.
CREATE OR REPLACE FUNCTION public.feedback_uitstellen()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    UPDATE public.profiles
       SET feedback_uitgesteld_tot = now() + interval '7 days'
     WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.feedback_moet_vragen() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.feedback_uitstellen()  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.feedback_moet_vragen() TO authenticated;
GRANT EXECUTE ON FUNCTION public.feedback_uitstellen()  TO authenticated;

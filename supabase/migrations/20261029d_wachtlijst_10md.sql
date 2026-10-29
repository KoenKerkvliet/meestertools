-- ============================================
-- Wachtlijst 10minutendidactiek vanuit Meestertools
-- Toegepast 29 oktober 2026
-- ============================================

-- Een subtiele regel op de rekenplekken van Meestertools ("Wil je bericht als
-- ze er zijn?"). Eén klik zet het e-mailadres van het account op de bestaande
-- Emailit-audience "10MD – Wachtlijst" (dezelfde als het formulier op de
-- homepage van 10minutendidactiek). Dat doet de edge function
-- wachtlijst-aanmelden; deze tabel onthoudt alleen dat iemand het deed, zodat
-- de regel daarna wegblijft en het dagoverzicht kan tellen.
--
-- Afmelden gaat via de afmeldlink in de mails van Emailit. De wachtlijst staat
-- los van het account: wie zijn account verwijdert, blijft op de wachtlijst
-- staan tot hij zich daar afmeldt (net als via het formulier op de 10MD-site).

CREATE TABLE IF NOT EXISTS public.wachtlijst_10md (
    user_id      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    aangemeld_op timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wachtlijst_10md ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.wachtlijst_10md FROM anon, authenticated;
GRANT SELECT ON public.wachtlijst_10md TO authenticated;

-- Alleen de eigen rij (staat ik er al op?). Schrijven doet de edge function.
DROP POLICY IF EXISTS "eigen wachtlijst lezen" ON public.wachtlijst_10md;
CREATE POLICY "eigen wachtlijst lezen"
    ON public.wachtlijst_10md FOR SELECT
    USING (auth.uid() = user_id);

-- ---------- Dagoverzicht: ook de wachtlijst ----------
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
        'wachtlijst', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                       'naam',      NULLIF(btrim(p.full_name), ''),
                       'email',     p.email,
                       'aangemeld', w.aangemeld_op
                   ) ORDER BY w.aangemeld_op)
              FROM public.wachtlijst_10md w
              LEFT JOIN public.profiles p ON p.id = w.user_id
             WHERE w.aangemeld_op >= p_sinds
        ), '[]'::jsonb),
        'wachtlijst_totaal', (SELECT count(*) FROM public.wachtlijst_10md),
        'totaal_accounts', (SELECT count(*) FROM public.profiles WHERE role = 'user')
    );
$$;

REVOKE ALL ON FUNCTION public._dagoverzicht(timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._dagoverzicht(timestamptz) TO service_role;

-- ============================================
-- Klasseprestatie: klaspot en groepsprijzen
-- Toegepast 26 augustus 2026
-- ============================================

-- Punten waren tot nu toe puur individueel: elk kind spaarde voor zichzelf. Voor
-- een klassenbeloning ("we sparen samen voor een filmmiddag") was er niets. De
-- klaspot telt op wat de klas samen verdient en groepsprijzen worden daaruit
-- betaald - zonder dat een kind eigen punten kwijtraakt.

-- ---------- 1. Prijzen: individueel of voor de hele groep ----------
-- Bestaande prijzen blijven individueel; alleen nieuwe kunnen groepsprijs zijn.
ALTER TABLE public.klasseprestatie_prizes
    ADD COLUMN IF NOT EXISTS is_group boolean NOT NULL DEFAULT false;

-- ---------- 2. Ingewisselde groepsprijzen ----------
-- Hangt aan de klas en niet aan de leerkracht: de pot is van de groep, dus een
-- duo-collega ziet dezelfde stand en kan er ook uit betalen. Zelfde patroon als
-- klassendienst_days. user_id legt alleen vast wie het inwisselde.
CREATE TABLE IF NOT EXISTS public.klasseprestatie_group_redemptions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id    uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prize_id    uuid REFERENCES public.klasseprestatie_prizes(id) ON DELETE SET NULL,
    prize_label text NOT NULL,
    prize_icon  text NOT NULL DEFAULT '🎁',
    points_cost integer NOT NULL,
    redeemed_at timestamptz DEFAULT now()
);

-- Het overzicht vraagt altijd om één klas, nieuwste eerst.
CREATE INDEX IF NOT EXISTS klasseprestatie_group_redemptions_group_idx
    ON public.klasseprestatie_group_redemptions (group_id, redeemed_at DESC);

ALTER TABLE public.klasseprestatie_group_redemptions ENABLE ROW LEVEL SECURITY;

-- Wie bij de klas hoort, ziet de pot en mag eruit betalen. Terugdraaien mag ook:
-- een misklik moet je kunnen herstellen, anders klopt de pot niet meer.
DROP POLICY IF EXISTS "groepsprijs lezen"        ON public.klasseprestatie_group_redemptions;
DROP POLICY IF EXISTS "groepsprijs inwisselen"   ON public.klasseprestatie_group_redemptions;
DROP POLICY IF EXISTS "groepsprijs terugdraaien" ON public.klasseprestatie_group_redemptions;

CREATE POLICY "groepsprijs lezen"
    ON public.klasseprestatie_group_redemptions FOR SELECT
    USING (public.has_group_access(group_id));

CREATE POLICY "groepsprijs inwisselen"
    ON public.klasseprestatie_group_redemptions FOR INSERT
    WITH CHECK (public.has_group_access(group_id) AND auth.uid() = user_id);

CREATE POLICY "groepsprijs terugdraaien"
    ON public.klasseprestatie_group_redemptions FOR DELETE
    USING (public.has_group_access(group_id));

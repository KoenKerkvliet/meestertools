-- ============================================
-- Startbord: eigen borden voor het digibord
-- Toegepast 28 oktober 2026
-- ============================================

-- Een leerkracht zet borden klaar voor op het digibord ("Inloop", "Rekenen",
-- "Na de pauze") en klikt er in de presenteerstand doorheen. Elk bord heeft een
-- vaste indeling met 1 tot 4 vakken; in elk vak staat een blok:
--
--   blokken: [{ type:'tekst',  titel, html, grootte:'normaal'|'groot'|'heelgroot' }
--             { type:'klok',   klok:bool, datum:bool, groet }
--             { type:'taken',  titel, taken:[tekst] }
--             { type:'tool',   tool:'timetimer'|'stoplicht'|'geluidsmeter'|'namenkiezer' }
--             { type:'leeg' }]
--
-- De html van een tekstblok wordt in de browser opgeschoond (alleen vet,
-- cursief, onderstreept, alinea's en opsommingen) en bij het tonen nog een
-- keer, zodat er nooit iets anders dan opmaak uit de database komt.
--
-- De borden zijn van de leerkracht zelf, niet van de klas: alleen je eigen
-- borden, ook voor de super admin.

CREATE TABLE IF NOT EXISTS public.startborden (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid        NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    titel       text        NOT NULL CHECK (length(btrim(titel)) BETWEEN 1 AND 80),
    volgorde    integer     NOT NULL DEFAULT 0,
    indeling    text        NOT NULL DEFAULT 'groot-twee'
                            CHECK (indeling IN ('een', 'twee', 'groot-twee', 'vier')),
    kleur       text        NOT NULL DEFAULT 'lavendel' CHECK (kleur ~ '^[a-z]{2,20}$'),
    blokken     jsonb       NOT NULL DEFAULT '[]'::jsonb
                            CHECK (jsonb_typeof(blokken) = 'array'
                                   AND jsonb_array_length(blokken) <= 4
                                   AND pg_column_size(blokken) < 60000),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS startborden_user_idx ON public.startborden (user_id, volgorde);

ALTER TABLE public.startborden ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.startborden FROM anon;

DROP POLICY IF EXISTS "startborden_eigen" ON public.startborden;
CREATE POLICY "startborden_eigen" ON public.startborden
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

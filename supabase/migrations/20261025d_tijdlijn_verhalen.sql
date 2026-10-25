-- Verhalen bij de eeuwen van de tijdlijn (/tijdlijn/).
-- Eén verzonnen voorleesverhaal per eeuwkaart, met een lijstje "Wat klopt er van dit verhaal?".
-- De tijdlijn is openbaar en heeft geen inlog; hij leest deze tabel met de anon-sleutel en,
-- als iemand op meestertools.nl is ingelogd, met diens sessie.
--
-- Zolang gepubliceerd = false ziet alleen de super_admin een verhaal. Zo kan een nieuw verhaal
-- live worden nagelezen voordat leerkrachten het zien. Publiceren = het vinkje op true zetten.
-- De verhalen zelf staan bewust niet in deze (openbare) repository, alleen in de database.

CREATE TABLE IF NOT EXISTS public.tijdlijn_verhalen (
    eeuw            text PRIMARY KEY,                    -- id van de kaart in TILES, bv. 'eeuw17'
    titel           text NOT NULL,
    ondertitel      text,                                -- plaats en jaar, bv. 'Amsterdam, 1642'
    tekst           jsonb NOT NULL DEFAULT '[]'::jsonb,  -- alinea's
    klopt           jsonb NOT NULL DEFAULT '[]'::jsonb,  -- "Wat klopt er van dit verhaal?"
    gebeurtenissen  jsonb NOT NULL DEFAULT '[]'::jsonb,  -- titels van gebeurtenissen om naar te linken
    gepubliceerd    boolean NOT NULL DEFAULT false,
    bijgewerkt      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tijdlijn_verhalen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verhalen lezen" ON public.tijdlijn_verhalen;
CREATE POLICY "verhalen lezen" ON public.tijdlijn_verhalen
    FOR SELECT USING (gepubliceerd OR public.is_super_admin());

DROP POLICY IF EXISTS "verhalen beheren" ON public.tijdlijn_verhalen;
CREATE POLICY "verhalen beheren" ON public.tijdlijn_verhalen
    FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

GRANT SELECT ON public.tijdlijn_verhalen TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tijdlijn_verhalen TO authenticated;

-- ============================================
-- Topografie: eigen kaarten van de leerkracht
-- Toegepast 27 oktober 2026
-- ============================================

-- Een leerkracht stelt een topografiekaart samen (welke provincies, plaatsen,
-- wateren, rivieren en eigen punten) en deelt die met een link of QR-code.
-- Leerlingen oefenen via /topografie?k=CODE, zonder account.
--
-- De kaart zelf (de lijnen) staat als statisch bestand in assets/topografie/.
-- Hier staat alleen de keuze van de leerkracht: een lijst met verwijzingen
-- naar items op die basiskaart, plus eigen punten met naam en positie.
--
--   items: [{ t:'p'|'s'|'g'|'r', id }                 provincie, plaats, gebied, rivier
--           { t:'e', id, naam, x, y }]                 eigen punt (kaartcoördinaten)
--
-- Er staat geen leerlingdata in en er wordt niets over oefenaars bewaard.
-- De kaarten hangen aan de leerkracht, niet aan een klas: het is eigen
-- lesmateriaal, net als een werkblad.

CREATE TABLE IF NOT EXISTS public.topografie_kaarten (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid        NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    titel       text        NOT NULL CHECK (length(btrim(titel)) BETWEEN 1 AND 80),
    basis       text        NOT NULL DEFAULT 'nederland' CHECK (basis IN ('nederland', 'europa', 'wereld')),
    items       jsonb       NOT NULL DEFAULT '[]'::jsonb
                            CHECK (jsonb_typeof(items) = 'array' AND jsonb_array_length(items) <= 500),
    code        text        NOT NULL UNIQUE,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS topografie_kaarten_user_idx ON public.topografie_kaarten (user_id, updated_at DESC);

-- Deelcode: 8 tekens zonder letters die op elkaar lijken (geen 0/O, 1/I/L).
-- Lang genoeg om niet te raden; wie de code heeft, mag de kaart oefenen.
CREATE OR REPLACE FUNCTION public.topografie_nieuwe_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    abc  text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    v    text;
BEGIN
    LOOP
        v := '';
        FOR i IN 1..8 LOOP
            v := v || substr(abc, 1 + floor(random() * length(abc))::int, 1);
        END LOOP;
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.topografie_kaarten WHERE code = v);
    END LOOP;
    RETURN v;
END;
$$;

ALTER TABLE public.topografie_kaarten
    ALTER COLUMN code SET DEFAULT public.topografie_nieuwe_code();

ALTER TABLE public.topografie_kaarten ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.topografie_kaarten FROM anon;

-- Alleen je eigen kaarten. Ook de super admin ziet die van anderen niet.
DROP POLICY IF EXISTS "topografie_kaarten_eigen" ON public.topografie_kaarten;
CREATE POLICY "topografie_kaarten_eigen" ON public.topografie_kaarten
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Oefenen zonder account: één kaart ophalen op code. Geeft alleen wat de
-- oefenpagina nodig heeft, niet wie hem gemaakt heeft.
CREATE OR REPLACE FUNCTION public.topografie_kaart(p_code text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT jsonb_build_object('titel', titel, 'basis', basis, 'items', items)
      FROM public.topografie_kaarten
     WHERE code = upper(btrim(COALESCE(p_code, '')));
$$;

REVOKE ALL ON FUNCTION public.topografie_kaart(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.topografie_kaart(text) TO anon, authenticated;

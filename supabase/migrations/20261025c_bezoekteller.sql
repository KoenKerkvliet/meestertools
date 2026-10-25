-- ============================================
-- Anonieme bezoekteller
-- Toegepast 25 oktober 2026
-- ============================================

-- Hoeveel worden de pagina's bekeken, en waar komen bezoekers vandaan? Zonder
-- iets over een bezoeker op te slaan. Elke paginaweergave telt alleen op in
-- een dagtotaal: deze pagina, deze dag, deze bron, telefoon of computer, +1.
--
-- Er staat geen IP-adres, geen cookie-id, geen gebruikers-id en geen tijdstip
-- per bezoek in. Een rij is daardoor nooit naar een persoon terug te leiden, en
-- er is geen cookiemelding nodig (de browser bewaart ook niets).
--
-- Gevolg: unieke bezoekers zijn niet te tellen, want daarvoor moet je iemand
-- herkennen. In plaats daarvan telt "binnenkomst": een weergave waarbij de
-- bezoeker van buiten de site kwam (een andere site, Google of een link in een
-- mail of app). Dat ligt dicht bij het aantal bezoeken.
--
-- js/teller.js (en de tijdlijn) roept public.tel_bezoek aan; beheer leest via
-- public.admin_bezoek. Bekende bots worden in de browser al overgeslagen.

CREATE TABLE IF NOT EXISTS public.bezoek_dag (
    dag           date    NOT NULL,
    pad           text    NOT NULL,
    -- Domein waar de bezoeker vandaan kwam (alleen bij binnenkomst), anders ''.
    bron          text    NOT NULL DEFAULT '',
    apparaat      text    NOT NULL CHECK (apparaat IN ('mobiel', 'computer')),
    weergaven     integer NOT NULL DEFAULT 0,
    binnenkomsten integer NOT NULL DEFAULT 0,
    PRIMARY KEY (dag, pad, bron, apparaat)
);

ALTER TABLE public.bezoek_dag ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bezoek_dag FROM anon, authenticated;

-- Tellen mag iedereen, maar alleen via deze functie, en alleen +1.
CREATE OR REPLACE FUNCTION public.tel_bezoek(p_pad text, p_bron text, p_mobiel boolean, p_binnenkomst boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_pad  text := lower(btrim(COALESCE(p_pad, '')));
    v_bron text := lower(btrim(COALESCE(p_bron, '')));
BEGIN
    -- Alleen een net pad: begint met /, geen rare tekens, niet te lang.
    IF v_pad !~ '^/[a-z0-9/_.-]{0,150}$' THEN
        RETURN;
    END IF;
    IF v_bron <> '' AND v_bron !~ '^[a-z0-9.-]{1,100}$' THEN
        v_bron := 'overig';
    END IF;
    IF NOT COALESCE(p_binnenkomst, false) THEN
        v_bron := '';
    END IF;

    INSERT INTO public.bezoek_dag AS b (dag, pad, bron, apparaat, weergaven, binnenkomsten)
    VALUES ((now() AT TIME ZONE 'Europe/Amsterdam')::date, v_pad, v_bron,
            CASE WHEN p_mobiel THEN 'mobiel' ELSE 'computer' END,
            1, CASE WHEN p_binnenkomst THEN 1 ELSE 0 END)
    ON CONFLICT (dag, pad, bron, apparaat) DO UPDATE
       SET weergaven     = b.weergaven + 1,
           binnenkomsten = b.binnenkomsten + EXCLUDED.binnenkomsten;
END;
$$;

REVOKE ALL ON FUNCTION public.tel_bezoek(text, text, boolean, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tel_bezoek(text, text, boolean, boolean) TO anon, authenticated;

-- Voor het tabblad Bezoek: alles in één keer, al opgeteld.
CREATE OR REPLACE FUNCTION public.admin_bezoek(p_dagen integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_van date;
BEGIN
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Alleen voor de beheerder' USING ERRCODE = '42501';
    END IF;
    v_van := (now() AT TIME ZONE 'Europe/Amsterdam')::date - (GREATEST(1, LEAST(COALESCE(p_dagen, 30), 400)) - 1);

    RETURN jsonb_build_object(
        'van', v_van,
        'per_dag', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('dag', d.dag::date, 'weergaven', COALESCE(t.w, 0), 'binnenkomsten', COALESCE(t.b, 0)) ORDER BY d.dag)
              FROM generate_series(v_van, (now() AT TIME ZONE 'Europe/Amsterdam')::date, interval '1 day') AS d(dag)
              LEFT JOIN (SELECT dag, sum(weergaven) w, sum(binnenkomsten) b
                           FROM public.bezoek_dag WHERE dag >= v_van GROUP BY dag) t ON t.dag = d.dag::date
        ), '[]'::jsonb),
        'paginas', COALESCE((
            SELECT jsonb_agg(x ORDER BY (x->>'weergaven')::int DESC)
              FROM (SELECT jsonb_build_object('pad', pad, 'weergaven', sum(weergaven), 'binnenkomsten', sum(binnenkomsten)) x
                      FROM public.bezoek_dag WHERE dag >= v_van
                     GROUP BY pad ORDER BY sum(weergaven) DESC LIMIT 40) s
        ), '[]'::jsonb),
        'bronnen', COALESCE((
            SELECT jsonb_agg(x ORDER BY (x->>'binnenkomsten')::int DESC)
              FROM (SELECT jsonb_build_object('bron', bron, 'binnenkomsten', sum(binnenkomsten)) x
                      FROM public.bezoek_dag WHERE dag >= v_van AND binnenkomsten > 0
                     GROUP BY bron ORDER BY sum(binnenkomsten) DESC LIMIT 20) s
        ), '[]'::jsonb),
        'apparaat', COALESCE((
            SELECT jsonb_object_agg(apparaat, w)
              FROM (SELECT apparaat, sum(weergaven) w FROM public.bezoek_dag WHERE dag >= v_van GROUP BY apparaat) s
        ), '{}'::jsonb)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_bezoek(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_bezoek(integer) TO authenticated;

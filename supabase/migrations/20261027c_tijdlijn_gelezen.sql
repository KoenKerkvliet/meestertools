-- ============================================
-- Tijdlijn: welke onderwerpen en verhalen worden gelezen
-- Toegepast 27 oktober 2026
-- ============================================

-- De bezoekteller (20261025c_bezoekteller.sql) telt de tijdlijn als één pagina,
-- omdat een onderwerp in het deel achter de # van het adres staat. Deze teller
-- telt apart hoe vaak een onderwerp (leespagina) of voorleesverhaal geopend wordt.
--
-- Zelfde uitgangspunt als de bezoekteller: alleen een dagtotaal per onderwerp,
-- niets over de bezoeker (geen IP, geen cookie, geen gebruikers-id). Een eigen
-- tabel, zodat het openen van een onderwerp de paginaweergaven niet vertekent.
--
-- De tijdlijn roept public.tel_tijdlijn aan; beheer leest via public.admin_bezoek
-- (sleutel 'tijdlijn'), in het tabblad Bezoek.

CREATE TABLE IF NOT EXISTS public.tijdlijn_gelezen (
    dag     date    NOT NULL,
    soort   text    NOT NULL CHECK (soort IN ('onderwerp', 'verhaal')),
    sleutel text    NOT NULL,
    aantal  integer NOT NULL DEFAULT 0,
    PRIMARY KEY (dag, soort, sleutel)
);

ALTER TABLE public.tijdlijn_gelezen ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tijdlijn_gelezen FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.tel_tijdlijn(p_soort text, p_sleutel text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_sleutel text := lower(btrim(COALESCE(p_sleutel, '')));
BEGIN
    IF p_soort NOT IN ('onderwerp', 'verhaal') OR v_sleutel !~ '^[a-z0-9-]{1,120}$' THEN
        RETURN;
    END IF;
    INSERT INTO public.tijdlijn_gelezen AS t (dag, soort, sleutel, aantal)
    VALUES ((now() AT TIME ZONE 'Europe/Amsterdam')::date, p_soort, v_sleutel, 1)
    ON CONFLICT (dag, soort, sleutel) DO UPDATE SET aantal = t.aantal + 1;
END;
$$;

REVOKE ALL ON FUNCTION public.tel_tijdlijn(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tel_tijdlijn(text, text) TO anon, authenticated;

-- admin_bezoek krijgt er 'tijdlijn' bij: de 40 meest geopende onderwerpen en verhalen.
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
        ), '{}'::jsonb),
        'tijdlijn', COALESCE((
            SELECT jsonb_agg(x ORDER BY (x->>'aantal')::int DESC)
              FROM (SELECT jsonb_build_object('soort', soort, 'sleutel', sleutel, 'aantal', sum(aantal)) x
                      FROM public.tijdlijn_gelezen WHERE dag >= v_van
                     GROUP BY soort, sleutel ORDER BY sum(aantal) DESC LIMIT 40) s
        ), '[]'::jsonb)
    );
END;
$$;
REVOKE ALL ON FUNCTION public.admin_bezoek(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_bezoek(integer) TO authenticated;

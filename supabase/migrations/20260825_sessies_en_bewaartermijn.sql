-- ============================================
-- Sessies automatisch sluiten + bewaartermijn
-- Toegepast 25 augustus 2026 (v1.47.0)
-- ============================================

-- ---------- 1. Vergeten sessies sluiten ----------
-- Sessiecodes bleven onbeperkt geldig: een lobby die je 's middags vergeet te
-- sluiten was maanden later nog joinbaar door iedereen die de code kent.
--
-- Uitzondering: rekenrace met purpose = 'view' is de permanente rekenmuur-link
-- van een klas en hoort juist wel open te blijven.
-- Het sociogram krijgt een ruimere termijn: kinderen vullen dat vaak over
-- meerdere dagen in.

CREATE OR REPLACE FUNCTION public.close_stale_sessions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_race INT; v_typ INT; v_esc INT; v_com INT; v_soc INT;
    c_lesduur CONSTANT INTERVAL := INTERVAL '12 hours';
    c_socio   CONSTANT INTERVAL := INTERVAL '7 days';
BEGIN
    UPDATE public.rekenrace_sessions
       SET status = 'closed', closed_at = now()
     WHERE status IN ('lobby', 'playing')
       AND coalesce(purpose, 'race') <> 'view'
       AND created_at < now() - c_lesduur;
    GET DIAGNOSTICS v_race = ROW_COUNT;

    UPDATE public.typrace_sessions
       SET status = 'closed', closed_at = now()
     WHERE status IN ('lobby', 'playing') AND created_at < now() - c_lesduur;
    GET DIAGNOSTICS v_typ = ROW_COUNT;

    UPDATE public.escaperoom_sessions
       SET status = 'closed', closed_at = now()
     WHERE status IN ('lobby', 'playing') AND created_at < now() - c_lesduur;
    GET DIAGNOSTICS v_esc = ROW_COUNT;

    UPDATE public.compliment_sessions
       SET status = 'closed', closed_at = now()
     WHERE status IN ('lobby', 'collecting') AND created_at < now() - c_lesduur;
    GET DIAGNOSTICS v_com = ROW_COUNT;

    UPDATE public.sociogram_sessions
       SET status = 'closed', updated_at = now()
     WHERE status = 'open' AND created_at < now() - c_socio;
    GET DIAGNOSTICS v_soc = ROW_COUNT;

    RETURN jsonb_build_object(
        'rekenrace', v_race, 'typrace', v_typ, 'escaperoom', v_esc,
        'compliment', v_com, 'sociogram', v_soc
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.close_stale_sessions() FROM PUBLIC, anon, authenticated;

-- ---------- 2. Bewaartermijn ----------
-- "Zolang jij ze nodig hebt" is geen bewaartermijn; de AVG vraagt een concrete.
-- Alle kindtabellen hangen met ON DELETE CASCADE aan de sessie, dus het
-- verwijderen van een sessie neemt deelnemers en antwoorden mee.
--
-- Termijnen, en waarom:
--    90 dagen  spelsessies (rekenrace, typrace, escaperoom) - eenmalige
--              activiteiten zonder blijvende waarde. De duurzame voortgang van
--              een kind staat in rekenmuur_mastery en blijft dus staan.
--   12 maanden complimentenmuur - complimenten hebben bewaarwaarde voor een
--              kind; een schooljaar is ruim.
--   13 maanden sociogram - de gevoeligste data die de site heeft (wie wil niet
--              met wie spelen). Na een schooljaar nergens meer voor nodig. Een
--              maand extra zodat een lopend jaar nooit halverwege sneuvelt.

CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_race INT; v_typ INT; v_esc INT; v_com INT; v_soc INT;
    c_spel  CONSTANT INTERVAL := INTERVAL '90 days';
    c_comp  CONSTANT INTERVAL := INTERVAL '12 months';
    c_socio CONSTANT INTERVAL := INTERVAL '13 months';
BEGIN
    DELETE FROM public.rekenrace_sessions
     WHERE coalesce(purpose, 'race') <> 'view' AND created_at < now() - c_spel;
    GET DIAGNOSTICS v_race = ROW_COUNT;

    DELETE FROM public.typrace_sessions WHERE created_at < now() - c_spel;
    GET DIAGNOSTICS v_typ = ROW_COUNT;

    DELETE FROM public.escaperoom_sessions WHERE created_at < now() - c_spel;
    GET DIAGNOSTICS v_esc = ROW_COUNT;

    DELETE FROM public.compliment_sessions WHERE created_at < now() - c_comp;
    GET DIAGNOSTICS v_com = ROW_COUNT;

    DELETE FROM public.sociogram_sessions WHERE created_at < now() - c_socio;
    GET DIAGNOSTICS v_soc = ROW_COUNT;

    RETURN jsonb_build_object(
        'rekenrace', v_race, 'typrace', v_typ, 'escaperoom', v_esc,
        'compliment', v_com, 'sociogram', v_soc
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_old_data() FROM PUBLIC, anon, authenticated;

-- ---------- 3. Inplannen ----------
SELECT cron.schedule('close_stale_sessions', '7 * * * *',  'SELECT public.close_stale_sessions();');
SELECT cron.schedule('cleanup_old_data',     '20 3 * * *', 'SELECT public.cleanup_old_data();');

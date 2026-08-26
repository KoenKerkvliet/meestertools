-- ============================================
-- Prijzen mogen meer dan 999 punten kosten
-- Toegepast 26 augustus 2026
-- ============================================

-- Bij het invoeren van de mijlpaalladder (v1.52.0) is het maximum in het formulier
-- en in de client-validatie op 99999 gezet, maar deze CHECK bleef op 999 staan.
-- Een groepsprijs van 1200 punten werd daardoor door de database geweigerd, met
-- de ruwe Postgres-melding in beeld.
ALTER TABLE public.klasseprestatie_prizes
    DROP CONSTRAINT IF EXISTS klasseprestatie_prizes_cost_check;

ALTER TABLE public.klasseprestatie_prizes
    ADD CONSTRAINT klasseprestatie_prizes_cost_check
    CHECK (cost >= 1 AND cost <= 99999);

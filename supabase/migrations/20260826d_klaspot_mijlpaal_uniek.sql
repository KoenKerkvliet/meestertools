-- ============================================
-- Klaspot: een mijlpaal maar één keer vieren
-- Toegepast 26 augustus 2026
-- ============================================

-- Groepsprijzen zijn geen aankopen meer maar mijlpalen: de klaspot loopt door en
-- een mijlpaal wordt één keer gehaald. De client controleert dat al, maar twee
-- duo-collega's die tegelijk afvinken zouden anders twee rijen maken.
--
-- prize_id mag NULL zijn (de prijs kan verwijderd worden, ON DELETE SET NULL).
-- Postgres laat meerdere NULLs toe in een unieke index, dus die oude regels
-- blijven gewoon naast elkaar bestaan - precies wat we willen.
CREATE UNIQUE INDEX IF NOT EXISTS klasseprestatie_group_redemptions_mijlpaal_uniek
    ON public.klasseprestatie_group_redemptions (group_id, prize_id)
    WHERE prize_id IS NOT NULL;

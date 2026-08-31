-- ============================================
-- 24 Game: één rij per combinatie kaarten
-- Toegepast 31 augustus 2026
-- ============================================

-- Bij het inladen van een reeks setjes is er niets dat een dubbeling
-- tegenhoudt, en een dubbel setje betekent dat diezelfde opgave vaker
-- voorbijkomt dan de bedoeling is.
--
-- De index werkt op de array zoals hij is opgeslagen, dus de volgorde moet
-- vastliggen: [1,2,3,4] en [4,3,2,1] zouden anders als twee verschillende
-- setjes tellen. Het beheerscherm sorteert daarom sinds v1.56.1 vóór het
-- opslaan (js/admin.js) en toont een nette melding bij foutcode 23505.
-- De 26 bestaande rijen zijn gecontroleerd: allemaal al oplopend.
CREATE UNIQUE INDEX IF NOT EXISTS game24_sets_numbers_uniek
    ON public.game24_sets (numbers);

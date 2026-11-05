-- ============================================
-- Gasttools: 24 Game en Woorden flitsen werken ook zonder account
-- Toegepast 5 november 2026
-- ============================================

-- Sinds v1.67.2 staan 24 Game, Woorden flitsen, Potje 1000 en Werkblad
-- Rekenen in de gratis laag (PUBLIC_TOOLS in js/app.js). Potje 1000 en het
-- werkblad gebruiken geen database. 24 Game en Woorden flitsen lezen hun
-- opgaven en woorden wel uit de database, en die mochten tot nu toe alleen
-- ingelogde gebruikers lezen (auth.role() = 'authenticated').
--
-- Hier komt alleen LEZEN voor niet-ingelogde bezoekers (rol anon) bij. Het gaat
-- om puzzelsetjes en woordenlijsten, dus geen persoonsgegevens en geen
-- klasdata. Schrijven blijft voorbehouden aan de beheerder (de bestaande
-- policies "Super admin can ..." veranderen niet).
--
-- De gastenlaag mag nooit klasdata lezen (groups, students, sociogram,
-- klasseprestatie, enzovoort): voeg daarom NOOIT een anon-policy toe aan een
-- tabel met leerlingen of klassen.

CREATE POLICY "Gasten kunnen game24_sets lezen"
    ON public.game24_sets FOR SELECT TO anon
    USING (true);

CREATE POLICY "Gasten kunnen flash_words lezen"
    ON public.flash_words FOR SELECT TO anon
    USING (true);

CREATE POLICY "Gasten kunnen flash_difficulties lezen"
    ON public.flash_difficulties FOR SELECT TO anon
    USING (true);

-- ============================================
-- Een duo-collega mag de beloningen en prijzen van de klas beheren
-- Toegepast 11 september 2026
-- ============================================

-- Bij de duo-leerkracht (v1.49.0) bleven beloningstypes en prijzen bewust van
-- de eigenaar: een duo mocht ze zien en gebruiken, niet wijzigen. Alleen bood
-- Klasseprestatie de collega wél de knop "Nieuwe toevoegen". Die sloeg de
-- beloning op onder de collega zelf, terwijl de lijst alleen die van de
-- eigenaar toont. Opslaan lukte dus, en de beloning verscheen nooit. Bewerken
-- en verwijderen liepen stil op RLS stuk (0 rijen, geen fout).
--
-- Een duo geeft al punten en deelt de klaspot; dan hoort bepalen wáárvoor die
-- punten zijn er ook bij. De rijen blijven op user_id van de eigenaar staan
-- (de client schrijft voortaan ownerId()), en schrijven mag iedereen die een
-- klas met die eigenaar deelt - dezelfde regel als het lezen al had.
--
-- Bekend nadeel: heeft de eigenaar meerdere klassen, dan geldt een wijziging
-- van de duo voor al die klassen. Beloningen per klas (group_id) lost dat op;
-- dat is nu niet nodig. Hard verwijderen blijft eigenaar-alleen; de client
-- archiveert alleen. Zie [[project_duo_leerkracht]].

DROP POLICY IF EXISTS "beloningen beheren i" ON public.klasseprestatie_reward_types;
CREATE POLICY "beloningen beheren i" ON public.klasseprestatie_reward_types
    FOR INSERT WITH CHECK (public.shares_class_with(user_id));

DROP POLICY IF EXISTS "beloningen beheren u" ON public.klasseprestatie_reward_types;
CREATE POLICY "beloningen beheren u" ON public.klasseprestatie_reward_types
    FOR UPDATE USING (public.shares_class_with(user_id))
    WITH CHECK (public.shares_class_with(user_id));

DROP POLICY IF EXISTS "prijzen beheren i" ON public.klasseprestatie_prizes;
CREATE POLICY "prijzen beheren i" ON public.klasseprestatie_prizes
    FOR INSERT WITH CHECK (public.shares_class_with(user_id));

DROP POLICY IF EXISTS "prijzen beheren u" ON public.klasseprestatie_prizes;
CREATE POLICY "prijzen beheren u" ON public.klasseprestatie_prizes
    FOR UPDATE USING (public.shares_class_with(user_id))
    WITH CHECK (public.shares_class_with(user_id));

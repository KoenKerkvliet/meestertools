-- ============================================
-- Klassendienst en plattegrond horen bij de klas, niet bij de leerkracht
-- Toegepast 31 augustus 2026
-- ============================================

-- Een duo-collega die een klas gedeeld kreeg, zag bij de klassendienst een
-- lege takenlijst en bij de plattegrond een leeg lokaal. De oorzaak: beide
-- tools bewaren hun instellingen in `tool_settings`, dat op `user_id` staat.
-- De leerlingen kwamen wél binnen (die hangen aan de groep), de taken en de
-- opstelling niet. Twee leerkrachten voor dezelfde klas kregen zo twee
-- verschillende klassendiensten.
--
-- `tool_settings` blijft wat het is: persoonlijke voorkeuren (dobbelstenen,
-- timetimer, dashboard). Wat bij de klás hoort verhuist naar deze tabel, met
-- has_group_access als toegangsregel - dezelfde regel die students en
-- klassendienst_days al gebruiken. Zie [[project_duo_leerkracht]]: voor
-- klasgegevens nooit meer op user_id filteren.

CREATE TABLE IF NOT EXISTS public.group_tool_settings (
    group_id   uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    tool_name  text NOT NULL,
    settings   jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamptz NOT NULL DEFAULT now(),
    -- Wie paste het als laatste aan. Niet functioneel, maar bij een gedeelde
    -- lijst wil je kunnen zien wie er aan gedraaid heeft.
    updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    PRIMARY KEY (group_id, tool_name)
);

ALTER TABLE public.group_tool_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "klasinstellingen van je eigen klas" ON public.group_tool_settings;

-- Eén policy voor alles: wie bij de klas hoort mag de instellingen lezen én
-- aanpassen. Een duo is geen kijker maar een tweede leerkracht.
CREATE POLICY "klasinstellingen van je eigen klas"
    ON public.group_tool_settings FOR ALL
    USING (public.has_group_access(group_id))
    WITH CHECK (public.has_group_access(group_id));

-- ---------- Bestaande instellingen meeverhuizen ----------
-- De aanmaker van de groep (groups.user_id) is de bron: zijn lijst wordt de
-- lijst van de klas. Precies wat je verwacht als je je klas deelt - de ander
-- neemt over wat er al stond in plaats van bij nul te beginnen.

-- Klassendienst: één blob per leerkracht, die gold voor al zijn klassen. Elke
-- klas van die leerkracht krijgt er een eigen kopie van; vanaf nu kunnen twee
-- klassen dus uit elkaar lopen, wat ook logischer is (andere kinderen, andere
-- taken).
INSERT INTO public.group_tool_settings (group_id, tool_name, settings, updated_by)
SELECT g.id, 'klassendienst', ts.settings, g.user_id
  FROM public.groups g
  JOIN public.tool_settings ts
    ON ts.user_id = g.user_id AND ts.tool_name = 'klassendienst'
ON CONFLICT (group_id, tool_name) DO NOTHING;

-- Plattegrond bewaarde al per klas, verstopt in settings->byGroup->'<groep-id>'.
-- Die tak wordt hier de hele inhoud van de rij.
INSERT INTO public.group_tool_settings (group_id, tool_name, settings, updated_by)
SELECT g.id, 'plattegrond', ts.settings -> 'byGroup' -> g.id::text, g.user_id
  FROM public.groups g
  JOIN public.tool_settings ts
    ON ts.user_id = g.user_id AND ts.tool_name = 'plattegrond'
 WHERE ts.settings -> 'byGroup' -> g.id::text IS NOT NULL
ON CONFLICT (group_id, tool_name) DO NOTHING;

-- De oude rijen in tool_settings blijven staan. Ze worden niet meer gelezen,
-- maar als er iets misgaat met de verhuizing is het origineel er nog.

-- ---------- Schooljaar van de klas ----------
-- De klassendienst rekent zijn weken uit met het schooljaar en de vakanties.
-- Die staan persoonlijk in tool_settings ('schooljaar'). Zonder deze regel
-- ziet een duo met een lege vakantielijst een ándere weekindeling, en dus een
-- ander kind dat aan de beurt is - de gedeelde takenlijst zou dan nog steeds
-- niet hetzelfde beeld geven.
--
-- Daarom: wie een klas met je deelt, mag jouw schooljaar lezen. Alleen die ene
-- tool_name, en alleen lezen. Vakantiedata zijn geen persoonsgegevens.
DROP POLICY IF EXISTS "schooljaar van je duo lezen" ON public.tool_settings;

CREATE POLICY "schooljaar van je duo lezen"
    ON public.tool_settings FOR SELECT
    USING (tool_name = 'schooljaar' AND public.shares_class_with(user_id));

-- ---------- En meteen de deur weer dicht ----------
-- De bestaande leesregel op tool_settings stond op
--   auth.uid() = user_id OR shares_class_with(user_id)
-- en dateert van de duo-functie. Daarmee kon een duo-collega álle persoonlijke
-- toolinstellingen van de eigenaar lezen: niet alleen het schooljaar, maar ook
-- de plattegrond en de klasseprestatie-instellingen van diens ándere klassen.
--
-- Niets in de code leunde daarop - elke tool_settings-select filtert op
-- user_id. De enige echte uitzondering is het schooljaar hierboven, en die
-- heeft nu een eigen, smalle regel. Dus terug naar alleen je eigen rijen.
DROP POLICY IF EXISTS "instellingen lezen" ON public.tool_settings;

CREATE POLICY "instellingen lezen"
    ON public.tool_settings FOR SELECT
    USING (auth.uid() = user_id);

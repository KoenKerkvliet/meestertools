-- ============================================
-- Ideeënbus + publieke roadmap
-- Toegepast 31 augustus 2026
-- ============================================

-- Leerkrachten hadden tot nu toe alleen info@meestertools.nl om iets kwijt te
-- kunnen. Dat is een drempel: je moet je mailprogramma erbij pakken op het
-- moment dat je nét in een tool zit en denkt "hier mis ik iets". De ideeënbus
-- vangt dat op de plek zelf op.
--
-- Twee gescheiden werelden, en dat is bewust:
--
--   ideas          - privé. Alleen de inzender en de super admin zien een rij.
--                    Vrije tekst van leerkrachten: kan per ongeluk een
--                    leerlingnaam of een klassensituatie bevatten.
--   roadmap_items  - publiek voor iedereen die is ingelogd. Bevat GEEN user_id
--                    en geen verwijzing terug naar een idee.
--
-- Goedkeuren is dus geen vinkje op een bestaande rij maar het overtypen naar een
-- nieuwe tabel. Als het één rij met een `is_public`-vlag was, zou publiceren
-- meteen ook user_id en de originele tekst zichtbaar maken - RLS filtert rijen,
-- geen kolommen. De koppeling staat aan de privé-kant (ideas.roadmap_item_id),
-- zodat de inzender wel ziet dat zijn idee het gehaald heeft.

-- ---------- 1. Publieke roadmap ----------
CREATE TABLE IF NOT EXISTS public.roadmap_items (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text NOT NULL,
    body        text,
    status      text NOT NULL DEFAULT 'gepland'
                CHECK (status IN ('gepland', 'in-aanbouw', 'gebouwd')),
    sort_order  integer NOT NULL DEFAULT 0,
    vote_count  integer NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    released_at timestamptz
);

-- De roadmappagina toont drie kolommen en sorteert binnen elke kolom op stemmen.
CREATE INDEX IF NOT EXISTS roadmap_items_status_idx
    ON public.roadmap_items (status, vote_count DESC, sort_order);

ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roadmap lezen"  ON public.roadmap_items;
DROP POLICY IF EXISTS "roadmap beheer" ON public.roadmap_items;

-- TO authenticated en niet TO public: de roadmap is een kijkje in de keuken voor
-- gebruikers, niet iets dat op straat hoeft te liggen.
CREATE POLICY "roadmap lezen"
    ON public.roadmap_items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "roadmap beheer"
    ON public.roadmap_items FOR ALL
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

DROP TRIGGER IF EXISTS roadmap_items_updated_at ON public.roadmap_items;
CREATE TRIGGER roadmap_items_updated_at
    BEFORE UPDATE ON public.roadmap_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------- 2. Stemmen ----------
-- user_id moet erin, anders kan iedereen oneindig duimen. Anoniem betekent hier:
-- anoniem voor kijkers. Niemand mag de stemmenlijst lezen behalve zijn eigen
-- rij - ook de super admin niet, want die hoeft alleen het totaal te weten.
CREATE TABLE IF NOT EXISTS public.roadmap_votes (
    item_id    uuid NOT NULL REFERENCES public.roadmap_items(id) ON DELETE CASCADE,
    user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (item_id, user_id)
);

ALTER TABLE public.roadmap_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigen stem lezen"      ON public.roadmap_votes;
DROP POLICY IF EXISTS "stem uitbrengen"       ON public.roadmap_votes;
DROP POLICY IF EXISTS "stem terugtrekken"     ON public.roadmap_votes;

CREATE POLICY "eigen stem lezen"
    ON public.roadmap_votes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "stem uitbrengen"
    ON public.roadmap_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stem terugtrekken"
    ON public.roadmap_votes FOR DELETE
    USING (auth.uid() = user_id);

-- De teller op roadmap_items is de enige publieke uitkomst van die tabel. Hij
-- wordt hier bijgehouden en niet client-side geteld, want SELECT count(*) op
-- roadmap_votes mag niemand.
CREATE OR REPLACE FUNCTION public.roadmap_vote_count()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.roadmap_items
           SET vote_count = vote_count + 1
         WHERE id = NEW.item_id;
        RETURN NEW;
    ELSE
        UPDATE public.roadmap_items
           SET vote_count = GREATEST(vote_count - 1, 0)
         WHERE id = OLD.item_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- FROM PUBLIC en niet FROM anon, authenticated: die laatste laat het
-- standaardrecht van PUBLIC staan, waardoor de functie alsnog als
-- /rest/v1/rpc-eindpunt aanroepbaar blijft. Een triggerfunctie heeft geen
-- EXECUTE-recht nodig om af te vuren, dus die mag helemaal dicht.
REVOKE EXECUTE ON FUNCTION public.roadmap_vote_count() FROM PUBLIC;

DROP TRIGGER IF EXISTS roadmap_votes_count_ins ON public.roadmap_votes;
DROP TRIGGER IF EXISTS roadmap_votes_count_del ON public.roadmap_votes;

CREATE TRIGGER roadmap_votes_count_ins
    AFTER INSERT ON public.roadmap_votes
    FOR EACH ROW EXECUTE FUNCTION public.roadmap_vote_count();

CREATE TRIGGER roadmap_votes_count_del
    AFTER DELETE ON public.roadmap_votes
    FOR EACH ROW EXECUTE FUNCTION public.roadmap_vote_count();

-- ---------- 3. De ideeënbus zelf ----------
CREATE TABLE IF NOT EXISTS public.ideas (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- SET NULL en niet CASCADE: zegt iemand zijn account op, dan blijft het idee
    -- staan als los idee. Het is dan van niemand meer, maar niet weg.
    user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    category        text NOT NULL DEFAULT 'idee'
                    CHECK (category IN ('idee', 'verbetering', 'bug', 'nieuwe-tool')),
    -- id uit MT_ALL_TOOLS in js/template.js, of leeg als het niet over één tool gaat.
    tool_id         text,
    title           text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 3 AND 120),
    body            text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 5 AND 2000),
    page_url        text,
    status          text NOT NULL DEFAULT 'nieuw'
                    CHECK (status IN ('nieuw', 'bekeken', 'gepland', 'gebouwd', 'niet-nu')),
    roadmap_item_id uuid REFERENCES public.roadmap_items(id) ON DELETE SET NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Beheer sorteert op binnenkomst; de inzender ziet zijn eigen lijst.
CREATE INDEX IF NOT EXISTS ideas_created_idx ON public.ideas (created_at DESC);
CREATE INDEX IF NOT EXISTS ideas_user_idx    ON public.ideas (user_id, created_at DESC);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "idee insturen"          ON public.ideas;
DROP POLICY IF EXISTS "eigen idee lezen"       ON public.ideas;
DROP POLICY IF EXISTS "eigen idee intrekken"   ON public.ideas;
DROP POLICY IF EXISTS "super admin leest ideeen"   ON public.ideas;
DROP POLICY IF EXISTS "super admin beheert ideeen" ON public.ideas;

CREATE POLICY "idee insturen"
    ON public.ideas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "eigen idee lezen"
    ON public.ideas FOR SELECT
    USING (auth.uid() = user_id);

-- Wel intrekken, niet bewerken: anders staat er in beheer iets anders dan wat er
-- beoordeeld werd. Opnieuw insturen kan altijd.
CREATE POLICY "eigen idee intrekken"
    ON public.ideas FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "super admin leest ideeen"
    ON public.ideas FOR SELECT
    USING (public.is_super_admin());

CREATE POLICY "super admin beheert ideeen"
    ON public.ideas FOR ALL
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

DROP TRIGGER IF EXISTS ideas_updated_at ON public.ideas;
CREATE TRIGGER ideas_updated_at
    BEFORE UPDATE ON public.ideas
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Rem tegen doorgeschoten enthousiasme en tegen een vastgelopen knop die blijft
-- versturen. Alleen ingelogde leerkrachten kunnen hier komen, dus veel meer
-- bescherming dan dit is overdreven.
CREATE OR REPLACE FUNCTION public.ideas_rate_limit()
RETURNS trigger AS $$
DECLARE
    recent integer;
BEGIN
    SELECT count(*) INTO recent
      FROM public.ideas
     WHERE user_id = NEW.user_id
       AND created_at > now() - interval '10 minutes';

    IF recent >= 5 THEN
        RAISE EXCEPTION 'Je hebt net al een paar ideeën ingestuurd. Probeer het over een paar minuten nog eens.'
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.ideas_rate_limit() FROM PUBLIC;

DROP TRIGGER IF EXISTS ideas_rate_limit_trg ON public.ideas;
CREATE TRIGGER ideas_rate_limit_trg
    BEFORE INSERT ON public.ideas
    FOR EACH ROW EXECUTE FUNCTION public.ideas_rate_limit();

-- ---------- 4. Interne notities ----------
-- Aparte tabel en geen kolom op ideas: de inzender leest zijn eigen rij compleet,
-- dus een admin_note-kolom daar zou hem laten meelezen met het oordeel.
CREATE TABLE IF NOT EXISTS public.idea_notes (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id    uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    note       text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idea_notes_idea_idx ON public.idea_notes (idea_id, created_at);

ALTER TABLE public.idea_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notities alleen super admin" ON public.idea_notes;

CREATE POLICY "notities alleen super admin"
    ON public.idea_notes FOR ALL
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- ---------- 5. Melding bijhouden ----------
-- Wanneer is er over dit idee gemaild? De edge function idee-melding zet dit en
-- weigert een tweede mail voor hetzelfde idee, zodat een herhaalde aanroep
-- (dubbelklik, herhaald verzoek) niets doet.
ALTER TABLE public.ideas
    ADD COLUMN IF NOT EXISTS notified_at timestamptz;

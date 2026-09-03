-- ============================================
-- Weektaak (premium)
-- Toegepast 1 september 2026
-- ============================================

-- Een digitale weektaak: de leerkracht zet een basisrooster op, kopieert dat
-- per week en hangt er moet- en magwerk aan. Kinderen zien op /leerling hun
-- eigen week en vinken zelf af.
--
-- Dit is de eerste tool áchter een slot. Dat vraagt iets anders dan de
-- bestaande `uc`-vlag in js/template.js: die verbergt een onafgemaakte tool,
-- maar is puur client-side. Voor iets waar straks voor betaald wordt is dat
-- niet genoeg - wie het adres raadt of devtools opent, is er zo langs. Daarom
-- staat het slot hier, in de database.

-- ---------- 1. Wie mag erbij ----------
-- Eén kolom, zodat de paywall later een schakelaar is en geen verbouwing.
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'gratis';

DO $$ BEGIN
    ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('gratis', 'premium'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- De super admin is altijd premium: anders kan de bouwer zijn eigen tool niet in.
CREATE OR REPLACE FUNCTION public.is_premium()
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
         WHERE id = auth.uid()
           AND (role = 'super_admin' OR plan = 'premium')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- Hoort deze klas bij iemand met premium? Nodig omdat de tabellen aan de klas
-- hangen en niet aan de leerkracht: een duo-collega zonder abonnement mag mee
-- in de klas van een collega die het wél heeft.
CREATE OR REPLACE FUNCTION public.group_has_premium(p_group uuid)
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1
          FROM public.groups g
          JOIN public.profiles p ON p.id = g.user_id
         WHERE g.id = p_group
           AND (p.role = 'super_admin' OR p.plan = 'premium')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- ---------- 2. Instellingen: schooltijden en pauzes ----------
-- Eén rij per klas. De dagen en pauzes zitten in JSON omdat je ze als geheel
-- bewerkt en er nooit los op gezocht wordt.
--
--   dagen:  [{ dag:1..5, start:'08:30', eind:'15:15' }]
--   pauzes: [{ naam, van, tot, dagen:[1..5] }]
CREATE TABLE IF NOT EXISTS public.weektaak_instellingen (
    group_id   uuid PRIMARY KEY REFERENCES public.groups(id) ON DELETE CASCADE,
    dagen      jsonb NOT NULL DEFAULT '[]'::jsonb,
    pauzes     jsonb NOT NULL DEFAULT '[]'::jsonb,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ---------- 3. Vakken ----------
-- De leerkracht maakt ze zelf aan. Het lestype bepaalt de kleur in het rooster;
-- 'instructie' en 'zelfstandig' zijn de twee die het meest doen.
CREATE TABLE IF NOT EXISTS public.weektaak_vakken (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id   uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    naam       text NOT NULL CHECK (char_length(btrim(naam)) BETWEEN 1 AND 40),
    lestype    text NOT NULL DEFAULT 'overig'
               CHECK (lestype IN ('instructie', 'zelfstandig', 'gym', 'creatief', 'toets', 'overig', 'start')),
    sort_order integer NOT NULL DEFAULT 0,
    archived   boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS weektaak_vakken_group_idx ON public.weektaak_vakken (group_id, sort_order);

-- ---------- 4. Basisrooster ----------
-- Het sjabloon: wat er in een gewone week op welke dag staat. Een les heeft een
-- begin- en eindtijd, geen vaste blokgrootte - gym van anderhalf uur en een
-- spellingles van een half uur staan zo naast elkaar in hetzelfde rooster.
CREATE TABLE IF NOT EXISTS public.weektaak_rooster (
    id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    dag      smallint NOT NULL CHECK (dag BETWEEN 1 AND 5),   -- 1 = maandag
    van      time NOT NULL,
    tot      time NOT NULL,
    vak_id   uuid NOT NULL REFERENCES public.weektaak_vakken(id) ON DELETE CASCADE,
    CHECK (tot > van)
);
CREATE INDEX IF NOT EXISTS weektaak_rooster_group_idx ON public.weektaak_rooster (group_id, dag, van);

-- ---------- 5. De weken zelf ----------
-- Een week is een KOPIE van het basisrooster, niet een verwijzing ernaar.
-- Verschuif je in november een gymles in je basisrooster, dan mogen de weken
-- van september daar niet in meebewegen: die zijn geschiedenis. En binnen een
-- week wil je vrij kunnen schuiven voor een excursie of een toetsweek, zonder
-- dat je sjabloon verandert.
--
-- rooster jsonb: [{ les_id, dag, van, tot, vak, lestype }]
--   les_id is een eigen uuid per les in díe week; het werk hangt eraan vast.
CREATE TABLE IF NOT EXISTS public.weektaak_weken (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id   uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    jaar       smallint NOT NULL,
    week       smallint NOT NULL CHECK (week BETWEEN 1 AND 53),
    rooster    jsonb NOT NULL DEFAULT '[]'::jsonb,
    -- Niet gepubliceerd = de kinderen zien de week nog niet. Zo kun je op
    -- zondagavond rustig klaarzetten zonder dat het halve werk al zichtbaar is.
    zichtbaar  boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE (group_id, jaar, week)
);
CREATE INDEX IF NOT EXISTS weektaak_weken_group_idx ON public.weektaak_weken (group_id, jaar, week);

-- ---------- 6. Groepjes ----------
-- Zes kinderen in het groeilab krijgen elke week hetzelfde soort extra werk.
-- Zonder een naam voor die zes vink je ze elke week opnieuw aan, en dat is
-- precies de wrijving waardoor een tool na een maand blijft liggen.
--
-- Bewust niet 'weektaak_'-genoemd: een instructiegroep rekenen is voor meer
-- tools bruikbaar dan alleen deze.
CREATE TABLE IF NOT EXISTS public.klas_groepjes (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id   uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    naam       text NOT NULL CHECK (char_length(btrim(naam)) BETWEEN 1 AND 40),
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS klas_groepjes_group_idx ON public.klas_groepjes (group_id, sort_order);

CREATE TABLE IF NOT EXISTS public.klas_groepje_leden (
    groepje_id uuid NOT NULL REFERENCES public.klas_groepjes(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    PRIMARY KEY (groepje_id, student_id)
);

-- ---------- 7. Het werk ----------
-- Drie plekken waar werk kan staan, met een duidelijk verschil in bedoeling:
--   les   - "dit doe je nu, in deze les"      (sturing van de leerkracht)
--   dag   - "dit doe je vandaag, ergens"
--   week  - "dit moet voor vrijdag af, plan het zelf"  (eigenaarschap)
-- De dag-laag verschijnt in het scherm alleen als er iets in staat.
--
-- doelgroep bepaalt wie het ziet:
--   {"type":"klas"}                          - iedereen (de standaard)
--   {"type":"groepje","id":"<uuid>"}         - dat groepje, ook als het later groeit
--   {"type":"leerlingen","ids":["<uuid>"]}   - deze kinderen, eenmalig
--
-- group_id staat er ook op, puur zodat de toegangsregel niet via de week hoeft
-- te joinen.
CREATE TABLE IF NOT EXISTS public.weektaak_items (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id    uuid NOT NULL REFERENCES public.weektaak_weken(id) ON DELETE CASCADE,
    group_id   uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    niveau     text NOT NULL CHECK (niveau IN ('les', 'dag', 'week')),
    les_id     uuid,                                    -- gevuld bij niveau 'les'
    dag        smallint CHECK (dag BETWEEN 1 AND 5),     -- gevuld bij 'les' en 'dag'
    soort      text NOT NULL CHECK (soort IN ('moet', 'mag')),
    tekst      text NOT NULL CHECK (char_length(btrim(tekst)) BETWEEN 1 AND 300),
    doelgroep  jsonb NOT NULL DEFAULT '{"type":"klas"}'::jsonb,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK ((niveau = 'les'  AND les_id IS NOT NULL AND dag IS NOT NULL)
        OR (niveau = 'dag'  AND les_id IS NULL     AND dag IS NOT NULL)
        OR (niveau = 'week' AND les_id IS NULL     AND dag IS NULL))
);
CREATE INDEX IF NOT EXISTS weektaak_items_week_idx ON public.weektaak_items (week_id, niveau, dag, sort_order);
CREATE INDEX IF NOT EXISTS weektaak_items_les_idx  ON public.weektaak_items (les_id);

-- ---------- 8. Afvinken ----------
CREATE TABLE IF NOT EXISTS public.weektaak_afgevinkt (
    item_id    uuid NOT NULL REFERENCES public.weektaak_items(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    af_op      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (item_id, student_id)
);
CREATE INDEX IF NOT EXISTS weektaak_afgevinkt_student_idx ON public.weektaak_afgevinkt (student_id);

-- ---------- 9. Het slot ----------
-- Overal dezelfde twee voorwaarden: je hoort bij de klas, én de klas zit op een
-- premium-account. Zonder de tweede helft is dit gewoon een gratis tool met een
-- gordijn ervoor.
DO $$
DECLARE t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'weektaak_instellingen', 'weektaak_vakken', 'weektaak_rooster',
        'weektaak_weken', 'weektaak_items', 'klas_groepjes'
    ] LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "weektaak van je eigen klas" ON public.%I', t);
        EXECUTE format($f$
            CREATE POLICY "weektaak van je eigen klas" ON public.%I FOR ALL
                USING (public.has_group_access(group_id) AND public.group_has_premium(group_id))
                WITH CHECK (public.has_group_access(group_id) AND public.group_has_premium(group_id))
        $f$, t);
    END LOOP;
END $$;

-- De ledentabel en de vinkjes hebben geen group_id; die lopen via hun ouder.
ALTER TABLE public.klas_groepje_leden ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "groepjesleden van je eigen klas" ON public.klas_groepje_leden;
CREATE POLICY "groepjesleden van je eigen klas"
    ON public.klas_groepje_leden FOR ALL
    USING (EXISTS (SELECT 1 FROM public.klas_groepjes g
                    WHERE g.id = groepje_id
                      AND public.has_group_access(g.group_id)
                      AND public.group_has_premium(g.group_id)))
    WITH CHECK (EXISTS (SELECT 1 FROM public.klas_groepjes g
                    WHERE g.id = groepje_id
                      AND public.has_group_access(g.group_id)
                      AND public.group_has_premium(g.group_id)));

-- Vinkjes: de leerkracht mag ze lezen (om te zien wie waar staat) en wissen
-- (misklik van een kind), maar zet ze niet zelf. Kinderen komen hier nooit
-- rechtstreeks; die lopen via de edge function met de service-role key.
ALTER TABLE public.weektaak_afgevinkt ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vinkjes van je eigen klas" ON public.weektaak_afgevinkt;
CREATE POLICY "vinkjes van je eigen klas"
    ON public.weektaak_afgevinkt FOR ALL
    USING (EXISTS (SELECT 1 FROM public.weektaak_items i
                    WHERE i.id = item_id
                      AND public.has_group_access(i.group_id)
                      AND public.group_has_premium(i.group_id)))
    WITH CHECK (EXISTS (SELECT 1 FROM public.weektaak_items i
                    WHERE i.id = item_id
                      AND public.has_group_access(i.group_id)
                      AND public.group_has_premium(i.group_id)));

-- ---------- 10. updated_at bijhouden ----------
DROP TRIGGER IF EXISTS weektaak_weken_updated_at ON public.weektaak_weken;
CREATE TRIGGER weektaak_weken_updated_at
    BEFORE UPDATE ON public.weektaak_weken
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS weektaak_instellingen_updated_at ON public.weektaak_instellingen;
CREATE TRIGGER weektaak_instellingen_updated_at
    BEFORE UPDATE ON public.weektaak_instellingen
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Sfeercijfer hoort bij de klas
-- Toegepast 31 augustus 2026
-- ============================================

-- Vervolg op 20260831b en 20260831c. Van de tools die hun klasgegevens per
-- leerkracht bewaarden was deze de schadelijkste, en dat komt door de grafiek.
--
-- Sfeercijfer is "één cijfer per dag, uitgezet over de tijd". Stond dat per
-- leerkracht, dan bouwden twee duo-collega's ieder een eigen halve reeks op:
-- de een de maandag t/m woensdag, de ander de donderdag en vrijdag. Allebei
-- zagen ze een grafiek die er compleet uitziet maar waar de helft van de week
-- in ontbreekt - en juist die grafiek gebruik je om te beoordelen hoe het met
-- de groep gaat. Een leeg scherm valt op, een halve grafiek niet.

INSERT INTO public.group_tool_settings (group_id, tool_name, settings, updated_by)
SELECT g.id,
       'sfeercijfer',
       jsonb_build_object('days', COALESCE(ts.settings -> 'byGroup' -> g.id::text -> 'days', '{}'::jsonb)),
       g.user_id
  FROM public.groups g
  JOIN public.tool_settings ts
    ON ts.user_id = g.user_id AND ts.tool_name = 'sfeercijfer'
 WHERE ts.settings -> 'byGroup' -> g.id::text IS NOT NULL
ON CONFLICT (group_id, tool_name) DO NOTHING;

-- De oude rijen in tool_settings blijven staan als terugvaloptie.

-- ============================================
-- Huiswerk controleren hoort ook bij de klas
-- Toegepast 31 augustus 2026
-- ============================================

-- Vervolg op 20260831b: dezelfde verhuizing, nu voor de huiswerktool. Die had
-- een gemengde vorm: `counts` en `log` stonden al per klas (byGroup), maar de
-- prijzenlijst en de drempel golden voor de leerkracht. Een duo-collega zag
-- dus niet alleen lege tellers, maar zou ook aan een ander prijzenrad draaien
-- en bij een ander aantal keer vergeten afgeteld hebben.
--
-- Alles gaat naar de klas. Voor een leerkracht met twee klassen betekent dat
-- twee losse prijzenlijsten in plaats van één gedeelde - passender ook, want
-- "de klas vegen" is niet in elke groep een even zinnige prijs.

INSERT INTO public.group_tool_settings (group_id, tool_name, settings, updated_by)
SELECT g.id,
       'huiswerk',
       -- De klasgebonden tak (counts, log) bovenop de algemene instellingen.
       jsonb_build_object(
           'prizes',    COALESCE(ts.settings -> 'prizes',    '[]'::jsonb),
           'threshold', COALESCE(ts.settings -> 'threshold', '3'::jsonb)
       ) || COALESCE(ts.settings -> 'byGroup' -> g.id::text, '{}'::jsonb),
       g.user_id
  FROM public.groups g
  JOIN public.tool_settings ts
    ON ts.user_id = g.user_id AND ts.tool_name = 'huiswerk'
ON CONFLICT (group_id, tool_name) DO NOTHING;

-- De oude rijen in tool_settings blijven staan als terugvaloptie.

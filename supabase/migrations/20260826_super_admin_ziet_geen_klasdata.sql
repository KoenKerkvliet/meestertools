-- ============================================
-- Super admin ziet geen klasdata meer
-- Toegepast 26 augustus 2026
-- ============================================

-- Vanaf de eerste opzet had de super_admin-rol een extra leesregel op de
-- klasgebonden tabellen. RLS-policies werken als OF, dus dat betekende: je eigen
-- klas OF - als super admin - alle klassen van alle scholen. In elke tool met een
-- klassenkiezer (Podium was waar het opviel) stonden zo de groepen van andere
-- leerkrachten in de lijst, inclusief de voornamen van hun leerlingen en zelfs de
-- sociogramkeuzes: wie kiest wie.
--
-- De beheerpagina raakt deze vier tabellen nergens aan, dus de policies deden
-- niets behalve lekken. Weg ermee. De super-admin-rechten die beheer.html wel
-- gebruikt (profielen, scholen, escaperoom-vragen, flitswoorden, spellingzinnen,
-- 24-game) blijven ongemoeid.

DROP POLICY IF EXISTS "super admin leest groepen"    ON public.groups;
DROP POLICY IF EXISTS "super admin leest leerlingen" ON public.students;
DROP POLICY IF EXISTS "sg super admin"               ON public.sociogram_sessions;
DROP POLICY IF EXISTS "sg keuzes super admin"        ON public.sociogram_picks;

-- Voor de zekerheid ook de oorspronkelijke namen uit supabase-setup.sql: bij een
-- oudere database kunnen die er nog onder liggen.
DROP POLICY IF EXISTS "Super admin can read all groups"   ON public.groups;
DROP POLICY IF EXISTS "Super admin can read all students" ON public.students;

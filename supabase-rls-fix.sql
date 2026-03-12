-- ============================================
-- MEESTERTOOLS - RLS Fix: Infinite Recursion
-- Voer dit uit in de Supabase SQL Editor
-- ============================================
--
-- PROBLEEM: De "Super admin" policies op profiles, groups, students
-- bevatten een subquery op de profiles-tabel. Omdat profiles zelf ook
-- RLS heeft met dezelfde subquery, ontstaat er oneindige recursie.
--
-- OPLOSSING: Een SECURITY DEFINER functie die RLS overslaat bij
-- het controleren van de rol.
-- ============================================

-- Stap 1: Helper functie aanmaken (SECURITY DEFINER omzeilt RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Stap 2: Policies op profiles vervangen
DROP POLICY IF EXISTS "Super admin can read all profiles" ON public.profiles;
CREATE POLICY "Super admin can read all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super admin can update all profiles" ON public.profiles;
CREATE POLICY "Super admin can update all profiles"
    ON public.profiles FOR UPDATE
    USING (public.is_super_admin());

-- Stap 3: Policies op schools vervangen
DROP POLICY IF EXISTS "Super admin can insert schools" ON public.schools;
CREATE POLICY "Super admin can insert schools"
    ON public.schools FOR INSERT
    WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Super admin can update schools" ON public.schools;
CREATE POLICY "Super admin can update schools"
    ON public.schools FOR UPDATE
    USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super admin can delete schools" ON public.schools;
CREATE POLICY "Super admin can delete schools"
    ON public.schools FOR DELETE
    USING (public.is_super_admin());

-- Stap 4: Policies op groups vervangen
DROP POLICY IF EXISTS "Super admin can read all groups" ON public.groups;
CREATE POLICY "Super admin can read all groups"
    ON public.groups FOR SELECT
    USING (public.is_super_admin());

-- Stap 5: Policies op students vervangen
DROP POLICY IF EXISTS "Super admin can read all students" ON public.students;
CREATE POLICY "Super admin can read all students"
    ON public.students FOR SELECT
    USING (public.is_super_admin());

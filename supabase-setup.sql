-- ============================================
-- MEESTERTOOLS - Supabase Database Setup
-- Voer dit uit in de Supabase SQL Editor
-- ============================================

-- ---------- 1. Schools tabel ----------
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ---------- 2. Profiles tabel ----------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'user')),
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ---------- 3. Auto-update updated_at ----------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_schools_updated
    BEFORE UPDATE ON public.schools
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------- 4. Auto-create profile on signup ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.email,
        CASE
            WHEN NEW.email = 'koen.kerkvliet@movare.nl' THEN 'super_admin'
            ELSE 'user'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- 5. Helper: is_super_admin (SECURITY DEFINER) ----------
-- Voorkomt infinite recursie bij RLS policies die profiles raadplegen
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ---------- 6. RLS inschakelen ----------
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ---------- 7. RLS Policies: profiles ----------

-- Users kunnen hun eigen profiel lezen
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Super admin kan alle profielen lezen
CREATE POLICY "Super admin can read all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_super_admin());

-- Super admin kan profielen updaten
CREATE POLICY "Super admin can update all profiles"
    ON public.profiles FOR UPDATE
    USING (public.is_super_admin());

-- Users kunnen eigen profiel updaten (behalve role)
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ---------- 8. RLS Policies: schools ----------

-- Alle ingelogde users kunnen scholen lezen
CREATE POLICY "Authenticated users can read schools"
    ON public.schools FOR SELECT
    USING (auth.role() = 'authenticated');

-- Super admin kan scholen aanmaken
CREATE POLICY "Super admin can insert schools"
    ON public.schools FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Super admin kan scholen updaten
CREATE POLICY "Super admin can update schools"
    ON public.schools FOR UPDATE
    USING (public.is_super_admin());

-- Super admin kan scholen verwijderen
CREATE POLICY "Super admin can delete schools"
    ON public.schools FOR DELETE
    USING (public.is_super_admin());

-- ---------- 9. Groups tabel (klassen/groepen per leerkracht) ----------
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER on_groups_updated
    BEFORE UPDATE ON public.groups
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------- 10. Students tabel (leerlingen per groep) ----------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT DEFAULT '',
    student_number INTEGER NOT NULL,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER on_students_updated
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------- 11. RLS voor groups ----------
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Users kunnen eigen groepen lezen
CREATE POLICY "Users can read own groups"
    ON public.groups FOR SELECT
    USING (auth.uid() = user_id);

-- Super admin kan alle groepen lezen
CREATE POLICY "Super admin can read all groups"
    ON public.groups FOR SELECT
    USING (public.is_super_admin());

-- Users kunnen eigen groepen aanmaken
CREATE POLICY "Users can insert own groups"
    ON public.groups FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users kunnen eigen groepen updaten
CREATE POLICY "Users can update own groups"
    ON public.groups FOR UPDATE
    USING (auth.uid() = user_id);

-- Users kunnen eigen groepen verwijderen
CREATE POLICY "Users can delete own groups"
    ON public.groups FOR DELETE
    USING (auth.uid() = user_id);

-- ---------- 12. RLS voor students ----------
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Users kunnen eigen leerlingen lezen
CREATE POLICY "Users can read own students"
    ON public.students FOR SELECT
    USING (auth.uid() = user_id);

-- Super admin kan alle leerlingen lezen
CREATE POLICY "Super admin can read all students"
    ON public.students FOR SELECT
    USING (public.is_super_admin());

-- Users kunnen eigen leerlingen aanmaken
CREATE POLICY "Users can insert own students"
    ON public.students FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users kunnen eigen leerlingen updaten
CREATE POLICY "Users can update own students"
    ON public.students FOR UPDATE
    USING (auth.uid() = user_id);

-- Users kunnen eigen leerlingen verwijderen
CREATE POLICY "Users can delete own students"
    ON public.students FOR DELETE
    USING (auth.uid() = user_id);

-- ---------- 13. Flash Words tabel (woordenlijsten per leesniveau) ----------
CREATE TABLE IF NOT EXISTS public.flash_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL,
    word TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS voor flash_words
ALTER TABLE public.flash_words ENABLE ROW LEVEL SECURITY;

-- Alle ingelogde users kunnen woorden lezen
CREATE POLICY "Authenticated users can read flash_words"
    ON public.flash_words FOR SELECT
    USING (auth.role() = 'authenticated');

-- Super admin kan woorden aanmaken
CREATE POLICY "Super admin can insert flash_words"
    ON public.flash_words FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Super admin kan woorden updaten
CREATE POLICY "Super admin can update flash_words"
    ON public.flash_words FOR UPDATE
    USING (public.is_super_admin());

-- Super admin kan woorden verwijderen
CREATE POLICY "Super admin can delete flash_words"
    ON public.flash_words FOR DELETE
    USING (public.is_super_admin());

-- ---------- 14. Flash Difficulties tabel (leesmoeilijkheden per niveau) ----------
CREATE TABLE IF NOT EXISTS public.flash_difficulties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    levels TEXT[] NOT NULL DEFAULT '{}',
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS voor flash_difficulties
ALTER TABLE public.flash_difficulties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read flash_difficulties"
    ON public.flash_difficulties FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Super admin can insert flash_difficulties"
    ON public.flash_difficulties FOR INSERT
    WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admin can update flash_difficulties"
    ON public.flash_difficulties FOR UPDATE
    USING (public.is_super_admin());

CREATE POLICY "Super admin can delete flash_difficulties"
    ON public.flash_difficulties FOR DELETE
    USING (public.is_super_admin());

-- ---------- 15. Koppel flash_words aan flash_difficulties ----------
ALTER TABLE public.flash_words ADD COLUMN IF NOT EXISTS difficulty_id UUID REFERENCES public.flash_difficulties(id) ON DELETE SET NULL;

-- ---------- 16. Super admin instellen voor bestaande user ----------
-- Als koen.kerkvliet@movare.nl al geregistreerd is:
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'koen.kerkvliet@movare.nl';

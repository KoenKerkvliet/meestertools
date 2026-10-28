-- ============================================
-- Topografie: Oceanië als basiskaart
-- Toegepast 28 oktober 2026
-- ============================================

ALTER TABLE public.topografie_kaarten DROP CONSTRAINT IF EXISTS topografie_kaarten_basis_check;
ALTER TABLE public.topografie_kaarten ADD CONSTRAINT topografie_kaarten_basis_check
    CHECK (basis IN ('nederland', 'europa', 'wereld', 'noordamerika', 'zuidamerika', 'afrika', 'azie', 'oceanie'));

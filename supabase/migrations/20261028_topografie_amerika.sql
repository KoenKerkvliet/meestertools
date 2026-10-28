-- ============================================
-- Topografie: Noord-Amerika en Zuid-Amerika als basiskaart
-- Toegepast 28 oktober 2026
-- ============================================

-- De basiskaart van een topografiekaart is een vaste lijst: elk van deze
-- namen heeft een bestand assets/topografie/<basis>.json.

ALTER TABLE public.topografie_kaarten DROP CONSTRAINT IF EXISTS topografie_kaarten_basis_check;
ALTER TABLE public.topografie_kaarten ADD CONSTRAINT topografie_kaarten_basis_check
    CHECK (basis IN ('nederland', 'europa', 'wereld', 'noordamerika', 'zuidamerika'));

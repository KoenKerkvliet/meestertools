-- ============================================
-- Super admin ziet ook geen visiespel-sessies meer
-- Toegepast 26 augustus 2026
-- ============================================

-- Sluitstuk van 20260826_super_admin_ziet_geen_klasdata.sql. Deze bleef eerst
-- staan omdat de tabel geen leerlinggegevens bevat - alleen user_id, een
-- sessienaam en de spelstand. Maar het blijft een ongebruikt leesrecht op het
-- werk van andere scholen: beheer.html raakt visiespel_sessions nergens aan.

DROP POLICY IF EXISTS "Super admin can read all visiespel sessions" ON public.visiespel_sessions;

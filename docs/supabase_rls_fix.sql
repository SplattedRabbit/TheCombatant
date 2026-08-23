-- ====================================================================
-- SUPABASE RLS FIX & INITIALIZATION SCRIPT (v6.0 Cloud)
-- ====================================================================
-- 1. Automatischer Profil-Trigger + Backfill (verhindert Foreign-Key-Fehler)
-- 2. Zirkelfreie RLS-Policies (verhindert Infinite-Recursion Error 42P17)
-- 3. Volle Rechte für DM & Spieler (Campaigns, Characters, Members)
-- 4. Einmalige Deduplizierung
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. PROFILES TRIGGER & BACKFILL
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Adventurer'),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Bestehende Auth-User in profiles nachtragen:
INSERT INTO public.profiles (id, email, name, created_at)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'Adventurer'), created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- 2. HELPER FUNCTIONS (SECURITY DEFINER to bypass RLS recursion)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_campaign_member(target_campaign_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaign_members
    WHERE campaign_id = target_campaign_id
    AND user_id = target_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_campaign_dm(target_campaign_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = target_campaign_id
    AND dm_user_id = target_user_id
  );
$$;

-- --------------------------------------------------------------------
-- 3. DROP OLD POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "characters_select_policy" ON public.characters;
DROP POLICY IF EXISTS "characters_insert_policy" ON public.characters;
DROP POLICY IF EXISTS "characters_update_policy" ON public.characters;
DROP POLICY IF EXISTS "characters_delete_policy" ON public.characters;
DROP POLICY IF EXISTS "Users can manage own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can view own characters" ON public.characters;

DROP POLICY IF EXISTS "Users can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "DMs can manage their campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_select_policy" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_insert_policy" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_update_policy" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_delete_policy" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_dm_all_policy" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_member_select_policy" ON public.campaigns;

DROP POLICY IF EXISTS "Users can view campaign members" ON public.campaign_members;
DROP POLICY IF EXISTS "Members and DMs can view campaign_members" ON public.campaign_members;
DROP POLICY IF EXISTS "DMs and users can insert campaign_members" ON public.campaign_members;
DROP POLICY IF EXISTS "DMs and users can manage campaign_members" ON public.campaign_members;
DROP POLICY IF EXISTS "campaign_members_select_policy" ON public.campaign_members;
DROP POLICY IF EXISTS "campaign_members_insert_policy" ON public.campaign_members;
DROP POLICY IF EXISTS "campaign_members_update_policy" ON public.campaign_members;
DROP POLICY IF EXISTS "campaign_members_delete_policy" ON public.campaign_members;

-- --------------------------------------------------------------------
-- 4. PROFILES POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- --------------------------------------------------------------------
-- 5. CHARACTERS POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "characters_select_policy" ON public.characters
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "characters_insert_policy" ON public.characters
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "characters_update_policy" ON public.characters
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "characters_delete_policy" ON public.characters
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- --------------------------------------------------------------------
-- 6. CAMPAIGNS POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- DM hat vollen Lese- und Schreibzugriff (INSERT, UPDATE, DELETE, SELECT) auf seine Kampagnen
CREATE POLICY "campaigns_dm_all_policy" ON public.campaigns
FOR ALL TO authenticated
USING (dm_user_id = auth.uid())
WITH CHECK (dm_user_id = auth.uid());

-- Kampagnen-Mitglieder (Spieler) dürfen die Kampagne lesen
CREATE POLICY "campaigns_member_select_policy" ON public.campaigns
FOR SELECT TO authenticated
USING (public.is_campaign_member(id, auth.uid()));

-- --------------------------------------------------------------------
-- 7. CAMPAIGN_MEMBERS POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaign_members_select_policy" ON public.campaign_members
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_campaign_dm(campaign_id, auth.uid())
  OR public.is_campaign_member(campaign_id, auth.uid())
);

CREATE POLICY "campaign_members_insert_policy" ON public.campaign_members
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR public.is_campaign_dm(campaign_id, auth.uid())
);

CREATE POLICY "campaign_members_update_policy" ON public.campaign_members
FOR UPDATE TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_campaign_dm(campaign_id, auth.uid())
)
WITH CHECK (
  user_id = auth.uid()
  OR public.is_campaign_dm(campaign_id, auth.uid())
);

CREATE POLICY "campaign_members_delete_policy" ON public.campaign_members
FOR DELETE TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_campaign_dm(campaign_id, auth.uid())
);

-- --------------------------------------------------------------------
-- 8. DEDUPLIZIERUNG (Behält jeweils nur den neuesten Helden)
-- --------------------------------------------------------------------
DELETE FROM public.characters
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, name) id
  FROM public.characters
  ORDER BY user_id, name, updated_at DESC
);

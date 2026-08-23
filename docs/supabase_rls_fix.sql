-- ====================================================================
-- SURGICAL SUPABASE RLS RESET & INITIALIZATION SCRIPT (v6.0 Cloud)
-- ====================================================================
-- 1. Dynamically drops ALL existing policies on campaigns, campaign_members,
--    characters, and profiles to remove any hidden/stale recursive policies.
-- 2. Backfills public.profiles and sets up auto-create trigger.
-- 3. Implements 100% zero-recursion RLS architecture.
-- ====================================================================

-- --------------------------------------------------------------------
-- STEP 1: DYNAMICALLY DROP ALL EXISTING POLICIES (Cleans hidden old policies)
-- --------------------------------------------------------------------
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (
        SELECT policyname, tablename, schemaname 
        FROM pg_policies 
        WHERE tablename IN ('campaigns', 'campaign_members', 'characters', 'profiles')
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- --------------------------------------------------------------------
-- STEP 2: PROFILES TRIGGER & BACKFILL (Guarantees foreign key integrity)
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

-- Backfill all existing auth.users into public.profiles:
INSERT INTO public.profiles (id, email, name, created_at)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'Adventurer'), created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- STEP 3: SECURITY DEFINER HELPER FUNCTIONS (Runs with elevated rights, bypasses RLS)
-- --------------------------------------------------------------------
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
-- STEP 4: PROFILES POLICIES (Zero Subqueries)
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON public.profiles
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- --------------------------------------------------------------------
-- STEP 5: CHARACTERS POLICIES (Zero Subqueries)
-- --------------------------------------------------------------------
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "characters_select_own" ON public.characters
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "characters_insert_own" ON public.characters
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "characters_update_own" ON public.characters
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "characters_delete_own" ON public.characters
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- --------------------------------------------------------------------
-- STEP 6: CAMPAIGNS POLICIES (Zero Subqueries - Guaranteed 0% Recursion)
-- --------------------------------------------------------------------
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 1. All authenticated users can SELECT campaigns (needed for invite codes & sessions)
CREATE POLICY "campaigns_select_authenticated" ON public.campaigns
FOR SELECT TO authenticated
USING (true);

-- 2. Only the DM can INSERT campaigns
CREATE POLICY "campaigns_insert_dm" ON public.campaigns
FOR INSERT TO authenticated
WITH CHECK (dm_user_id = auth.uid());

-- 3. Only the DM can UPDATE their campaigns
CREATE POLICY "campaigns_update_dm" ON public.campaigns
FOR UPDATE TO authenticated
USING (dm_user_id = auth.uid())
WITH CHECK (dm_user_id = auth.uid());

-- 4. Only the DM can DELETE their campaigns
CREATE POLICY "campaigns_delete_dm" ON public.campaigns
FOR DELETE TO authenticated
USING (dm_user_id = auth.uid());

-- --------------------------------------------------------------------
-- STEP 7: CAMPAIGN_MEMBERS POLICIES (Uses SECURITY DEFINER is_campaign_dm)
-- --------------------------------------------------------------------
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;

-- 1. Member can see own membership, or DM can see all campaign members
CREATE POLICY "campaign_members_select_policy" ON public.campaign_members
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR public.is_campaign_dm(campaign_id, auth.uid())
);

-- 2. User can join or DM can add member
CREATE POLICY "campaign_members_insert_policy" ON public.campaign_members
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR public.is_campaign_dm(campaign_id, auth.uid())
);

-- 3. User or DM can update
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

-- 4. User can leave or DM can remove member
CREATE POLICY "campaign_members_delete_policy" ON public.campaign_members
FOR DELETE TO authenticated
USING (
  user_id = auth.uid() 
  OR public.is_campaign_dm(campaign_id, auth.uid())
);

-- --------------------------------------------------------------------
-- STEP 8: DEDUPLICATION CLEANUP
-- --------------------------------------------------------------------
DELETE FROM public.characters
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, name) id
  FROM public.characters
  ORDER BY user_id, name, updated_at DESC
);

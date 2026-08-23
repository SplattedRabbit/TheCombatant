-- ====================================================================
-- SUPABASE RLS FIX & INITIALIZATION SCRIPT
-- ====================================================================
-- Solves:
-- 1. Infinite recursion (Error 42P17) between campaigns and campaign_members
-- 2. Clean RLS permissions for profiles, characters, campaigns, campaign_members
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. HELPER FUNCTIONS (SECURITY DEFINER to bypass RLS recursion)
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
-- 2. DROP OLD POLICIES
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

DROP POLICY IF EXISTS "Users can view campaign members" ON public.campaign_members;
DROP POLICY IF EXISTS "Members and DMs can view campaign_members" ON public.campaign_members;
DROP POLICY IF EXISTS "DMs and users can insert campaign_members" ON public.campaign_members;
DROP POLICY IF EXISTS "DMs and users can manage campaign_members" ON public.campaign_members;
DROP POLICY IF EXISTS "campaign_members_select_policy" ON public.campaign_members;
DROP POLICY IF EXISTS "campaign_members_insert_policy" ON public.campaign_members;
DROP POLICY IF EXISTS "campaign_members_update_policy" ON public.campaign_members;
DROP POLICY IF EXISTS "campaign_members_delete_policy" ON public.campaign_members;

-- --------------------------------------------------------------------
-- 3. PROFILES POLICIES
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
-- 4. CHARACTERS POLICIES
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
-- 5. CAMPAIGNS POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_select_policy" ON public.campaigns
FOR SELECT TO authenticated
USING (
  dm_user_id = auth.uid() 
  OR public.is_campaign_member(id, auth.uid())
);

CREATE POLICY "campaigns_insert_policy" ON public.campaigns
FOR INSERT TO authenticated
WITH CHECK (
  dm_user_id = auth.uid()
);

CREATE POLICY "campaigns_update_policy" ON public.campaigns
FOR UPDATE TO authenticated
USING (
  dm_user_id = auth.uid()
)
WITH CHECK (
  dm_user_id = auth.uid()
);

CREATE POLICY "campaigns_delete_policy" ON public.campaigns
FOR DELETE TO authenticated
USING (
  dm_user_id = auth.uid()
);

-- --------------------------------------------------------------------
-- 6. CAMPAIGN_MEMBERS POLICIES
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

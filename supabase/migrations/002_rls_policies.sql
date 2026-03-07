-- IMC Project Scheduler - Row Level Security Policies
-- Run this migration AFTER 001_initial_schema.sql

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is internal or admin
CREATE OR REPLACE FUNCTION is_internal_or_admin()
RETURNS BOOLEAN AS $$
DECLARE
  r user_role;
BEGIN
  r := get_user_role();
  RETURN r = 'admin' OR r = 'internal';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CLIENTS POLICIES
-- ============================================

-- Anyone authenticated can view clients (needed for dropdowns)
CREATE POLICY "Clients viewable by authenticated users"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

-- Only admin/internal can create clients
CREATE POLICY "Clients insertable by internal users"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (is_internal_or_admin());

-- Only admin/internal can update clients
CREATE POLICY "Clients updatable by internal users"
  ON clients FOR UPDATE
  TO authenticated
  USING (is_internal_or_admin())
  WITH CHECK (is_internal_or_admin());

-- Only admin can delete clients
CREATE POLICY "Clients deletable by admin"
  ON clients FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- Internal users can view all projects
CREATE POLICY "Projects viewable by internal users"
  ON projects FOR SELECT
  TO authenticated
  USING (is_internal_or_admin());

-- Only admin/internal can create projects
CREATE POLICY "Projects insertable by internal users"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (is_internal_or_admin());

-- Only admin/internal can update projects
CREATE POLICY "Projects updatable by internal users"
  ON projects FOR UPDATE
  TO authenticated
  USING (is_internal_or_admin())
  WITH CHECK (is_internal_or_admin());

-- Only admin can delete projects
CREATE POLICY "Projects deletable by admin"
  ON projects FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- PROPERTIES POLICIES
-- ============================================

-- Follow project access rules
CREATE POLICY "Properties viewable by internal users"
  ON properties FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = properties.project_id
      AND is_internal_or_admin()
    )
  );

CREATE POLICY "Properties insertable by internal users"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (is_internal_or_admin());

CREATE POLICY "Properties updatable by internal users"
  ON properties FOR UPDATE
  TO authenticated
  USING (is_internal_or_admin())
  WITH CHECK (is_internal_or_admin());

CREATE POLICY "Properties deletable by admin"
  ON properties FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- TEMPLATES POLICIES
-- ============================================

-- All authenticated can view templates
CREATE POLICY "Templates viewable by all"
  ON templates FOR SELECT
  TO authenticated
  USING (true);

-- Only admin/internal can manage templates
CREATE POLICY "Templates insertable by internal users"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (is_internal_or_admin());

CREATE POLICY "Templates updatable by internal users"
  ON templates FOR UPDATE
  TO authenticated
  USING (is_internal_or_admin())
  WITH CHECK (is_internal_or_admin());

CREATE POLICY "Templates deletable by admin"
  ON templates FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- DELIVERABLES POLICIES
-- ============================================

CREATE POLICY "Deliverables viewable by internal users"
  ON deliverables FOR SELECT
  TO authenticated
  USING (is_internal_or_admin());

CREATE POLICY "Deliverables insertable by internal users"
  ON deliverables FOR INSERT
  TO authenticated
  WITH CHECK (is_internal_or_admin());

CREATE POLICY "Deliverables updatable by internal users"
  ON deliverables FOR UPDATE
  TO authenticated
  USING (is_internal_or_admin())
  WITH CHECK (is_internal_or_admin());

CREATE POLICY "Deliverables deletable by admin"
  ON deliverables FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- MILESTONES POLICIES
-- ============================================

CREATE POLICY "Milestones viewable by internal users"
  ON milestones FOR SELECT
  TO authenticated
  USING (is_internal_or_admin());

CREATE POLICY "Milestones insertable by internal users"
  ON milestones FOR INSERT
  TO authenticated
  WITH CHECK (is_internal_or_admin());

CREATE POLICY "Milestones updatable by internal users"
  ON milestones FOR UPDATE
  TO authenticated
  USING (is_internal_or_admin())
  WITH CHECK (is_internal_or_admin());

CREATE POLICY "Milestones deletable by admin"
  ON milestones FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can view their own record
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

-- Users are created via trigger (see below)
CREATE POLICY "Users insertable by admin"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR id = auth.uid());

-- Users can update their own non-role fields; admin can update all
CREATE POLICY "Users updatable"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

-- Only admin can delete users
CREATE POLICY "Users deletable by admin"
  ON users FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- SHARE LINKS POLICIES
-- ============================================

-- Internal users can view share links
CREATE POLICY "Share links viewable by internal users"
  ON share_links FOR SELECT
  TO authenticated
  USING (is_internal_or_admin());

-- Internal users can create share links
CREATE POLICY "Share links insertable by internal users"
  ON share_links FOR INSERT
  TO authenticated
  WITH CHECK (is_internal_or_admin());

-- Internal users can update share links
CREATE POLICY "Share links updatable by internal users"
  ON share_links FOR UPDATE
  TO authenticated
  USING (is_internal_or_admin())
  WITH CHECK (is_internal_or_admin());

-- Admin can delete share links
CREATE POLICY "Share links deletable by admin"
  ON share_links FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- AUTO-CREATE USER ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'internal');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

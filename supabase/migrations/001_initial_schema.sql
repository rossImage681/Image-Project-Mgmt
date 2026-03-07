-- IMC Project Scheduler - Initial Schema
-- Run this migration in your Supabase SQL Editor

-- ============================================
-- ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOM TYPES
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'internal', 'client_viewer');

-- Project status
CREATE TYPE project_status AS ENUM ('draft', 'active', 'on_hold', 'completed', 'archived');

-- Deliverable status
CREATE TYPE deliverable_status AS ENUM ('planned', 'in_progress', 'blocked', 'complete');

-- Milestone types
CREATE TYPE milestone_type AS ENUM ('delivery', 'feedback_due', 'review', 'final');

-- Deliverable types
CREATE TYPE deliverable_type AS ENUM ('brochure', 'microsite', 'video', 'photography', 'design', 'other');

-- ============================================
-- CORE TABLES
-- ============================================

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  accent_color VARCHAR(7) DEFAULT '#E52E7D', -- Default to IMC fuchsia
  logo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status project_status DEFAULT 'draft',
  -- Business day rules: JSON object { workdays: [1,2,3,4,5], holidays: ['2026-01-01'] }
  business_day_rules JSONB DEFAULT '{"workdays": [1, 2, 3, 4, 5], "holidays": []}',
  -- Client theme override: JSON object with color tokens
  client_theme JSONB,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table (e.g., Chicago Ridge, Orange Park Mall)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  group_name VARCHAR(255), -- Optional grouping
  accent_color VARCHAR(7), -- Per-property accent color
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates table (reusable milestone patterns)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  deliverable_type deliverable_type NOT NULL,
  is_duration_based BOOLEAN DEFAULT false,
  duration_days INTEGER, -- For duration-based templates
  revision_rounds INTEGER DEFAULT 2,
  -- Milestone pattern: array of { name, offset_days, type, is_feedback_due }
  milestones_pattern JSONB DEFAULT '[]',
  -- Spacing rules: { round_spacing: 2, feedback_spacing: 1 }
  spacing_rules JSONB DEFAULT '{"round_spacing": 2, "feedback_spacing": 1}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliverables table
CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type deliverable_type NOT NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  -- Duration mode
  duration_days INTEGER,
  -- Phase 1 (pre-work) days for visual display
  phase1_days INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status deliverable_status DEFAULT 'planned',
  -- Dependencies: array of { deliverable_id, milestone_type }
  dependencies JSONB DEFAULT '[]',
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type milestone_type NOT NULL,
  scheduled_date DATE NOT NULL,
  -- Reviewers: array of initials ["JD", "SM"]
  reviewers JSONB DEFAULT '[]',
  is_feedback_due BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUTH & USERS
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  initials VARCHAR(5),
  role user_role DEFAULT 'internal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Share links table (for client access)
CREATE TABLE share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  -- Permissions: { view_deliverables: true, view_milestones: true }
  permissions JSONB DEFAULT '{"view_deliverables": true, "view_milestones": true}',
  password_hash TEXT, -- Optional password protection
  expires_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_properties_project_id ON properties(project_id);
CREATE INDEX idx_properties_sort_order ON properties(project_id, sort_order);
CREATE INDEX idx_deliverables_property_id ON deliverables(property_id);
CREATE INDEX idx_deliverables_type ON deliverables(type);
CREATE INDEX idx_deliverables_status ON deliverables(status);
CREATE INDEX idx_milestones_deliverable_id ON milestones(deliverable_id);
CREATE INDEX idx_milestones_scheduled_date ON milestones(scheduled_date);
CREATE INDEX idx_share_links_token ON share_links(token);
CREATE INDEX idx_share_links_project_id ON share_links(project_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverables_updated_at
  BEFORE UPDATE ON deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DEFAULT TEMPLATES
-- ============================================

-- Brochure - 2 rounds template
INSERT INTO templates (name, deliverable_type, is_duration_based, revision_rounds, milestones_pattern, spacing_rules, is_default)
VALUES (
  'Brochure – 2 rounds',
  'brochure',
  false,
  2,
  '[
    {"name": "Round 1 Delivered", "offset_days": 0, "type": "delivery", "is_feedback_due": false},
    {"name": "Round 1 Feedback Due", "offset_days": 1, "type": "feedback_due", "is_feedback_due": true},
    {"name": "Round 2 Delivered", "offset_days": 3, "type": "delivery", "is_feedback_due": false},
    {"name": "Round 2 Feedback Due", "offset_days": 5, "type": "feedback_due", "is_feedback_due": true},
    {"name": "Final Delivered", "offset_days": 6, "type": "final", "is_feedback_due": false}
  ]',
  '{"round_spacing": 2, "feedback_spacing": 1}',
  true
);

-- Microsite - standard (duration-based)
INSERT INTO templates (name, deliverable_type, is_duration_based, duration_days, revision_rounds, milestones_pattern, spacing_rules, is_default)
VALUES (
  'Microsite – standard',
  'microsite',
  true,
  7,
  2,
  '[
    {"name": "Development Start", "offset_days": 0, "type": "delivery", "is_feedback_due": false},
    {"name": "Review Ready", "offset_days": 5, "type": "review", "is_feedback_due": false},
    {"name": "Launch", "offset_days": 7, "type": "final", "is_feedback_due": false}
  ]',
  '{"round_spacing": 2, "feedback_spacing": 1}',
  true
);

-- Microsite - short (5 business days)
INSERT INTO templates (name, deliverable_type, is_duration_based, duration_days, revision_rounds, milestones_pattern, spacing_rules, is_default)
VALUES (
  'Microsite – short',
  'microsite',
  true,
  5,
  1,
  '[
    {"name": "Development Start", "offset_days": 0, "type": "delivery", "is_feedback_due": false},
    {"name": "Review Ready", "offset_days": 3, "type": "review", "is_feedback_due": false},
    {"name": "Launch", "offset_days": 5, "type": "final", "is_feedback_due": false}
  ]',
  '{"round_spacing": 1, "feedback_spacing": 1}',
  false
);
